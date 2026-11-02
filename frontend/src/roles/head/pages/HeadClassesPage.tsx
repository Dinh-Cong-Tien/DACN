import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Plus, School, Search, Users, TrendingUp, ClipboardCheck } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import type { ClassRoom, ExamType } from '@/shared/types';
import { headApi, useHeadClasses, useHeadInvalidate, useHeadSchedule, useHeadTeachers, type HeadClass } from '@/shared/api/head';
import { errorMessage } from '@/shared/api/client';
import { addDaysLocal, ymdLocal } from '@/shared/constants/staff';
import { Avatar, Input, Modal, Select } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { cn } from '@/shared/utils';
import { Figures, Meter, Panel, TBtn, TPageHead, inputCls } from '@/roles/teacher/components/TeacherKit';

const COVERS = [PHOTOS.classroom, PHOTOS.discussion, PHOTOS.lecture, PHOTOS.team, PHOTOS.students2];
const EMPTY: HeadClass[] = [];

/** Vấn đề của lớp cần trưởng bộ môn xử lý. `teacherStatus` = trạng thái tài khoản GV (undefined khi chưa tải). Chỉ số = 0 nghĩa là chưa có dữ liệu. */
export const classIssue = (c: ClassRoom, teacherStatus?: string | null): string | null => {
  if (teacherStatus === null || teacherStatus === 'LOCKED') return 'Giáo viên đã bị khoá tài khoản, cần phân công lại';
  if (c.attendanceRate > 0 && c.attendanceRate < 75) return `Chuyên cần ${c.attendanceRate}%, dưới ngưỡng 75%`;
  if (c.completionRate > 0 && c.completionRate < 65) return `Hoàn thành bài tập ${c.completionRate}%, dưới ngưỡng 65%`;
  return null;
};

