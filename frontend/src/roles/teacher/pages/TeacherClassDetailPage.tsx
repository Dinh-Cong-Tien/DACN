import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Copy, ClipboardList, UserPlus, Upload, FileText, Video, Music, File } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_ASSIGNMENTS, MOCK_MATERIALS, MOCK_TESTS, CLASS_WEEKLY_PROGRESS, ASSIGNMENT_TYPE_LABEL, describeTarget } from '@/shared/mocks';
import type { ClassStudent, Material } from '@/shared/types';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { Avatar, Input, Modal, Select, Textarea } from '@/shared/components/ui';
import { Figures, Meter, Panel, Status, TBtn, TPageHead, TTabs, tbl, type StatusTone } from '../components/TeacherKit';

const STATUS: Record<ClassStudent['status'], { label: string; tone: StatusTone }> = {
  GOOD: { label: 'Ổn định', tone: 'green' },
  WARNING: { label: 'Cần nhắc', tone: 'amber' },
  RISK: { label: 'Nguy cơ bỏ học', tone: 'red' },
};
const MAT_LABEL: Record<Material['type'], string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Word', AUDIO: 'Audio' };

const MAT_ICON: Record<Material['type'], React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music };

export const TeacherClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const cls = MOCK_CLASSES.find((c) => c.id === id) ?? MOCK_CLASSES[0];
  useDocumentTitle(cls.name);
  const navigate = useNavigate();
  const [tab, setTab] = useState('students');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [emails, setEmails] = useState('');
  const [materials, setMaterials] = useState<Material[]>(MOCK_MATERIALS.filter((m) => m.classId === cls.id));
  const [matForm, setMatForm] = useState({ title: '', type: 'PDF' as Material['type'] });

  const assignments = MOCK_ASSIGNMENTS.filter((a) => a.classId === cls.id);
  const students = MOCK_CLASS_STUDENTS;

  const copy = () => {
    navigator.clipboard?.writeText(cls.code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', cls.code);
  };

  const invite = () => {
    const n = emails.split(/[\n,;]/).map((s) => s.trim()).filter(Boolean).length;
    if (!n) return toast.error('Chưa có email nào');
    setInviteOpen(false);
    setEmails('');
    toast.success('Đã gửi lời mời', `${n} email nhận được mã lớp ${cls.code}.`);
  };

  const upload = () => {
    if (!matForm.title.trim()) return toast.error('Vui lòng nhập tên tài liệu');
    setMaterials((m) => [{ id: `mt-${Date.now().toString(36)}`, classId: cls.id, title: matForm.title, type: matForm.type, size: '1.2 MB', uploadedAt: new Date().toISOString().slice(0, 10), downloads: 0 }, ...m]);
    setUploadOpen(false);
    setMatForm({ title: '', type: 'PDF' });
    toast.success('Đã tải lên tài liệu', 'Học viên trong lớp có thể tải xuống ngay.');
  };

  const A_STATUS: Record<string, [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };

  return (
    <div className="space-y-6">
      <TPageHead
        crumbs={[{ label: 'Lớp học', to: '/teacher/classes' }, { label: cls.name }]}
        title={cls.name}
        sub={[cls.examType, cls.schedule, cls.room, `mở ngày ${formatDate(cls.createdAt)}`].filter(Boolean).join(' · ')}
        actions={
          <>
            <TBtn icon={<UserPlus />} onClick={() => setInviteOpen(true)}>
              Mời học viên
            </TBtn>
            <TBtn variant="primary" icon={<ClipboardList />} onClick={() => navigate('/teacher/assignments', { state: { assign: { kind: 'EXAM', testId: MOCK_TESTS.find((t) => t.examType === cls.examType)!.id, setup: { mode: 'FULL', parts: [], minutes: null } }, classId: cls.id } })}>
              Giao bài tập
            </TBtn>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Figures
          items={[
            { label: 'Sĩ số', value: cls.studentsCount, note: `${students.filter((x) => x.status !== 'GOOD').length} học viên cần theo dõi` },
            { label: 'Điểm trung bình', value: cls.avgScore, note: 'bài thi thử gần nhất' },
            { label: 'Hoàn thành bài tập', value: `${cls.completionRate}%`, note: `${cls.assignmentsCount} bài đã giao` },
            { label: 'Chuyên cần', value: `${cls.attendanceRate}%`, note: 'từ đầu khoá' },
          ]}
        />
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3.5">
          <p className="text-[13px] text-slate-500">Mã mời vào lớp</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[1.3rem] font-semibold tracking-wide text-slate-900">{cls.code}</span>
            <TBtn size="sm" variant="ghost" icon={<Copy />} onClick={copy}>
              Sao chép
            </TBtn>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Hiệu lực đến hết học kỳ</p>
        </div>
      </div>

      <TTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'students', label: 'Học viên', count: students.length },
          { key: 'assignments', label: 'Bài tập', count: assignments.length },
          { key: 'materials', label: 'Tài liệu', count: materials.length },
          { key: 'progress', label: 'Tiến độ theo tuần' },
        ]}
      />

      {tab === 'students' && (
        <Panel flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={cn(tbl.th, 'w-12 text-right')}>STT</th>
                  <th className={tbl.th}>Học viên</th>
                  <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  <th className={cn(tbl.th, 'w-48')}>Hoàn thành bài tập</th>
                  <th className={tbl.th}>Hoạt động gần nhất</th>
                  <th className={tbl.th}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {students.map((r, i) => (
                  <tr key={r.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'text-right tabular-nums text-slate-400')}>{i + 1}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2.5">
                        <Avatar name={r.name} src={r.avatarUrl} size="sm" />
                        <span className="min-w-0">
                          <span className="block whitespace-nowrap font-medium text-slate-900">{r.name}</span>
                          <span className="block text-[12px] text-slate-500">{r.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{r.avgScore}</td>
                    <td className={tbl.td}>
                      <span className="flex items-center gap-2">
                        <Meter value={r.completion} tone={r.completion < 65 ? 'red' : r.completion < 80 ? 'amber' : 'indigo'} className="flex-1" />
                        <span className="w-10 text-right text-[13px] tabular-nums text-slate-600">{r.completion}%</span>
                      </span>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{timeAgo(r.lastActive)}</td>
                    <td className={tbl.td}>
                      <Status tone={STATUS[r.status].tone}>{STATUS[r.status].label}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'assignments' && (
        <Panel flush>
          {assignments.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Lớp chưa có bài tập nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Bài tập</th>
                    <th className={tbl.th}>Hạn nộp</th>
                    <th className={cn(tbl.th, 'w-48')}>Đã nộp</th>
                    <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                    <th className={tbl.th}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className={tbl.tr}>
                      <td className={tbl.td}>
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="text-[12px] text-slate-500">
                          {ASSIGNMENT_TYPE_LABEL[a.type]} · {describeTarget(a.target)}
                        </p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums text-slate-700')}>{formatDate(a.dueDate)}</td>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2">
                          <Meter value={(a.submitted / a.total) * 100} className="flex-1" />
                          <span className="w-12 text-right text-[13px] tabular-nums text-slate-600">
                            {a.submitted}/{a.total}
                          </span>
                        </span>
                      </td>
                      <td className={cn(tbl.td, 'text-right tabular-nums')}>{a.avgScore ?? '—'}</td>
                      <td className={tbl.td}>
                        <Status tone={A_STATUS[a.status][0]}>{A_STATUS[a.status][1]}</Status>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === 'materials' && (
        <Panel
          title="Tài liệu của lớp"
          sub="Học viên trong lớp xem và tải được"
          action={
            <TBtn size="sm" icon={<Upload />} onClick={() => setUploadOpen(true)}>
              Tải lên
            </TBtn>
          }
          flush
        >
          {materials.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Chưa có tài liệu nào.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className={tbl.table}>
                <thead className={tbl.thead}>
                  <tr>
                    <th className={tbl.th}>Tên tài liệu</th>
                    <th className={tbl.th}>Loại</th>
                    <th className={cn(tbl.th, 'text-right')}>Dung lượng</th>
                    <th className={tbl.th}>Ngày tải lên</th>
                    <th className={cn(tbl.th, 'text-right')}>Lượt tải</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => {
                    const Icon = MAT_ICON[m.type];
                    return (
                      <tr key={m.id} className={tbl.tr}>
                        <td className={tbl.td}>
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-900">{m.title}</span>
                          </span>
                        </td>
                        <td className={cn(tbl.td, 'text-slate-600')}>{MAT_LABEL[m.type]}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{m.size}</td>
                        <td className={cn(tbl.td, 'tabular-nums text-slate-600')}>{formatDate(m.uploadedAt)}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{m.downloads}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === 'progress' && (
        <Panel title="Tỷ lệ học viên nộp bài đúng hạn theo tuần" sub={`Từ tuần 1 đến tuần ${CLASS_WEEKLY_PROGRESS.length} của khoá`}>
          <ul className="space-y-2.5">
            {CLASS_WEEKLY_PROGRESS.map((w, i) => (
              <li key={w.label} className="grid grid-cols-[64px_1fr_48px] items-center gap-3 text-sm">
                <span className="text-slate-600">Tuần {i + 1}</span>
                <Meter value={w.value} className="h-2" />
                <span className="text-right tabular-nums text-slate-800">{w.value}%</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Mời học viên qua email"
        description={`Mã lớp ${cls.code} sẽ được gửi kèm hướng dẫn.`}
        icon={<UserPlus />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setInviteOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={invite}>
              Gửi lời mời
            </TBtn>
          </>
        }
      >
        <Textarea label="Danh sách email" hint="Mỗi email một dòng hoặc cách nhau bằng dấu phẩy" placeholder="hocvien1@gmail.com&#10;hocvien2@gmail.com" value={emails} onChange={(e) => setEmails(e.target.value)} />
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Tải lên tài liệu"
        icon={<Upload />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setUploadOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={upload}>
              Tải lên
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <div className="cursor-pointer rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500 transition hover:border-indigo-400 hover:bg-slate-50">
            <Upload className="mx-auto mb-2 h-6 w-6 text-slate-400" />
            <p className="text-sm font-medium text-slate-800">Kéo thả file vào đây hoặc bấm để chọn</p>
            <p className="text-[11px] mt-1">MP4, PDF, DOCX, MP3 · tối đa 500 MB</p>
          </div>
          <Input label="Tên tài liệu" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} />
          <Select label="Loại" options={[{ value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' }, { value: 'DOC', label: 'Tài liệu Word' }, { value: 'AUDIO', label: 'Audio' }]} value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as Material['type'] }))} />
        </div>
      </Modal>
    </div>
  );
};
