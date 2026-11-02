import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ChevronRight, ClipboardCheck, ClipboardList, Eye, MapPin, MessageSquare, Star, TrendingUp, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import type { ClassStudent } from '@/shared/types';
import { headApi, useHeadClass, useHeadClasses, useHeadInvalidate, useHeadTeachers, type HeadClass } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { ASSIGNMENT_TYPE_LABEL, partLabel } from '@/shared/constants/staff';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { HBarChart, LineChart } from '@/shared/components/charts/Charts';
import { cn, formatDate, timeAgo } from '@/shared/utils';
import { Avatar, Input, Modal, Textarea } from '@/shared/components/ui';
import { Figures, Meter, Panel, Status, TBtn, TTabs, tbl, type StatusTone } from '@/roles/teacher/components/TeacherKit';
import { classIssue } from './HeadClassesPage';

export const STUDENT_STATUS: Record<ClassStudent['status'], { label: string; tone: StatusTone }> = {
  GOOD: { label: 'Ổn định', tone: 'green' },
  WARNING: { label: 'Cần nhắc', tone: 'amber' },
  RISK: { label: 'Nguy cơ bỏ học', tone: 'red' },
};
const EMPTY_C: HeadClass[] = [];
const A_STATUS: Record<string, [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };

export const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${value}/5 điểm`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={cn('h-3.5 w-3.5', i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300')} />
    ))}
  </span>
);

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Modal lên lịch dự giờ, dùng chung cho chi tiết lớp, hồ sơ giáo viên, lịch bộ môn. `classIds` giới hạn danh sách lớp được chọn. */
export const ObserveDialog: React.FC<{ open: boolean; onClose: () => void; classId?: string; classIds?: string[]; onSaved?: () => void }> = ({ open, onClose, classId, classIds, onSaved }) => {
  const all = useHeadClasses().data ?? EMPTY_C;
  const options = classIds ? all.filter((c) => classIds.includes(c.id)) : all;
  const [cidState, setCid] = useState<string>();
  const cid = classId ?? cidState ?? options[0]?.id;
  const [date, setDate] = useState(todayIso);
  const [saving, setSaving] = useState(false);
  const refresh = useHeadInvalidate();
  const detail = useHeadClass(open ? cid : undefined).data;
  const cls = detail?.class ?? all.find((c) => c.id === cid);
  const session = detail?.sessions.find((s) => s.date >= date && s.date >= todayIso() && s.status === 'UPCOMING' && !s.observerId);
  const save = async () => {
    if (!cls || !session) return toast.error('Không có buổi học phù hợp', 'Chọn ngày khác trong lịch của lớp.');
    setSaving(true);
    try {
      await headApi.planObservation(session.id);
      toast.success('Đã lên lịch dự giờ', `${cls.name} · ${formatDate(session.date)} ${session.start} · giáo viên ${cls.teacherName} nhận được thông báo.`);
      await refresh();
      onSaved?.();
      onClose();
    } catch (e) {
      toast.error('Không lên lịch được', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Lên lịch dự giờ"
      description="Chọn lớp và ngày, hệ thống xếp vào buổi học gần nhất theo lịch của lớp."
      icon={<Eye />}
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" disabled={saving || !session} onClick={() => void save()}>
            Lên lịch
          </TBtn>
        </>
      }
    >
      <div className="space-y-4">
        {!classId && (
          <label className="block text-sm">
            <span className="mb-1.5 block font-semibold text-slate-700">Lớp</span>
            <select value={cid ?? ''} onChange={(e) => setCid(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm">
              {options.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.teacherName}
                </option>
              ))}
            </select>
          </label>
        )}
        <Input label="Từ ngày" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
          {session ? (
            <>
              <p className="text-[12px] text-slate-500">Buổi được chọn</p>
              <p className="mt-0.5 font-medium text-slate-900">
                {formatDate(session.date)} · {session.start}–{session.end} · {session.room}
              </p>
              <p className="text-slate-600">{session.topic}</p>
            </>
          ) : (
            <p className="text-slate-500">{detail ? 'Không còn buổi học nào (chưa có người dự giờ) sau ngày này.' : 'Đang tải lịch của lớp…'}</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

/** Chi tiết lớp ở góc nhìn trưởng bộ môn: theo dõi kết quả, chuyên cần, bài tập, dự giờ; gửi nhận xét cho giáo viên */
export const HeadClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const q = useHeadClass(id);
  const teachers = useHeadTeachers().data ?? [];
  const [tab, setTab] = useState('overview');
  const [observeOpen, setObserveOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  useDocumentTitle(q.data?.class.name ?? 'Chi tiết lớp');

  if (!q.data) {
    return (
      <div className="space-y-6">
        <Link to="/head/classes" className="text-[13px] text-slate-500 hover:text-slate-900">
          ← Lớp học bộ môn
        </Link>
        <Panel>
          <p className="py-12 text-center text-sm text-slate-500">{q.isError ? 'Không tìm thấy lớp học hoặc lớp không thuộc bộ môn của bạn.' : 'Đang tải…'}</p>
        </Panel>
      </div>
    );
  }

  const { class: cls, students, sessions, assignments, observations: obs, analytics } = q.data;
  const teacher = teachers.find((t) => t.id === cls.teacherId);
  const issue = classIssue(cls, teachers.length ? (teacher?.status ?? null) : undefined);
  const done = sessions.filter((s) => s.status === 'DONE');
  const trend = analytics.trend;
  const trendValues = trend.values;
  const hasTrend = trendValues.some((v) => v > 0);
  const accuracy = analytics.accuracy.map((a) => ({ label: partLabel(a.part), value: a.rate }));

  const sendNote = async () => {
    if (!note.trim()) return toast.error('Chưa nhập nội dung nhận xét');
    setSending(true);
    try {
      await headApi.classNote(cls.id, note.trim());
      setNoteOpen(false);
      setNote('');
      toast.success('Đã gửi nhận xét', `${cls.teacherName} nhận được nhận xét về lớp ${cls.name}.`);
    } catch (e) {
      toast.error('Không gửi được', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        <Link to="/head/classes" className="hover:text-slate-900 hover:underline underline-offset-2">
          Lớp học bộ môn
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">{cls.name}</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-[0_20px_40px_-24px_rgba(16,24,40,0.6)]">
        <div className="absolute inset-0 opacity-60">
          <Img src={cls.coverUrl ?? PHOTOS.classroom} alt={cls.name} wrapperClass="h-full" fallbackClass="bg-slate-800" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-950/70 to-fuchsia-900/20" />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div className="min-w-0">
            <span className="rounded-md bg-white/15 px-2 py-0.5 text-[12px] font-semibold backdrop-blur">
              {cls.examType} · {cls.code}
            </span>
            <h1 className="mt-3 font-display text-[2rem] font-extrabold leading-tight md:text-[2.6rem]">{cls.name}</h1>
            <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {cls.schedule || 'Chưa xếp lịch'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {cls.room || 'Chưa xếp phòng'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {cls.studentsCount} học viên · mở ngày {formatDate(cls.createdAt)}
              </span>
            </p>
            {issue && <p className="mt-3 inline-flex rounded-lg bg-rose-500/25 px-2.5 py-1 text-sm text-rose-50">{issue}</p>}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:items-end">
            <Link to={teacher ? `/head/teachers/${teacher.id}` : '/head/teachers'} className="flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur hover:bg-white/15">
              <Avatar name={cls.teacherName} src={teacher?.avatarUrl} size="sm" />
              <span>
                <span className="block text-[11px] text-slate-300">Giáo viên phụ trách</span>
                <span className="block text-sm font-semibold">{cls.teacherName}</span>
              </span>
            </Link>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setNoteOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10">
                <MessageSquare className="h-4 w-4" /> Nhận xét cho GV
              </button>
              <button type="button" onClick={() => setObserveOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
                <Eye className="h-4 w-4" /> Lên lịch dự giờ
              </button>
            </div>
          </div>
        </div>
      </section>

      <Figures
        items={[
          { label: 'Sĩ số', value: cls.studentsCount, note: `${students.filter((x) => x.status !== 'GOOD').length} học viên cần theo dõi`, icon: Users, tone: 'indigo' },
          { label: 'Điểm trung bình', value: cls.avgScore || '—', note: 'bài thi thử & bài được chấm', icon: TrendingUp, tone: 'violet' },
          { label: 'Hoàn thành bài tập', value: cls.assignmentsCount ? `${cls.completionRate}%` : '—', note: `${cls.assignmentsCount} bài đã giao`, icon: ClipboardList, tone: 'amber' },
          { label: 'Chuyên cần', value: cls.attendanceRate ? `${cls.attendanceRate}%` : '—', note: `${done.length} buổi đã dạy`, icon: ClipboardCheck, tone: 'emerald' },
        ]}
      />

      <TTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'overview', label: 'Kết quả học tập' },
          { key: 'students', label: 'Học viên', count: students.length },
          { key: 'sessions', label: 'Buổi học & chuyên cần', count: sessions.length },
          { key: 'assignments', label: 'Bài tập', count: assignments.length },
          { key: 'observe', label: 'Dự giờ', count: obs.length },
        ]}
      />

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <Panel title="Điểm thi thử trung bình theo tháng" sub={cls.examType === 'TOEIC' ? 'Thang 990' : 'Thang 10'}>
            {hasTrend ? (
              <LineChart ariaLabel="Điểm thi thử trung bình theo tháng" labels={trend.labels} series={[{ name: 'Điểm TB', values: trendValues }]} min={0} format={(v) => v.toLocaleString('vi-VN')} />
            ) : (
              <p className="py-14 text-center text-sm text-slate-500">Học viên trong lớp chưa có bài thi thử nào được chấm.</p>
            )}
          </Panel>
          <Panel title="Tỷ lệ đúng theo phần thi" sub="Tất cả câu học viên trong lớp đã làm">
            {accuracy.length ? <HBarChart ariaLabel="Tỷ lệ đúng theo phần thi" data={accuracy} max={100} unit="%" labelWidth={120} /> : <p className="py-14 text-center text-sm text-slate-500">Chưa có câu trả lời nào.</p>}
          </Panel>
        </div>
      )}

      {tab === 'students' && (
        <Panel flush>
          <div className="overflow-x-auto">
            <table className={tbl.table}>
              <thead className={tbl.thead}>
                <tr>
                  <th className={tbl.th}>Học viên</th>
                  <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                  <th className={cn(tbl.th, 'w-44')}>Hoàn thành bài</th>
                  <th className={cn(tbl.th, 'text-right')}>Chuyên cần</th>
                  <th className={tbl.th}>Hoạt động gần nhất</th>
                  <th className={tbl.th}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {students.map((r) => (
                  <tr key={r.id} className={tbl.tr}>
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
                    <td className={cn(tbl.td, 'text-right tabular-nums', r.attendance < 75 && 'text-rose-600')}>{r.attendance}%</td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-slate-600')}>{timeAgo(r.lastActive)}</td>
                    <td className={tbl.td}>
                      <Status tone={STUDENT_STATUS[r.status].tone}>{STUDENT_STATUS[r.status].label}</Status>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!students.length && <p className="px-5 py-8 text-center text-sm text-slate-500">Lớp chưa có học viên.</p>}
        </Panel>
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
                  <th className={cn(tbl.th, 'w-44')}>Có mặt</th>
                  <th className={tbl.th}>Tình trạng</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const rate = s.attendanceRate ?? 0;
                  return (
                    <tr key={s.id} className={tbl.tr}>
                      <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums')}>{formatDate(s.date)}</td>
                      <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums text-slate-600')}>
                        {s.start}–{s.end}
                      </td>
                      <td className={cn(tbl.td, 'min-w-[240px] text-slate-800')}>
                        {s.topic}
                        {s.note && <p className="text-[12px] text-slate-500">{s.note}</p>}
                      </td>
                      <td className={tbl.td}>
                        {s.status === 'DONE' && s.attendanceRate != null ? (
                          <span className="flex items-center gap-2">
                            <Meter value={rate} tone={rate < 75 ? 'red' : rate < 85 ? 'amber' : 'green'} className="flex-1" />
                            <span className="w-10 text-right text-[13px] tabular-nums text-slate-600">{rate}%</span>
                          </span>
                        ) : (
                          <span className="text-[13px] text-slate-400">—</span>
                        )}
                      </td>
                      <td className={tbl.td}>
                        <Status tone={s.status === 'DONE' ? 'green' : s.status === 'CANCELLED' ? 'gray' : 'blue'}>{s.status === 'DONE' ? 'Đã dạy' : s.status === 'CANCELLED' ? 'Nghỉ' : 'Sắp dạy'}</Status>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'assignments' && (
        <Panel flush>
          {assignments.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">Giáo viên chưa giao bài tập nào trên hệ thống cho lớp này.</p>
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
                      <td className={cn(tbl.td, 'min-w-[240px]')}>
                        <p className="font-medium text-slate-900">{a.title}</p>
                        <p className="text-[12px] text-slate-500">{ASSIGNMENT_TYPE_LABEL[a.type] ?? a.type}</p>
                      </td>
                      <td className={cn(tbl.td, 'whitespace-nowrap tabular-nums text-slate-700')}>{a.dueAt ? formatDate(a.dueAt) : '—'}</td>
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
                        <Status tone={(A_STATUS[a.status] ?? A_STATUS.DRAFT)[0]}>{(A_STATUS[a.status] ?? A_STATUS.DRAFT)[1]}</Status>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === 'observe' && (
        <Panel
          title="Dự giờ lớp"
          sub="Biên bản dự giờ được gửi cho giáo viên sau buổi học"
          icon={Eye}
          tone="violet"
          action={
            <TBtn size="sm" variant="primary" onClick={() => setObserveOpen(true)}>
              Lên lịch dự giờ
            </TBtn>
          }
        >
          {obs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">Chưa có buổi dự giờ nào cho lớp này.</p>
          ) : (
            <ul className="space-y-3">
              {obs.map((o) => (
                <li key={o.id} className="rounded-xl border border-slate-200/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatDate(o.date)} · {o.start} · {o.topic}
                    </p>
                    {o.status === 'DONE' && o.rating ? <Stars value={o.rating} /> : <Status tone="blue">Đã lên lịch</Status>}
                  </div>
                  {o.strengths && (
                    <p className="mt-2 text-sm text-slate-700">
                      <span className="font-medium text-emerald-700">Điểm mạnh:</span> {o.strengths}
                    </p>
                  )}
                  {o.improvements && (
                    <p className="mt-1 text-sm text-slate-700">
                      <span className="font-medium text-amber-700">Cần cải thiện:</span> {o.improvements}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      )}

      <ObserveDialog open={observeOpen} onClose={() => setObserveOpen(false)} classId={cls.id} onSaved={() => setTab('observe')} />
      <Modal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        title={`Nhận xét cho ${cls.teacherName}`}
        description={`Về lớp ${cls.name}. Giáo viên nhận được trong mục Thông báo.`}
        icon={<MessageSquare />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setNoteOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" disabled={sending} onClick={() => void sendNote()}>
              Gửi nhận xét
            </TBtn>
          </>
        }
      >
        <Textarea label="Nội dung" rows={5} placeholder="VD: Chuyên cần lớp giảm 2 tuần liền, đề nghị liên hệ 3 học viên vắng nhiều nhất…" value={note} onChange={(e) => setNote(e.target.value)} />
      </Modal>
    </div>
  );
};
