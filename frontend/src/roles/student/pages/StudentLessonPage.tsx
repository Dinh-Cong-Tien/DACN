import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { Breadcrumb } from '@/shared/components/ui';
import { LessonEngine } from '@/engines';

export const StudentLessonPage: React.FC = () => {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const course = MOCK_COURSES.find((c) => c.id === id) ?? MOCK_COURSES[0];
  const all = course.sections.flatMap((s) => s.lessons);
  const lesson = all.find((l) => l.id === lessonId) ?? all.find((l) => !l.isLocked && !l.isCompleted) ?? all[0];
  useDocumentTitle(lesson.title);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Khoá học', to: '/app/courses' }, { label: course.title, to: `/app/courses/${course.id}` }, { label: lesson.title }]} />
      <LessonEngine key={lesson.id} course={course} lesson={lesson} onSelectLesson={(lid) => navigate(`/app/courses/${course.id}/lessons/${lid}`)} onComplete={() => undefined} />
    </div>
  );
};
