import { Student, Course, Session, AttendanceRecord } from './types';

// Mock database since we can't directly use the .db file in the browser
// In a real application, this would connect to a backend service

// Sessions data
const sessions: Session[] = [
  { id: 'autumn2023', name: '2023 AUTUMN SEMESTER' },
  { id: 'spring2024', name: '2024 SPRING SEMESTER' },
  { id: 'summer2024', name: '2024 SUMMER SEMESTER' }
];

// Generate mock student data
const generateStudents = (count: number, prefix: string): Student[] => {
  const students: Student[] = [];
  const firstNames = ['Emily', 'Michael', 'Sarah', 'David', 'Olivia', 'Christopher', 'Sophia', 'Ethan', 'Emma', 'James', 'Daniel', 'Mia', 'Chloe', 'Isabella', 'Grace', 'Caleb'];
  const lastNames = ['Johnson', 'Smith', 'Martinez', 'Brown', 'Williams', 'Davis', 'Wilson', 'Anderson', 'Miller', 'Jones', 'Thomas', 'Garcia', 'Martin', 'Hall', 'Lewis', 'Baker'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const studentId = `${prefix}${(i + 1001).toString().padStart(4, '0')}`;
    
    students.push({
      id: i + 1,
      studentId,
      name: `${firstName} ${lastName}`
    });
  }
  
  return students;
};

// Courses data
const courses: Course[] = [
  { 
    id: 'CS670', 
    name: 'ARTIFICIAL INTELLIGENCE',
    students: generateStudents(60, 'CSB2')
  },
  { 
    id: 'CO321', 
    name: 'DATABASE SYSTEMS',
    students: generateStudents(55, 'CSM2')
  },
  { 
    id: 'CO215', 
    name: 'WEB DEVELOPMENT',
    students: generateStudents(52, 'CSA2')
  }
];

// Attendance records
let attendanceRecords: AttendanceRecord[] = [];

// User authentication
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'rcb', password: '1234' }
];

export const db = {
  // Authentication
  login: (username: string, password: string) => {
    return users.find(user => user.username === username && user.password === password);
  },
  
  // Sessions
  getSessions: () => {
    return sessions;
  },
  
  // Courses
  getCourses: () => {
    return courses;
  },
  
  getCourse: (courseId: string) => {
    return courses.find(course => course.id === courseId);
  },
  
  // Students
  getStudents: (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.students : [];
  },
  
  // Attendance
  getAttendance: (courseId: string, date: string) => {
    const records = attendanceRecords.filter(
      record => record.courseId === courseId && record.date === date
    );
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];
    
    return course.students.map(student => {
      const record = records.find(r => r.studentId === student.studentId);
      return {
        ...student,
        present: record ? record.present : false
      };
    });
  },
  
  saveAttendance: (records: AttendanceRecord[]) => {
    // Remove existing records for this course and date
    const firstRecord = records[0];
    attendanceRecords = attendanceRecords.filter(
      record => !(record.courseId === firstRecord.courseId && record.date === firstRecord.date)
    );
    
    // Add new records
    attendanceRecords = [...attendanceRecords, ...records];
    
    return true;
  },
  
  getAttendanceReport: (courseId: string) => {
    const courseRecords = attendanceRecords.filter(record => record.courseId === courseId);
    const dates = [...new Set(courseRecords.map(record => record.date))].sort();
    
    const course = courses.find(c => c.id === courseId);
    if (!course) return { dates: [], students: [] };
    
    const students = course.students.map(student => {
      const studentAttendance = dates.map(date => {
        const record = courseRecords.find(
          r => r.studentId === student.studentId && r.date === date
        );
        return record ? record.present : false;
      });
      
      return {
        ...student,
        attendance: studentAttendance,
        totalPresent: studentAttendance.filter(present => present).length
      };
    });
    
    return { dates, students };
  }
};