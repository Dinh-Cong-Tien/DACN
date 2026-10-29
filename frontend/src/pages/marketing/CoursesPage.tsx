import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, PlayCircle, ArrowRight } from 'lucide-react';
import { Badge, Card, Chip, SectionTitle, EmptyState } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

export const CoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học');
  const [filter, setFilter] = useState<'ALL' | 'TOEIC' | 'VSTEP' | 'FREE'>('ALL');
  const list = MOCK_COURSES.filter((c) => (filter === 'ALL' ? true : filter === 'FREE' ? c.isFree : c.examType === filter));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-10">
      <Reveal>
        <SectionTitle eyebrow="Khoá học" title="Học theo khoá, luyện theo lộ trình" description="Video bài giảng kèm transcript song ngữ, tra từ điển một chạm và quiz củng cố cuối mỗi chương." />
      </Reveal>
      <div className="flex flex-wrap justify-center gap-2 animate-fade-up">
        {[
          ['ALL', 'Tất cả'],
          ['TOEIC', 'TOEIC'],
          ['VSTEP', 'VSTEP'],
          ['FREE', 'Miễn phí'],
        ].map(([k, l]) => (
          <Chip key={k} active={filter === k} onClick={() => setFilter(k as typeof filter)}>
            {l}
          </Chip>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState title="Không có khoá học phù hợp" />
      ) : (
        <Stagger key={filter} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" step={80} whenVisible={false}>
          {list.map((c) => (
            <Link key={c.id} to={`/courses/${c.id}`} className="block group">
              <Card hover padding="none" className="overflow-hidden h-full flex flex-col">
                <div className={`relative h-40 bg-gradient-to-br ${c.gradient} p-5 flex flex-col justify-between text-white`}>
                  <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
                  <div className="relative flex justify-between">
                    <Badge className="bg-white/20 text-white border-white/30" size="xs">
                      {c.examType} · {c.level}
                    </Badge>
                    {c.isFree ? (
                      <Badge tone="emerald" solid size="xs">
                        Miễn phí
                      </Badge>
                    ) : (
                      <Badge tone="amber" solid size="xs">
                        VIP
                      </Badge>
                    )}
                  </div>
                  <PlayCircle className="relative w-12 h-12 opacity-80 group-hover:scale-110 transition-transform self-end" />
                </div>
                <div className="p-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1">{c.description}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {c.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {formatNumber(c.studentsCount)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {c.durationHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">GV: {c.teacherName}</span>
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      Xem chi tiết <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </Stagger>
      )}
    </div>
  );
};
