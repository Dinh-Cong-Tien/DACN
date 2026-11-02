import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, ClipboardCheck, Copy, ClipboardList, ExternalLink, Link2, MapPin, Megaphone, Pin, TrendingUp, UserPlus, Upload, FileText, Users, Video, Music, File } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useClassAnalytics, useClassDetail, useTeacherLibrary, useTeacherMutation, type MaterialType } from '@/shared/api/teacher';
import { ASSIGNMENT_TYPE_LABEL, describeTarget } from '@/shared/constants/teacher';
import type { ClassStudent } from '@/shared/types';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { BarChart } from '@/shared/components/charts/Charts';
import { presentRate } from './TeacherSchedulePage';
import { cn, formatDate, formatDateTime, timeAgo } from '@/shared/utils';
import { Avatar, Input, Modal, Select, Textarea } from '@/shared/components/ui';
import { Figures, IconTile, Meter, Panel, Status, TBtn, TTabs, inputCls, tbl, type StatusTone } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';

const STATUS: Record<ClassStudent['status'], { label: string; tone: StatusTone }> = {
  GOOD: { label: 'Ổn định', tone: 'green' },
  WARNING: { label: 'Cần nhắc', tone: 'amber' },
  RISK: { label: 'Nguy cơ bỏ học', tone: 'red' },
};
const MAT_LABEL: Record<MaterialType, string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Word', AUDIO: 'Audio', LINK: 'Liên kết' };

const MAT_ICON: Record<MaterialType, React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music, LINK: Link2 };

