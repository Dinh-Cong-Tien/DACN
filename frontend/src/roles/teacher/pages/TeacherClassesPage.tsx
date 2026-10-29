import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Users, ClipboardList, Calendar, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES } from '@/shared/mocks';
import type { ClassRoom, ExamType } from '@/shared/types';
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, ProgressBar, SearchInput, Select } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

const COVERS = [PHOTOS.classroom, PHOTOS.discussion, PHOTOS.lecture, PHOTOS.team, PHOTOS.students2];

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
      gradient: '',
      coverUrl: COVERS[classes.length % COVERS.length],
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
        title={
          <>
            Lớp học <span className="mark">của tôi</span>
          </>
        }
        description="Tạo lớp, cấp mã mời cho học viên, theo dõi tiến độ và giao bài tập."
        actions={
          <Button variant="gradient" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setOpen(true)}>
            Tạo lớp mới
          </Button>
        }
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="sm:w-80">
          <SearchInput placeholder="Tìm theo tên hoặc mã lớp..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <p className="text-xs font-bold text-slate-500">
          {list.length} lớp · {list.reduce((a, c) => a + c.studentsCount, 0)} học viên
        </p>
      </div>

      {list.length === 0 ? (
        <Card hard>
          <EmptyState icon={<Users />} title="Chưa có lớp nào" description="Tạo lớp đầu tiên và chia sẻ mã mời cho học viên." action={<Button onClick={() => setOpen(true)}>Tạo lớp</Button>} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {list.map((c, i) => (
            <Card key={c.id} hard hover padding="none" className="overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="relative">
                <Img src={c.coverUrl} alt={c.name} ratio="video" fallbackClass="bg-indigo-200" wrapperClass="border-b-2 border-slate-900" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge tone={c.examType === 'TOEIC' ? 'indigo' : 'emerald'} solid>
                    {c.examType}
                  </Badge>
                </div>
                <button onClick={() => copy(c.code)} className="sticker tilt-2 absolute -bottom-3 right-4 !bg-amber-300 hover:!bg-amber-200 font-mono !tracking-wider" title="Sao chép mã mời">
                  {c.code} <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-display font-extrabold text-lg text-slate-900 leading-tight">{c.name}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> {c.schedule} · tạo {c.createdAt}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    [c.studentsCount, 'Học viên'],
                    [c.assignmentsCount, 'Bài tập'],
                    [c.avgScore || '—', 'Điểm TB'],
                  ].map(([v, l]) => (
                    <div key={l as string} className="p-2 rounded-xl bg-slate-50 border-2 border-slate-200">
                      <p className="font-display text-xl font-extrabold text-slate-900 leading-none">{v as React.ReactNode}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mt-1">{l as string}</p>
                    </div>
                  ))}
                </div>
                <ProgressBar value={c.completionRate} label="Hoàn thành bài tập" showValue size="sm" tone="indigo" />
                <Link to={`/teacher/classes/${c.id}`} className="btn-3d flex items-center justify-center gap-1.5 h-11 rounded-xl bg-slate-900 border-black text-amber-300 text-sm font-bold">
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
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </Button>
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
