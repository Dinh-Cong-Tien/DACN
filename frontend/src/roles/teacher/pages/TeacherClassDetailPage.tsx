import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Archive, Ban, CalendarDays, CalendarPlus, ChevronRight, ClipboardCheck, Copy, ClipboardList, ExternalLink, Link2, MapPin, Megaphone, Pencil, Pin, PinOff, RefreshCw, RotateCcw, Trash2, TrendingUp, UserMinus, UserPlus, Upload, FileText, Users, Video, Music, File, Sheet, BarChart3 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { fileHref, teacherApi, useClassAnalytics, useClassDetail, useTeacherLibrary, useTeacherMutation, type ClassInput, type MaterialType, type SessionInput } from '@/shared/api/teacher';
import { ASSIGNMENT_TYPE_LABEL, describeTarget } from '@/shared/constants/teacher';
import type { ClassStudent } from '@/shared/types';
import { Img, PHOTOS } from '@/shared/components/media/Img';
import { BarChart } from '@/shared/components/charts/Charts';
import { presentRate } from './TeacherSchedulePage';
import { cn, formatDate, formatDateTime, sessionState, timeAgo } from '@/shared/utils';
import { Avatar, ConfirmDialog, Input, Modal, Select, Textarea } from '@/shared/components/ui';
import { Figures, IconTile, Meter, Panel, Status, TBtn, TTabs, inputCls, tbl, type StatusTone } from '../components/TeacherKit';
import { TEmpty, TError, TLoading } from '../components/TeacherState';
import { ClassLeaderboardPanel } from '../components/ClassLeaderboard';
import { CLASS_LEVEL_OPTIONS, classTrack, classTrackLabel, courseOptions } from '@/shared/constants/staff';
import { ClassCourseProgressPanel } from '../components/ClassCourseProgress';
import { CourseLessonList } from '../components/CourseLessonList';

const STATUS: Record<ClassStudent['status'], { label: string; tone: StatusTone }> = {
  GOOD: { label: 'Ổn định', tone: 'green' },
  WARNING: { label: 'Cần nhắc', tone: 'amber' },
  RISK: { label: 'Nguy cơ bỏ học', tone: 'red' },
};
const MAT_LABEL: Record<MaterialType, string> = { VIDEO: 'Video', PDF: 'PDF', DOC: 'Word', AUDIO: 'Audio', LINK: 'Liên kết' };

const MAT_ICON: Record<MaterialType, React.ElementType> = { VIDEO: Video, PDF: FileText, DOC: File, AUDIO: Music, LINK: Link2 };
const MAX_UPLOAD_MB = 25;

type Confirm = { title: string; message: string; confirmText: string; danger?: boolean; run: () => void };
const todayYmd = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

