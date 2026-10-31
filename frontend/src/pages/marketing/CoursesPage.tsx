import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star } from 'lucide-react';
import { RevealPhoto } from '@/shared/components/motion';
import { Img } from '@/shared/components/media/Img';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle, useGate, useParamState } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';
import type { Course } from '@/shared/types';
import { Accent, PageHeader, Section, UnderlineTabs, CtaStrip } from './shared/PageKit';

type Exam = 'ALL' | 'TOEIC' | 'VSTEP';
type Sort = 'popular' | 'rating' | 'short';

/** Thẻ khoá học nền sáng kiểu catalog LMS */
const CourseCard: React.FC<{ c: Course }> = ({ c }) => (
  <Link to={`/courses/${c.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(16,24,40,0.25)]">
    <div className="relative overflow-hidden">
      <RevealPhoto>
        <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.03]" />
      </RevealPhoto>
      <span className="absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-0.5 text-[11px] font-medium text-white tabular-nums">{c.durationHours} giờ</span>
    </div>
    <div className="flex flex-1 flex-col p-4">
      <p className={cn('text-[12px] font-medium', c.examType === 'TOEIC' ? 'text-indigo-700' : 'text-violet-700')}>
        {c.examType} · {c.level}
      </p>
      <h3 className="mt-1 font-semibold leading-snug text-slate-900 line-clamp-2 group-hover:text-indigo-700">{c.title}</h3>
      <p className="mt-1 text-[13px] text-slate-500">{c.teacherName}</p>
      <p className="mt-1.5 flex items-center gap-1 text-[13px]">
        <span className="font-semibold text-amber-700">{c.rating.toFixed(1)}</span>
        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
        <span className="text-slate-500">({formatNumber(c.studentsCount)} học viên)</span>
      </p>
      <div className="mt-auto flex items-center justify-between border-t border-slate-200 pt-3 mt-4 text-[13px]">
        <span className="text-slate-500">{c.lessonsCount} bài học</span>
        <span className={cn('font-semibold', c.isFree ? 'text-emerald-700' : 'text-slate-900')}>{c.isFree ? 'Miễn phí' : 'Gói VIP'}</span>
      </div>
    </div>
  </Link>
);

export const CoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học');
  const gate = useGate();
  const [exam, setExam] = useParamState<Exam>('exam', ['ALL', 'TOEIC', 'VSTEP'], 'ALL');
  const [free, setFree] = useParamState('free', ['1', ''], '');
  const freeOnly = free === '1';
  const setFreeOnly = (v: boolean) => setFree(v ? '1' : '');
  const [sort, setSort] = useState<Sort>('popular');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    const out = MOCK_COURSES.filter((c) => (exam === 'ALL' || c.examType === exam) && (!freeOnly || c.isFree) && (!key || `${c.title} ${c.teacherName}`.toLowerCase().includes(key)));
    const by: Record<Sort, (a: Course, b: Course) => number> = {
      popular: (a, b) => b.studentsCount - a.studentsCount,
      rating: (a, b) => b.rating - a.rating,
      short: (a, b) => a.durationHours - b.durationHours,
    };
    return [...out].sort(by[sort]);
  }, [exam, freeOnly, sort, q]);

  const count = (e: Exam) => MOCK_COURSES.filter((c) => e === 'ALL' || c.examType === e).length;
  const totalStudents = MOCK_COURSES.reduce((a, c) => a + c.studentsCount, 0);

  return (
    <div className="bg-page">
      <PageHeader
        crumbs={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học' }]}
        eyebrow="Khoá học"
        title={<>Khoá học <Accent>TOEIC và VSTEP</Accent></>}
        lead="Video bài giảng có bản ghi chữ, bấm vào từ để tra nghĩa và nghe phát âm. Cuối mỗi bài có quiz 5 câu, sai câu nào được lưu vào sổ tay lỗi sai."
        facts={[
          { value: String(MOCK_COURSES.length), label: 'Khoá học' },
          { value: String(MOCK_COURSES.reduce((a, c) => a + c.lessonsCount, 0)), label: 'Bài học' },
          { value: formatNumber(totalStudents), label: 'Lượt ghi danh' },
        ]}
      />

      <Section innerClassName="pt-8 md:pt-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <UnderlineTabs
            className="lg:flex-1"
            value={exam}
            onChange={setExam}
            items={[
              { value: 'ALL', label: 'Tất cả', count: count('ALL') },
              { value: 'TOEIC', label: 'TOEIC', count: count('TOEIC') },
              { value: 'VSTEP', label: 'VSTEP', count: count('VSTEP') },
            ]}
          />
          <div className="flex flex-wrap items-center gap-3 pb-1">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
              Chỉ khoá miễn phí
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sắp xếp" className="h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none">
              <option value="popular">Nhiều học viên nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="short">Thời lượng ngắn nhất</option>
            </select>
            <label className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm khoá học, giáo viên" className="h-9 w-56 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none" />
            </label>
          </div>
        </div>

        <p className="mt-6 text-[13px] text-slate-500">{list.length} khoá học</p>
        {list.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-6 py-14 text-center">
            <p className="font-medium text-slate-900">Không có khoá học phù hợp</p>
            <p className="mt-1 text-sm text-slate-500">Thử từ khoá khác hoặc bỏ bớt bộ lọc.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        )}

        <div className="mt-14">
          <CtaStrip title="Chưa biết nên học khoá nào?" text="Làm bài xếp lớp khoảng 15 phút, lộ trình sẽ gợi ý khoá đúng trình độ." action={{ label: 'Làm bài xếp lớp', to: gate('/onboarding/goal', '/try') }} />
        </div>
      </Section>
    </div>
  );
};
