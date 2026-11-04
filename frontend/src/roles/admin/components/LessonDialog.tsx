import React, { useEffect, useState } from 'react';
import type { TreeLesson } from '@/shared/api/admin';
import { adminApi, useAdminInvalidate } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import { Input, Modal, Select, Switch, Textarea } from '@/shared/components/ui';
import { TBtn } from '@/roles/teacher/components/TeacherKit';
import { toast } from '@/shared/stores/uiStore';
import { Upload } from 'lucide-react';

const TYPES = [
  { value: 'VIDEO', label: 'Video bài giảng' },
  { value: 'READING', label: 'Bài đọc' },
  { value: 'QUIZ', label: 'Bài kiểm tra cuối bài' },
  { value: 'CHECKPOINT', label: 'Kiểm tra giữa khoá' },
];

type Form = { title: string; type: string; videoUrl: string; durationMin: string; summary: string; contentMd: string; isFreePreview: boolean; knowledgeText: string; transcriptText: string };
const EMPTY: Form = { title: '', type: 'VIDEO', videoUrl: '', durationMin: '10', summary: '', contentMd: '', isFreePreview: false, knowledgeText: '', transcriptText: '' };

const KNOWLEDGE_HINT = [
  '# Ngữ pháp',
  'Câu bị động | S + be + V3/ed (+ by O) | Nhấn mạnh đối tượng chịu tác động | The report was written by Anna.',
  '# Phát âm',
  'Đuôi -ed /ɪd/ | sau /t/, /d/ | Thêm một âm tiết | wanted, needed',
  '# Mẫu câu',
  'Nhờ lịch sự | Could you …? / Would you mind + V-ing? | | Could you send me the file?',
  '# Kỹ năng',
  'Nghe ý chính trước | Đọc câu hỏi, đoán chủ đề trước khi nghe | | ',
  '# Từ vựng',
  'deadline | /ˈdedlaɪn/ | n | hạn chót | We must meet the deadline.',
  '# Mệnh đề',
  'Mệnh đề quan hệ | who, which, that, whose | Bổ nghĩa cho danh từ đứng trước | The man who called you is my boss.',
  '# Mạo từ',
  'a | trước danh từ đếm được số ít bắt đầu bằng âm phụ âm',
  '  a deadline | một hạn chót | We have a deadline on Friday.',
].join('\n');

const SUBTITLE_HINT = ['1', '00:00:01,000 --> 00:00:04,200', 'Welcome back to the lesson.', 'Chào mừng các bạn quay lại bài học.', '', '2', '00:00:04,500 --> 00:00:07,000', "Today we'll look at the passive voice."].join('\n');

