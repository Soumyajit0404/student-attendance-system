import React, { useState, useEffect } from 'react';
import { db } from '../db';

interface AttendanceReportProps {
  courseId: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ courseId }) => {
  const [report, setReport] = useState<{
    dates: string[];
    students: any[];
  }>({ dates: [], students: [] });
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    if (!courseId) return;

    const course = db.getCourse(courseId);
    if (course) {
      setCourseName(course.name);
    }

    const reportData = db.getAttendanceReport(courseId);
    setReport(reportData);
  }, [courseId]);

  if (!courseId || report.dates.length === 0) {
    return (
      <div className="mt-8 text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-xl font-medium text-gray-500">No attendance records found</h3>
        <p className="mt-2 text-gray-400">
          Take attendance first to generate a report
        </p>
      </div>
    );
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
        <h3 className="text-lg font-medium text-gray-700">Attendance Report</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                Student ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              {report.dates.map((date) => (
                <th
                  key={date}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                >
                  {new Date(date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                  })}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {report.students.map((student, index) => (
              <tr
                key={student.studentId}
                className={index % 2 === 0 ? 'bg-blue-50' : 'bg-pink-50'}
              >
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {index + 1}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentId}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.name}
                </td>
                {student.attendance.map((present: boolean, i: number) => (
                  <td key={i} className="px-2 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center">
                      {present ? (
                        <div className="h-5 w-5 bg-green-500 rounded-sm"></div>
                      ) : (
                        <div className="h-5 w-5 bg-red-500 rounded-sm"></div>
                      )}
                    </div>
                  </td>
                ))}
                <td className="px-4 py-4 whitespace-nowrap text-center font-bold">
                  {student.totalPresent} / {report.dates.length}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceReport;