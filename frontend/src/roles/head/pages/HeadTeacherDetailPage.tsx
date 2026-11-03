import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ClipboardCheck, Eye, Mail, MessageSquare, PenTool, School, Star, TrendingUp, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import type { GradingReview } from '@/shared/types';
import { headApi, useHeadReviews, useHeadTeacher } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { addDaysLocal, distinctStudents, mondayOf, pooledAttendance, weekdayCode, ymdLocal } from '@/shared/constants/staff';
import { Avatar, Modal, Textarea } from '@/shared/components/ui';
import { cn, formatDate, staffPath } from '@/shared/utils';
import { CLASS_BAR, DAY_NAME, Figures, Meter, Panel, PanelLink, Status, TBtn, classTone, tbl } from '@/roles/teacher/components/TeacherKit';
import { ObservationActions, ObserveDialog, Stars } from './HeadClassDetailPage';

const STATUS_LABEL = { ACTIVE: ['green', 'Đang giảng dạy'], LOCKED: ['red', 'Đã khoá tài khoản'], PENDING: ['amber', 'Chờ duyệt hồ sơ'] } as const;

/** Trung bình điểm tiêu chí (thang 10) */
export const criteriaAvg = (c?: Record<string, number>) => {
  const v = Object.values(c ?? {});
  return v.length ? Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100 : 0;
};
/** Độ lệch điểm GV so với điểm kiểm định (dương = GV chấm cao hơn) */
export const reviewGap = (r: GradingReview) => (r.headCriteria ? Math.round((criteriaAvg(r.teacherCriteria) - criteriaAvg(r.headCriteria)) * 100) / 100 : null);

