import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardPen } from 'lucide-react';
import { toast } from '@/shared/stores/uiStore';
import { errorMessage } from '@/shared/api/client';
import { teacherApi, useTeacherMutation, type LibLesson } from '@/shared/api/teacher';
import { Input, Modal, Textarea } from '@/shared/components/ui';
import { TBtn } from './TeacherKit';

/** Giáo viên xem / sửa đề kiểm tra riêng của một bài QUIZ / CHECKPOINT trong khoá (định dạng chữ giống admin) */
export const LessonTestDialog: React.FC<{ lesson: (LibLesson & { no?: number }) | null; onClose: () => void }> = ({ lesson, onClose }) => {
  const { data, isLoading, error } = useQuery({ queryKey: ['teacher', 'lesson-test', lesson?.id], queryFn: () => teacherApi.getLessonTest(lesson!.id), enabled: !!lesson, staleTime: 0 });
  const [text, setText] = useState('');
  const [pass, setPass] = useState('70');
  const save = useTeacherMutation((v: { id: string; exercisesText: string; passScorePct: number }) => teacherApi.saveLessonTest(v.id, v));

  useEffect(() => {
    if (!data) return;
    setText(data.exercisesText);
    setPass(String(data.passScorePct));
  }, [data]);

  if (!lesson) return null;
  const count = text.split(/\r?\n/).filter((l) => l.trim().startsWith('?')).length;
  const submit = () => {
    const p = Number(pass);
    if (!Number.isInteger(p) || p < 10 || p > 100) return toast.error('Điểm đạt từ 10 đến 100%');
    save.mutate(
      { id: lesson.id, exercisesText: text, passScorePct: p },
      { onSuccess: (r) => (toast.success('Đã lưu đề kiểm tra', `${r.total} câu · áp dụng cho học viên mọi lớp học khoá này`), onClose()), onError: (e) => toast.error('Chưa lưu được', errorMessage(e)) }
    );
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Đề kiểm tra"
      description={`${lesson.no ? `Bài ${lesson.no} · ` : ''}${lesson.title}. Đề riêng của bài này, không trùng bài tập trong bài học hay đề thi thử.`}
      icon={<ClipboardPen />}
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" onClick={submit} disabled={save.isPending || isLoading || !!error}>
            {save.isPending ? 'Đang lưu…' : 'Lưu đề'}
          </TBtn>
        </>
      }
    >
      {isLoading ? (
        <p className="py-8 text-center text-sm text-slate-500">Đang tải đề…</p>
      ) : error ? (
        <p className="py-8 text-center text-sm text-rose-600">{errorMessage(error)}</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <p className="flex-1 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{count + (data?.fixed ?? 0)} câu</span>
              {data?.fixed ? ` · ${count} câu sửa được, ${data.fixed} câu đề thật có ảnh / audio / đoạn văn giữ nguyên` : ''}
            </p>
            <div className="w-36">
              <Input label="Điểm đạt (%)" type="number" min={10} max={100} value={pass} onChange={(e) => setPass(e.target.value)} />
            </div>
          </div>
          <Textarea
            label="Câu hỏi"
            rows={18}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="font-mono text-[13px] leading-relaxed"
            hint={'Mỗi câu: "? yêu cầu", câu hỏi, "* đáp án đúng", "- phương án sai", "> giải thích"; câu nghe thêm dòng "@ lời máy đọc". Các câu cách nhau 1 dòng trống, vị trí đáp án đúng tự xáo.'}
          />
        </div>
      )}
    </Modal>
  );
};
