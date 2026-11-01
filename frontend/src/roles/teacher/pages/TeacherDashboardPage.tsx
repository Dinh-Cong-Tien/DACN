import React from 'react';
import { Link } from 'react-router-dom';
import { AlarmClock, CalendarDays, ChevronRight, ClipboardCheck, ClipboardList, Clock, FileWarning, MapPin, Megaphone, NotebookPen, PenTool, School, UserRoundX, Users } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { useAuthStore } from '@/shared/stores/authStore';
import { MOCK_ASSIGNMENTS, MOCK_CLASSES, MOCK_CLASS_STUDENTS, MOCK_SESSIONS, MOCK_SUBMISSIONS } from '@/shared/mocks';
import { cn, formatDateTime } from '@/shared/utils';
import { Avatar } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { CLASS_BAR, Figures, GradientTail, IconTile, Meter, Panel, PanelLink, Status, TBtn, classTone, type Tone } from '../components/TeacherKit';

const WEEKDAY = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;

/** Còn bao lâu tới buổi dạy */
const untilText = (date: string, start: string) => {
  const diff = new Date(`${date}T${start}:00`).getTime() - Date.now();
  if (diff <= 0) return 'Đang diễn ra';
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `Còn ${h > 0 ? `${h} giờ ` : ''}${Math.floor((diff % 3600000) / 60000)} phút`;
  return `Còn ${Math.round(h / 24)} ngày`;
};

