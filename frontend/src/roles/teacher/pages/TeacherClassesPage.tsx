import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Search, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES } from '@/shared/mocks';
import type { ClassRoom, ExamType } from '@/shared/types';
import { Input, Modal, Select } from '@/shared/components/ui';
import { cn, formatDate } from '@/shared/utils';
import { Meter, Panel, TBtn, TPageHead, inputCls, tbl } from '../components/TeacherKit';
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
      <TPageHead
        title="Lớp học"
        sub="Tạo lớp, gửi mã mời cho học viên, theo dõi tiến độ từng lớp."
        actions={
          <TBtn variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>
            Tạo lớp
          </TBtn>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã lớp" className={cn(inputCls, 'w-full pl-9')} />
        </div>
        <p className="text-[13px] text-slate-500">
          {list.length} lớp · {list.reduce((a, c) => a + c.studentsCount, 0)} học viên
        </p>
      </div>

      <Panel flush>
        {list.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="font-medium text-slate-900">Không tìm thấy lớp nào</p>
            <p className="mt-1 text-sm text-slate-500">Thử tìm bằng mã lớp, hoặc tạo lớp mới.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Tên lớp</th>
                  <th className={tbl.th}>Mã mời</th>
                  <th className={tbl.th}>Lịch học</th>
                  <th className={cn(tbl.th, 'text-right')}>Sĩ số</th>
                  <th className={cn(tbl.th, 'text-right')}>Bài tập</th>
                  <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  <th className={cn(tbl.th, 'w-44')}>Hoàn thành</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className={tbl.tr}>
                    <td className={tbl.td}>
                      <Link to={`/teacher/classes/${c.id}`} className="font-medium text-slate-900 hover:text-indigo-700 hover:underline underline-offset-2">
                        {c.name}
                      </Link>
                      <p className="text-[12px] text-slate-500">
                        {c.examType} · mở ngày {formatDate(c.createdAt)}
                      </p>
                    </td>
                    <td className={tbl.td}>
                      <button type="button" onClick={() => copy(c.code)} title="Sao chép mã mời" className="group inline-flex items-center gap-1.5 font-mono text-[13px] text-slate-700 hover:text-indigo-700">
                        {c.code}
                        <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600" />
                      </button>
                    </td>
                    <td className={tbl.td}>
                      <p className="whitespace-nowrap text-slate-700">{c.schedule}</p>
                      {c.room && <p className="text-[12px] text-slate-500">{c.room}</p>}
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.studentsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.assignmentsCount}</td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.avgScore || '—'}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        <Meter value={c.completionRate} className="flex-1" />
                        <span className="w-9 text-right text-[13px] tabular-nums text-slate-600">{c.completionRate}%</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'text-right')}>
                      <TBtn to={`/teacher/classes/${c.id}`} size="sm">
                        Mở lớp
                      </TBtn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Tạo lớp học mới"
        description="Mã mời 8 ký tự được tạo tự động sau khi lưu."
        icon={<Users />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={create}>
              Tạo lớp
            </TBtn>
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
