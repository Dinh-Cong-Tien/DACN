import React, { useState } from 'react';
import { Copy, Lock, Unlock, UserCog, School, Users, GraduationCap, AlertTriangle } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { DEPT_CLASSES, MOCK_TEACHERS } from '@/shared/mocks';
import type { ClassRoom } from '@/shared/types';
import { Column, Modal, Select, Button } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { CrudEditor } from '@/engines';
import { Figures, Status, TPageHead } from '@/roles/teacher/components/TeacherKit';

type Row = ClassRoom & { locked?: boolean };

const teacherStatus = (name: string) => MOCK_TEACHERS.find((t) => t.name === name)?.status;

/** Toàn bộ lớp trên hệ thống: mã mời học viên dùng để vào lớp, giáo viên phụ trách, trạng thái */
export const AdminClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học toàn hệ thống');
  const [rows, setRows] = useState<Row[]>(DEPT_CLASSES);
  const [reassign, setReassign] = useState<Row | null>(null);
  const [teacher, setTeacher] = useState('');

  const update = (id: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const orphan = rows.filter((r) => teacherStatus(r.teacherName) !== 'ACTIVE').length;

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Lớp',
      render: (r) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <Img src={r.coverUrl ?? PHOTOS.classroom} alt="" wrapperClass="h-10 w-14 shrink-0 rounded-lg" fallbackClass="bg-indigo-200" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">{r.name}</p>
            <p className="text-[12px] text-slate-500">
              {r.schedule} · {r.room}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'code', header: 'Mã mời', render: (r) => <span className="whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-slate-700">{r.code}</span> },
    { key: 'examType', header: 'Kỳ thi', render: (r) => <span className="text-[13px] text-slate-700">{r.examType}</span> },
    {
      key: 'teacherName',
      header: 'Giáo viên',
      render: (r) => (
        <div className="whitespace-nowrap text-[13px]">
          <p className="text-slate-800">{r.teacherName}</p>
          {teacherStatus(r.teacherName) !== 'ACTIVE' && <p className="text-[11px] text-rose-600">Tài khoản giáo viên không hoạt động</p>}
        </div>
      ),
    },
    { key: 'studentsCount', header: 'Sĩ số', align: 'right', render: (r) => <span className="tabular-nums">{r.studentsCount}</span> },
    { key: 'status', header: 'Trạng thái', render: (r) => (r.locked ? <Status tone="gray">Đã khoá</Status> : <Status tone="green">Đang học</Status>) },
  ];

  return (
    <div className="space-y-6">
      <TPageHead crumbs={[{ label: 'Người dùng' }, { label: 'Lớp học' }]} title="Lớp học toàn hệ thống" sub="Mọi lớp giáo viên đã mở. Học viên vào lớp bằng mã mời và thấy bài được giao ở mục Lớp của tôi." />
      <Figures
        items={[
          { label: 'Lớp đang mở', value: rows.filter((r) => !r.locked).length, icon: School, tone: 'indigo' },
          { label: 'Học viên trong lớp', value: rows.reduce((a, r) => a + r.studentsCount, 0), icon: Users, tone: 'emerald' },
          { label: 'Giáo viên phụ trách', value: new Set(rows.map((r) => r.teacherName)).size, icon: GraduationCap, tone: 'violet' },
          { label: 'Lớp cần đổi giáo viên', value: orphan, icon: AlertTriangle, tone: 'rose', note: 'Giáo viên bị khoá hoặc chờ duyệt' },
        ]}
      />
      <CrudEditor<Row>
        key={rows.map((r) => `${r.id}${r.teacherName}${r.locked ? 1 : 0}`).join()}
        rows={rows}
        onChange={setRows}
        columns={columns}
        entityName="lớp học"
        createLabel="Tạo lớp"
        idPrefix="cl"
        searchKeys={['name', 'code', 'teacherName']}
        filters={[
          { key: 'examType', label: 'Kỳ thi', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'teacherName', label: 'Giáo viên', options: MOCK_TEACHERS.map((t) => ({ value: t.name, label: t.name })) },
        ]}
        defaultValues={{ examType: 'TOEIC', code: `ORB-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, studentsCount: 0, assignmentsCount: 0, avgScore: 0, completionRate: 0, attendanceRate: 0, createdAt: new Date().toISOString().slice(0, 10), gradient: '', coverUrl: PHOTOS.students2, teacherName: MOCK_TEACHERS[0].name, room: 'Phòng 301' }}
        fields={[
          { key: 'name', label: 'Tên lớp', required: true, colSpan: 2 },
          { key: 'examType', label: 'Kỳ thi', type: 'select', options: [{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }] },
          { key: 'teacherName', label: 'Giáo viên phụ trách', type: 'select', options: MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE').map((t) => ({ value: t.name, label: t.name })) },
          { key: 'schedule', label: 'Lịch học', placeholder: 'T2 – T4 · 19:00' },
          { key: 'room', label: 'Phòng / hình thức', placeholder: 'Phòng 302 hoặc Online · Google Meet' },
        ]}
        rowActions={(r) => [
          { label: 'Sao chép mã mời', icon: <Copy />, onClick: () => { void navigator.clipboard?.writeText(r.code).catch(() => undefined); toast.success('Đã sao chép mã mời', r.code); } },
          { label: 'Đổi giáo viên', icon: <UserCog />, onClick: () => { setReassign(r); setTeacher(''); } },
          r.locked
            ? { label: 'Mở khoá lớp', icon: <Unlock />, onClick: () => { update(r.id, { locked: false }); toast.success('Đã mở khoá lớp', r.name); } }
            : { label: 'Khoá lớp', icon: <Lock />, onClick: () => { update(r.id, { locked: true }); toast.warning('Đã khoá lớp', `${r.name}: học viên không vào lớp bằng mã mời được nữa`); } },
        ]}
      />

      <Modal
        open={!!reassign}
        onClose={() => setReassign(null)}
        title="Đổi giáo viên phụ trách"
        description={reassign ? `${reassign.name} · hiện do ${reassign.teacherName} phụ trách` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReassign(null)}>Huỷ</Button>
            <Button
              disabled={!teacher}
              onClick={() => {
                if (!reassign) return;
                update(reassign.id, { teacherName: teacher });
                toast.success('Đã đổi giáo viên', `${reassign.name} → ${teacher}`);
                setReassign(null);
              }}
            >
              Lưu
            </Button>
          </>
        }
      >
        <Select
          label="Giáo viên mới"
          placeholder="Chọn giáo viên"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          options={MOCK_TEACHERS.filter((t) => t.status === 'ACTIVE' && t.name !== reassign?.teacherName).map((t) => ({ value: t.name, label: `${t.name} · ${t.subject}` }))}
        />
        <p className="mt-3 text-[13px] text-slate-500">Bài tập, bảng điểm và lịch sử điểm danh của lớp được giữ nguyên. Giáo viên mới nhận thông báo ngay.</p>
      </Modal>
    </div>
  );
};
