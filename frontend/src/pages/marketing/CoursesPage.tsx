import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RevealPhoto } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { MOCK_COURSES, courseHref } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import type { Course, CourseSection } from '@/shared/types';
import { Accent, ActionLink, PageHeader, Section } from './shared/PageKit';

/** Một mục Khoá học: ảnh, mô tả, các chặng theo thứ tự; học viên thấy tiến độ và bài đang học */
const TrackRow: React.FC<{ course: Course; isStudent: boolean }> = ({ course: c, isStudent }) => {
  const gate = useGate();
  const all = c.sections.flatMap((s) => s.lessons);
  const done = all.filter((l) => l.isCompleted).length;
  const current = all.find((l) => !l.isCompleted && !l.isLocked) ?? all[0];
  const lessonUrl = `/app/courses/${c.id}/lessons/${current.id}`;
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
          <Img src={c.coverUrl} alt={c.title} ratio="4/3" fallbackClass="bg-slate-200" className="transition-transform duration-500 hover:scale-[1.03]" />
        </RevealPhoto>
      </Link>
      <div className="flex min-w-0 flex-col py-1">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500">{c.category === 'FOUNDATION' ? `Nền tảng · ${c.examType}` : 'Kiến thức chung'}</p>
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
                Phần {gi + 1} · {g.part}
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
 * Khoá học, học từ đầu theo thứ tự bài:
 * - Kiến thức chung: Ngữ pháp, Từ vựng và Phát âm (dùng cho cả hai kỳ thi)
 * - Kiến thức nền tảng: tách riêng TOEIC (nặng hơn, tiếng Anh công việc) và VSTEP (nhẹ hơn, bốn kỹ năng, B1)
 * Luyện đề theo kỳ thi nằm ở menu TOEIC / VSTEP.
 */
const GROUPS = [
  { key: 'general', title: 'Kiến thức chung', desc: 'Dùng cho cả TOEIC và VSTEP. Nên học song song hai khoá này trước.', match: (c: Course) => c.category !== 'FOUNDATION' },
  { key: 'exam', title: 'Kiến thức nền tảng theo kỳ thi', desc: 'Tách riêng hai kỳ thi. TOEIC nặng hơn VSTEP: văn bản dài hơn, ngữ cảnh công việc, nhiều bài hơn.', match: (c: Course) => c.category === 'FOUNDATION' },
];

export const CoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học');
  const isStudent = useAuthStore((s) => s.user?.role === 'STUDENT');
  const lessons = MOCK_COURSES.reduce((a, c) => a + c.lessonsCount, 0);
  const hours = MOCK_COURSES.reduce((a, c) => a + c.durationHours, 0);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học' }]}
        eyebrow="Khoá học"
        title={
          <>
            Học tiếng Anh <Accent>từ đầu</Accent>
          </>
        }
        lead="Mỗi khoá là một chuỗi video bài giảng đánh số từ Bài 1, học xong bài trước mới mở bài sau. Bắt đầu với Ngữ pháp và Từ vựng, sau đó chọn khoá nền tảng của kỳ thi bạn sẽ thi."
        facts={[
          { value: String(MOCK_COURSES.length), label: 'Khoá học' },
          { value: String(lessons), label: 'Bài giảng' },
          { value: `${hours} giờ`, label: 'Tổng thời lượng' },
        ]}
      />
      <Section innerClassName="py-12 md:py-16">
        <div className="space-y-14">
          {GROUPS.map((g) => (
            <section key={g.key} aria-labelledby={`g-${g.key}`}>
              <h2 id={`g-${g.key}`} className="font-display text-2xl font-extrabold tracking-tight text-slate-900 md:text-[1.9rem]">
                {g.title}
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">{g.desc}</p>
              <div className="mt-6 space-y-6">
                {MOCK_COURSES.filter(g.match).map((c) => (
                  <TrackRow key={c.id} course={c} isStudent={isStudent} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </div>
  );
};
