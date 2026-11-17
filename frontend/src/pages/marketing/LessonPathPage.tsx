import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { courseHref, useCourse, useCourses } from '@/shared/api/catalog';
import { COURSE_PART_NOTE } from '@/shared/constants/public';
import { SkeletonCard } from '@/shared/components/ui';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { cn, stageOf } from '@/shared/utils';
import { TRACK_LABEL, type Course, type Lesson } from '@/shared/types';
import { ActionLink, PageHeader, Section } from './shared/PageKit';
import { Books3DIcon, OwlMascotIcon, VideoBadgeIcon, BlueCirclePlayIcon } from '@/shared/components/media/EdmicroIcons';

/** Nhãn đầu trang theo mục chính (TOEIC / VSTEP / THPT) và nhóm trong mục; `muc` = tham số tab ở trang Khoá học */
const copyOf = (c: Course): { eyebrow: string; title: React.ReactNode; track: string; muc: string } => ({
  eyebrow: [c.track && TRACK_LABEL[c.track], c.trackGroup].filter(Boolean).join(' · ') || 'Khoá học',
  title: c.title,
  track: c.track ? TRACK_LABEL[c.track] : 'Khoá học',
  muc: (c.track ?? 'TOEIC').toLowerCase(),
});

const TYPE_LABEL: Record<Lesson['type'], string> = { VIDEO: 'Video', READING: 'Tài liệu', QUIZ: 'Bài kiểm tra' };

const getLessonSubLabel = (l: Lesson) => {
  if (l.type === 'QUIZ') return 'Quiz';
  if (l.title.toLowerCase().includes('tổng hợp') || l.title.toLowerCase().includes('document') || l.title.toLowerCase().includes('lý thuyết')) return 'Document';
  if (l.title.toLowerCase().includes('tự luyện') || l.title.toLowerCase().includes('dictation') || l.title.toLowerCase().includes('chính tả')) return 'Dictation';
  if (l.type === 'READING') return 'Document';
  if (l.exerciseCount && l.exerciseCount > 0 && !l.videoUrl) return 'Practice';
  return 'Video';
};

const STEPS = ['Học bài: xem video bài giảng, ôn ý chính và kiến thức trong bài, bấm vào từ để tra nghĩa.', 'Làm bài tập ngay sau bài, đúng từ 70% để hoàn thành bài.', 'Bài tiếp theo tự mở. Cuối mỗi chặng có bài kiểm tra hoặc Review.'];

/**
 * Trang một mục Khoá học (/courses/:slug): danh sách bài đánh số từ Bài 1, chia theo chặng.
 * Học viên thấy bài đã học / đang học / còn khoá; khách bấm bài sẽ được đưa tới đăng ký hoặc đăng nhập.
 */
export const LessonPathPage: React.FC = () => {
  const { slug } = useParams();
  const { data: course, isLoading, isError } = useCourse(slug);
  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={8} />
      </div>
    );
  return course && !isError ? <PathView key={course.id} course={course} /> : <Navigate to="/courses" replace />;
};

