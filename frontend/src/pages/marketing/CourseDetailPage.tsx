import React from 'react';
import { useParams } from 'react-router-dom';
import { Star, Users, Clock, PlayCircle, FileText, HelpCircle, Lock, CheckCircle2, ArrowRight, Video } from 'lucide-react';
import { Accordion, Badge, Breadcrumb, Button, Card, GradientPanel } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

const ICON = { VIDEO: Video, READING: FileText, QUIZ: HelpCircle } as const;

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams();
  const course = MOCK_COURSES.find((c) => c.id === id || c.slug === id) ?? MOCK_COURSES[0];
  useDocumentTitle(course.title);
  const allLessons = course.sections.flatMap((s) => s.lessons);

  return (
    <div className="pb-24">
      <section className={`relative overflow-hidden bg-gradient-to-br ${course.gradient} text-white`}>
        <div aria-hidden className="absolute inset-0 bg-grid opacity-15" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20 space-y-5 animate-fade-up">
          <Breadcrumb items={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học', to: '/courses' }, { label: course.examType }]} className="[&_*]:text-white/80 [&_span]:text-white" />
          <div className="flex gap-2">
            <Badge className="bg-white/20 text-white border-white/30">{course.examType} · {course.level}</Badge>
            <Badge tone={course.isFree ? 'emerald' : 'amber'} solid>
              {course.isFree ? 'Miễn phí' : 'VIP'}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl">{course.title}</h1>
          <p className="text-white/85 max-w-2xl leading-relaxed">{course.description}</p>
          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> {course.rating} / 5
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {formatNumber(course.studentsCount)} học viên
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {course.durationHours} giờ · {course.lessonsCount} bài
            </span>
            <span>GV: {course.teacherName}</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-8">
          <Reveal>
            <h2 className="text-xl font-black text-slate-900 mb-4">Nội dung khoá học</h2>
            <Accordion
              defaultOpen={course.sections[0]?.id}
              items={course.sections.map((s) => ({
                id: s.id,
                title: (
                  <span className="flex items-center gap-2">
                    {s.title}
                    <Badge tone="slate" size="xs">
                      {s.lessons.length} bài
                    </Badge>
                  </span>
                ),
                content: (
                  <ul className="space-y-1">
                    {s.lessons.map((l) => {
                      const Icon = ICON[l.type];
                      return (
                        <li key={l.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${l.isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <span className="flex-1 text-sm font-medium text-slate-800">{l.title}</span>
                          <span className="text-xs text-slate-400">{l.durationMin} phút</span>
                          {l.isFree ? <Badge tone="emerald" size="xs">Học thử</Badge> : <Lock className="w-3.5 h-3.5 text-slate-300" />}
                        </li>
                      );
                    })}
                  </ul>
                ),
              }))}
            />
          </Reveal>
          <Reveal>
            <h2 className="text-xl font-black text-slate-900 mb-4">Bạn sẽ học được gì</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {['Nắm vững cấu trúc đề thi và chiến thuật từng phần', 'Nhận diện bẫy đề thi thường gặp', 'Tra từ điển một chạm ngay trong transcript', 'Quiz củng cố cuối mỗi chương', 'Câu sai tự động vào Sổ tay lỗi sai', 'Lộ trình cập nhật theo tiến độ thực'].map((t) => (
                <div key={t} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {t}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <aside>
          <div className="sticky top-24 space-y-4">
            <Reveal animation="slide-in-right">
              <Card className="space-y-4">
                <div className={`h-32 rounded-2xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-white`}>
                  <PlayCircle className="w-12 h-12 animate-pulse" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{course.isFree ? 'Miễn phí' : 'Gói VIP'}</p>
                  <p className="text-xs text-slate-500">{allLessons.filter((l) => l.isFree).length} bài học thử không cần tài khoản VIP</p>
                </div>
                <Button to="/auth/register" variant="gradient" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} className="shine">
                  Đăng ký học
                </Button>
                {!course.isFree && (
                  <Button to="/pricing" variant="outline" fullWidth>
                    Xem gói VIP
                  </Button>
                )}
                <ul className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
                  <li>• {course.lessonsCount} bài giảng video & bài đọc</li>
                  <li>• Transcript song ngữ Anh – Việt</li>
                  <li>• Truy cập trọn đời</li>
                </ul>
              </Card>
            </Reveal>
            <Reveal animation="slide-in-right" delay={120}>
              <GradientPanel tone="slate" className="!p-5">
                <p className="text-sm font-bold">Chưa biết trình độ?</p>
                <p className="text-xs text-slate-300 mt-1">Làm bài xếp lớp 15 phút để hệ thống gợi ý khoá phù hợp.</p>
                <Button to="/auth/register" size="sm" variant="gradient" className="mt-3">
                  Làm bài xếp lớp
                </Button>
              </GradientPanel>
            </Reveal>
          </div>
        </aside>
      </div>
    </div>
  );
};
