import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, Course } from '../types';
import { db } from '../db';
import { LogOut, ClipboardList } from 'lucide-react';
import CourseList from './CourseList';
import AttendanceTable from './AttendanceTable';
import AttendanceReport from './AttendanceReport';

const Dashboard: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [showReport, setShowReport] = useState(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }
    
    // Load sessions
    const availableSessions = db.getSessions();
    setSessions(availableSessions);
    
    // Load courses
    const availableCourses = db.getCourses();
    setCourses(availableCourses);
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };
  
  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSession(e.target.value);
    setSelectedCourse('');
    setShowReport(false);
  };
  
  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
    setShowReport(false);
  };
  
  const handleDateChange = (date: string) => {
    setCurrentDate(date);
  };
  
  const toggleView = () => {
    setShowReport(!showReport);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            ATTENDANCE APP
          </h1>
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition duration-200"
          >
            <span>LOGOUT</span>
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Session selector */}
        <div className="mb-8 flex items-center justify-center">
          <div className="w-full max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SESSION
            </label>
            <select
              value={selectedSession}
              onChange={handleSessionChange}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 bg-white"
            >
              <option value="">SELECT ONE</option>
              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Course selection */}
        {selectedSession && (
          <>
            <CourseList
              courses={courses}
              onSelectCourse={handleCourseSelect}
              selectedCourse={selectedCourse}
            />
            
            {/* Divider */}
            {selectedCourse && (
              <div className="border-t border-gray-200 my-6"></div>
            )}
            
            {/* Attendance view toggle */}
            {selectedCourse && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleView}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  <ClipboardList size={18} />
                  <span>{showReport ? "TAKE ATTENDANCE" : "VIEW REPORT"}</span>
                </button>
              </div>
            )}
            
            {/* Attendance table or report */}
            {selectedCourse && !showReport && (
              <AttendanceTable
                courseId={selectedCourse}
                date={currentDate}
                onDateChange={handleDateChange}
              />
            )}
            
            {selectedCourse && showReport && (
              <AttendanceReport courseId={selectedCourse} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;