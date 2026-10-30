import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Users, PlayCircle, FileText, HelpCircle, Lock, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import { Badge, Breadcrumb, Button, Card, Accordion, Avatar } from '@/shared/components/ui';
import { Reveal } from '@/shared/components/motion';
import { Img, pravatar } from '@/shared/components/media/Img';
import { MOCK_COURSES } from '@/shared/mocks';
import { useDocumentTitle, useGate } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils';

const ICON = { VIDEO: PlayCircle, READING: FileText, QUIZ: HelpCircle } as const;

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams();
  const course = MOCK_COURSES.find((c) => c.id === id || c.slug === id) ?? MOCK_COURSES[0];
  useDocumentTitle(course.title);
  const gate = useGate();
  const lessons = course.sections.flatMap((s) => s.lessons);
  const freeCount = lessons.filter((l) => l.isFree || !l.isLocked).length;
  const teacherIdx = Array.from(new Set(MOCK_COURSES.map((c) => c.teacherName))).indexOf(course.teacherName);
  const related = MOCK_COURSES.filter((c) => c.id !== course.id && c.examType === course.examType).slice(0, 2);

  return (
    <div>
      <section className="bg-slate-900 text-white border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid lg:grid-cols-[1fr_420px] gap-10 items-center">
          <div className="space-y-5">
            <Breadcrumb className="[&_a]:text-slate-400 [&_span]:text-white" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Khoá học', to: '/courses' }, { label: course.examType }]} />
            <div className="flex gap-2">
              <Badge tone="amber" solid>
                {course.examType}
              </Badge>
              <Badge tone="slate" solid>
                {course.level}
              </Badge>
              {course.isFree && (
                <Badge tone="emerald" solid>
                  Miễn phí
                </Badge>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">{course.title}</h1>
            <p className="text-slate-300 text-lg leading-relaxed">{course.description}</p>
            <div className="flex items-center gap-6 flex-wrap text-sm">
              <span className="flex items-center gap-2">
                <Avatar name={course.teacherName} src={pravatar(40 + teacherIdx)} size="sm" ring /> <b>{course.teacherName}</b>
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-4 h-4 fill-current" /> {course.rating}
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Users className="w-4 h-4" /> {formatNumber(course.studentsCount)} học viên
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-4 h-4" /> {course.durationHours} giờ · {course.lessonsCount} bài
              </span>
            </div>
          </div>
          <div className="photo-frame tilt-2">
            <Img src={course.coverUrl} alt={course.title} ratio="4/3" fallbackClass="bg-indigo-300" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid lg:grid-cols-[1fr_360px] gap-10 items-start">
        <div className="space-y-10">
          <Reveal className="space-y-4">
            <h2 className="font-display text-2xl font-extrabold text-slate-900">Bạn sẽ học được gì</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {['Chiến thuật làm bài cho từng Part/kỹ năng', 'Nhận diện bẫy đề thi phổ biến', 'Từ vựng và ngữ pháp trọng tâm theo chủ đề', 'Quiz củng cố sau mỗi bài giảng', 'Transcript song ngữ, tra từ 1 chạm', 'Lộ trình gợi ý bài tiếp theo'].map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-slate-700 bg-white rounded-xl border-2 border-slate-200 p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold text-slate-900">Nội dung khoá học</h2>
              <span className="text-sm font-semibold text-slate-500">
                {course.sections.length} chương · {lessons.length} bài · {freeCount} bài học thử
              </span>
            </div>
            <Accordion
              defaultOpen={course.sections[0]?.id}
              items={course.sections.map((s) => ({
                id: s.id,
                title: s.title,
                content: (
                  <ul className="space-y-2">
                    {s.lessons.map((l) => {
                      const Icon = ICON[l.type];
                      return (
                        <li key={l.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="w-8 h-8 rounded-lg bg-white border-2 border-slate-900 flex items-center justify-center text-slate-700">{l.isLocked ? <Lock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</span>
                          <span className="flex-1 text-sm font-semibold text-slate-800">{l.title}</span>
                          <span className="text-xs text-slate-500">{l.durationMin} phút</span>
                          {!l.isLocked && (
                            <Badge tone="emerald" size="xs">
                              Học thử
                            </Badge>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ),
              }))}
            />
          </Reveal>

          <Reveal>
            <Card hard tone="cream" padding="lg" className="flex flex-col sm:flex-row gap-6 items-center">
              <img src={pravatar(40 + teacherIdx)} alt={course.teacherName} className="w-24 h-24 rounded-2xl border-2 border-slate-900 object-cover shadow-hard-sm" />
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Giảng viên</p>
                <h3 className="font-display text-xl font-extrabold text-slate-900">{course.teacherName}</h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">8 năm luyện thi TOEIC/VSTEP tại Đà Nẵng. TOEIC 985, VSTEP C1. Đã hướng dẫn hơn 3.000 học viên đạt mục tiêu đúng hạn.</p>
              </div>
            </Card>
          </Reveal>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card hard padding="lg" className="space-y-4">
            <p className="font-display text-3xl font-extrabold text-slate-900">{course.isFree ? 'Miễn phí' : 'Gói VIP'}</p>
            <p className="text-sm text-slate-600">{course.isFree ? 'Chỉ cần tài khoản để bắt đầu học.' : 'Bao gồm trong gói VIP TOEIC / VSTEP Master.'}</p>
            <Button to={gate(`/app/courses/${course.id}`, '/auth/register')} fullWidth size="lg" variant="gradient" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Đăng ký học ngay
            </Button>
            <Button to={gate(`/app/courses/${course.id}`)} fullWidth variant="outline">
              Đã có tài khoản? Đăng nhập
            </Button>
            <ul className="text-sm text-slate-700 space-y-2 pt-3 border-t-2 border-slate-100">
              <li className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> {course.lessonsCount} bài giảng
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> {course.durationHours} giờ nội dung
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Truy cập trọn đời
              </li>
            </ul>
          </Card>
          {related.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Khoá liên quan</p>
              {related.map((r) => (
                <Link key={r.id} to={`/courses/${r.id}`} className="flex gap-3 bg-white rounded-2xl border-2 border-slate-900 p-2 hover:-translate-y-0.5 transition">
                  <Img src={r.coverUrl} alt="" wrapperClass="w-20 rounded-xl shrink-0" ratio="4/3" fallbackClass="bg-amber-200" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">{r.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{r.lessonsCount} bài · ★ {r.rating}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};
