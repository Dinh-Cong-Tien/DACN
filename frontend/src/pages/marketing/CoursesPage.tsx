import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, GraduationCap, School } from 'lucide-react';
import { RevealPhoto } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { CourseCover } from '@/shared/components/media/CourseCover';
import { courseHref, useCourses } from '@/shared/api/catalog';
import { SkeletonGrid } from '@/shared/components/ui';
import { useDocumentTitle, useGate, useParamState } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { TRACK_LABEL, type Course, type CourseSection, type CourseTrack } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Accent, ActionLink, PageHeader, Section } from './shared/PageKit';

/** Một mục Khoá học: ảnh, mô tả, các chặng theo thứ tự; học viên thấy tiến độ và bài đang học */
const TrackRow: React.FC<{ course: Course; isStudent: boolean }> = ({ course: c, isStudent }) => {
  const gate = useGate();
  const all = c.sections.flatMap((s) => s.lessons);
  const done = all.filter((l) => l.isCompleted).length;
  const current = all.find((l) => !l.isCompleted && !l.isLocked) ?? all[0];
  const lessonUrl = current ? `/app/courses/${c.id}/lessons/${current.id}` : courseHref(c);
  // Gom các chặng liền nhau cùng phần (Ôn kiến thức chung / Luyện theo chủ đề)
  const groups = c.sections.reduce<{ part?: string; items: { s: CourseSection; i: number }[] }[]>((acc, s, i) => {
    const last = acc[acc.length - 1];
    if (last && last.part === s.part) last.items.push({ s, i });
    else acc.push({ part: s.part, items: [{ s, i }] });
    return acc;
  }, []);

  return (
    <article className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,380px)_1fr] md:gap-8 md:p-5">
      <Link to={courseHref(c)} className="block overflow-hidden rounded-xl">
        <RevealPhoto>
          <Img src={c.coverUrl} alt={c.title} ratio="4/3" fallbackClass="bg-slate-200" fallback={<CourseCover course={c} />} className="transition-transform duration-500 hover:scale-[1.03]" />
        </RevealPhoto>
      </Link>
      <div className="flex min-w-0 flex-col py-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{[c.track && TRACK_LABEL[c.track], c.trackGroup].filter(Boolean).join(' · ')}</p>
        <h3 className="mt-1 font-display text-2xl font-bold text-slate-900 md:text-[1.7rem]">
          <Link to={courseHref(c)} className="hover:text-indigo-700">
            {c.title}
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl leading-relaxed text-slate-600">{c.description}</p>
        <p className="mt-3 text-[13px] tabular-nums text-slate-500">
          {all.length} bài · {c.sections.length} chặng · {c.durationHours} giờ · {c.level}
        </p>

        {groups.map((g, gi) => (
          <div key={gi} className="mt-4">
            {g.part && (
              <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {g.part}
              </p>
            )}
            <ol className="gap-x-6 text-[14px] text-slate-700 sm:columns-2">
              {g.items.map(({ s, i }) => (
                <li key={s.id} className="flex break-inside-avoid gap-2 py-[3px]">
                  <span className="w-16 shrink-0 text-slate-400">Chặng {i + 1}</span>
                  <span className="min-w-0">{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-6">
          {isStudent ? (
            <>
              <ActionLink to={lessonUrl} icon={<ArrowRight className="h-4 w-4" />}>
                {done === 0 ? 'Bắt đầu Bài 1' : `Học tiếp Bài ${all.indexOf(current) + 1}`}
              </ActionLink>
              <div className="flex min-w-[180px] flex-1 items-center gap-3 sm:max-w-xs">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/[0.07]">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(done / all.length) * 100}%` }} />
                </div>
                <span className="text-[13px] tabular-nums text-slate-500">
                  {done}/{all.length} bài
                </span>
              </div>
            </>
          ) : (
            <ActionLink to={gate(lessonUrl, '/auth/register')} icon={<ArrowRight className="h-4 w-4" />}>
              Học Bài 1 miễn phí
            </ActionLink>
          )}
          <Link to={courseHref(c)} className="text-sm font-semibold text-indigo-700 hover:underline underline-offset-4">
            Xem danh sách {all.length} bài
          </Link>
        </div>
      </div>
    </article>
  );
};

/**
 * Khoá học chia 3 mục chính (?muc=toeic | vstep | thpt):
 * - TOEIC: Nền tảng → Listening (Part 1–4) → Reading (Part 5–7), đúng cấu trúc đề thi.
 * - VSTEP: Nền tảng → Nghe → Đọc → Viết → Nói, đúng 4 kỹ năng của đề thi.
 * - Tiếng Anh THPT: Lớp 10 / 11 / 12 theo SGK Global Success, mỗi Unit có từ vựng, ngữ pháp, bài tập và Review.
 * Trong mỗi mục, khoá xếp theo nhóm (trackGroup) và thứ tự học.
 */
const TRACKS: { key: CourseTrack; param: string; icon: React.ElementType; title: string; lead: string }[] = [
  { key: 'TOEIC', param: 'toeic', icon: Briefcase, title: 'TOEIC', lead: 'Học theo đúng cấu trúc đề: nền tảng trước, rồi Listening Part 1–4 và Reading Part 5–7.' },
  { key: 'VSTEP', param: 'vstep', icon: GraduationCap, title: 'VSTEP', lead: 'Học theo 4 kỹ năng của đề thi: Nghe, Đọc, Viết, Nói — mỗi khoá chia đúng các phần thi.' },
  { key: 'THPT', param: 'thpt', icon: School, title: 'Tiếng Anh THPT', lead: 'Bám sát SGK Global Success lớp 10, 11, 12: từ vựng và ngữ pháp từng Unit, bài tập và Review sau các cụm Unit.' },
];
const PARAMS = TRACKS.map((t) => t.param);

export const CoursesPage: React.FC = () => {
  const isStudent = useAuthStore((s) => s.user?.role === 'STUDENT');
  const [param, setParam] = useParamState('muc', PARAMS, 'toeic');
  const track = TRACKS.find((t) => t.param === param) ?? TRACKS[0];
  useDocumentTitle(`Khoá học ${track.title}`);
  const { data: courseList = [], isLoading } = useCourses();
  const inTrack = courseList.filter((c) => c.track === track.key);
  // nhóm theo trackGroup, giữ thứ tự khoá do server trả về
  const groups = inTrack.reduce<{ name: string; items: Course[] }[]>((acc, c) => {
    const name = c.trackGroup ?? 'Khác';
    const g = acc.find((x) => x.name === name);
    if (g) g.items.push(c);
    else acc.push({ name, items: [c] });
    return acc;
  }, []);
  const lessons = inTrack.reduce((a, c) => a + c.lessonsCount, 0);
  const hours = Math.round(inTrack.reduce((a, c) => a + c.durationHours, 0));

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học', to: '/courses' }, { label: track.title }]}
        eyebrow="Khoá học"
        title={
          <>
            Khoá học <Accent>{track.title}</Accent>
          </>
        }
        lead={track.lead}
        facts={[
          { value: String(inTrack.length), label: 'Khoá học' },
          { value: String(lessons), label: 'Bài học' },
          { value: `${hours} giờ`, label: 'Tổng thời lượng' },
        ]}
      />
      <Section innerClassName="py-10 md:py-14">
        <div role="tablist" aria-label="Mục khoá học" className="grid gap-2 sm:grid-cols-3">
          {TRACKS.map((t) => {
            const on = t.key === track.key;
            const n = courseList.filter((c) => c.track === t.key).length;
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setParam(t.param)}
                className={cn('flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors', on ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400')}
              >
                <t.icon className={cn('h-5 w-5 shrink-0', on ? 'text-amber-300' : 'text-slate-500')} />
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{t.title}</span>
                  <span className={cn('block text-[12px]', on ? 'text-white/70' : 'text-slate-500')}>{n} khoá học</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 space-y-14">
          {isLoading && <SkeletonGrid count={3} cols="grid-cols-1" />}
          {groups.map((g, gi) => (
            <section key={g.name} aria-labelledby={`g-${gi}`}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                {track.title} · Phần {gi + 1}
              </p>
              <h2 id={`g-${gi}`} className="mt-1 font-display text-2xl font-extrabold tracking-tight text-slate-900 md:text-[1.9rem]">
                {g.name}
              </h2>
              <div className="mt-6 space-y-6">
                {g.items.map((c) => (
                  <TrackRow key={c.id} course={c} isStudent={isStudent} />
                ))}
              </div>
            </section>
          ))}
          {!isLoading && !groups.length && <p className="text-slate-500">Chưa có khoá học trong mục này.</p>}
        </div>
      </Section>
    </div>
  );
};
