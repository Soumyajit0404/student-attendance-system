import React from 'react';
import { Course } from '../types';

interface CourseListProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  selectedCourse: string;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onSelectCourse, selectedCourse }) => {
  return (
    <div className="flex justify-center gap-4 my-8">
      {courses.map((course) => (
        <button
          key={course.id}
          onClick={() => onSelectCourse(course.id)}
          className={`w-24 h-24 rounded-md text-white font-bold transition-all duration-200 ${
            selectedCourse === course.id
              ? 'bg-pink-400 scale-95'
              : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {course.id}
        </button>
      ))}
    </div>
  );
};

export default CourseList;