export const TeacherClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: cls, isLoading, error, refetch } = useClassDetail(id);
  useDocumentTitle(cls?.name ?? 'Lớp học');
  const navigate = useNavigate();
  const lib = useTeacherLibrary();
  const analytics = useClassAnalytics(id);
  const [tab, setTab] = useState('news');
  const [newsTitle, setNewsTitle] = useState('');
  const [newsBody, setNewsBody] = useState('');
  const [newsPin, setNewsPin] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [emails, setEmails] = useState('');
  const [matForm, setMatForm] = useState({ title: '', type: 'PDF' as MaterialType, url: '' });
  const postNews = useTeacherMutation(teacherApi.postAnnouncement);
  const addStudents = useTeacherMutation((list: string[]) => teacherApi.addStudents(id!, list));
  const addMaterial = useTeacherMutation(teacherApi.addMaterial);

  if (isLoading) return <TLoading />;
  if (error || !cls) return <TError error={error} onRetry={() => refetch()} />;

  const sessions = cls.sessions;
  const nextSession = sessions.filter((s) => s.status === 'UPCOMING').sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
  const news = cls.announcements;
  const materials = cls.materials;
  const assignments = cls.assignments;
  const students = cls.students;
  const sessionsDone = sessions.filter((s) => s.status === 'DONE').length;
  const firstTest = lib.tests.find((t) => t.examType === cls.examType);

  const post = () =>
    postNews.mutate(
      { classId: cls.id, title: newsTitle.trim(), body: newsBody.trim(), pinned: newsPin },
      {
        onSuccess: () => {
          setNewsTitle('');
          setNewsBody('');
          setNewsPin(false);
          toast.success('Đã đăng thông báo', `${cls.studentsCount} học viên lớp ${cls.name} nhận được thông báo.`);
        },
        onError: (e) => toast.error('Không đăng được thông báo', errorMessage(e)),
      }
    );

  const copy = () => {
    navigator.clipboard?.writeText(cls.code).catch(() => undefined);
    toast.success('Đã sao chép mã mời', cls.code);
  };

  const invite = () => {
    const list = [...new Set(emails.split(/[\n,;]/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
    if (!list.length) return toast.error('Chưa có email nào');
    const bad = list.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (bad.length) return toast.error('Email chưa đúng định dạng', bad.join(', '));
    addStudents.mutate(list, {
      onSuccess: (r) => {
        setInviteOpen(false);
        setEmails('');
        if (r.added) toast.success(`Đã thêm ${r.added} học viên`, r.notFound.length ? `Chưa có tài khoản: ${r.notFound.join(', ')}` : `Học viên nhận thông báo kèm mã lớp ${cls.code}.`);
        else toast.error('Không thêm được học viên nào', r.notFound.length ? `Chưa có tài khoản học viên: ${r.notFound.join(', ')}. Gửi mã ${cls.code} để các bạn tự tham gia sau khi đăng ký.` : undefined);
      },
      onError: (e) => toast.error('Không thêm được học viên', errorMessage(e)),
    });
  };

  const upload = () => {
    if (!matForm.title.trim()) return toast.error('Vui lòng nhập tên tài liệu');
    if (!/^https?:\/\/\S+$/.test(matForm.url.trim())) return toast.error('Đường dẫn chưa hợp lệ', 'Nhập link bắt đầu bằng http:// hoặc https://');
    addMaterial.mutate(
      { classId: cls.id, title: matForm.title.trim(), type: matForm.type, fileUrl: matForm.url.trim() },
      {
        onSuccess: () => {
          setUploadOpen(false);
          setMatForm({ title: '', type: 'PDF', url: '' });
          toast.success('Đã thêm tài liệu', 'Học viên trong lớp xem được ngay ở mục Lớp của tôi.');
        },
        onError: (e) => toast.error('Không thêm được tài liệu', errorMessage(e)),
      }
    );
  };

  const A_STATUS: Record<string, [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        <Link to="/teacher/classes" className="hover:text-slate-900 hover:underline underline-offset-2">
          Lớp học
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">{cls.name}</span>
      </nav>

      {/* Ảnh bìa lớp */}
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-[0_20px_40px_-24px_rgba(16,24,40,0.6)]">
        <div className="absolute inset-0 opacity-60">
          <Img src={cls.coverUrl ?? PHOTOS.classroom} alt={cls.name} wrapperClass="h-full" fallbackClass="bg-slate-800" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-950/70 to-fuchsia-900/20" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="min-w-0">
            <span className="rounded-md bg-white/15 px-2 py-0.5 text-[12px] font-semibold backdrop-blur">{cls.examType}</span>
            <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight md:text-[2.6rem]">{cls.name}</h1>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {cls.schedule || 'Chưa có lịch'}
              </span>
              {cls.room && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {cls.room}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {cls.studentsCount} học viên · mở ngày {formatDate(cls.createdAt)}
              </span>
            </p>
            {nextSession && <p className="mt-3 text-sm text-indigo-100">Buổi tới: {nextSession.date.slice(8, 10)}/{nextSession.date.slice(5, 7)} lúc {nextSession.start}{nextSession.topic ? ` · ${nextSession.topic}` : ''}</p>}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-left backdrop-blur hover:bg-white/15" title="Sao chép mã mời">
              <span>
                <span className="block text-[11px] text-slate-300">Mã mời vào lớp</span>
                <span className="block font-mono text-lg font-semibold tracking-wider">{cls.code}</span>
              </span>
              <Copy className="h-4 w-4 text-slate-300" />
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10">
                <UserPlus className="h-4 w-4" /> Mời học viên
              </button>
              <button type="button" onClick={() => navigate('/teacher/assignments', { state: { assign: firstTest ? { kind: 'EXAM', testId: firstTest.slug, setup: { mode: 'FULL', parts: [], minutes: null } } : undefined, classId: cls.id } })} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
                <ClipboardList className="h-4 w-4" /> Giao bài tập
              </button>
            </div>
          </div>
        </div>
      </section>

      <Figures
        items={[
          { label: 'Sĩ số', value: cls.studentsCount, note: `${students.filter((x) => x.status !== 'GOOD').length} học viên cần theo dõi`, icon: Users, tone: 'indigo' },
          { label: 'Điểm trung bình', value: cls.avgScore || '—', note: cls.avgScore ? 'các bài thi thử của học viên' : 'chưa có bài thi thử', icon: TrendingUp, tone: 'violet' },
          { label: 'Hoàn thành bài tập', value: cls.assignmentsCount ? `${cls.completionRate}%` : '—', note: `${cls.assignmentsCount} bài đã giao`, icon: ClipboardList, tone: 'amber' },
          { label: 'Chuyên cần', value: cls.attendanceRate ? `${cls.attendanceRate}%` : '—', note: `${sessionsDone} buổi đã dạy`, icon: ClipboardCheck, tone: 'emerald' },
        ]}
      />

      <TTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'news', label: 'Bảng tin', count: news.length },
          { key: 'students', label: 'Học viên', count: students.length },
          { key: 'sessions', label: 'Buổi học', count: sessions.length },
          { key: 'assignments', label: 'Bài tập', count: assignments.length },
          { key: 'materials', label: 'Tài liệu', count: materials.length },
          { key: 'progress', label: 'Tiến độ bài tập' },
        ]}
      />

      {tab === 'news' && (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {news.length === 0 && (
              <Panel>
                <p className="py-6 text-center text-sm text-slate-500">Chưa có thông báo nào.</p>
              </Panel>
            )}
            {news.map((n) => (
              <Panel key={n.id}>
                <div className="flex items-start gap-3">
                  <IconTile icon={n.pinned ? Pin : Megaphone} tone={n.pinned ? 'amber' : 'indigo'} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-slate-500">
                      {n.pinned && <span className="mr-1.5 font-semibold text-amber-600">Đã ghim ·</span>}
                      {formatDateTime(n.createdAt)} · {n.readCount}/{cls.studentsCount} đã xem
                    </p>
                    <h3 className="mt-1 font-display text-[17px] font-bold text-slate-900">{n.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{n.body}</p>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
          <Panel title="Đăng thông báo" sub="Học viên nhận thông báo ngay" icon={Megaphone} tone="rose" className="lg:sticky lg:top-20">
            <div className="space-y-3">
              <input value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="Tiêu đề, VD: Đổi phòng học buổi thứ Sáu" className={cn(inputCls, 'w-full')} />
              <textarea value={newsBody} onChange={(e) => setNewsBody(e.target.value)} rows={4} placeholder="Nội dung" className={cn(inputCls, 'h-auto w-full py-2')} />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={newsPin} onChange={(e) => setNewsPin(e.target.checked)} className="h-4 w-4 accent-indigo-600" /> Ghim lên đầu bảng tin
              </label>
              <TBtn variant="primary" className="w-full" disabled={!newsTitle.trim() || !newsBody.trim()} onClick={post}>
                Đăng thông báo
              </TBtn>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'sessions' && (
        <Panel flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Ngày</th>
                  <th className={tbl.th}>Giờ</th>
                  <th className={tbl.th}>Giáo án</th>
                  <th className={tbl.th}>Tình trạng</th>
                  <th className={tbl.th} />
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className={tbl.tr}>
                    <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums')}>{formatDate(s.date)}</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums text-slate-600')}>
                      {s.start}–{s.end}
                    </td>
                    <td className={cn(tbl.td, 'min-w-[260px] text-slate-800')}>
                      {s.topic || <span className="text-slate-400">Chưa soạn giáo án</span>}
                      {s.note && <p className="text-[12px] text-slate-500">{s.note}</p>}
                    </td>
                    <td className={tbl.td}>
                      <Status tone={s.status === 'DONE' ? 'green' : s.status === 'CANCELLED' ? 'gray' : 'blue'}>{s.status === 'DONE' ? (s.attendance ? `Đã dạy · có mặt ${presentRate(s)}%` : 'Đã dạy') : s.status === 'CANCELLED' ? 'Nghỉ' : 'Sắp dạy'}</Status>
                    </td>
                    <td className={cn(tbl.td, 'text-right')}>
                      {s.status !== 'CANCELLED' && (
                        <TBtn size="sm" to={`/teacher/attendance/${s.id}`}>
                          Điểm danh
                        </TBtn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'students' && (
        <Panel flush>
          {students.length === 0 && <TEmpty title="Lớp chưa có học viên" sub={`Gửi mã ${cls.code} cho học viên hoặc bấm “Mời học viên”.`} />}
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
                    <td className={cn(tbl.td, 'text-right tabular-nums')}>{r.avgScore || '—'}</td>
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
                          {ASSIGNMENT_TYPE_LABEL[a.type]} · {describeTarget(a.target, lib)}
                        </p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums text-slate-700')}>{a.dueDate ? formatDate(a.dueDate) : '—'}</td>
                      <td className={tbl.td}>
                        <span className="flex items-center gap-2">
                          <Meter value={a.total ? (a.submitted / a.total) * 100 : 0} className="flex-1" />
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
              Thêm tài liệu
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
                    <th className={tbl.th} />
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => {
                    const Icon = MAT_ICON[m.type] ?? File;
                    return (
                      <tr key={m.id} className={tbl.tr}>
                        <td className={tbl.td}>
                          <span className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                            <span className="font-medium text-slate-900">{m.title}</span>
                          </span>
                        </td>
                        <td className={cn(tbl.td, 'text-slate-600')}>{MAT_LABEL[m.type] ?? m.type}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums text-slate-600')}>{m.size}</td>
                        <td className={cn(tbl.td, 'tabular-nums text-slate-600')}>{formatDate(m.uploadedAt)}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{m.downloads}</td>
                        <td className={cn(tbl.td, 'text-right')}>
                          {m.fileUrl && (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" title="Mở tài liệu" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </td>
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
        <Panel title="Tỷ lệ học viên đã nộp từng bài tập" sub="Theo thứ tự hạn nộp, tính trên sĩ số lớp">
          {(analytics.data?.completionByAssignment.length ?? 0) === 0 ? (
            <TEmpty title={analytics.isLoading ? 'Đang tải…' : 'Chưa có bài tập nào được giao'} sub={analytics.isLoading ? undefined : 'Tiến độ hiện ở đây sau khi lớp có bài tập.'} />
          ) : (
            <BarChart ariaLabel="Tỷ lệ nộp từng bài tập" data={analytics.data!.completionByAssignment.map((a) => ({ label: a.title.length > 14 ? `${a.title.slice(0, 14)}…` : a.title, value: a.rate }))} max={100} unit="%" height={260} />
          )}
        </Panel>
      )}

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Thêm học viên bằng email"
        description={`Nhập email tài khoản học viên đã đăng ký. Bạn nào chưa có tài khoản có thể tự tham gia bằng mã ${cls.code}.`}
        icon={<UserPlus />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setInviteOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={invite} disabled={addStudents.isPending}>
              {addStudents.isPending ? 'Đang thêm…' : 'Thêm vào lớp'}
            </TBtn>
          </>
        }
      >
        <Textarea label="Danh sách email" hint="Mỗi email một dòng hoặc cách nhau bằng dấu phẩy" placeholder="hocvien1@gmail.com&#10;hocvien2@gmail.com" value={emails} onChange={(e) => setEmails(e.target.value)} />
      </Modal>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Thêm tài liệu"
        description="Dán đường dẫn tài liệu (Google Drive, OneDrive, YouTube…) đã chia sẻ quyền xem."
        icon={<Upload />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setUploadOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={upload} disabled={addMaterial.isPending}>
              {addMaterial.isPending ? 'Đang lưu…' : 'Thêm tài liệu'}
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên tài liệu" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} />
          <Input label="Đường dẫn" required placeholder="https://drive.google.com/…" value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} />
          <Select label="Loại" options={[{ value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' }, { value: 'DOC', label: 'Tài liệu Word' }, { value: 'AUDIO', label: 'Audio' }, { value: 'LINK', label: 'Liên kết khác' }]} value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as MaterialType }))} />
        </div>
      </Modal>
    </div>
  );
};
