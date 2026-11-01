import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, FileText, HelpCircle } from 'lucide-react';
import { MOCK_COURSES, courseHref } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { Breadcrumb, Badge } from '@/shared/components/ui';
import { LessonEngine } from '@/engines';

const TYPE_LABEL = { VIDEO: { label: 'Video bài giảng', Icon: Video }, READING: { label: 'Bài đọc', Icon: FileText }, QUIZ: { label: 'Quiz củng cố', Icon: HelpCircle } } as const;

export const StudentLessonPage: React.FC = () => {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const course = MOCK_COURSES.find((c) => c.id === id) ?? MOCK_COURSES[0];
  const all = course.sections.flatMap((s) => s.lessons);
  const lesson = all.find((l) => l.id === lessonId) ?? all.find((l) => !l.isLocked && !l.isCompleted) ?? all[0];
  useDocumentTitle(lesson.title);
  const idx = all.findIndex((l) => l.id === lesson.id);
  const t = TYPE_LABEL[lesson.type];

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 animate-fade-down">
        <div className="space-y-2">
          <Breadcrumb items={[{ label: 'Khoá học', to: '/courses' }, { label: course.title, to: courseHref(course) }, { label: lesson.title }]} />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="sticker tilt-3 !text-[10px] !py-1">
              <t.Icon className="w-3.5 h-3.5" /> {t.label}
            </span>
            <Badge tone="slate" size="xs">
              Bài {idx + 1}/{all.length}
            </Badge>
            <Badge tone="indigo" size="xs">
              {course.level}
            </Badge>
          </div>
        </div>
      </div>
      <LessonEngine key={lesson.id} course={course} lesson={lesson} onSelectLesson={(lid) => navigate(`/app/courses/${course.id}/lessons/${lid}`)} onComplete={() => undefined} />
    </div>
  );
};