export const TeacherDashboardPage: React.FC = () => {
  useDocumentTitle('Tổng quan giáo viên');
  const user = useAuthStore((s) => s.user);
  const now = new Date();
  const today = iso(now);
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return iso(d);
  });

  const nextSession = MOCK_SESSIONS.filter((s) => s.status === 'UPCOMING' && `${s.date}T${s.end}` >= `${today}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
  const nextClass = nextSession ? MOCK_CLASSES.find((c) => c.id === nextSession.classId)! : undefined;
  const todaySessions = MOCK_SESSIONS.filter((s) => s.date === today && s.status !== 'CANCELLED');
  const toGrade = MOCK_SUBMISSIONS.filter((s) => s.status !== 'GRADED');
  const overdueOpen = MOCK_ASSIGNMENTS.filter((a) => a.status === 'OPEN' && new Date(a.dueDate).getTime() < now.getTime());
  const upcoming = MOCK_ASSIGNMENTS.filter((a) => a.status === 'OPEN' && new Date(a.dueDate).getTime() >= now.getTime()).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const watch = MOCK_CLASS_STUDENTS.filter((s) => s.status !== 'GOOD').sort((a, b) => a.completion - b.completion);
  const totalStudents = MOCK_CLASSES.reduce((a, c) => a + c.studentsCount, 0);
  const weekCount = MOCK_SESSIONS.filter((s) => s.date >= weekDays[0] && s.date <= weekDays[6] && s.status !== 'CANCELLED').length;

  const todos: { icon: React.ElementType; tone: Tone; text: string; to: string; cta: string }[] = [
    ...todaySessions.map((s) => ({ icon: ClipboardCheck, tone: 'emerald' as Tone, text: `Điểm danh ${MOCK_CLASSES.find((c) => c.id === s.classId)?.name} lúc ${s.start}`, to: `/teacher/attendance/${s.id}`, cta: 'Điểm danh' })),
    ...(toGrade.length ? [{ icon: PenTool, tone: 'violet' as Tone, text: `Chấm ${toGrade.length} bài Viết / Nói (${toGrade.filter((s) => s.status === 'LATE').length} bài nộp muộn)`, to: '/teacher/grading', cta: 'Chấm bài' }] : []),
    ...(overdueOpen.length ? [{ icon: FileWarning, tone: 'rose' as Tone, text: `${overdueOpen.length} bài tập đã quá hạn nhưng chưa đóng`, to: '/teacher/assignments?status=OPEN', cta: 'Xem' }] : []),
    ...(watch.length ? [{ icon: UserRoundX, tone: 'amber' as Tone, text: `Liên hệ ${watch.filter((s) => s.status === 'RISK').length} học viên có nguy cơ bỏ học`, to: '/teacher/students?filter=watch', cta: 'Hồ sơ' }] : []),
    { icon: NotebookPen, tone: 'sky' as Tone, text: 'Soạn giáo án cho các buổi dạy tuần này', to: '/teacher/schedule', cta: 'Lịch dạy' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-amber-600">
          {WEEKDAY[now.getDay()]}, {dm(today)}/{now.getFullYear()} · Học kỳ 1, năm học 2026–2027
        </p>
        <h1 className="mt-1.5 font-display text-[2rem] font-extrabold leading-[1.12] tracking-tight text-slate-900 md:text-[2.6rem]"><GradientTail text="Tổng quan giảng dạy" /></h1>
        <p className="mt-1 text-[15px] text-slate-500">
          {user?.fullName} · {MOCK_CLASSES.length} lớp · {weekCount} buổi dạy tuần này
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Buổi dạy tiếp theo */}
        {nextSession && nextClass ? (
          <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white shadow-[0_20px_40px_-24px_rgba(16,24,40,0.6)]">
            <div className="absolute inset-0 opacity-60">
              <Img src={nextClass.coverUrl ?? PHOTOS.classroom} alt={nextClass.name} wrapperClass="h-full" fallbackClass="bg-slate-800" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/95 via-indigo-950/70 to-fuchsia-900/20" />
            <div className="relative flex h-full flex-col justify-between gap-8 p-6 md:p-7">
              <div>
                <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-indigo-200">
                  <AlarmClock className="h-4 w-4" /> Buổi dạy tiếp theo · {untilText(nextSession.date, nextSession.start)}
                </p>
                <h2 className="mt-3 font-display text-[1.75rem] font-extrabold leading-tight md:text-[2rem]">{nextClass.name}</h2>
                <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-slate-200">{nextSession.topic}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" /> {nextSession.date === today ? 'Hôm nay' : `${WEEKDAY[new Date(nextSession.date).getDay()]} ${dm(nextSession.date)}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {nextSession.start} – {nextSession.end}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> {nextSession.room}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {nextClass.studentsCount} học viên
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/teacher/attendance/${nextSession.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-indigo-50">
                  <ClipboardCheck className="h-4 w-4" /> Điểm danh
                </Link>
                <Link to="/teacher/schedule" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white hover:bg-white/10">
                  <NotebookPen className="h-4 w-4" /> Xem giáo án
                </Link>
                <Link to={`/teacher/classes/${nextClass.id}`} className="inline-flex h-10 items-center gap-1 px-2 text-sm font-semibold text-slate-200 hover:text-white">
                  Trang lớp <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <Panel>
            <p className="py-10 text-center text-sm text-slate-500">Không còn buổi dạy nào trong lịch.</p>
          </Panel>
        )}

        {/* Việc cần làm */}
        <Panel title="Việc cần làm hôm nay" sub={`${todos.length} việc`} icon={ClipboardList} tone="indigo" flush>
          <ul className="divide-y divide-slate-100">
            {todos.map((t) => (
              <li key={t.text} className="flex items-center gap-3 px-5 py-3">
                <IconTile icon={t.icon} tone={t.tone} size="sm" />
                <p className="min-w-0 flex-1 text-sm text-slate-800">{t.text}</p>
                <TBtn size="sm" to={t.to}>
                  {t.cta}
                </TBtn>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Figures
        items={[
          { label: 'Lớp phụ trách', value: MOCK_CLASSES.length, note: `${totalStudents} học viên`, icon: School, tone: 'indigo' },
          { label: 'Bài chờ chấm', value: toGrade.length, note: `${toGrade.filter((s) => s.status === 'LATE').length} bài nộp muộn`, icon: PenTool, tone: 'violet' },
          { label: 'Chuyên cần trung bình', value: `${Math.round(MOCK_CLASSES.reduce((a, c) => a + c.attendanceRate, 0) / MOCK_CLASSES.length)}%`, note: 'các buổi đã dạy', icon: ClipboardCheck, tone: 'emerald' },
          { label: 'Học viên cần theo dõi', value: watch.length, note: `${watch.filter((s) => s.status === 'RISK').length} có nguy cơ bỏ học`, icon: UserRoundX, tone: 'rose' },
        ]}
      />

      {/* Lịch tuần */}
      <Panel title="Lịch dạy tuần này" icon={CalendarDays} tone="sky" action={<PanelLink to="/teacher/schedule">Mở lịch dạy</PanelLink>} flush>
        <div className="overflow-x-auto">
          <div className="grid min-w-[760px] grid-cols-7 divide-x divide-slate-100">
            {weekDays.map((d) => {
              const list = MOCK_SESSIONS.filter((s) => s.date === d).sort((a, b) => a.start.localeCompare(b.start));
              const isToday = d === today;
              return (
                <div key={d} className={cn('min-h-[150px] p-2.5', isToday && 'bg-indigo-500/[0.04]')}>
                  <p className={cn('mb-2 text-[12px]', isToday ? 'font-semibold text-indigo-700' : 'text-slate-500')}>
                    {WEEKDAY[new Date(d).getDay()]} · {dm(d)}
                  </p>
                  <div className="space-y-1.5">
                    {list.map((s) => {
                      const c = MOCK_CLASSES.find((x) => x.id === s.classId)!;
                      return (
                        <Link key={s.id} to="/teacher/schedule" className={cn('block rounded-lg border-l-4 px-2 py-1.5 hover:shadow-md', CLASS_BAR[classTone(c.id)], s.status === 'CANCELLED' && 'opacity-50')}>
                          <p className="text-[11px] font-semibold tabular-nums text-slate-600">{s.start}</p>
                          <p className={cn('text-[12px] font-semibold leading-snug text-slate-900', s.status === 'CANCELLED' && 'line-through')}>{c.name}</p>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Bài chờ chấm" sub="Bài Viết và bài Nói học viên đã nộp" icon={PenTool} tone="violet" action={<PanelLink to="/teacher/grading">Mở bàn chấm</PanelLink>} flush>
          <ul className="divide-y divide-slate-100">
            {toGrade.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={s.studentName} src={s.avatarUrl} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{s.studentName}</span>
                  <span className="block truncate text-[12px] text-slate-500">
                    {s.assignmentTitle} · <span className={s.status === 'LATE' ? 'text-rose-600' : undefined}>{s.status === 'LATE' ? 'nộp muộn ' : ''}{formatDateTime(s.submittedAt)}</span>
                  </span>
                </span>
                <TBtn size="sm" to={`/teacher/grading/${s.id}`}>
                  Chấm
                </TBtn>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Hạn nộp sắp tới" icon={ClipboardList} tone="amber" action={<PanelLink to="/teacher/assignments">Tất cả</PanelLink>} flush>
            <ul className="divide-y divide-slate-100">
              {upcoming.map((a) => (
                <li key={a.id} className="px-5 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{a.title}</p>
                    <span className="shrink-0 text-[12px] tabular-nums text-slate-500">{dm(new Date(a.dueDate).toISOString().slice(0, 10))}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="w-28 shrink-0 truncate text-[12px] text-slate-500">{a.className}</span>
                    <Meter value={(a.submitted / a.total) * 100} className="flex-1" />
                    <span className="w-11 text-right text-[12px] tabular-nums text-slate-600">
                      {a.submitted}/{a.total}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Học viên cần theo dõi" icon={Megaphone} tone="rose" action={<PanelLink to="/teacher/students?filter=watch">Hồ sơ</PanelLink>} flush>
            <ul className="divide-y divide-slate-100">
              {watch.map((s) => (
                <li key={s.id}>
                  <Link to={`/teacher/students?id=${s.id}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-slate-50">
                    <Avatar name={s.name} src={s.avatarUrl} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-slate-900">{s.name}</span>
                      <span className="block text-[12px] text-slate-500">Hoàn thành {s.completion}% bài tập</span>
                    </span>
                    <Status tone={s.status === 'RISK' ? 'red' : 'amber'}>{s.status === 'RISK' ? 'Nguy cơ' : 'Cần nhắc'}</Status>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Lớp phụ trách */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-extrabold text-slate-900">Lớp phụ trách</h2>
          <PanelLink to="/teacher/classes">Quản lý lớp</PanelLink>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MOCK_CLASSES.map((c) => (
            <Link key={c.id} to={`/teacher/classes/${c.id}`} className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-[0_16px_32px_-20px_rgba(16,24,40,0.35)]">
              <div className="relative">
                <Img src={c.coverUrl ?? PHOTOS.classroom} alt={c.name} ratio="video" fallbackClass="bg-slate-200" className="transition-transform duration-500 group-hover:scale-[1.04]" />
                <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-slate-800 backdrop-blur">{c.examType}</span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-slate-900 group-hover:text-indigo-700">{c.name}</h3>
                <p className="mt-0.5 text-[12px] text-slate-500">
                  {c.schedule} · {c.room}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    [c.studentsCount, 'Học viên'],
                    [c.avgScore, 'Điểm TB'],
                    [`${c.attendanceRate}%`, 'Chuyên cần'],
                  ].map(([v, l]) => (
                    <div key={l as string} className="rounded-lg bg-slate-50 py-1.5">
                      <p className="font-display text-[15px] font-bold tabular-nums text-slate-900">{v}</p>
                      <p className="text-[11px] text-slate-500">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
