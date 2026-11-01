import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight, Lock } from 'lucide-react';
import { MOCK_COURSES, courseHref } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn } from '@/shared/utils';
import type { Course, Lesson } from '@/shared/types';
import { Accent, ActionLink, PageHeader, Section } from './shared/PageKit';

/** Nhãn và tiêu đề đầu trang; Kiến thức nền tảng tách riêng theo kỳ thi (TOEIC / VSTEP) */
const copyOf = (c: Course): { eyebrow: string; title: React.ReactNode } =>
  c.category === 'GRAMMAR'
    ? { eyebrow: 'Ngữ pháp', title: <>Ngữ pháp tiếng Anh <Accent>từ đầu</Accent></> }
    : c.category === 'VOCABULARY'
      ? { eyebrow: 'Từ vựng và Phát âm', title: <>Từ vựng và <Accent>Phát âm</Accent></> }
      : { eyebrow: `Kiến thức nền tảng · ${c.examType}`, title: <>Nền tảng <Accent>{c.examType}</Accent></> };

const TYPE_LABEL: Record<Lesson['type'], string> = { VIDEO: 'Video', READING: 'Bài đọc', QUIZ: 'Bài kiểm tra' };

const STEPS = ['Xem video bài giảng, có bản ghi chữ song ngữ và tra từ khi bấm vào chữ.', 'Trả lời 5 câu hỏi cuối bài để chắc là đã hiểu.', 'Bài tiếp theo tự mở. Cuối mỗi chặng có một bài kiểm tra ngắn.'];

/**
 * Trang một mục Khoá học (/courses/:slug): danh sách bài đánh số từ Bài 1, chia theo chặng.
 * Học viên thấy bài đã học / đang học / còn khoá; khách bấm bài sẽ được đưa tới đăng ký hoặc đăng nhập.
 */
export const LessonPathPage: React.FC = () => {
  const { slug } = useParams();
  const course = MOCK_COURSES.find((c) => c.slug === slug);
  return course ? <PathView key={course.id} course={course} /> : <Navigate to="/courses" replace />;
};

