export interface Student {
  id: number;
  studentId: string;
  name: string;
  present?: boolean;
}

export interface Course {
  id: string;
  name: string;
  students: Student[];
}

export interface Session {
  id: string;
  name: string;
}

export interface User {
  username: string;
  password: string;
}

export interface AttendanceRecord {
  id?: number;
  date: string;
  courseId: string;
  studentId: string;
  present: boolean;
}