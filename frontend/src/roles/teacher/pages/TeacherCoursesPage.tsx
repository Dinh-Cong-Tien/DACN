import React, { useState } from 'react';
import { Plus, Video, FileText, HelpCircle, Star, Users, Clock, PlayCircle } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_COURSES } from '@/shared/mocks';
import type { Course, LessonType } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Accordion, Badge, Button, Card, Input, Modal, PageHeader, Select } from '@/shared/components/ui';
import { Img } from '@/shared/components/media/Img';

const ICON: Record<LessonType, React.ElementType> = { VIDEO: Video, READING: FileText, QUIZ: HelpCircle };

export const TeacherCoursesPage: React.FC = () => {
  useDocumentTitle('Khoá học & Bài giảng');
  const user = useAuthStore((s) => s.user);
  const mine = MOCK_COURSES.filter((c) => c.teacherName === user?.fullName);
  const [courses, setCourses] = useState<Course[]>(mine.length ? mine : MOCK_COURSES.slice(0, 3));
  const [active, setActive] = useState<Course>(courses[0]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'VIDEO' as LessonType, url: '', minutes: 10, sectionId: courses[0].sections[0]?.id ?? '' });
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  const add = () => {
    if (!form.title.trim()) return toast.error('Vui lòng nhập tiêu đề bài giảng');
    const id = `l-${Date.now().toString(36)}`;
    const updated: Course = {
      ...active,
      lessonsCount: active.lessonsCount + 1,
      sections: active.sections.map((s) => (s.id === form.sectionId ? { ...s, lessons: [...s.lessons, { id, title: form.title.trim(), type: form.type, durationMin: Number(form.minutes) || 10, isCompleted: false, isLocked: false, videoUrl: form.url || undefined }] } : s)),
    };
    setCourses((cs) => cs.map((c) => (c.id === active.id ? updated : c)));
    setActive(updated);
    setPendingIds((p) => [...p, id]);
    setOpen(false);
    setForm((f) => ({ ...f, title: '', url: '' }));
    toast.success('Đã thêm bài giảng', 'Bài giảng đang chờ Trưởng bộ môn phê duyệt.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Khoá học & <span className="mark">Bài giảng</span>
          </>
        }
        description="Tải video bài giảng, tài liệu đọc và quiz cho khoá học bạn phụ trách."
        icon={<PlayCircle />}
        actions={
          <Button
            variant="gradient"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setForm((f) => ({ ...f, sectionId: active.sections[0]?.id ?? '' }));
              setOpen(true);
            }}
          >
            Thêm bài giảng
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {courses.map((c, i) => (
          <Card key={c.id} hard hover padding="none" onClick={() => setActive(c)} className={cn('overflow-hidden animate-fade-up', active.id === c.id ? '!shadow-hard-coral !border-violet-600' : '')} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="relative">
              <Img src={c.coverUrl} alt={c.title} ratio="video" fallbackClass="bg-indigo-200" wrapperClass="border-b-2 border-slate-900" />
              <Badge tone={c.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid className="absolute top-3 left-3">
                {c.examType} · {c.level}
              </Badge>
              {active.id === c.id && <span className="sticker tilt-2 absolute -bottom-3 right-3 !bg-violet-500 !text-white">Đang chọn</span>}
            </div>
            <div className="p-4 space-y-2">
              <p className="font-display font-bold text-slate-900 text-sm leading-snug">{c.title}</p>
              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" /> {c.lessonsCount} bài
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {c.durationHours}h
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {c.studentsCount.toLocaleString('vi-VN')}
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {c.rating}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card hard className="animate-fade-up" key={active.id}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-extrabold text-slate-900 text-lg">{active.title}</h3>
            <p className="text-sm text-slate-600">{active.description}</p>
          </div>
        </div>
        <Accordion
          defaultOpen={active.sections[0]?.id}
          items={active.sections.map((s) => ({
            id: s.id,
            title: `${s.title} · ${s.lessons.length} bài`,
            content: (
              <ul className="space-y-2">
                {s.lessons.map((l) => {
                  const Icon = ICON[l.type];
                  const pending = pendingIds.includes(l.id);
                  return (
                    <li key={l.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 hover:border-slate-900 transition bg-white">
                      <span className={cn('w-9 h-9 rounded-lg border-2 border-slate-900 flex items-center justify-center', l.type === 'VIDEO' ? 'bg-violet-200 text-violet-800' : l.type === 'QUIZ' ? 'bg-amber-200 text-amber-900' : 'bg-indigo-200 text-indigo-900')}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{l.title}</p>
                        <p className="text-[11px] text-slate-500">
                          {l.type} · {l.durationMin} phút
                        </p>
                      </div>
                      <Badge tone={pending ? 'amber' : 'emerald'} dot size="xs">
                        {pending ? 'Chờ duyệt' : 'Đã duyệt'}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            ),
          }))}
        />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Thêm bài giảng mới"
        description={active.title}
        icon={<Video />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
            <Button onClick={add}>Thêm bài giảng</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tiêu đề" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="VD: Part 4 — Nhận diện ngữ cảnh" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Chương" options={active.sections.map((s) => ({ value: s.id, label: s.title }))} value={form.sectionId} onChange={(e) => setForm((f) => ({ ...f, sectionId: e.target.value }))} />
            <Select label="Loại" options={[{ value: 'VIDEO', label: 'Video' }, { value: 'READING', label: 'Bài đọc' }, { value: 'QUIZ', label: 'Quiz' }]} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as LessonType }))} />
          </div>
          {form.type === 'VIDEO' && <Input label="URL video (MP4 / YouTube)" placeholder="https://..." value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} hint="Hoặc kéo thả file MP4 vào khung bên dưới" />}
          {form.type === 'VIDEO' && (
            <div className="border-2 border-dashed border-slate-400 rounded-2xl p-6 text-center text-slate-600 hover:border-slate-900 hover:bg-amber-50 transition cursor-pointer bg-paper">
              <Video className="w-7 h-7 mx-auto mb-1 text-slate-500" />
              <p className="text-xs font-bold">Tải lên file MP4 (tối đa 500 MB)</p>
            </div>
          )}
          <Input label="Thời lượng (phút)" type="number" value={form.minutes} onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) }))} />
        </div>
      </Modal>
    </div>
  );
};