const PathView: React.FC<{ course: Course }> = ({ course }) => {
  const copy = copyOf(course);
  // Học song song: khoá nền tảng chỉ gợi ý 2 khoá kiến thức chung, không gợi ý khoá của kỳ thi kia
  const others = MOCK_COURSES.filter((c) => c.id !== course.id && (course.category !== 'FOUNDATION' || c.category !== 'FOUNDATION'));
  useDocumentTitle(course.title);
  const gate = useGate();
  const isStudent = useAuthStore((s) => s.user?.role === 'STUDENT');

  const all = course.sections.flatMap((s) => s.lessons);
  const doneCount = all.filter((l) => l.isCompleted).length;
  const current = all.find((l) => !l.isCompleted && !l.isLocked) ?? all[0];
  const totalMin = all.reduce((a, l) => a + l.durationMin, 0);
  const lessonUrl = (l: Lesson) => `/app/courses/${course.id}/lessons/${l.id}`;
  const numberOf = (l: Lesson) => all.indexOf(l) + 1;

  const primary = isStudent ? (
    <ActionLink to={lessonUrl(current)} size="lg" icon={<ArrowRight className="w-4 h-4" />}>
      {doneCount === 0 ? 'Bắt đầu Bài 1' : doneCount === all.length ? 'Xem lại từ Bài 1' : `Học tiếp Bài ${numberOf(current)}`}
    </ActionLink>
  ) : (
    <ActionLink to={gate(lessonUrl(all[0]), '/auth/register')} size="lg" icon={<ArrowRight className="w-4 h-4" />}>
      Học Bài 1 miễn phí
    </ActionLink>
  );

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học', to: '/courses' }, { label: copy.eyebrow }]}
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={course.description}
        facts={[
          { value: String(all.length), label: 'Bài học' },
          { value: String(course.sections.length), label: 'Chặng' },
          { value: `${Math.round(totalMin / 60)} giờ`, label: 'Tổng thời lượng' },
          { value: course.level, label: 'Trình độ' },
        ]}
        actions={
          <>
            {primary}
            <ActionLink to="/courses" variant="secondary" size="lg">
              Các khoá khác
            </ActionLink>
          </>
        }
        aside={
          isStudent ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(16,24,40,0.35)] lg:ml-auto lg:max-w-sm">
              <p className="text-[13px] text-slate-500">Tiến độ của bạn</p>
              <p className="mt-1 font-display text-3xl font-bold tabular-nums text-slate-900">
                {doneCount}
                <span className="text-lg font-semibold text-slate-400">/{all.length} bài</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-900/[0.07]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(doneCount / all.length) * 100}%` }} />
              </div>
              <div className="mt-5 border-t border-slate-200 pt-5">
                <p className="text-[12px] text-slate-500">Bài tiếp theo</p>
                <Link to={lessonUrl(current)} className="mt-1 block font-semibold leading-snug text-slate-900 hover:text-indigo-700">
                  Bài {numberOf(current)}. {current.title}
                </Link>
                <p className="mt-1 text-[13px] text-slate-500">
                  {TYPE_LABEL[current.type]} · {current.durationMin} phút
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-30px_rgba(16,24,40,0.35)] lg:ml-auto lg:max-w-sm">
              <p className="font-semibold text-slate-900">Học theo thứ tự</p>
              <ol className="mt-4 space-y-4">
                {STEPS.map((t, i) => (
                  <li key={t} className="flex gap-3 text-[14px] leading-relaxed text-slate-600">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900/[0.06] text-[12px] font-bold text-slate-700">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-slate-200 pt-4 text-[13px] text-slate-500">Lộ trình miễn phí, chỉ cần tạo tài khoản để lưu tiến độ.</p>
            </div>
          )
        }
      />

      <Section innerClassName="py-12 md:py-16">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_300px]">
          <div className="space-y-12">
            {course.sections.map((sec, si) => {
              const secDone = sec.lessons.filter((l) => l.isCompleted).length;
              return (
                <section key={sec.id} aria-labelledby={sec.id}>
                  <div className="flex flex-col gap-1 border-b border-slate-200 pb-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">Chặng {si + 1}</p>
                      <h2 id={sec.id} className="mt-1 font-display text-xl font-bold text-slate-900 md:text-2xl">
                        {sec.title}
                      </h2>
                    </div>
                    <p className="shrink-0 text-[13px] tabular-nums text-slate-500">
                      {sec.lessons.length} bài · {sec.lessons.reduce((a, l) => a + l.durationMin, 0)} phút
                      {isStudent && ` · đã học ${secDone}/${sec.lessons.length}`}
                    </p>
                  </div>
                  <ol className="mt-2">
                    {sec.lessons.map((l, li) => (
                      <LessonRow
                        key={l.id}
                        lesson={l}
                        n={numberOf(l)}
                        last={li === sec.lessons.length - 1}
                        state={!isStudent ? 'guest' : l.isCompleted ? 'done' : l.id === current.id ? 'current' : l.isLocked ? 'locked' : 'open'}
                        to={isStudent ? lessonUrl(l) : gate(lessonUrl(l), l.isFree ? '/auth/register' : '/auth/login')}
                      />
                    ))}
                  </ol>
                </section>
              );
            })}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-2">
              <p className="px-3 pb-1 pt-2 text-[12px] text-slate-500">Học song song</p>
              {others.map((o) => (
                <Link key={o.id} to={courseHref(o)} className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-900/[0.03]">
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-slate-900 group-hover:text-indigo-700">{o.title}</span>
                    <span className="block text-[13px] text-slate-500">
                      {o.lessonsCount} bài · {o.durationHours} giờ
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                </Link>
              ))}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[12px] text-slate-500">Khi đã vững kiến thức chung</p>
              <p className="mt-1 text-[14px] leading-relaxed text-slate-600">Chuyển sang luyện đề theo kỳ thi bạn chọn.</p>
              <div className="mt-3 flex flex-col gap-1.5">
                {(['TOEIC', 'VSTEP'] as const).map((e) => (
                  <Link key={e} to={`/${e.toLowerCase()}`} className="inline-flex items-center gap-1 text-[13px] font-semibold text-indigo-700 hover:underline underline-offset-2">
                    Luyện thi {e} <ChevronRight className="w-4 h-4" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
};

type RowState = 'done' | 'current' | 'open' | 'locked' | 'guest';

/** Một dòng bài học: số thứ tự trên đường nối dọc, tên bài, mô tả, trạng thái bên phải */
const LessonRow: React.FC<{ lesson: Lesson; n: number; last: boolean; state: RowState; to: string }> = ({ lesson, n, last, state, to }) => {
  const locked = state === 'locked';
  const body = (
    <>
      <span
        className={cn(
          'relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-bold tabular-nums',
          state === 'done' && 'bg-emerald-500 text-white',
          state === 'current' && 'bg-indigo-600 text-white',
          (state === 'open' || state === 'guest') && 'border border-slate-300 bg-white text-slate-700',
          locked && 'border border-slate-200 bg-white text-slate-400'
        )}
      >
        {state === 'done' ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">
          Bài {n} · {TYPE_LABEL[lesson.type]} · {lesson.durationMin} phút
        </p>
        <p className={cn('mt-0.5 font-semibold leading-snug', locked ? 'text-slate-500' : 'text-slate-900 group-hover:text-indigo-700')}>{lesson.title}</p>
        {lesson.summary && <p className={cn('mt-1 text-[13px] leading-relaxed', locked ? 'text-slate-400' : 'text-slate-600')}>{lesson.summary}</p>}
      </div>
      <div className="flex items-center self-center text-[13px]">
        {state === 'done' && <span className="hidden font-medium text-emerald-700 sm:inline">Đã học</span>}
        {state === 'current' && <span className="btn-3d inline-flex h-9 items-center gap-1.5 rounded-lg border-violet-700 bg-violet-500 px-3.5 font-bold text-white">Học tiếp</span>}
        {state === 'guest' && lesson.isFree && <span className="hidden font-semibold text-indigo-700 sm:inline">Học thử</span>}
        {locked ? (
          <span className="flex items-center gap-1.5 text-slate-400" title={`Mở sau khi học xong Bài ${n - 1}`}>
            <Lock className="h-4 w-4" />
            <span className="hidden md:inline">Mở sau Bài {n - 1}</span>
          </span>
        ) : (
          state !== 'current' && <ChevronRight className="ml-1 h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
        )}
      </div>
    </>
  );
  const cls = cn('group relative grid grid-cols-[36px_1fr_auto] items-start gap-4 rounded-xl px-3 py-4 transition-colors', state === 'current' ? 'bg-indigo-500/[0.07] ring-1 ring-inset ring-indigo-500/25' : !locked && 'hover:bg-slate-900/[0.03]');

  return (
    <li className="relative">
      {/* Đường nối giữa các số thứ tự trong cùng chặng */}
      {!last && <span aria-hidden className={cn('absolute left-[29.5px] top-[52px] -bottom-4 w-px', state === 'done' ? 'bg-emerald-500/60' : 'bg-slate-200')} />}
      {locked ? (
        <div className={cls} aria-disabled>
          {body}
        </div>
      ) : (
        <Link to={to} className={cls}>
          {body}
        </Link>
      )}
    </li>
  );
};
