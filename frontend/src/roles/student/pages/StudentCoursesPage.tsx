import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Star, Users, Clock, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { MOCK_COURSES } from '@/shared/mocks';
import type { Course, Lesson } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, PageHeader, ProgressBar, Tabs, EmptyState } from '@/shared/components/ui';

const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  const started = (course.progress ?? 0) > 0;
  return (
    <Card padding="none" className="overflow-hidden card-hover animate-fade-up flex flex-col" style={{ animationDelay: `${index * 60}ms` }}>
      <div className={cn('relative h-36 bg-gradient-to-br p-5 text-white flex flex-col justify-between', course.gradient)}>
        <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex items-center justify-between">
          <Badge tone="slate" solid size="xs" className="!bg-white/20 !text-white backdrop-blur">
            {course.examType} · {course.level}
          </Badge>
          {course.isFree ? (
            <Badge tone="emerald" solid size="xs">
              Miễn phí
            </Badge>
          ) : (
            <Badge tone="amber" solid size="xs" icon={<Sparkles className="w-3 h-3" />}>
              VIP
            </Badge>
          )}
        </div>
        <PlayCircle className="relative w-10 h-10 opacity-90 animate-float" />
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{course.title}</h3>
          <p className="text-xs text-slate-500 mt-1">GV: {course.teacherName}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {course.lessonsCount} bài
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.durationHours}h
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400" /> {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {(course.studentsCount / 1000).toFixed(1)}k
          </span>
        </div>
        {started && <ProgressBar value={course.progress ?? 0} size="sm" tone="emerald" showValue label="Tiến độ" />}
        <div className="mt-auto pt-2">
          <Button to={`/app/courses/${course.id}`} fullWidth size="sm" variant={started ? 'primary' : 'outline'} rightIcon={<ChevronRight className="w-4 h-4" />}>
            {started ? 'Tiếp tục học' : 'Bắt đầu học'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const StudentCoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học & Video');
  const [tab, setTab] = useState('learning');

  const list = MOCK_COURSES.filter((c) => {
    if (tab === 'learning') return (c.progress ?? 0) > 0;
    if (tab === 'TOEIC' || tab === 'VSTEP') return c.examType === tab;
    return true;
  });

  const recent: { course: Course; lesson: Lesson }[] = MOCK_COURSES.filter((c) => (c.progress ?? 0) > 0)
    .map((course) => {
      const lesson = course.sections.flatMap((s) => s.lessons).find((l) => !l.isCompleted && !l.isLocked) ?? course.sections[0].lessons[0];
      return { course, lesson };
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader title="Khoá học & Video bài giảng" icon={<PlayCircle />} description="Video kèm transcript song ngữ, tra từ điển 1 chạm và quiz củng cố sau mỗi chương." />

      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-bold text-slate-900">Học tiếp bài gần đây</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recent.map(({ course, lesson }, i) => (
              <Link key={course.id} to={`/app/courses/${course.id}/lessons/${lesson.id}`} className="block animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <Card hover padding="sm" className="flex items-center gap-4">
                  <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white shrink-0', course.gradient)}>
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-400 truncate">{course.title}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{lesson.title}</p>
                    <ProgressBar value={course.progress ?? 0} size="xs" className="mt-2" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <Tabs
          variant="pill"
          value={tab}
          onChange={setTab}
          items={[
            { key: 'learning', label: 'Đang học', count: MOCK_COURSES.filter((c) => (c.progress ?? 0) > 0).length },
            { key: 'all', label: 'Tất cả', count: MOCK_COURSES.length },
            { key: 'TOEIC', label: 'TOEIC' },
            { key: 'VSTEP', label: 'VSTEP' },
          ]}
        />
        {list.length === 0 ? (
          <Card>
            <EmptyState icon={<BookOpen />} title="Chưa có khoá học nào" description="Chọn một khoá học trong mục Tất cả để bắt đầu." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {list.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
