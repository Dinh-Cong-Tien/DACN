import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, ListChecks, Users, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Badge, Card, Chip, SectionTitle, Tabs, EmptyState } from '@/shared/components/ui';
import { Reveal, Stagger } from '@/shared/components/motion';
import { MOCK_TESTS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

export const MockTestsPage: React.FC = () => {
  useDocumentTitle('Thi thử');
  const [exam, setExam] = useState('TOEIC');
  const [access, setAccess] = useState<'ALL' | 'FREE' | 'VIP'>('ALL');
  const list = MOCK_TESTS.filter((t) => t.examType === exam && (access === 'ALL' ? true : access === 'FREE' ? t.isFree : !t.isFree));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24 space-y-8">
      <Reveal>
        <SectionTitle eyebrow="Kho đề thi thử" title="Thi thử chuẩn format, bấm giờ thật" description="Đề TOEIC bám sát ETS, đề VSTEP theo format Bộ GD&ĐT. Audio phát một lần, không tua lùi như phòng thi thật." />
      </Reveal>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-up">
        <Tabs
          variant="pill"
          value={exam}
          onChange={setExam}
          items={[
            { key: 'TOEIC', label: 'TOEIC', count: MOCK_TESTS.filter((t) => t.examType === 'TOEIC').length },
            { key: 'VSTEP', label: 'VSTEP', count: MOCK_TESTS.filter((t) => t.examType === 'VSTEP').length },
          ]}
        />
        <div className="flex gap-2">
          <Chip active={access === 'ALL'} onClick={() => setAccess('ALL')}>
            Tất cả
          </Chip>
          <Chip active={access === 'FREE'} onClick={() => setAccess('FREE')} tone="emerald">
            Miễn phí
          </Chip>
          <Chip active={access === 'VIP'} onClick={() => setAccess('VIP')} tone="amber">
            VIP
          </Chip>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Không có đề phù hợp" />
      ) : (
        <Stagger key={exam + access} className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" step={60} whenVisible={false}>
          {list.map((t) => (
            <Link key={t.id} to="/auth/login" className="block group">
              <Card hover className="h-full flex flex-col space-y-3">
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${t.examType === 'TOEIC' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1">
                    {t.tags?.map((tag) => (
                      <Badge key={tag} tone={tag === 'VIP' ? 'amber' : tag === 'Mới' ? 'rose' : 'slate'} size="xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition">{t.title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500 font-semibold">
                  <span className="flex items-center gap-1">
                    <ListChecks className="w-3.5 h-3.5" /> {t.totalQuestions} câu
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t.durationMinutes} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {formatNumber(t.attempts)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex-1">
                  {t.parts.join(' · ')} · Mức {t.level}
                </p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Badge tone={t.isFree ? 'emerald' : 'amber'} size="xs" icon={t.isFree ? undefined : <Sparkles className="w-3 h-3" />}>
                    {t.isFree ? 'Miễn phí' : 'VIP'}
                  </Badge>
                  <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Đăng nhập để thi <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </Stagger>
      )}
    </div>
  );
};
