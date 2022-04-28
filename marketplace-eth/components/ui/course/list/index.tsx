import { ICourse } from '@content/fetcher';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface ICourseListProps {
  courses: ICourse[]
  children: (course:ICourse) => React.ReactNode
}

const CourseList: React.FunctionComponent<ICourseListProps> = ({ courses, children }) => {
  return (
    <section className="grid md:grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
      { courses.map(course => children(course))}
    </section>
  );
};

export default CourseList;