/** Thêm / sửa bài học trong một chương (POST/PATCH /admin/lessons). `lesson` = null → thêm mới vào `sectionId`. */
export const LessonDialog: React.FC<{ open: boolean; sectionId: string | null; lesson: TreeLesson | null; onClose: () => void }> = ({ open, sectionId, lesson, onClose }) => {
  const refresh = useAdminInvalidate();
  const [f, setF] = useState<Form>(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  const [knowledgeLoaded, setKnowledgeLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setF(lesson ? { ...EMPTY, title: lesson.title, type: lesson.type, videoUrl: lesson.videoUrl ?? '', durationMin: String(lesson.durationMin), isFreePreview: lesson.isFreePreview } : EMPTY);
    setKnowledgeLoaded(!lesson);
    if (lesson)
      adminApi
        .lessonKnowledge(lesson.id)
        .then((r) => {
          setF((x) => ({ ...x, knowledgeText: r.knowledgeText, transcriptText: r.transcriptText ?? '' }));
          setKnowledgeLoaded(true);
        })
        .catch(() => undefined);
  }, [open, lesson]);

  /** Đọc file phụ đề vào ô Script (server kiểm tra định dạng khi lưu) */
  const loadSubtitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 500_000) return toast.error('File phụ đề quá lớn', 'Tối đa 500 KB');
    set('transcriptText', await file.text());
    toast.success('Đã nạp phụ đề', `${file.name} — bấm Lưu để áp dụng`);
  };

  const save = async () => {
    if (f.title.trim().length < 1) return toast.error('Vui lòng nhập tên bài học');
    const duration = Number(f.durationMin);
    if (!Number.isInteger(duration) || duration < 1 || duration > 600) return toast.error('Thời lượng phải từ 1 đến 600 phút');
    if (f.type === 'VIDEO' && f.videoUrl && !/^https?:\/\//i.test(f.videoUrl.trim())) return toast.error('Link video phải bắt đầu bằng http(s)://');
    const body: Record<string, unknown> = {
      title: f.title.trim(),
      type: f.type,
      videoUrl: f.type === 'VIDEO' ? f.videoUrl.trim() || null : null,
      durationMin: duration,
      isFreePreview: f.isFreePreview,
      ...(f.summary.trim() ? { summary: f.summary.trim().slice(0, 300) } : {}),
      ...(f.contentMd.trim() ? { contentMd: f.contentMd.trim() } : {}),
      // chỉ gửi khi đã tải xong kiến thức cũ — tránh ghi đè rỗng
      ...(f.type === 'VIDEO' && knowledgeLoaded ? { knowledgeText: f.knowledgeText, transcriptText: f.transcriptText } : {}),
    };
    setSaving(true);
    try {
      if (lesson) await adminApi.updateLesson(lesson.id, body);
      else await adminApi.createLesson({ ...body, sectionId, status: 'PUBLISHED' });
      toast.success(lesson ? 'Đã lưu bài học' : 'Đã thêm bài học', f.title.trim());
      await refresh();
      onClose();
    } catch (e) {
      toast.error('Không lưu được', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lesson ? 'Sửa bài học' : 'Thêm bài học'}
      size="lg"
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn variant="primary" disabled={saving} onClick={() => void save()}>
            {lesson ? 'Lưu' : 'Thêm'}
          </TBtn>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Input label="Tên bài học" required value={f.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <Select label="Loại bài" options={TYPES} value={f.type} onChange={(e) => set('type', e.target.value)} />
        <Input label="Thời lượng (phút)" type="number" value={f.durationMin} onChange={(e) => set('durationMin', e.target.value)} />
        {f.type === 'VIDEO' && (
          <div className="md:col-span-2">
            <Input label="Link video" placeholder="https://vimeo.com/… hoặc https://youtu.be/…" value={f.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} />
          </div>
        )}
        <div className="md:col-span-2">
          <Input label="Mô tả ngắn" value={f.summary} onChange={(e) => set('summary', e.target.value)} hint={lesson ? 'Để trống để giữ mô tả hiện tại' : undefined} />
        </div>
        <div className="md:col-span-2">
          <Textarea label="Nội dung bài (Markdown)" rows={5} value={f.contentMd} onChange={(e) => set('contentMd', e.target.value)} hint={lesson ? 'Để trống để giữ nội dung hiện tại' : undefined} />
        </div>
        {f.type === 'VIDEO' && (
          <div className="md:col-span-2">
            <Textarea
              label="Kiến thức trong video"
              rows={8}
              className="font-mono text-xs"
              disabled={!knowledgeLoaded}
              placeholder={KNOWLEDGE_HINT}
              value={f.knowledgeText}
              onChange={(e) => set('knowledgeText', e.target.value)}
              hint="Hiện dưới video cho học viên. Mục: # Ngữ pháp, # Phát âm, # Mẫu câu, # Kỹ năng, # Từ vựng, # Mệnh đề, # Mạo từ (chỉ ghi ngữ pháp thật vào # Ngữ pháp). Các trường cách nhau dấu |. Mạo từ: thụt 2 dấu cách để thêm từ đi kèm (node con)."
            />
          </div>
        )}
        {f.type === 'VIDEO' && (
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">Script (phụ đề có mốc thời gian)</span>
              <label className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-slate-400 ${knowledgeLoaded ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}>
                <Upload className="h-3.5 w-3.5" /> Tải file .srt / .vtt
                <input type="file" accept=".srt,.vtt,text/vtt" className="sr-only" onChange={(e) => void loadSubtitle(e)} />
              </label>
            </div>
            <Textarea
              rows={8}
              className="font-mono text-xs"
              disabled={!knowledgeLoaded}
              placeholder={SUBTITLE_HINT}
              value={f.transcriptText}
              onChange={(e) => set('transcriptText', e.target.value)}
              hint="Học viên thấy script chạy theo đúng thời điểm video. Mỗi đoạn: mốc thời gian rồi câu tiếng Anh; thêm 1 dòng tiếng Việt bên dưới để có song ngữ. Để trống = không hiện script."
            />
          </div>
        )}
        <div className="md:col-span-2">
          <Switch checked={f.isFreePreview} onChange={(v) => set('isFreePreview', v)} label="Cho học thử" description="Khách chưa đăng nhập xem được bài này" />
        </div>
      </div>
    </Modal>
  );
};
