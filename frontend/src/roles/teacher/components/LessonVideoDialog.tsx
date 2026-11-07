import React, { useEffect, useState } from 'react';
import { Captions, Trash2, Upload, Video } from 'lucide-react';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useTeacherMutation, type LibLesson } from '@/shared/api/teacher';
import { Input, Modal } from '@/shared/components/ui';
import { embedSrc, videoSource } from '@/engines/lesson/useWatchPosition';
import { TBtn, TTabs } from './TeacherKit';

const MAX_VIDEO_MB = 500;

/** Giáo viên đăng video bài giảng cho 1 bài trong khoá: dán link Vimeo/YouTube hoặc tải tệp MP4/WebM. Học viên học trên video, bên dưới chỉ hiện ý chính (mục Tóm tắt). */
export const LessonVideoDialog: React.FC<{ lesson: (LibLesson & { no?: number }) | null; onClose: () => void }> = ({ lesson, onClose }) => {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [hasSubs, setHasSubs] = useState(false);
  const setVideo = useTeacherMutation((v: { id: string; videoUrl: string | null }) => teacherApi.setLessonVideo(v.id, v.videoUrl));
  const upload = useTeacherMutation((v: { id: string; file: File }) => teacherApi.uploadLessonVideo(v.id, v.file));
  const setSubs = useTeacherMutation((v: { id: string; text: string | null }) => teacherApi.setLessonTranscript(v.id, v.text));
  const busy = setVideo.isPending || upload.isPending || setSubs.isPending;

  useEffect(() => {
    setMode('link');
    setUrl('');
    setFile(null);
    setHasSubs(!!lesson?.hasTranscript);
  }, [lesson?.id, lesson?.hasTranscript]);

  if (!lesson) return null;
  const current = lesson.videoUrl ? videoSource(lesson.videoUrl) : null;
  const done = (msg: string) => {
    toast.success(msg, lesson.title);
    onClose();
  };
  const save = () => {
    if (mode === 'file') {
      if (!file) return toast.error('Chọn tệp video MP4 hoặc WebM');
      if (file.size > MAX_VIDEO_MB * 1048576) return toast.error(`Video tối đa ${MAX_VIDEO_MB} MB`, 'Video dài nên tải lên Vimeo/YouTube rồi dán link.');
      return upload.mutate({ id: lesson.id, file }, { onSuccess: () => done('Đã đăng video bài giảng'), onError: (e) => toast.error('Không tải lên được', errorMessage(e)) });
    }
    const v = url.trim();
    if (!/^https?:\/\/\S+$/.test(v)) return toast.error('Link chưa hợp lệ', 'Dán link Vimeo, YouTube hoặc tệp .mp4');
    setVideo.mutate({ id: lesson.id, videoUrl: v }, { onSuccess: () => done('Đã gắn video bài giảng'), onError: (e) => toast.error('Không lưu được', errorMessage(e)) });
  };
  // phụ đề lưu ngay khi chọn tệp (không cần bấm Lưu video)
  const pickSubs = async (f: File | undefined) => {
    if (!f) return;
    if (f.size > 2 * 1048576) return toast.error('Tệp phụ đề tối đa 2 MB');
    setSubs.mutate({ id: lesson.id, text: await f.text() }, { onSuccess: (r) => { setHasSubs(true); toast.success('Đã gắn phụ đề', `${r.cues} câu thoại · kiến thức mạo từ của bài lấy từ lời thoại này`); }, onError: (e) => toast.error('Không đọc được phụ đề', errorMessage(e)) });
  };
  const removeSubs = () => setSubs.mutate({ id: lesson.id, text: null }, { onSuccess: () => { setHasSubs(false); toast.success('Đã gỡ phụ đề'); }, onError: (e) => toast.error('Không gỡ được', errorMessage(e)) });
  const remove = () => setVideo.mutate({ id: lesson.id, videoUrl: null }, { onSuccess: () => done('Đã gỡ video'), onError: (e) => toast.error('Không gỡ được', errorMessage(e)) });

  return (
    <Modal
      open
      onClose={onClose}
      title={lesson.videoUrl ? 'Đổi video bài giảng' : 'Đăng video bài giảng'}
      description={`${lesson.no ? `Bài ${lesson.no} · ` : ''}${lesson.title}. Học viên học trên video, bên dưới chỉ hiện ý chính của bài.`}
      icon={<Video />}
      footer={
        <>
          {lesson.videoUrl && (
            <TBtn variant="ghost" icon={<Trash2 />} className="mr-auto" onClick={remove} disabled={busy}>
              Gỡ video
            </TBtn>
          )}
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" onClick={save} disabled={busy}>
            {busy ? 'Đang lưu…' : mode === 'file' ? 'Tải lên' : 'Lưu video'}
          </TBtn>
        </>
      }
    >
      <div className="space-y-4">
        {current && (
          <div className="overflow-hidden rounded-xl bg-black aspect-video">
            {current.kind === 'file' ? <video src={current.url} controls className="h-full w-full" /> : <iframe src={embedSrc(current, 0)} title={lesson.title} className="h-full w-full" allow="fullscreen; picture-in-picture" allowFullScreen />}
          </div>
        )}
        <TTabs value={mode} onChange={(k) => setMode(k as 'link' | 'file')} items={[{ key: 'link', label: 'Dán link video' }, { key: 'file', label: 'Tải tệp lên' }]} />
        {mode === 'link' ? (
          <Input label="Link video" placeholder="https://vimeo.com/… hoặc https://youtu.be/…" value={url} onChange={(e) => setUrl(e.target.value)} hint="Video Vimeo/YouTube để chế độ không công khai (unlisted) vẫn phát được." />
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center hover:border-indigo-400">
            <Upload className="h-5 w-5 text-slate-400" />
            <span className="text-sm font-semibold text-slate-800">{file ? file.name : 'Chọn video từ máy'}</span>
            <span className="text-[12px] text-slate-500">{file ? `${(file.size / 1048576).toFixed(1)} MB` : `MP4 hoặc WebM · tối đa ${MAX_VIDEO_MB} MB`}</span>
            <input type="file" className="sr-only" accept="video/mp4,video/webm,.mp4,.webm" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        )}
        {lesson.videoUrl && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 px-4 py-3">
            <Captions className="h-5 w-5 shrink-0 text-slate-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Phụ đề video {hasSubs && <span className="ml-1 text-[12px] font-medium text-emerald-600">· Đã có</span>}</p>
              <p className="text-[12px] text-slate-500">Tệp .srt hoặc .vtt. Lời thoại hiện dưới video, phần kiến thức mạo từ của bài lấy từ chính lời thoại này.</p>
            </div>
            {hasSubs && (
              <TBtn variant="ghost" size="sm" onClick={removeSubs} disabled={busy}>
                Gỡ
              </TBtn>
            )}
            <label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-semibold text-slate-700 hover:border-indigo-400 ${busy ? 'pointer-events-none opacity-50' : ''}`}>
              <Upload className="h-4 w-4" aria-hidden /> {hasSubs ? 'Thay phụ đề' : 'Tải phụ đề'}
              <input type="file" className="sr-only" accept=".srt,.vtt,text/vtt" onChange={(e) => { pickSubs(e.target.files?.[0]); e.target.value = ''; }} />
            </label>
          </div>
        )}
      </div>
    </Modal>
  );
};