/** Lớp học thuộc bộ môn: theo dõi mọi lớp, giáo viên phụ trách, phân công lại khi cần */
export const HeadClassesPage: React.FC = () => {
  useDocumentTitle('Lớp học bộ môn');
  const classesQ = useHeadClasses();
  const classes = classesQ.data ?? EMPTY;
  const teacherList = useHeadTeachers().data ?? [];
  const refresh = useHeadInvalidate();
  const today = new Date();
  const upcoming = useHeadSchedule(ymdLocal(today), ymdLocal(addDaysLocal(today, 14))).data?.sessions ?? [];
  const teacherByName = (name: string) => teacherList.find((t) => t.name === name);
  /** null = GV không còn trong bộ môn / bị xoá; undefined = đang tải */
  const statusOf = (c: HeadClass) => (teacherList.length ? (teacherList.find((t) => t.id === c.teacherId)?.status ?? null) : undefined);
  const [saving, setSaving] = useState(false);
  const [exam, setExam] = useState<'ALL' | ExamType>('ALL');
  const [teacher, setTeacher] = useState('ALL');
  const [onlyIssue, setOnlyIssue] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', examType: 'TOEIC' as ExamType, teacherId: '', schedule: '', room: '' });
  const [error, setError] = useState('');

  const list = classes.filter(
    (c) =>
      (exam === 'ALL' || c.examType === exam) &&
      (teacher === 'ALL' || c.teacherName === teacher) &&
      (!onlyIssue || classIssue(c, statusOf(c))) &&
      (c.name.toLowerCase().includes(q.toLowerCase()) || c.code.toLowerCase().includes(q.toLowerCase()))
  );
  const issues = classes.filter((c) => classIssue(c, statusOf(c))).length;
  const activeTeachers = teacherList.filter((t) => t.status === 'ACTIVE');

  const create = async () => {
    if (!form.name.trim()) return setError('Vui lòng nhập tên lớp');
    const teacherId = form.teacherId || activeTeachers[0]?.id;
    if (!teacherId) return setError('Bộ môn chưa có giáo viên đang hoạt động');
    setSaving(true);
    try {
      const c = await headApi.createClass({ name: form.name.trim(), examType: form.examType, teacherId, scheduleText: form.schedule || undefined, room: form.room || undefined, coverUrl: COVERS[classes.length % COVERS.length] });
      setOpen(false);
      setForm({ name: '', examType: 'TOEIC', teacherId: '', schedule: '', room: '' });
      setError('');
      toast.success('Đã mở lớp mới', `${c.name} · mã ${c.code} · giáo viên ${c.teacherName} nhận được thông báo phân công.`);
      await refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const reassign = async (c: HeadClass, teacherId: string) => {
    const name = teacherList.find((t) => t.id === teacherId)?.name ?? '';
    try {
      await headApi.updateClass(c.id, { teacherId });
      toast.success('Đã phân công lại', `${c.name} → ${name}`);
      await refresh();
    } catch (e) {
      toast.error('Không phân công được', errorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <TPageHead
        eyebrow="Bộ môn"
        title="Lớp học bộ môn"
        sub="Toàn bộ lớp đang mở, giáo viên phụ trách, chuyên cần và tiến độ. Mở lớp mới hoặc phân công lại giáo viên khi cần."
        actions={
          <TBtn variant="primary" icon={<Plus />} onClick={() => setOpen(true)}>
            Mở lớp & phân công
          </TBtn>
        }
      />

      <Figures
        items={[
          { label: 'Lớp đang mở', value: classes.length, note: `${new Set(classes.map((c) => c.teacherName)).size} giáo viên phụ trách`, icon: School, tone: 'indigo' },
          { label: 'Tổng học viên', value: classes.reduce((a, c) => a + c.studentsCount, 0), icon: Users, tone: 'violet' },
          { label: 'Chuyên cần TB', value: classes.some((c) => c.attendanceRate) ? `${Math.round(classes.reduce((a, c) => a + c.attendanceRate, 0) / Math.max(1, classes.filter((c) => c.attendanceRate).length))}%` : '—', icon: ClipboardCheck, tone: 'emerald' },
          { label: 'Lớp cần xử lý', value: issues, note: 'chuyên cần thấp, GV bị khoá…', icon: AlertTriangle, tone: 'rose' },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên hoặc mã lớp" className={cn(inputCls, 'w-full pl-9')} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={exam} onChange={(e) => setExam(e.target.value as typeof exam)} className={inputCls} aria-label="Lọc theo kỳ thi">
            <option value="ALL">Tất cả kỳ thi</option>
            <option value="TOEIC">TOEIC</option>
            <option value="VSTEP">VSTEP</option>
          </select>
          <select value={teacher} onChange={(e) => setTeacher(e.target.value)} className={cn(inputCls, 'max-w-[220px]')} aria-label="Lọc theo giáo viên">
            <option value="ALL">Tất cả giáo viên</option>
            {teacherList.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-1 text-sm text-slate-700">
            <input type="checkbox" checked={onlyIssue} onChange={(e) => setOnlyIssue(e.target.checked)} className="h-4 w-4 accent-indigo-600" /> Chỉ lớp cần xử lý
          </label>
        </div>
        <p className="text-[13px] text-slate-500 lg:ml-auto">
          {list.length} lớp · {list.reduce((a, c) => a + c.studentsCount, 0)} học viên
        </p>
      </div>

      {list.length === 0 ? (
        <Panel>
          <p className="py-10 text-center text-sm text-slate-500">{classesQ.isLoading ? 'Đang tải…' : 'Không có lớp nào khớp bộ lọc.'}</p>
        </Panel>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const t = teacherByName(c.teacherName);
            const issue = classIssue(c, statusOf(c));
            const next = upcoming.find((s) => s.classId === c.id && s.status === 'UPCOMING');
            return (
              <article key={c.id} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-16px_rgba(16,24,40,0.15)] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(16,24,40,0.4)]">
                <Link to={`/head/classes/${c.id}`} className="relative block">
                  <Img src={c.coverUrl ?? PHOTOS.classroom} alt={c.name} ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
                  <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-800 backdrop-blur">{c.examType}</span>
                  <div className="absolute inset-x-4 bottom-3 text-white">
                    <h3 className="font-display text-xl font-extrabold leading-tight">{c.name}</h3>
                    <p className="mt-0.5 text-[13px] text-slate-200">
                      {c.schedule} · {c.room}
                    </p>
                  </div>
                </Link>
                <div className="flex flex-1 flex-col p-4">
                  <div className="mb-3 flex items-center gap-2.5">
                    <Avatar name={c.teacherName} src={t?.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] text-slate-500">Giáo viên phụ trách</p>
                      {t ? (
                        <Link to={`/head/teachers/${t.id}`} className="block truncate text-sm font-semibold text-slate-900 hover:text-indigo-700">
                          {c.teacherName}
                        </Link>
                      ) : (
                        <p className="truncate text-sm font-semibold text-slate-900">{c.teacherName}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      [c.studentsCount, 'Học viên'],
                      [c.avgScore || '—', 'Điểm TB'],
                      [c.attendanceRate ? `${c.attendanceRate}%` : '—', 'Chuyên cần'],
                    ].map(([v, l]) => (
                      <div key={l as string} className="rounded-xl bg-slate-50 py-2">
                        <p className={cn('font-display text-lg font-bold tabular-nums', l === 'Chuyên cần' && c.attendanceRate > 0 && c.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-900')}>{v}</p>
                        <p className="text-[11px] text-slate-500">{l}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[13px]">
                    <span className="w-28 shrink-0 text-slate-500">Hoàn thành bài</span>
                    <Meter value={c.completionRate} tone={c.completionRate < 65 ? 'red' : c.completionRate < 80 ? 'amber' : 'indigo'} className="flex-1" />
                    <span className="w-10 text-right tabular-nums text-slate-700">{c.completionRate}%</span>
                  </div>
                  {issue ? (
                    <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-rose-500/[0.07] px-2.5 py-2 text-[13px] text-rose-700">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {issue}
                    </p>
                  ) : (
                    <p className="mt-3 text-[13px] text-slate-600">{next ? `Buổi tới: ${next.date.slice(8, 10)}/${next.date.slice(5, 7)} lúc ${next.start} · ${next.topic}` : 'Chưa có buổi sắp tới'}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <select
                      value={c.teacherId}
                      onChange={(e) => void reassign(c, e.target.value)}
                      aria-label={`Phân công giáo viên cho lớp ${c.name}`}
                      className="h-8 min-w-0 max-w-[60%] rounded-lg border border-slate-200 bg-white px-2 text-[13px] text-slate-700"
                    >
                      {!activeTeachers.some((x) => x.id === c.teacherId) && <option value={c.teacherId}>{c.teacherName} (cần thay)</option>}
                      {activeTeachers.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                    <TBtn size="sm" variant="primary" to={`/head/classes/${c.id}`} icon={<TrendingUp />}>
                      Theo dõi lớp
                    </TBtn>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Mở lớp & phân công giáo viên"
        description="Giáo viên được phân công nhận thông báo và thấy lớp trong mục Lớp học của mình."
        icon={<School />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" disabled={saving} onClick={() => void create()}>
              Mở lớp
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Tên lớp" required placeholder="VD: TOEIC 650+ K13" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Kỳ thi" options={[{ value: 'TOEIC', label: 'TOEIC' }, { value: 'VSTEP', label: 'VSTEP' }]} value={form.examType} onChange={(e) => setForm((f) => ({ ...f, examType: e.target.value as ExamType }))} />
            <Select label="Giáo viên phụ trách" options={activeTeachers.map((t) => ({ value: t.id, label: `${t.name} · ${t.classesCount} lớp` }))} value={form.teacherId || activeTeachers[0]?.id || ''} onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Lịch học" placeholder="VD: T2 – T4 – T6 · 19:00" value={form.schedule} onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value }))} />
            <Input label="Phòng học" placeholder="VD: Phòng 302 hoặc Online" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
