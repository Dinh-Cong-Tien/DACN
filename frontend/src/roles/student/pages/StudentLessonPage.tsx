import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Video, FileText, HelpCircle } from 'lucide-react';
import { courseHref, useCourse, useLesson, useLessonProgress } from '@/shared/api/catalog';
import { useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '@/shared/hooks';
import { Breadcrumb, Badge, EmptyState, Button } from '@/shared/components/ui';
import { LessonEngine } from '@/engines';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';

const TYPE_LABEL = { VIDEO: { label: 'Video bài giảng', Icon: Video }, READING: { label: 'Bài đọc', Icon: FileText }, QUIZ: { label: 'Kiểm tra chặng', Icon: HelpCircle } } as const;

export const StudentLessonPage: React.FC = () => {
  const { id = '', lessonId } = useParams<{ id: string; lessonId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: course, isLoading, error } = useCourse(id);
  const all = course?.sections.flatMap((s) => s.lessons) ?? [];
  // Không chỉ định bài → bài đang học dở / bài đầu tiên chưa hoàn thành
  const target = all.find((l) => l.id === lessonId) ?? all.find((l) => l.id === course?.currentLessonId) ?? all.find((l) => !l.isLocked && !l.isCompleted) ?? all[0];
  const { data: detail } = useLesson(target?.id);
  const progress = useLessonProgress();
  const lesson = target ? { ...target, ...(detail ?? {}) } : undefined;
  useDocumentTitle(lesson?.title ?? course?.title ?? 'Bài học');

  // Ghi nhận bắt đầu học (tạo/ cập nhật lesson_progress) khi mở bài chưa khoá
  useEffect(() => {
    if (target && !target.isLocked && !target.isCompleted) progress.mutate({ lessonId: target.id, action: 'start' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.id]);

  if (!course || !lesson)
    return (
      <div className="space-y-5">
        <Breadcrumb items={[{ label: 'Khoá học', to: '/courses' }, { label: 'Bài học' }]} />
        {isLoading ? <p className="text-sm text-slate-500">Đang tải bài học…</p> : <EmptyState title="Không tìm thấy bài học" description={error ? errorMessage(error) : 'Khoá học chưa có bài học.'} action={<Button to="/courses">Xem khoá học</Button>} />}
      </div>
    );

  const idx = all.findIndex((l) => l.id === lesson.id);
  const t = TYPE_LABEL[lesson.type] ?? TYPE_LABEL.VIDEO;

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
            {course.level && (
              <Badge tone="indigo" size="xs">
                {course.level}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <LessonEngine
        key={lesson.id}
        course={course}
        lesson={lesson}
        onSelectLesson={(lid) => navigate(`/app/courses/${course.slug ?? course.id}/lessons/${lid}`)}
        onComplete={(lid, scorePct) =>
          progress
            .mutateAsync({ lessonId: lid, action: 'complete', scorePct })
            .then(() => ['progress', 'path'].forEach((k) => qc.invalidateQueries({ queryKey: ['learner', k] })))
            .catch((e) => {
              toast.error('Chưa lưu được tiến độ', errorMessage(e));
              throw e;
            })
        }
      />
    </div>
  );
};
