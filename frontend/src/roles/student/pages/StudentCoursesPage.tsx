import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, Star, Users, Clock, BookOpen, ChevronRight, Lock, Play } from 'lucide-react';
import { MOCK_COURSES, courseHref } from '@/shared/mocks';
import type { Course, Lesson } from '@/shared/types';
import { cn } from '@/shared/utils';
import { useDocumentTitle, useParamState } from '@/shared/hooks';
import { Badge, Button, Card, PageHeader, ProgressBar, Tabs, EmptyState, Avatar } from '@/shared/components/ui';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';

const TEACHER_AVATAR: Record<string, string> = { 'Trần Thu Hà': pravatar(43), 'Lê Quốc Bảo': pravatar(44), 'Phạm Ngọc Linh': pravatar(47) };

const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  const started = (course.progress ?? 0) > 0;
  return (
    <Card hard hover padding="none" className="overflow-hidden animate-fade-up flex flex-col" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="relative">
        <Img src={course.coverUrl ?? PHOTOS.studying} alt={course.title} ratio="video" fallbackClass="bg-indigo-200" className="group-hover:scale-105" />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="sticker tilt-1 !py-1 !text-[10px]">
            {course.examType} · {course.level}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {course.isFree ? (
            <Badge tone="emerald" solid size="xs">
              Miễn phí
            </Badge>
          ) : (
            <Badge tone="amber" solid size="xs" icon={<Lock className="w-3 h-3" />}>
              VIP
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-violet-500 border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm">
          <Play className="w-4 h-4 ml-0.5 fill-current" />
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3 border-t-2 border-slate-900">
        <div>
          <h3 className="font-display font-bold text-slate-900 leading-snug line-clamp-2">{course.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar name={course.teacherName} src={TEACHER_AVATAR[course.teacherName]} size="xs" />
            <p className="text-xs text-slate-600 font-semibold">{course.teacherName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600 font-bold">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> {course.lessonsCount} bài
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.durationHours}h
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> {(course.studentsCount / 1000).toFixed(1)}k
          </span>
        </div>
        {started && <ProgressBar value={course.progress ?? 0} size="sm" tone="emerald" showValue label="Tiến độ" />}
        <div className="mt-auto pt-2">
          <Button to={courseHref(course, true)} fullWidth size="sm" variant={started ? 'primary' : 'outline'} rightIcon={<ChevronRight className="w-4 h-4" />}>
            {started ? 'Tiếp tục học' : 'Bắt đầu học'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const StudentCoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học & Video');
  const [tab, setTab] = useParamState('tab', ['learning', 'all', 'TOEIC', 'VSTEP'], 'learning');

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

  const hero = recent[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <>
            Khoá học & <span className="mark">Video bài giảng</span>
          </>
        }
        icon={<PlayCircle />}
        description="Video kèm transcript song ngữ, tra từ điển 1 chạm và quiz củng cố sau mỗi chương."
      />

      {hero && (
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
          <Link to={`/app/courses/${hero.course.id}/lessons/${hero.lesson.id}`} className="block group animate-fade-up">
            <Card hard tone="ink" padding="none" className="overflow-hidden h-full">
              <div className="grid md:grid-cols-[1fr_260px] h-full">
                <div className="p-6 md:p-8 flex flex-col justify-between gap-6">
                  <div>
                    <span className="sticker tilt-2 !bg-amber-300">Học tiếp</span>
                    <p className="text-xs text-slate-400 mt-4 font-semibold">{hero.course.title}</p>
                    <h2 className="font-display text-2xl md:text-3xl font-extrabold text-white leading-tight mt-1">{hero.lesson.title}</h2>
                    <p className="text-sm text-slate-300 mt-2">
                      {hero.lesson.type === 'VIDEO' ? 'Video' : hero.lesson.type === 'READING' ? 'Bài đọc' : 'Quiz'} · {hero.lesson.durationMin} phút · còn {100 - (hero.course.progress ?? 0)}% khoá học
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center justify-center h-11 px-5 rounded-xl bg-violet-500 border-b-4 border-violet-700 text-white font-bold text-sm group-hover:bg-violet-400 transition">
                      <Play className="w-4 h-4 mr-2 fill-current" /> Vào học ngay
                    </span>
                    <div className="flex-1 max-w-[180px]">
                      <ProgressBar value={hero.course.progress ?? 0} size="sm" tone="amber" />
                    </div>
                  </div>
                </div>
                <div className="relative hidden md:block border-l-2 border-slate-900">
                  <Img src={hero.course.coverUrl ?? PHOTOS.laptop} alt="" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-700" />
                </div>
              </div>
            </Card>
          </Link>
          <div className="space-y-3">
            {recent.slice(1).map(({ course, lesson }, i) => (
              <Link key={course.id} to={`/app/courses/${course.id}/lessons/${lesson.id}`} className="block animate-fade-up" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                <Card hard hover padding="sm" className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl overflow-hidden border-2 border-slate-900 shrink-0">
                    <Img src={course.coverUrl ?? PHOTOS.books} alt="" wrapperClass="w-full h-full" fallbackClass="bg-amber-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-slate-500 truncate font-semibold">{course.title}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{lesson.title}</p>
                    <ProgressBar value={course.progress ?? 0} size="xs" className="mt-2" tone="emerald" />
                  </div>
                </Card>
              </Link>
            ))}
            <Card hard tone="yellow" padding="sm" className="flex items-center gap-3 animate-fade-up" style={{ animationDelay: '240ms' }}>
              <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold leading-snug">Mẹo: nhấn vào bất kỳ từ nào trong transcript để tra nghĩa và lưu vào sổ từ.</p>
            </Card>
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
          <Card hard>
            <EmptyState icon={<BookOpen />} title="Chưa có khoá học nào" description="Chọn một khoá học trong mục Tất cả để bắt đầu." />
          </Card>
        ) : (
          <div key={tab} className={cn('grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5')}>
            {list.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
