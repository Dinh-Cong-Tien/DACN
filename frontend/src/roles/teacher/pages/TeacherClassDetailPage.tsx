import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Users, ClipboardList, FolderOpen, TrendingUp, UserPlus, Upload, FileText, Video, Music, File, Calendar } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_ASSIGNMENTS, MOCK_MATERIALS, CLASS_WEEKLY_PROGRESS } from '@/shared/mocks';
import type { ClassStudent, Material } from '@/shared/types';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { Avatar, Badge, Button, Card, CardHeader, Column, DataTable, GradientPanel, Input, MiniBars, Modal, PageHeader, ProgressBar, RingProgress, Select, StatCard, Tabs, Textarea } from '@/shared/components/ui';

const STATUS: Record<ClassStudent['status'], { label: string; tone: 'emerald' | 'amber' | 'rose' }> = {
  GOOD: { label: 'Tốt', tone: 'emerald' },
  WARNING: { label: 'Cảnh báo', tone: 'amber' },
  RISK: { label: 'Nguy cơ', tone: 'rose' },
};

const MAT_ICON: Record<Material['type'], React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music };

export const TeacherClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const cls = MOCK_CLASSES.find((c) => c.id === id) ?? MOCK_CLASSES[0];
  useDocumentTitle(cls.name);
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

  const studentCols: Column<ClassStudent>[] = [
    { key: 'name', header: 'Học viên', render: (r) => (<div className="flex items-center gap-3"><Avatar name={r.name} size="sm" /><div><p className="font-bold text-slate-900">{r.name}</p><p className="text-[11px] text-slate-500">{r.email}</p></div></div>) },
    { key: 'avgScore', header: 'Điểm TB', align: 'center', render: (r) => <span className="font-black text-slate-900">{r.avgScore}</span> },
    { key: 'completion', header: 'Hoàn thành', width: '160px', render: (r) => <ProgressBar value={r.completion} size="sm" showValue tone={r.completion >= 80 ? 'emerald' : r.completion >= 60 ? 'amber' : 'rose'} /> },
    { key: 'streak', header: 'Chuỗi', align: 'center', render: (r) => <span className="font-semibold">🔥 {r.streak}</span> },
    { key: 'lastActive', header: 'Hoạt động', render: (r) => <span className="text-xs text-slate-500">{timeAgo(r.lastActive)}</span> },
    { key: 'status', header: 'Trạng thái', render: (r) => <Badge tone={STATUS[r.status].tone} dot>{STATUS[r.status].label}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader crumbs={[{ label: 'Lớp học', to: '/teacher/classes' }, { label: cls.name }]} title={cls.name} description={`${cls.examType} · Tạo ngày ${formatDate(cls.createdAt)}`} actions={<Button variant="outline" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setInviteOpen(true)}>Mời học viên</Button>} />

      <GradientPanel tone="emerald" className="animate-scale-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">Mã mời lớp học</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl md:text-4xl font-black font-mono tracking-wider">{cls.code}</span>
              <button onClick={copy} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition" title="Sao chép"><Copy className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-emerald-100 mt-2">Học viên nhập mã này trong Cài đặt → Tham gia lớp học.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold bg-white/15 rounded-2xl px-4 py-3"><Calendar className="w-4 h-4" /> {cls.schedule}</div>
        </div>
      </GradientPanel>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Học viên" value={cls.studentsCount} icon={<Users />} tone="emerald" />
        <StatCard label="Bài tập" value={cls.assignmentsCount} icon={<ClipboardList />} tone="indigo" />
        <StatCard label="Điểm TB" value={cls.avgScore} icon={<TrendingUp />} tone="amber" />
        <StatCard label="Chuyên cần" value={cls.attendanceRate} suffix="%" icon={<Users />} tone="sky" />
      </div>

      <Tabs
        variant="pill"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'students', label: 'Học viên', icon: <Users />, count: students.length },
          { key: 'assignments', label: 'Bài tập', icon: <ClipboardList />, count: assignments.length },
          { key: 'materials', label: 'Tài liệu', icon: <FolderOpen />, count: materials.length },
          { key: 'progress', label: 'Tiến độ', icon: <TrendingUp /> },
        ]}
      />

      {tab === 'students' && <DataTable columns={studentCols} rows={students} className="animate-fade-up" />}

      {tab === 'assignments' && (
        <div className="space-y-3 animate-fade-up">
          {assignments.length === 0 && <Card><p className="text-sm text-slate-500 text-center py-6">Lớp chưa có bài tập nào.</p></Card>}
          {assignments.map((a, i) => (
            <Card key={a.id} padding="sm" className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-slate-900">{a.title}</p>
                    <Badge tone="violet" size="xs">{a.type}</Badge>
                    <Badge tone={a.status === 'OPEN' ? 'emerald' : a.status === 'CLOSED' ? 'slate' : 'amber'} size="xs">{a.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Hạn nộp {formatDate(a.dueDate)}{a.avgScore ? ` · Điểm TB ${a.avgScore}` : ''}</p>
                </div>
                <div className="md:w-56">
                  <ProgressBar value={(a.submitted / a.total) * 100} size="sm" label={`${a.submitted}/${a.total} đã nộp`} showValue tone="emerald" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'materials' && (
        <Card className="animate-fade-up">
          <CardHeader title="Tài liệu lớp học" subtitle="Video bài giảng, PDF, audio" action={<Button size="sm" leftIcon={<Upload className="w-4 h-4" />} onClick={() => setUploadOpen(true)}>Tải lên</Button>} />
          <div className="space-y-2">
            {materials.map((m, i) => {
              const Icon = MAT_ICON[m.type];
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className={cn('w-10 h-10 rounded-xl flex items-center justify-center', m.type === 'VIDEO' ? 'bg-rose-50 text-rose-600' : m.type === 'AUDIO' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600')}><Icon className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{m.title}</p>
                    <p className="text-[11px] text-slate-500">{m.size} · {formatDate(m.uploadedAt)} · {m.downloads} lượt tải</p>
                  </div>
                  <Badge tone="slate" size="xs">{m.type}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === 'progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-up">
          <Card className="lg:col-span-2">
            <CardHeader title="Hoàn thành bài tập theo tuần" subtitle="%" />
            <MiniBars data={CLASS_WEEKLY_PROGRESS.map((d) => ({ ...d, tone: 'emerald' as const }))} max={100} height={160} />
          </Card>
          <Card className="flex flex-col items-center justify-center gap-6">
            <div className="text-center"><RingProgress value={cls.completionRate} tone="emerald" size={110}><div><p className="text-xl font-black">{cls.completionRate}%</p></div></RingProgress><p className="text-xs font-bold text-slate-500 mt-2">Hoàn thành</p></div>
            <div className="text-center"><RingProgress value={cls.attendanceRate} tone="sky" size={110}><div><p className="text-xl font-black">{cls.attendanceRate}%</p></div></RingProgress><p className="text-xs font-bold text-slate-500 mt-2">Chuyên cần</p></div>
          </Card>
        </div>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Mời học viên qua email" description={`Mã lớp ${cls.code} sẽ được gửi kèm hướng dẫn.`} icon={<UserPlus />} footer={<><Button variant="ghost" onClick={() => setInviteOpen(false)}>Huỷ</Button><Button onClick={invite}>Gửi lời mời</Button></>}>
        <Textarea label="Danh sách email" hint="Mỗi email một dòng hoặc cách nhau bằng dấu phẩy" placeholder="hocvien1@gmail.com&#10;hocvien2@gmail.com" value={emails} onChange={(e) => setEmails(e.target.value)} />
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Tải lên tài liệu" icon={<Upload />} footer={<><Button variant="ghost" onClick={() => setUploadOpen(false)}>Huỷ</Button><Button onClick={upload}>Tải lên</Button></>}>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-500 hover:border-emerald-400 hover:bg-emerald-50/30 transition cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold">Kéo thả file vào đây hoặc nhấn để chọn</p>
            <p className="text-[11px] mt-1">MP4, PDF, DOCX, MP3 · tối đa 500 MB</p>
          </div>
          <Input label="Tên tài liệu" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} />
          <Select label="Loại" options={[{ value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' }, { value: 'DOC', label: 'Tài liệu Word' }, { value: 'AUDIO', label: 'Audio' }]} value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as Material['type'] }))} />
        </div>
      </Modal>
    </div>
  );
};
