import React, { useMemo, useState } from 'react';
import { Copy, Lock, Unlock, UserCog, School, Users, GraduationCap, AlertTriangle, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { adminApi, useAdminClasses, useAdminInvalidate, useAdminUsers } from '@/shared/api/admin';
import { headApi, type HeadClass } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { Column, Modal, Select, Button } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { CrudEditor } from '@/engines';
import { Figures, Status, TPageHead } from '@/roles/teacher/components/TeacherKit';
import { distinctStudents } from '@/shared/constants/staff';
import { CLASS_LEVEL_OPTIONS, CLASS_TRACK_OPTIONS, classTrack, classTrackLabel, courseOptions } from '@/shared/constants/staff';
import { useCourses } from '@/shared/api/catalog';

type Row = HeadClass & { locked?: boolean; teacherId: string; trackKey: string; courseKey: string };
const EMPTY: Row[] = [];

/** Toàn bộ lớp trên hệ thống: mã mời học viên dùng để vào lớp, giáo viên phụ trách, trạng thái */
export const AdminClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học toàn hệ thống');
  const navigate = useNavigate();
  const classesQ = useAdminClasses();
  const usersQ = useAdminUsers();
  const courses = useCourses().data ?? [];
  const refresh = useAdminInvalidate();
  const rows = useMemo<Row[]>(() => (classesQ.data ?? EMPTY).map((c) => ({ ...c, trackKey: classTrack(c), courseKey: c.course?.slug ?? '', locked: !!c.isArchived })), [classesQ.data]);
  const teacherList = useMemo(
    () => (usersQ.data?.items ?? []).filter((u) => u.role === 'TEACHER' || u.role === 'HEAD_TEACHER').map((u) => ({ id: u.id, name: u.fullName, status: u.status, subject: u.role === 'HEAD_TEACHER' ? 'Trưởng bộ môn' : 'Giáo viên' })),
    [usersQ.data]
  );
  const teacherStatus = (id: string) => teacherList.find((t) => t.id === id)?.status;
  const [reassign, setReassign] = useState<Row | null>(null);
  const [teacher, setTeacher] = useState('');
  const [saving, setSaving] = useState(false);

  const run = async (fn: () => Promise<unknown>, ok: string, desc?: string, warn = false) => {
    try {
      await fn();
      (warn ? toast.warning : toast.success)(ok, desc);
      await refresh();
    } catch (e) {
      toast.error('Không thực hiện được', errorMessage(e));
    }
  };
  const orphan = rows.filter((r) => teacherList.length && teacherStatus(r.teacherId) !== 'ACTIVE').length;

  const columns: Column<Row>[] = [
    {
      key: 'name',
      header: 'Lớp',
      render: (r) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <Img src={r.coverUrl ?? PHOTOS.classroom} alt="" wrapperClass="h-10 w-14 shrink-0 rounded-lg" fallbackClass="bg-indigo-200" />
          <div className="min-w-0">
            <Link to={`/admin/classes/${r.id}`} className="font-semibold text-slate-900 hover:text-indigo-700">
              {r.name}
            </Link>
            <p className="text-[12px] text-slate-500">
              {r.schedule} · {r.room}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'code', header: 'Mã mời', render: (r) => <span className="whitespace-nowrap rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-slate-700">{r.code}</span> },
    { key: 'courseKey', header: 'Khoá học', render: (r) => <span className="text-[13px] text-slate-700">{r.course?.title ?? <span className="text-slate-400">Chưa gắn khoá</span>}<span className="block text-[12px] text-slate-500">{classTrackLabel(r)}</span></span> },
    {
      key: 'teacherName',
      header: 'Giáo viên',
      render: (r) => (
        <div className="whitespace-nowrap text-[13px]">
          <p className="text-slate-800">{r.teacherName}</p>
          {teacherList.length > 0 && teacherStatus(r.teacherId) !== 'ACTIVE' && <p className="text-[11px] text-rose-600">Tài khoản giáo viên không hoạt động</p>}
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
          { label: 'Học viên trong lớp', value: distinctStudents(rows), icon: Users, tone: 'emerald' },
          { label: 'Giáo viên phụ trách', value: new Set(rows.map((r) => r.teacherName)).size, icon: GraduationCap, tone: 'violet' },
          { label: 'Lớp cần đổi giáo viên', value: orphan, icon: AlertTriangle, tone: 'rose', note: 'Giáo viên bị khoá hoặc chờ duyệt' },
        ]}
      />
      <CrudEditor<Row>
        rows={rows}
        loading={classesQ.isLoading}
        onCreate={async (v) => {
          const c = await headApi.createClass({ courseId: v.courseKey, level: v.level, teacherId: v.teacherId, room: v.room || undefined, scheduleText: v.schedule || undefined });
          void refresh();
          return { ...c, trackKey: classTrack(c), courseKey: c.course?.slug ?? '', locked: false } as Row;
        }}
        onUpdate={async (row, v) => {
          const c = await adminApi.updateClass(row.id, { courseId: v.courseKey || undefined, level: v.level || undefined, teacherId: v.teacherId !== row.teacherId ? v.teacherId : undefined, room: v.room ?? null, scheduleText: v.schedule ?? null });
          void refresh();
          return { ...c, trackKey: classTrack(c), courseKey: c.course?.slug ?? '', locked: !!c.isArchived } as Row;
        }}
        onDelete={async (row) => {
          await adminApi.deleteClass(row.id);
          void refresh();
        }}
        columns={columns}
        entityName="lớp học"
        createLabel="Tạo lớp"
        idPrefix="cl"
        searchKeys={['name', 'code', 'teacherName']}
        filters={[
          { key: 'trackKey', label: 'Mục', options: CLASS_TRACK_OPTIONS },
          { key: 'teacherName', label: 'Giáo viên', options: [...new Set(rows.map((r) => r.teacherName))].map((n) => ({ value: n, label: n })) },
        ]}
        defaultValues={{ courseKey: '', teacherId: teacherList.find((t) => t.status === 'ACTIVE')?.id, room: '' }}
        fields={[
                    { key: 'courseKey', label: 'Khoá học', type: 'select', required: true, options: courseOptions(courses) },
          { key: 'level', label: 'Trình độ lớp (cuối mã lớp, vd T203A1)', type: 'select', required: true, options: CLASS_LEVEL_OPTIONS },
          { key: 'teacherId', label: 'Giáo viên phụ trách', type: 'select', required: true, options: teacherList.filter((t) => t.status === 'ACTIVE').map((t) => ({ value: t.id, label: t.name })) },
          { key: 'schedule', label: 'Lịch học', placeholder: 'T2 – T4 · 19:00' },
          { key: 'room', label: 'Phòng / hình thức', placeholder: 'Phòng 302 hoặc Online · Google Meet' },
        ]}
        rowActions={(r) => [
          { label: 'Xem chi tiết lớp', icon: <Eye />, onClick: () => navigate(`/admin/classes/${r.id}`) },
          { label: 'Sao chép mã mời', icon: <Copy />, onClick: () => { void navigator.clipboard?.writeText(r.code).catch(() => undefined); toast.success('Đã sao chép mã mời', r.code); } },
          { label: 'Đổi giáo viên', icon: <UserCog />, onClick: () => { setReassign(r); setTeacher(''); } },
          r.locked
            ? { label: 'Mở khoá lớp', icon: <Unlock />, onClick: () => void run(() => adminApi.updateClass(r.id, { isArchived: false }), 'Đã mở khoá lớp', r.name) }
            : { label: 'Khoá lớp', icon: <Lock />, onClick: () => void run(() => adminApi.updateClass(r.id, { isArchived: true }), 'Đã khoá lớp', `${r.name}: học viên không vào lớp bằng mã mời được nữa`, true) },
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
              loading={saving}
              onClick={async () => {
                if (!reassign) return;
                setSaving(true);
                await run(() => adminApi.updateClass(reassign.id, { teacherId: teacher }), 'Đã đổi giáo viên', `${reassign.name} → ${teacherList.find((t) => t.id === teacher)?.name ?? ''}`);
                setSaving(false);
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
          options={teacherList.filter((t) => t.status === 'ACTIVE' && t.id !== reassign?.teacherId).map((t) => ({ value: t.id, label: `${t.name} · ${t.subject}` }))}
        />
        <p className="mt-3 text-[13px] text-slate-500">Bài tập, bảng điểm và lịch sử điểm danh của lớp được giữ nguyên. Giáo viên mới nhận thông báo ngay.</p>
      </Modal>
    </div>
  );
};
