import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { db } from '../db';
import { Calendar, Save } from 'lucide-react';

interface AttendanceTableProps {
  courseId: string;
  date: string;
  onDateChange: (date: string) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ courseId, date, onDateChange }) => {
  const [students, setStudents] = useState<(Student & { present?: boolean })[]>([]);
  const [courseName, setCourseName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!courseId) return;

    const course = db.getCourse(courseId);
    if (course) {
      setCourseName(course.name);
    }

    const attendanceData = db.getAttendance(courseId, date);
    setStudents(attendanceData);
  }, [courseId, date]);

  const toggleAttendance = (studentId: string) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.studentId === studentId
          ? { ...student, present: !student.present }
          : student
      )
    );
    setSaveSuccess(false);
  };

  const saveAttendance = () => {
    const records = students.map((student) => ({
      date,
      courseId,
      studentId: student.studentId,
      present: student.present || false,
    }));

    const success = db.saveAttendance(records);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  if (!courseId) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4 border-b pb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md font-bold">
            {courseId}
          </div>
          <h2 className="text-xl font-bold uppercase">{courseName}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Calendar size={20} className="text-gray-500" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Present
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr 
                key={student.studentId}
                className={index % 2 === 0 ? 'bg-blue-100' : 'bg-pink-100'}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <input
                      type="checkbox"
                      checked={student.present || false}
                      onChange={() => toggleAttendance(student.studentId)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveAttendance}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md flex items-center gap-2 transition duration-200"
        >
          <Save size={18} />
          <span>SAVE</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-center">
          Attendance saved successfully!
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;