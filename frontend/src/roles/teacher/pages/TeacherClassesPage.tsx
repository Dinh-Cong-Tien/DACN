import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Users, ClipboardList, Calendar, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES } from '@/shared/mocks';
import type { ClassRoom, ExamType } from '@/shared/types';
import { cn } from '@/shared/utils';
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, ProgressBar, SearchInput, Select } from '@/shared/components/ui';

const GRADIENTS = ['from-indigo-500 to-violet-600', 'from-emerald-500 to-teal-600', 'from-amber-400 to-orange-500', 'from-rose-500 to-pink-600', 'from-sky-500 to-cyan-600'];

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const s = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `ORB-${s}`;
};

export const TeacherClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học của tôi');
  const user = useAuthStore((s) => s.user);
  const [classes, setClasses] = useState<ClassRoom[]>(MOCK_CLASSES);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', examType: 'TOEIC' as ExamType, schedule: '' });
  const [error, setError] = useState('');

  const list = classes.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()));

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', `Gửi mã ${code} cho học viên để tham gia lớp.`);
  };

  const create = () => {
    if (!form.name.trim()) return setError('Vui lòng nhập tên lớp');
    const c: ClassRoom = {
      id: `cl-${Date.now().toString(36)}`,
      name: form.name.trim(),
      code: randomCode(),
      examType: form.examType,
      teacherName: user?.fullName ?? 'Giáo viên',
      studentsCount: 0,
      assignmentsCount: 0,
      avgScore: 0,
      completionRate: 0,
      attendanceRate: 0,
      createdAt: new Date().toISOString().slice(0, 10),
      schedule: form.schedule || 'Chưa thiết lập',
      gradient: GRADIENTS[classes.length % GRADIENTS.length],
    };
    setClasses((s) => [c, ...s]);
    setOpen(false);
    setForm({ name: '', examType: 'TOEIC', schedule: '' });
    setError('');
    toast.success('Đã tạo lớp mới', `Mã mời: ${c.code}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lớp học của tôi"
        description="Tạo lớp, cấp mã mời cho học viên, theo dõi tiến độ và giao bài tập."
        actions={
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
            Tạo lớp mới
          </Button>
        }
      />
      <div className="max-w-sm">
        <SearchInput placeholder="Tìm theo tên hoặc mã lớp..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState icon={<Users />} title="Chưa có lớp nào" description="Tạo lớp đầu tiên và chia sẻ mã mời cho học viên." action={<Button onClick={() => setOpen(true)}>Tạo lớp</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {list.map((c, i) => (
            <Card key={c.id} padding="none" className="overflow-hidden card-hover animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className={cn('relative h-28 bg-gradient-to-br text-white p-5 flex flex-col justify-between', c.gradient)}>
                <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />
                <div className="relative flex items-start justify-between">
                  <Badge tone="slate" solid className="!bg-white/20 !text-white backdrop-blur">
                    {c.examType}
                  </Badge>
                  <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-mono font-bold backdrop-blur transition" title="Sao chép mã mời">
                    {c.code} <Copy className="w-3 h-3" />
                  </button>
                </div>
                <h3 className="relative font-black text-lg leading-tight truncate">{c.name}</h3>
              </div>
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-lg font-black text-slate-900">{c.studentsCount}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Học viên</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-lg font-black text-slate-900">{c.assignmentsCount}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Bài tập</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <p className="text-lg font-black text-slate-900">{c.avgScore || '—'}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Điểm TB</p>
                  </div>
                </div>
                <ProgressBar value={c.completionRate} label="Hoàn thành bài tập" showValue size="sm" tone="emerald" />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {c.schedule}</span>
                  <span className="flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5" /> {c.createdAt}</span>
                </div>
                <Link to={`/teacher/classes/${c.id}`} className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-emerald-600 transition">
                  Quản lý lớp <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tạo lớp học mới"
        description="Hệ thống sẽ tự sinh mã mời 8 ký tự cho học viên."
        icon={<Users />}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={create}>Tạo lớp</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên lớp" required placeholder="VD: TOEIC 650+ K13" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={error} />
          <Select label="Kỳ thi" options={[{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }]} value={form.examType} onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value as ExamType }))} />
          <Input label="Lịch học" placeholder="VD: T2 – T4 – T6 · 19:00" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
};
