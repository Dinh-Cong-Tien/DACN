import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Users, PlayCircle, ArrowRight, Search } from 'lucide-react';
import { Badge, Chip, SectionTitle, Avatar, Input, Button, EmptyState } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { Img, PHOTOS, pravatar } from '@/shared/components/media/Img';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { cn, formatNumber } from '@/shared/utils';

type Filter = 'ALL' | 'TOEIC' | 'VSTEP' | 'FREE';

export const CoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học');
  const gate = useGate();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [q, setQ] = useState('');
  const list = useMemo(
    () => MOCK_COURSES.filter((c) => (filter === 'ALL' ? true : filter === 'FREE' ? c.isFree : c.examType === filter)).filter((c) => c.title.toLowerCase().includes(q.toLowerCase())),
    [filter, q]
  );
  const teachers = Array.from(new Set(MOCK_COURSES.map((c) => c.teacherName)));

  return (
    <div>
      <section className="bg-paper border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 grid lg:grid-cols-[1fr_420px] gap-10 items-center">
          <div className="space-y-6">
            <SectionTitle align="left" eyebrow="Khoá học" title={<>Học với giáo viên thật, <span className="mark">video có transcript</span>.</>} description="6 khoá cho TOEIC và VSTEP. Nhấn vào từ trong transcript để tra nghĩa, phát âm; cuối mỗi bài là quiz 5 câu." />
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {teachers.map((t, i) => (
                  <img key={t} src={pravatar(40 + i)} alt={t} title={t} className="w-11 h-11 rounded-full border-2 border-cream object-cover" />
                ))}
              </div>
              <p className="text-sm text-slate-600 font-semibold">
                {teachers.length} giảng viên · <b className="text-slate-900">{formatNumber(MOCK_COURSES.reduce((a, c) => a + c.studentsCount, 0))}</b> lượt ghi danh
              </p>
            </div>
          </div>
          <div className="photo-frame tilt-2">
            <Img src={PHOTOS.lecture} alt="Giảng đường" ratio="4/3" fallbackClass="bg-amber-200" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {(
              [
                ['ALL', 'Tất cả'],
                ['TOEIC', 'TOEIC'],
                ['VSTEP', 'VSTEP'],
                ['FREE', 'Miễn phí'],
              ] as [Filter, string][]
            ).map(([k, l]) => (
              <Chip key={k} active={filter === k} onClick={() => setFilter(k)} tone={k === 'VSTEP' ? 'violet' : k === 'FREE' ? 'emerald' : 'indigo'}>
                {l}
              </Chip>
            ))}
          </div>
          <div className="md:w-72">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm khoá học..." leftIcon={<Search />} inputSize="sm" />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState title="Không tìm thấy khoá học" description="Thử từ khoá khác hoặc bỏ bộ lọc." />
        ) : (
          <Stagger key={filter + q} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((c, i) => (
              <Link key={c.id} to={`/courses/${c.id}`} className={cn('group block bg-white rounded-3xl border-2 border-slate-900 shadow-hard overflow-hidden card-hard-hover', i % 3 === 1 && 'lg:mt-6')}>
                <div className="relative">
                  <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-indigo-200" />
                  <span className="absolute top-3 left-3 sticker !py-1 !text-[10px]">{c.level}</span>
                  <span className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center shadow-hard-sm group-hover:scale-110 transition">
                    <PlayCircle className="w-5 h-5 text-violet-600" />
                  </span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge tone={c.examType === 'TOEIC' ? 'indigo' : 'violet'}>{c.examType}</Badge>
                    <Badge tone={c.isFree ? 'emerald' : 'amber'}>{c.isFree ? 'Miễn phí' : 'VIP'}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-lg text-slate-900 leading-snug">{c.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-2">
                      <Avatar name={c.teacherName} src={pravatar(40 + teachers.indexOf(c.teacherName))} size="xs" /> {c.teacherName}
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {c.durationHours}h
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {formatNumber(c.studentsCount)}
                      </span>
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" /> {c.rating}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Stagger>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Reveal>
          <div className="rounded-3xl bg-slate-900 text-white border-2 border-slate-900 shadow-hard p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-extrabold">Không biết nên học khoá nào?</h3>
              <p className="text-slate-300 mt-2">Làm bài xếp lớp 15 phút. Lộ trình sẽ gợi ý đúng khoá cho trình độ của bạn.</p>
            </div>
            <Button to={gate('/app/courses', '/auth/register')} size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Thi xếp lớp
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
};