export const TeacherClassDetailPage: React.FC = () => {
  const { id } = useParams();
  const { data: cls, isLoading, error, refetch } = useClassDetail(id);
  useDocumentTitle(cls?.name ?? 'Lớp học');
  const navigate = useNavigate();
  const lib = useTeacherLibrary();
  const analytics = useClassAnalytics(id);
  const [tab, setTab] = useState('news');
  const [picked, setPicked] = useState<string[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsBody, setNewsBody] = useState('');
  const [newsPin, setNewsPin] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [emails, setEmails] = useState('');
  const [matForm, setMatForm] = useState({ title: '', type: 'PDF' as MaterialType, url: '' });
  const [matMode, setMatMode] = useState<'file' | 'link'>('file');
  const [matFile, setMatFile] = useState<File | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [classForm, setClassForm] = useState<ClassInput | null>(null);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [sessionForm, setSessionForm] = useState<SessionInput>({ date: todayYmd(), start: '19:00', end: '20:30', room: '', topic: '' });
  const [newsEdit, setNewsEdit] = useState<{ id: string; title: string; body: string } | null>(null);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const postNews = useTeacherMutation(teacherApi.postAnnouncement);
  const addStudents = useTeacherMutation((list: string[]) => teacherApi.addStudents(id!, list));
  const addMaterial = useTeacherMutation(teacherApi.addMaterial);
  const uploadMaterial = useTeacherMutation(teacherApi.uploadMaterial);
  const deleteMaterial = useTeacherMutation(teacherApi.deleteMaterial);
  const updateClass = useTeacherMutation((b: Partial<ClassInput>) => teacherApi.updateClass(id!, b));
  const archiveClass = useTeacherMutation((archived: boolean) => teacherApi.archiveClass(id!, archived));
  const regenCode = useTeacherMutation(() => teacherApi.regenerateCode(id!));
  const removeStudent = useTeacherMutation((studentId: string) => teacherApi.removeStudent(id!, studentId));
  const addSession = useTeacherMutation((b: SessionInput) => teacherApi.addSession(id!, b));
  const setSessionStatus = useTeacherMutation((v: { id: string; status: 'UPCOMING' | 'CANCELLED' }) => teacherApi.updateSession(v.id, { status: v.status }));
  const updateNews = useTeacherMutation((v: { id: string; title?: string; body?: string; pinned?: boolean }) => teacherApi.updateAnnouncement(v.id, { title: v.title, body: v.body, pinned: v.pinned }));
  const deleteNews = useTeacherMutation(teacherApi.deleteAnnouncement);

  if (isLoading) return <TLoading />;
  if (error || !cls) return <TError error={error} onRetry={() => refetch()} />;

  const sessions = cls.sessions;
  // Buổi kế tiếp: chưa diễn ra (buổi đã qua mà vẫn UPCOMING là "chưa điểm danh", không phải buổi kế tiếp)
  const nowKey = (() => { const d = new Date(); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}${p(d.getHours())}:${p(d.getMinutes())}`; })();
  const libCourse = lib.courses.find((x) => x.id === cls.course?.id);
  const nextSession = sessions.filter((s) => s.status === 'UPCOMING' && `${s.date}${s.end}` > nowKey).sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`))[0];
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

  const closeUpload = () => {
    setUploadOpen(false);
    setMatForm({ title: '', type: 'PDF', url: '' });
    setMatFile(null);
  };

  const upload = () => {
    if (matMode === 'file') {
      if (!matFile) return toast.error('Chọn tệp cần tải lên');
      if (matFile.size > MAX_UPLOAD_MB * 1024 * 1024) return toast.error(`Tệp vượt quá ${MAX_UPLOAD_MB} MB`, 'Hãy nén tệp hoặc dán đường dẫn Google Drive.');
      const title = matForm.title.trim() || matFile.name.replace(/\.[^.]+$/, '');
      return uploadMaterial.mutate(
        { classId: cls.id, title, file: matFile },
        {
          onSuccess: () => {
            closeUpload();
            toast.success('Đã tải tài liệu lên', `${title} · học viên trong lớp mở được ngay.`);
          },
          onError: (e) => toast.error('Không tải lên được tài liệu', errorMessage(e)),
        }
      );
    }
    if (!matForm.title.trim()) return toast.error('Vui lòng nhập tên tài liệu');
    if (!/^https?:\/\/\S+$/.test(matForm.url.trim())) return toast.error('Đường dẫn chưa hợp lệ', 'Nhập link bắt đầu bằng http:// hoặc https://');
    addMaterial.mutate(
      { classId: cls.id, title: matForm.title.trim(), type: matForm.type, fileUrl: matForm.url.trim() },
      {
        onSuccess: () => {
          closeUpload();
          toast.success('Đã thêm tài liệu', 'Học viên trong lớp xem được ngay ở mục Lớp của tôi.');
        },
        onError: (e) => toast.error('Không thêm được tài liệu', errorMessage(e)),
      }
    );
  };

  const A_STATUS: Record<string, [StatusTone, string]> = { OPEN: ['green', 'Đang mở'], CLOSED: ['gray', 'Đã đóng'], DRAFT: ['amber', 'Bản nháp'] };
  const fail = (what: string) => (e: unknown) => toast.error(what, errorMessage(e));

  const openEdit = () => {
    setClassForm({ name: cls.name, ...(cls.course ? { courseId: cls.course.slug } : { track: classTrack(cls) }), schedule: cls.schedule ?? '', room: cls.room ?? '', level: cls.level ?? '', description: cls.description ?? '', maxStudents: cls.maxStudents ?? null, startDate: cls.startDate ?? null, endDate: cls.endDate ?? null });
    setEditOpen(true);
  };
  const saveClass = () => {
    if (!classForm) return;
    if (!cls.course && (classForm.name ?? '').trim().length < 2) return toast.error('Tên lớp cần ít nhất 2 ký tự');
    if (classForm.startDate && classForm.endDate && classForm.endDate < classForm.startDate) return toast.error('Ngày kết thúc phải sau ngày bắt đầu');
    updateClass.mutate(
      { ...classForm, courseId: classForm.courseId || undefined, name: (classForm.name ?? '').trim(), schedule: classForm.schedule?.trim() || null, room: classForm.room?.trim() || null, level: classForm.level?.trim() || null, description: classForm.description?.trim() || null, startDate: classForm.startDate || null, endDate: classForm.endDate || null },
      { onSuccess: () => (setEditOpen(false), toast.success('Đã lưu thông tin lớp', classForm.name)), onError: fail('Không lưu được thông tin lớp') }
    );
  };
  const askArchive = () =>
    setConfirm({
      title: cls.isArchived ? 'Mở lại lớp?' : 'Lưu trữ lớp?',
      message: cls.isArchived ? `Lớp ${cls.name} sẽ xuất hiện lại trong danh sách lớp đang dạy.` : `Lớp ${cls.name} chuyển vào mục Đã lưu trữ, không còn hiện trong lịch dạy. Dữ liệu điểm và bài tập vẫn được giữ.`,
      confirmText: cls.isArchived ? 'Mở lại' : 'Lưu trữ',
      danger: !cls.isArchived,
      run: () => archiveClass.mutate(!cls.isArchived, { onSuccess: () => (setEditOpen(false), toast.success(cls.isArchived ? 'Đã mở lại lớp' : 'Đã lưu trữ lớp', cls.name)), onError: fail('Không cập nhật được lớp') }),
    });
  const askRegen = () =>
    setConfirm({
      title: 'Đổi mã mời?',
      message: `Mã ${cls.code} sẽ hết hiệu lực; học viên đã vào lớp không bị ảnh hưởng. Bạn cần gửi mã mới cho học viên chưa tham gia.`,
      confirmText: 'Đổi mã',
      run: () => regenCode.mutate(undefined, { onSuccess: (r) => toast.success('Đã đổi mã mời', r.code), onError: fail('Không đổi được mã mời') }),
    });
  const askRemove = (st: ClassStudent) =>
    setConfirm({
      title: 'Xoá học viên khỏi lớp?',
      message: `${st.name} sẽ không còn thấy bảng tin, tài liệu và bài tập của lớp. Bài đã nộp và điểm vẫn được giữ.`,
      confirmText: 'Xoá khỏi lớp',
      danger: true,
      run: () => removeStudent.mutate(st.id, { onSuccess: () => toast.success('Đã xoá học viên khỏi lớp', st.name), onError: fail('Không xoá được học viên') }),
    });
  const saveSession = () => {
    const f = sessionForm;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) return toast.error('Chọn ngày học');
    if (!f.start || !f.end || f.end <= f.start) return toast.error('Giờ kết thúc phải sau giờ bắt đầu');
    addSession.mutate(
      { ...f, room: f.room?.trim() || null, topic: f.topic?.trim() || null },
      { onSuccess: () => (setSessionOpen(false), setSessionForm({ date: todayYmd(), start: f.start, end: f.end, room: '', topic: '' }), toast.success('Đã thêm buổi học', `${formatDate(f.date)} · ${f.start}–${f.end} · học viên nhận được thông báo`)), onError: fail('Không thêm được buổi học') }
    );
  };
  const askCancelSession = (sid: string, date: string, start: string) =>
    setConfirm({
      title: 'Huỷ buổi học?',
      message: `Buổi ${formatDate(date)} lúc ${start} chuyển sang Nghỉ và học viên trong lớp nhận được thông báo.`,
      confirmText: 'Huỷ buổi',
      danger: true,
      run: () => setSessionStatus.mutate({ id: sid, status: 'CANCELLED' }, { onSuccess: () => toast.success('Đã huỷ buổi học', formatDate(date)), onError: fail('Không huỷ được buổi học') }),
    });
  const restoreSession = (sid: string, date: string) => setSessionStatus.mutate({ id: sid, status: 'UPCOMING' }, { onSuccess: () => toast.success('Đã khôi phục buổi học', formatDate(date)), onError: fail('Không khôi phục được buổi học') });
  const togglePin = (n: { id: string; pinned?: boolean; title: string }) => updateNews.mutate({ id: n.id, pinned: !n.pinned }, { onSuccess: () => toast.success(n.pinned ? 'Đã bỏ ghim' : 'Đã ghim lên đầu bảng tin', n.title), onError: fail('Không cập nhật được thông báo') });
  const saveNews = () => {
    if (!newsEdit) return;
    if (newsEdit.title.trim().length < 2 || !newsEdit.body.trim()) return toast.error('Nhập tiêu đề và nội dung thông báo');
    updateNews.mutate({ id: newsEdit.id, title: newsEdit.title.trim(), body: newsEdit.body.trim() }, { onSuccess: () => (setNewsEdit(null), toast.success('Đã sửa thông báo')), onError: fail('Không sửa được thông báo') });
  };
  const askDeleteNews = (n: { id: string; title: string }) =>
    setConfirm({ title: 'Xoá thông báo?', message: `"${n.title}" sẽ bị gỡ khỏi bảng tin lớp.`, confirmText: 'Xoá', danger: true, run: () => deleteNews.mutate(n.id, { onSuccess: () => toast.success('Đã xoá thông báo', n.title), onError: fail('Không xoá được thông báo') }) });
  const askDeleteMaterial = (m: { id: string; title: string }) =>
    setConfirm({ title: 'Xoá tài liệu?', message: `"${m.title}" sẽ không còn hiện với học viên trong lớp.`, confirmText: 'Xoá', danger: true, run: () => deleteMaterial.mutate(m.id, { onSuccess: () => toast.success('Đã xoá tài liệu', m.title), onError: fail('Không xoá được tài liệu') }) });

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[13px] text-slate-500">
        <Link to={cls.course?.track ? `/teacher/courses?muc=${cls.course.track.toLowerCase()}` : '/teacher/classes'} className="hover:text-slate-900 hover:underline underline-offset-2">
          {cls.course?.track ? { TOEIC: 'Khoá học TOEIC', VSTEP: 'Khoá học VSTEP', THPT: 'Tiếng Anh THPT' }[cls.course.track] : 'Lớp học'}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        {cls.course && (
          <>
            <Link to={`/teacher/courses?open=${cls.course.id}`} className="hover:text-slate-900 hover:underline underline-offset-2">
              {cls.course.title}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          </>
        )}
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
            <span className="rounded-md bg-white/15 px-2 py-0.5 text-[12px] font-semibold backdrop-blur">
              {classTrackLabel(cls)}
              {cls.course ? ` · ${cls.course.title}` : ''}
            </span>
            {cls.isArchived && <span className="ml-2 rounded-md bg-amber-400/90 px-2 py-0.5 text-[12px] font-semibold text-amber-950">Đã lưu trữ</span>}
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
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {!cls.course && (
                <button type="button" onClick={askRegen} disabled={regenCode.isPending} title="Đổi mã mời" className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-3 text-sm font-semibold hover:bg-white/10 disabled:opacity-60">
                  <RefreshCw className="h-4 w-4" /> Đổi mã
                </button>
              )}
              <button type="button" onClick={openEdit} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-3 text-sm font-semibold hover:bg-white/10">
                <Pencil className="h-4 w-4" /> Sửa lớp
              </button>
              <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10">
                <UserPlus className="h-4 w-4" /> Mời học viên
              </button>
              <Link to={`/teacher/gradebook?class=${cls.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10">
                <Sheet className="h-4 w-4" /> Bảng điểm
              </Link>
              <Link to={`/teacher/analytics?class=${cls.id}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/25 px-4 text-sm font-semibold hover:bg-white/10">
                <BarChart3 className="h-4 w-4" /> Thống kê
              </Link>
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
          { label: 'Chuyên cần', value: cls.attendanceMarks ? `${cls.attendanceRate}%` : '—', note: `${sessionsDone} buổi đã dạy`, icon: ClipboardCheck, tone: 'emerald' },
        ]}
      />

      <TTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: 'news', label: 'Bảng tin', count: news.length },
          { key: 'lessons', label: 'Bài giảng', ...(cls.courseProgress ? { count: cls.courseProgress.lessonsTotal } : {}) },
          { key: 'course', label: 'Tiến độ khoá học' },
          { key: 'students', label: 'Học viên', count: students.length },
          { key: 'sessions', label: 'Buổi học & điểm danh', count: sessions.length },
          { key: 'assignments', label: 'Bài tập', count: assignments.length },
          { key: 'materials', label: 'Tài liệu', count: materials.length },
          { key: 'progress', label: 'Tiến độ bài tập' },
          { key: 'ranking', label: 'Xếp hạng' },
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
                    <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{n.body}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button type="button" title={n.pinned ? 'Bỏ ghim' : 'Ghim'} onClick={() => togglePin(n)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                      {n.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </button>
                    <button type="button" title="Sửa" onClick={() => setNewsEdit({ id: n.id, title: n.title, body: n.body })} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" title="Xoá" onClick={() => askDeleteNews(n)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
        <Panel
          title="Buổi học"
          sub="Lịch sinh theo thời khoá biểu lớp; thêm buổi dạy bù hoặc huỷ buổi nghỉ"
          action={
            <TBtn size="sm" icon={<CalendarPlus />} onClick={() => setSessionOpen(true)}>
              Thêm buổi
            </TBtn>
          }
          flush
        >
          {sessions.length === 0 && <TEmpty title="Lớp chưa có buổi học nào" sub="Bấm “Thêm buổi” để lên lịch." />}
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
                      <Status tone={sessionState(s).tone}>{s.status === 'DONE' && s.attendance ? `Đã dạy · có mặt ${presentRate(s)}%` : sessionState(s).label}</Status>
                    </td>
                    <td className={cn(tbl.td, 'whitespace-nowrap text-right')}>
                      {s.status !== 'CANCELLED' && (
                        <TBtn size="sm" to={`/teacher/attendance/${s.id}`}>
                          Điểm danh
                        </TBtn>
                      )}
                      {s.status === 'UPCOMING' && (
                        <TBtn size="sm" variant="ghost" icon={<Ban />} className="ml-1 text-rose-600 hover:text-rose-700" onClick={() => askCancelSession(s.id, s.date, s.start)}>
                          Huỷ
                        </TBtn>
                      )}
                      {s.status === 'CANCELLED' && (
                        <TBtn size="sm" variant="ghost" icon={<RotateCcw />} disabled={setSessionStatus.isPending} onClick={() => restoreSession(s.id, s.date)}>
                          Khôi phục
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
                  <th className={tbl.th} />
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
                    <td className={cn(tbl.td, 'text-right')}>
                      <button type="button" title="Xoá khỏi lớp" onClick={() => askRemove(r)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                        <UserMinus className="h-4 w-4" />
                      </button>
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
                          <span className="inline-flex gap-0.5">
                            {m.fileUrl && (
                              <a href={fileHref(m.fileUrl)} target="_blank" rel="noreferrer" title="Mở tài liệu" className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-900/[0.05] hover:text-slate-900">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            <button type="button" title="Xoá" onClick={() => askDeleteMaterial(m)} className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </span>
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

      {tab === 'ranking' && <ClassLeaderboardPanel classId={cls.id} />}

      {tab === 'lessons' &&
        (libCourse ? (
          <Panel
            title={libCourse.title}
            sub={`${libCourse.lessonsCount} bài theo đúng thứ tự học viên học · cột cuối: học viên của lớp đã học xong bài, điểm bài tập trung bình`}
            action={
              <TBtn size="sm" variant="primary" disabled={!picked.length} onClick={() => navigate('/teacher/assignments', { state: { assign: { kind: 'LESSON', courseId: libCourse.slug, lessonIds: picked }, classId: cls.id } })}>
                Giao {picked.length || ''} bài đã chọn
              </TBtn>
            }
          >
            <CourseLessonList course={libCourse} picked={picked} onToggle={(lid) => setPicked((p) => (p.includes(lid) ? p.filter((x) => x !== lid) : [...p, lid]))} stats={cls.courseProgress?.lessons} classSize={students.length} />
          </Panel>
        ) : (
          <ClassCourseProgressPanel course={undefined} progress={undefined} students={students} />
        ))}

      {tab === 'course' && (
        <ClassCourseProgressPanel
          course={cls.course}
          progress={cls.courseProgress}
          students={students}
          courseHref={cls.course ? `/teacher/courses?open=${cls.course.id}` : undefined}
          action={
            cls.course ? (
              <span className="flex items-center gap-3 text-[13px]">
                <button type="button" onClick={() => setTab('lessons')} className="font-medium text-slate-600 hover:underline">
                  Bài giảng
                </button>
                <button type="button" onClick={() => navigate('/teacher/assignments', { state: { assign: { kind: 'LESSON', courseId: cls.course!.slug, lessonIds: [] }, classId: cls.id } })} className="font-medium text-indigo-700 hover:underline">
                  Giao bài trong khoá
                </button>
              </span>
            ) : undefined
          }
        />
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
        onClose={closeUpload}
        title="Thêm tài liệu"
        description={matMode === 'file' ? `Tải tệp từ máy (PDF, Word, PowerPoint, Excel, MP3, MP4, ảnh · tối đa ${MAX_UPLOAD_MB} MB). Chỉ thành viên lớp mở được.` : 'Dán đường dẫn tài liệu (Google Drive, OneDrive, YouTube…) đã chia sẻ quyền xem.'}
        icon={<Upload />}
        footer={
          <>
            <TBtn variant="ghost" onClick={closeUpload}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={upload} disabled={addMaterial.isPending || uploadMaterial.isPending}>
              {addMaterial.isPending || uploadMaterial.isPending ? 'Đang lưu…' : matMode === 'file' ? 'Tải lên' : 'Thêm tài liệu'}
            </TBtn>
          </>
        }
      >
        <div className="space-y-4">
          <TTabs value={matMode} onChange={(k) => setMatMode(k as 'file' | 'link')} items={[{ key: 'file', label: 'Tải tệp lên' }, { key: 'link', label: 'Dán đường dẫn' }]} />
          {matMode === 'file' ? (
            <>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-indigo-400">
                <Upload className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-800">{matFile ? matFile.name : 'Chọn tệp từ máy'}</span>
                <span className="text-[12px] text-slate-500">{matFile ? `${(matFile.size / 1048576).toFixed(1)} MB` : `Tối đa ${MAX_UPLOAD_MB} MB`}</span>
                <input type="file" className="sr-only" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp3,.m4a,.wav,.mp4,.webm,.png,.jpg,.jpeg" onChange={(e) => setMatFile(e.target.files?.[0] ?? null)} />
              </label>
              <Input label="Tên tài liệu" placeholder={matFile ? matFile.name.replace(/\.[^.]+$/, '') : 'Mặc định lấy theo tên tệp'} value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} />
            </>
          ) : (
            <>
              <Input label="Tên tài liệu" required value={matForm.title} onChange={(e) => setMatForm((f) => ({ ...f, title: e.target.value }))} />
              <Input label="Đường dẫn" required placeholder="https://drive.google.com/…" value={matForm.url} onChange={(e) => setMatForm((f) => ({ ...f, url: e.target.value }))} />
              <Select label="Loại" options={[{ value: 'PDF', label: 'PDF' }, { value: 'VIDEO', label: 'Video' }, { value: 'DOC', label: 'Tài liệu Word' }, { value: 'AUDIO', label: 'Audio' }, { value: 'LINK', label: 'Liên kết khác' }]} value={matForm.type} onChange={(e) => setMatForm((f) => ({ ...f, type: e.target.value as MaterialType }))} />
            </>
          )}
        </div>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Thông tin lớp"
        icon={<Pencil />}
        size="lg"
        footer={
          <>
            <TBtn variant="ghost" icon={<Archive />} className="mr-auto" onClick={askArchive} disabled={archiveClass.isPending}>
              {cls.isArchived ? 'Mở lại lớp' : 'Lưu trữ lớp'}
            </TBtn>
            <TBtn variant="ghost" onClick={() => setEditOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={saveClass} disabled={updateClass.isPending}>
              {updateClass.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </TBtn>
          </>
        }
      >
        {classForm && (
          <div className="grid gap-4 md:grid-cols-2">
            {!cls.course && (
              <div className="md:col-span-2">
                <Input label="Tên lớp" required value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
              </div>
            )}
            <div className="md:col-span-2">
              <Select
                label="Khoá học của lớp"
                placeholder="Chưa gắn khoá học"
                options={courseOptions(lib.courses)}
                value={classForm.courseId ?? ''}
                onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value || undefined })}
                hint="Đổi khoá: học viên đang trong lớp được ghi danh khoá mới, tiến độ khoá cũ vẫn giữ"
              />
            </div>
            <Input label="Lịch học" placeholder="T2 – T4 – T6 · 19:00" value={classForm.schedule ?? ''} onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })} />
            <Input label="Phòng" value={classForm.room ?? ''} onChange={(e) => setClassForm({ ...classForm, room: e.target.value })} />
            {cls.course ? (
              <Select label="Trình độ lớp" options={CLASS_LEVEL_OPTIONS} value={classForm.level ?? ''} placeholder="Chọn trình độ" onChange={(e) => setClassForm({ ...classForm, level: e.target.value })} hint={`Mã lớp đổi theo, vd ${cls.code.replace(/(A1|A2|B1|B2|C1|C2)$/, '')}${classForm.level || 'B1'}`} />
            ) : (
              <Input label="Trình độ" placeholder="VD: 650+, B1–B2" value={classForm.level ?? ''} onChange={(e) => setClassForm({ ...classForm, level: e.target.value })} />
            )}
            <Input label="Sĩ số tối đa" type="number" min={1} value={classForm.maxStudents ?? ''} onChange={(e) => setClassForm({ ...classForm, maxStudents: e.target.value ? Number(e.target.value) : null })} />
            <Input label="Ngày bắt đầu" type="date" value={classForm.startDate ?? ''} onChange={(e) => setClassForm({ ...classForm, startDate: e.target.value || null })} />
            <Input label="Ngày kết thúc" type="date" value={classForm.endDate ?? ''} onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value || null })} />
            <div className="md:col-span-2">
              <Textarea label="Mô tả" value={classForm.description ?? ''} onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={sessionOpen}
        onClose={() => setSessionOpen(false)}
        title="Thêm buổi học"
        description="Buổi dạy bù hoặc buổi ngoài lịch. Học viên trong lớp nhận được thông báo."
        icon={<CalendarPlus />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setSessionOpen(false)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={saveSession} disabled={addSession.isPending}>
              {addSession.isPending ? 'Đang lưu…' : 'Thêm buổi'}
            </TBtn>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Input label="Ngày" type="date" required value={sessionForm.date} onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })} />
          <Input label="Bắt đầu" type="time" required value={sessionForm.start} onChange={(e) => setSessionForm({ ...sessionForm, start: e.target.value })} />
          <Input label="Kết thúc" type="time" required value={sessionForm.end} onChange={(e) => setSessionForm({ ...sessionForm, end: e.target.value })} />
          <div className="sm:col-span-3">
            <Input label="Phòng" placeholder={cls.room ?? 'Mặc định theo phòng của lớp'} value={sessionForm.room ?? ''} onChange={(e) => setSessionForm({ ...sessionForm, room: e.target.value })} />
          </div>
          <div className="sm:col-span-3">
            <Input label="Giáo án / chủ đề" value={sessionForm.topic ?? ''} onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })} />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!newsEdit}
        onClose={() => setNewsEdit(null)}
        title="Sửa thông báo"
        icon={<Megaphone />}
        footer={
          <>
            <TBtn variant="ghost" onClick={() => setNewsEdit(null)}>
              Huỷ
            </TBtn>
            <TBtn variant="primary" onClick={saveNews} disabled={updateNews.isPending}>
              {updateNews.isPending ? 'Đang lưu…' : 'Lưu'}
            </TBtn>
          </>
        }
      >
        {newsEdit && (
          <div className="space-y-4">
            <Input label="Tiêu đề" value={newsEdit.title} onChange={(e) => setNewsEdit({ ...newsEdit, title: e.target.value })} />
            <Textarea label="Nội dung" rows={5} value={newsEdit.body} onChange={(e) => setNewsEdit({ ...newsEdit, body: e.target.value })} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          confirm?.run();
          setConfirm(null);
        }}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmText={confirm?.confirmText}
        danger={confirm?.danger}
      />
    </div>
  );
};
