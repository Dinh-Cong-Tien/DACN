import React, { useEffect, useState } from 'react';
import { Trash2, Upload, Video } from 'lucide-react';
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
  const setVideo = useTeacherMutation((v: { id: string; videoUrl: string | null }) => teacherApi.setLessonVideo(v.id, v.videoUrl));
  const upload = useTeacherMutation((v: { id: string; file: File }) => teacherApi.uploadLessonVideo(v.id, v.file));
  const busy = setVideo.isPending || upload.isPending;

  useEffect(() => {
    setMode('link');
    setUrl('');
    setFile(null);
  }, [lesson?.id]);

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
      </div>
    </Modal>
  );
};