/** Hồ sơ chuyên môn của giáo viên: lớp phụ trách, lịch dạy, dự giờ, kết quả kiểm định chấm bài */
export const HeadTeacherDetailPage: React.FC = () => {
  const { id } = useParams();
  const q = useHeadTeacher(id);
  const allReviews = useHeadReviews().data ?? [];
  const [observeOpen, setObserveOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  useDocumentTitle(q.data?.teacher.name ?? 'Hồ sơ giáo viên');
  if (!q.data) {
    return (
      <div className="space-y-6">
        <Link to={staffPath('/teachers')} className="text-[13px] text-slate-500 hover:text-slate-900">
          ← Giáo viên bộ môn
        </Link>
        <Panel>
          <p className="py-12 text-center text-sm text-slate-500">{q.isError ? 'Không tìm thấy giáo viên trong bộ môn của bạn.' : 'Đang tải…'}</p>
        </Panel>
      </div>
    );
  }
  const { teacher: t, classes, observations: obs, sessions } = q.data;
  const reviews = allReviews.filter((r) => r.teacher === t.name);
  const rated = obs.filter((o) => o.rating);
  const avgRating = rated.length ? Math.round((rated.reduce((a, o) => a + (o.rating ?? 0), 0) / rated.length) * 10) / 10 : null;
  const attendance = pooledAttendance(classes);
  const students = distinctStudents(classes);
  const mon = mondayOf();
  const weekEnd = ymdLocal(addDaysLocal(mon, 7));
  const week = sessions.filter((s) => s.date >= ymdLocal(mon) && s.date < weekEnd && s.status !== 'CANCELLED').map((s) => ({ day: weekdayCode(s.date), time: `${s.start}–${s.end}`, cls: { id: s.classId, name: s.className, room: s.room } }));
  const toneOf = (cid: string) => classTone(`cl-${Math.max(0, classes.findIndex((c) => c.id === cid)) + 1}`);
  const st = STATUS_LABEL[t.status];
  const sendMsg = async () => {
    if (!msg.trim()) return toast.error('Chưa nhập nội dung');
    setSending(true);
    try {
      await headApi.teacherNote(t.id, msg.trim());
      setMsgOpen(false);
      setMsg('');
      toast.success('Đã gửi nhận xét', t.name);
    } catch (e) {
      toast.error('Không gửi được', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        <Link to={staffPath('/teachers')} className="hover:text-slate-900 hover:underline underline-offset-2">
          Giáo viên bộ môn
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-slate-700">{t.name}</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.12)] md:p-8">
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-500/15 via-violet-500/10 to-amber-400/15" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar name={t.name} src={t.avatarUrl} size="xl" ring />
            <div className="min-w-0">
              <h1 className="font-display text-[1.9rem] font-extrabold leading-tight text-slate-900 md:text-[2.3rem]">{t.name}</h1>
              <p className="mt-1 text-sm text-slate-600">{t.subject}</p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {t.email}
                </span>
                <Status tone={st[0]}>{st[1]}</Status>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <TBtn icon={<MessageSquare />} onClick={() => setMsgOpen(true)}>
              Gửi nhận xét
            </TBtn>
            <TBtn variant="primary" icon={<Eye />} onClick={() => setObserveOpen(true)} disabled={!classes.length}>
              Lên lịch dự giờ
            </TBtn>
          </div>
        </div>
      </section>

      <Figures
        className="lg:grid-cols-3 xl:grid-cols-6"
        items={[
          { label: 'Lớp phụ trách', value: classes.length, icon: School, tone: 'indigo' },
          { label: 'Học viên', value: students, icon: Users, tone: 'violet' },
          { label: 'Điểm TB lớp', value: t.avgClassScore || '—', icon: TrendingUp, tone: 'sky' },
          { label: 'Chuyên cần TB', value: attendance ? `${attendance}%` : '—', icon: ClipboardCheck, tone: 'emerald' },
          { label: 'Chờ kiểm định', value: reviews.filter((r) => r.status === 'PENDING').length, note: `${reviews.length} bài đã chọn kiểm tra`, icon: PenTool, tone: 'amber' },
          { label: 'Điểm dự giờ TB', value: avgRating ? `${avgRating}/5` : '—', note: `${rated.length} buổi đã dự`, icon: Star, tone: 'rose' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Lớp phụ trách" sub="Chuyên cần và tiến độ hoàn thành bài tập" icon={School} tone="indigo" flush>
            {classes.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa được phân công lớp nào.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className={tbl.table}>
                  <thead className={tbl.thead}>
                    <tr>
                      <th className={tbl.th}>Lớp</th>
                      <th className={cn(tbl.th, 'text-right')}>HV</th>
                      <th className={cn(tbl.th, 'text-right')}>Điểm TB</th>
                      <th className={cn(tbl.th, 'w-40')}>Chuyên cần</th>
                      <th className={cn(tbl.th, 'w-40')}>Hoàn thành</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c.id} className={tbl.tr}>
                        <td className={cn(tbl.td, 'min-w-[200px]')}>
                          <Link to={staffPath(`/classes/${c.id}`)} className="font-medium text-slate-900 hover:text-indigo-700">
                            {c.name}
                          </Link>
                          <p className="text-[12px] text-slate-500">
                            {c.schedule || 'Chưa xếp lịch'} · {c.room || 'Chưa xếp phòng'}
                          </p>
                        </td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.studentsCount}</td>
                        <td className={cn(tbl.td, 'text-right tabular-nums')}>{c.avgScore || '—'}</td>
                        <td className={tbl.td}>
                          <span className="flex items-center gap-2">
                            <Meter value={c.attendanceRate} tone={c.attendanceRate < 75 ? 'red' : c.attendanceRate < 85 ? 'amber' : 'green'} className="flex-1" />
                            <span className="w-9 text-right text-[13px] tabular-nums">{c.attendanceMarks ? `${c.attendanceRate}%` : '—'}</span>
                          </span>
                        </td>
                        <td className={tbl.td}>
                          <span className="flex items-center gap-2">
                            <Meter value={c.completionRate} tone={c.completionRate < 65 ? 'red' : 'indigo'} className="flex-1" />
                            <span className="w-9 text-right text-[13px] tabular-nums">{c.completionRate}%</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>

          <Panel title="Kiểm định chấm bài" sub="Bài Viết/Nói giáo viên đã chấm, trưởng bộ môn chấm lại để so sánh" icon={PenTool} tone="amber" action={<PanelLink to={staffPath('/grading-review')}>Bàn kiểm định</PanelLink>} flush>
            {reviews.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-500">Chưa có bài nào được chọn kiểm định.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {reviews.map((r) => {
                  const gap = reviewGap(r);
                  return (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {r.studentName} · {r.type === 'ESSAY' ? 'Bài Viết' : 'Bài Nói'}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {r.className} · GV chấm {criteriaAvg(r.teacherCriteria)}/10
                          {r.headCriteria && ` · kiểm định ${criteriaAvg(r.headCriteria)}/10`}
                        </p>
                      </div>
                      {r.status === 'PENDING' ? (
                        <TBtn size="sm" to={staffPath(`/grading-review/${r.id}`)}>
                          Kiểm định
                        </TBtn>
                      ) : (
                        <Status tone={gap !== null && Math.abs(gap) >= 1 ? 'red' : 'green'}>{gap !== null && Math.abs(gap) >= 1 ? `Lệch ${gap > 0 ? '+' : ''}${gap.toLocaleString('vi-VN')} điểm` : 'Khớp điểm'}</Status>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel title="Lịch dạy trong tuần" icon={Users} tone="emerald">
            {week.length === 0 ? (
              <p className="text-sm text-slate-500">Không có buổi dạy nào trong tuần này.</p>
            ) : (
              <ul className="space-y-2">
                {week.map((w, i) => (
                  <li key={i} className={cn('rounded-lg border-l-4 px-3 py-2', CLASS_BAR[toneOf(w.cls.id)])}>
                    <p className="text-[12px] text-slate-500">
                      {DAY_NAME[w.day]} · {w.time}
                    </p>
                    <p className="text-sm font-medium text-slate-900">{w.cls.name}</p>
                    <p className="text-[12px] text-slate-500">{w.cls.room ?? ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Dự giờ" icon={Eye} tone="violet">
            {obs.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có buổi dự giờ nào.</p>
            ) : (
              <ul className="space-y-3">
                {obs.map((o) => (
                  <li key={o.id} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] text-slate-500">
                        {formatDate(o.date)} · {o.start}
                      </p>
                      {o.rating ? <Stars value={o.rating} /> : <Status tone="blue">Sắp dự</Status>}
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-slate-900">{o.topic}</p>
                    {o.improvements && <p className="mt-1 text-[13px] text-slate-600">Cần cải thiện: {o.improvements}</p>}
                    <ObservationActions o={o} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {classes.length > 0 && <ObserveDialog key={classes[0].id} open={observeOpen} onClose={() => setObserveOpen(false)} classId={classes.length === 1 ? classes[0].id : undefined} classIds={classes.map((c) => c.id)} />}
      <Modal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        title={`Nhận xét cho ${t.name}`}
        description="Giáo viên nhận được trong mục Thông báo."
        icon={<MessageSquare />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setMsgOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" disabled={sending} onClick={() => void sendMsg()}>
              Gửi
            </TBtn>
          </>
        }
      >
        <Textarea label="Nội dung" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="VD: Bài Viết lớp VSTEP B2 chấm cao hơn kiểm định trung bình 1 điểm, đề nghị bám sát mô tả tiêu chí…" />
      </Modal>
    </div>
  );
};
