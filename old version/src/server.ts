import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
const db = new Database('attendance.db', { verbose: console.log });

app.use(cors());
app.use(express.json());

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )
  `);

  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      course_id TEXT,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    )
  `);

  // Attendance records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      present INTEGER NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (student_id) REFERENCES students(student_id)
    )
  `);

  // Insert default admin user if not exists
  const checkAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!checkAdmin) {
    db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', 'admin123');
  }
}

// Initialize database
initializeDatabase();

// Authentication endpoints
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  
  if (user) {
    res.json({ success: true, user: { username: user.username } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Sessions endpoints
app.get('/api/sessions', (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions').all();
  res.json(sessions);
});

// Courses endpoints
app.get('/api/courses', (req, res) => {
  const courses = db.prepare('SELECT * FROM courses').all();
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (course) {
    res.json(course);
  } else {
    res.status(404).json({ error: 'Course not found' });
  }
});

// Students endpoints
app.get('/api/courses/:courseId/students', (req, res) => {
  const students = db.prepare('SELECT * FROM students WHERE course_id = ?').all(req.params.courseId);
  res.json(students);
});

// Attendance endpoints
app.get('/api/attendance/:courseId/:date', (req, res) => {
  const { courseId, date } = req.params;
  const attendance = db.prepare(`
    SELECT s.*, ar.present 
    FROM students s 
    LEFT JOIN attendance_records ar ON s.student_id = ar.student_id 
    AND ar.course_id = ? AND ar.date = ?
    WHERE s.course_id = ?
  `).all(courseId, date, courseId);
  res.json(attendance);
});

app.post('/api/attendance', (req, res) => {
  const { records } = req.body;
  
  // Start a transaction
  const transaction = db.transaction((records) => {
    for (const record of records) {
      // Delete existing record for this student, course, and date
      db.prepare(`
        DELETE FROM attendance_records 
        WHERE student_id = ? AND course_id = ? AND date = ?
      `).run(record.studentId, record.courseId, record.date);
      
      // Insert new record
      db.prepare(`
        INSERT INTO attendance_records (date, course_id, student_id, present)
        VALUES (?, ?, ?, ?)
      `).run(record.date, record.courseId, record.studentId, record.present ? 1 : 0);
    }
  });

  try {
    transaction(records);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 