const PathView: React.FC<{ course: Course }> = ({ course }) => {
  const copy = copyOf(course);
  // Gợi ý các khoá khác cùng mục chính (TOEIC / VSTEP / THPT), theo thứ tự học
  const { data: courseList = [] } = useCourses();
  const others = courseList.filter((c) => c.id !== course.id && c.track === course.track);
  useDocumentTitle(course.title);
  const gate = useGate();
  const isStudent = useAuthStore((s) => s.user?.role === 'STUDENT');

  const all = course.sections.flatMap((s) => s.lessons);
  const doneCount = all.filter((l) => l.isCompleted).length;
  const current = all.find((l) => !l.isCompleted && !l.isLocked) ?? all[0];
  const totalMin = all.reduce((a, l) => a + l.durationMin, 0);
  const lessonUrl = (l: Lesson) => `/app/courses/${course.id}/lessons/${l.id}`;
  const numberOf = (l: Lesson) => all.indexOf(l) + 1;
  const parts = [...new Set(course.sections.map((s) => s.part).filter(Boolean))];
  // khoá trọn gói: Chặng (phần lớn) → Chương → Bài
  const staged = parts.length > 0 && course.sections.every((s) => stageOf(s.part));
  // chỉ mở sẵn chương đang học (khách: chương đầu) — khoá dài không bung hết hàng trăm bài
  const currentSec = course.sections.find((s) => s.lessons.some((l) => l.id === current?.id))?.id ?? course.sections[0]?.id;
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(currentSec ? [currentSec] : []));
  const allOpen = open.size === course.sections.length;
  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học', to: '/courses' }, { label: copy.track, to: `/courses?muc=${copy.muc}` }, { label: course.title }]}
        eyebrow={copy.eyebrow}
        title={copy.title}
        lead={course.description}
        facts={[
          { value: String(all.length), label: 'Bài học' },
          ...(staged ? [{ value: String(parts.length), label: 'Chặng' }, { value: String(course.sections.length), label: 'Chương' }] : [{ value: String(course.sections.length), label: 'Chặng' }]),
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
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-slate-500">
                {course.sections.length} {staged ? 'chương' : 'chặng'} · bấm tên chương để xem bài
              </p>
              <button type="button" onClick={() => setOpen(allOpen ? new Set(currentSec ? [currentSec] : []) : new Set(course.sections.map((s) => s.id)))} className="text-[13px] font-semibold text-indigo-700 hover:underline underline-offset-2">
                {allOpen ? 'Thu gọn' : 'Mở tất cả chương'}
              </button>
            </div>
            {course.sections.map((sec, si) => {
              const isOpen = open.has(sec.id);
              const secDone = sec.lessons.filter((l) => l.isCompleted).length;
              const secPercent = sec.lessons.length > 0 ? Math.round((secDone / sec.lessons.length) * 100) : 0;
              const partStart = sec.part && sec.part !== course.sections[si - 1]?.part;
              return (
                <React.Fragment key={sec.id}>
                {partStart && (
                  <div className="rounded-2xl bg-slate-900/[0.035] px-5 py-4 ring-1 ring-inset ring-slate-200">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">{staged ? `Chặng ${stageOf(sec.part)!.no}` : `Phần ${parts.indexOf(sec.part!) + 1}`}</p>
                    <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 md:text-[1.75rem]">{staged ? stageOf(sec.part)!.name : sec.part}</p>
                    {COURSE_PART_NOTE[sec.part!] && <p className="mt-1 text-[14px] text-slate-600">{COURSE_PART_NOTE[sec.part!]}</p>}
                  </div>
                )}
                <section aria-labelledby={sec.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => toggle(sec.id)}
                    className="group flex w-full flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <Books3DIcon size={56} className="transition-transform group-hover:scale-105" />
                      <div>
                        <h2 id={sec.id} className="font-display text-lg font-bold text-[#1b6e7e] transition-colors group-hover:text-[#13535f] sm:text-xl">
                          {sec.title}
                        </h2>
                        <p className="mt-0.5 text-xs font-medium text-slate-400 sm:text-sm">
                          {sec.lessons.length} {sec.lessons.length === 1 ? 'lesson' : 'lessons'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-100 sm:w-56">
                        <div
                          className="h-full rounded-full bg-[#00d284] transition-all duration-500"
                          style={{ width: `${secPercent}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-display text-xs font-bold text-slate-500 tabular-nums sm:text-sm">
                        {secPercent}%
                      </span>
                      <ChevronDown className={cn('h-5 w-5 text-slate-400 transition-transform duration-200 group-hover:text-slate-700', isOpen && 'rotate-180')} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="relative mt-4 border-t border-slate-100 pl-2 pt-4 sm:pl-4">
                      {/* Vertical timeline line connecting nodes */}
                      <div className="absolute bottom-6 left-[28px] top-7 w-[2px] bg-sky-100 sm:left-[36px]" />
                      <ol className="relative space-y-3">
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
                    </div>
                  )}
                </section>
                </React.Fragment>
              );
            })}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            {others.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-2">
              <p className="px-3 pb-1 pt-2 text-[12px] text-slate-500">Khoá khác trong mục {copy.track}</p>
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
            )}
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

/** Dòng bài học theo style Edmicro TOEIC với mascot/video badge tròn và timeline nối dọc */
const LessonRow: React.FC<{ lesson: Lesson; n: number; last: boolean; state: RowState; to: string }> = ({ lesson, n, last, state, to }) => {
  const locked = state === 'locked';
  const isDone = state === 'done';
  const isCurrent = state === 'current';
  const subLabel = getLessonSubLabel(lesson);

  const body = (
    <>
      {/* Mascot / Video Icon Node */}
      <div className="relative shrink-0">
        {subLabel === 'Video' ? <VideoBadgeIcon size={44} /> : <OwlMascotIcon size={44} />}
        {isDone && (
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#00d284] text-white shadow-sm">
            <Check className="h-3 w-3 stroke-[3]" />
          </span>
        )}
      </div>

      {/* Thông tin bài học */}
      <div className="min-w-0 flex-1">
        <h3 className={cn('text-[15px] font-semibold leading-snug transition-colors', isCurrent ? 'font-bold text-sky-950' : locked ? 'text-slate-400' : 'text-slate-800 group-hover:text-sky-700')}>
          {lesson.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-700">
          <BlueCirclePlayIcon size={14} />
          <span>{subLabel}</span>
          {lesson.durationMin > 0 && <span className="text-[11px] font-normal text-slate-400">· {lesson.durationMin} phút</span>}
        </div>
      </div>

      {/* Trạng thái / Hành động */}
      <div className="flex items-center gap-2 self-center shrink-0">
        {isDone && <span className="hidden text-xs font-bold text-emerald-600 sm:inline">Hoàn thành</span>}
        {isCurrent && (
          <span className="inline-flex h-8 items-center gap-1 rounded-full bg-sky-600 px-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-700">
            Học tiếp
          </span>
        )}
        {state === 'guest' && lesson.isFree && (
          <span className="inline-flex h-8 items-center rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700">
            Học thử
          </span>
        )}
        {locked ? (
          <span className="flex items-center gap-1 text-xs text-slate-400" title={`Mở sau Bài ${n - 1}`}>
            <Lock className="h-4 w-4" />
          </span>
        ) : (
          !isCurrent && <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600" />
        )}
      </div>
    </>
  );

  const cls = cn(
    'group relative flex items-center gap-3.5 sm:gap-4 rounded-xl p-2.5 sm:p-3 transition-all',
    isCurrent ? 'bg-sky-50/70 ring-1 ring-inset ring-sky-200' : !locked && 'hover:bg-sky-50/40'
  );

  return (
    <li className="relative z-10">
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
