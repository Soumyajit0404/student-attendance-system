from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Secret key for JWT
app.config['SECRET_KEY'] = 'your-secret-key'

# Database setup
DB_FILE = 'attendance.db'

def init_db():
    """Initialize the database with tables if they don't exist"""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL
    )
    ''')
    
    # Create Classes table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
    )
    ''')
    
    # Create Students table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS students (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        class_id INTEGER,
        FOREIGN KEY (class_id) REFERENCES classes (id)
    )
    ''')
    
    # Create Attendance table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        class_id INTEGER,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students (id),
        FOREIGN KEY (class_id) REFERENCES classes (id),
        UNIQUE(student_id, class_id, date)
    )
    ''')
    
    # Insert default admin user if not exists
    cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", 
                      ('admin', 'admin123', 'admin'))
    
    # Insert some sample classes if not exists
    cursor.execute("SELECT COUNT(*) FROM classes")
    if cursor.fetchone()[0] == 0:
        classes = [('Class 1',), ('Class 2',), ('Class 3',)]
        cursor.executemany("INSERT INTO classes (name) VALUES (?)", classes)
    
    conn.commit()
    conn.close()

# Initialize database when starting the app
init_db()

# Helper function to get database connection
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row  # This allows us to access columns by name
    return conn

# Authentication middleware
def token_required(f):
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            # You can also verify user existence in the database here if needed
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(*args, **kwargs)
    
    # Renaming the function name
    decorated.__name__ = f.__name__
    return decorated

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    auth = request.json
    
    if not auth or not auth.get('username') or not auth.get('password'):
        return jsonify({'message': 'Could not verify'}), 401
    
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (auth.get('username'),))
    user = cursor.fetchone()
    
    conn.close()
    
    if not user:
        return jsonify({'message': 'User not found'}), 401
    
    if user['password'] == auth.get('password'):
        token = jwt.encode({
            'username': user['username'],
            'role': user['role'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({'token': token})
    
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/verify-token', methods=['GET'])
@token_required
def verify_token():
    token = request.headers['Authorization'][7:]  # Remove 'Bearer ' prefix
    data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
    
    return jsonify({'valid': True, 'username': data['username'], 'role': data['role']})

# Classes API
@app.route('/api/classes', methods=['GET'])
@token_required
def get_classes():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM classes ORDER BY name")
    classes = [{'id': row['id'], 'name': row['name']} for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify(classes)

# Students API
@app.route('/api/students', methods=['GET'])
@token_required
def get_students():
    conn = get_db()
    cursor = conn.cursor()
    
    class_id = request.args.get('class_id')
    
    if class_id:
        cursor.execute("""
            SELECT s.id, s.name, s.class_id, c.name as class_name 
            FROM students s
            JOIN classes c ON s.class_id = c.id
            WHERE s.class_id = ?
            ORDER BY s.name
        """, (class_id,))
    else:
        cursor.execute("""
            SELECT s.id, s.name, s.class_id, c.name as class_name 
            FROM students s
            JOIN classes c ON s.class_id = c.id
            ORDER BY s.name
        """)
    
    students = [{'id': row['id'], 'name': row['name'], 'class_id': row['class_id'], 'class_name': row['class_name']} 
                for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify(students)

@app.route('/api/students/<student_id>', methods=['GET'])
@token_required
def get_student(student_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT s.id, s.name, s.class_id, c.name as class_name 
        FROM students s
        JOIN classes c ON s.class_id = c.id
        WHERE s.id = ?
    """, (student_id,))
    
    student = cursor.fetchone()
    
    conn.close()
    
    if student:
        return jsonify({
            'id': student['id'],
            'name': student['name'],
            'class_id': student['class_id'],
            'class_name': student['class_name']
        })
    else:
        return jsonify({'message': 'Student not found'}), 404

@app.route('/api/students/add', methods=['POST'])
@token_required
def add_student():
    data = request.json
    
    if not data or not data.get('id') or not data.get('name') or not data.get('class_id'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO students (id, name, class_id) 
            VALUES (?, ?, ?)
        """, (data.get('id'), data.get('name'), data.get('class_id')))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Student added successfully'})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'message': 'Student ID already exists'}), 400
    except Exception as e:
        conn.close()
        return jsonify({'message': str(e)}), 500

@app.route('/api/students/update/<student_id>', methods=['PUT'])
@token_required
def update_student(student_id):
    data = request.json
    
    if not data or not data.get('name') or not data.get('class_id'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            UPDATE students 
            SET name = ?, class_id = ? 
            WHERE id = ?
        """, (data.get('name'), data.get('class_id'), student_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'message': 'Student not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Student updated successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'message': str(e)}), 500

@app.route('/api/students/delete/<student_id>', methods=['DELETE'])
@token_required
def delete_student(student_id):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # First delete attendance records for this student
        cursor.execute("DELETE FROM attendance WHERE student_id = ?", (student_id,))
        
        # Then delete the student
        cursor.execute("DELETE FROM students WHERE id = ?", (student_id,))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'message': 'Student not found'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Student deleted successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'message': str(e)}), 500

# Attendance API
@app.route('/api/attendance/students', methods=['GET'])
@token_required