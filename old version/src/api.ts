const API_BASE_URL = 'http://localhost:5000/api';

export interface User {
  username: string;
  password: string;
}

export interface Session {
  id: string;
  name: string;
}

export interface Course {
  id: string;
  name: string;
}

export interface Student {
  id: number;
  student_id: string;
  name: string;
  course_id?: string;
  present?: boolean;
}

export interface AttendanceRecord {
  date: string;
  courseId: string;
  studentId: string;
  present: boolean;
}

export const api = {
  // Authentication
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  // Sessions
  getSessions: async (): Promise<Session[]> => {
    const response = await fetch(`${API_BASE_URL}/sessions`);
    return response.json();
  },

  // Courses
  getCourses: async (): Promise<Course[]> => {
    const response = await fetch(`${API_BASE_URL}/courses`);
    return response.json();
  },

  getCourse: async (courseId: string): Promise<Course> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
    return response.json();
  },

  // Students
  getStudents: async (courseId: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/students`);
    return response.json();
  },

  // Attendance
  getAttendance: async (courseId: string, date: string): Promise<Student[]> => {
    const response = await fetch(`${API_BASE_URL}/attendance/${courseId}/${date}`);
    return response.json();
  },

  saveAttendance: async (records: AttendanceRecord[]): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records }),
    });
    const result = await response.json();
    return result.success;
  },
}; 