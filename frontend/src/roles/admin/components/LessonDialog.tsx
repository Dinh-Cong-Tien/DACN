import React, { useEffect, useState } from 'react';
import type { TreeLesson } from '@/shared/api/admin';
import { adminApi, useAdminInvalidate } from '@/shared/api/admin';
import { errorMessage } from '@/shared/api/client';
import { Input, Modal, Select, Switch, Textarea } from '@/shared/components/ui';
import { TBtn } from '@/roles/teacher/components/TeacherKit';
import { toast } from '@/shared/stores/uiStore';
import { appLocale } from '@/shared/i18n';
import { Upload } from 'lucide-react';

const TYPES = [
  { value: 'VIDEO', label: 'Video bài giảng' },
  { value: 'READING', label: 'Bài giảng viết' },
  { value: 'QUIZ', label: 'Bài luyện đề' },
  { value: 'CHECKPOINT', label: 'Kiểm tra chặng' },
];

type Form = { title: string; type: string; videoUrl: string; durationMin: string; summary: string; contentMd: string; isFreePreview: boolean; knowledgeText: string; transcriptText: string; exercisesText: string; passScorePct: string };
const EMPTY: Form = { title: '', type: 'VIDEO', videoUrl: '', durationMin: '10', summary: '', contentMd: '', isFreePreview: false, knowledgeText: '', transcriptText: '', exercisesText: '', passScorePct: '70' };
/** Trường tải từ máy chủ — chỉ gửi lại khi admin có sửa (tránh sinh lại bài tập / ghi đè không cần thiết) */
type Loaded = Pick<Form, 'summary' | 'contentMd' | 'knowledgeText' | 'transcriptText' | 'exercisesText' | 'passScorePct'>;

const EXERCISE_HINT = [
  '? Chọn đáp án đúng điền vào chỗ trống',
  'She _____ to school every day.',
  '* goes',
  '- go',
  '- going',
  '- gone',
  '> Chủ ngữ ngôi thứ ba số ít ở thì hiện tại đơn → động từ thêm -s/-es.',
].join('\n');

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
  'a | trước danh từ đếm được số ít bắt đầu bằng phụ âm',
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
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [fixed, setFixed] = useState(0);

  useEffect(() => {
    if (!open) return;
    setF(lesson ? { ...EMPTY, title: lesson.title, type: lesson.type, videoUrl: lesson.videoUrl ?? '', durationMin: String(lesson.durationMin), isFreePreview: lesson.isFreePreview } : EMPTY);
    setKnowledgeLoaded(!lesson);
    setLoaded(null);
    setFixed(0);
    if (lesson)
      adminApi
        .lessonKnowledge(lesson.id)
        .then((r) => {
          const l: Loaded = { summary: r.summary, contentMd: r.contentMd, knowledgeText: r.knowledgeText, transcriptText: r.transcriptText ?? '', exercisesText: r.exercisesText, passScorePct: r.passScorePct == null ? '70' : String(r.passScorePct) };
          setF((x) => ({ ...x, ...l }));
          setLoaded(l);
          setFixed(r.exercisesFixed);
          setKnowledgeLoaded(true);
        })
        .catch((e) => toast.error('Không tải được nội dung bài', errorMessage(e)));
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
    const pass = Number(f.passScorePct);
    if (!Number.isInteger(pass) || pass < 0 || pass > 100) return toast.error('Điểm cần đạt phải từ 0 đến 100%');
    if (lesson && !knowledgeLoaded) return toast.error('Nội dung bài chưa tải xong');
    // bài đang sửa: chỉ gửi trường đã đổi; bài mới: gửi trường có nhập
    const changed = (k: keyof Loaded) => (loaded ? f[k] !== loaded[k] : f[k].trim() !== '' && f[k] !== EMPTY[k]);
    const body: Record<string, unknown> = {
      title: f.title.trim(),
      type: f.type,
      videoUrl: f.type === 'VIDEO' ? f.videoUrl.trim() || null : null,
      durationMin: duration,
      isFreePreview: f.isFreePreview,
      ...(changed('summary') ? { summary: f.summary.trim().slice(0, 300) || null } : {}),
      ...(changed('contentMd') ? { contentMd: f.contentMd.trim() || null } : {}),
      ...(changed('passScorePct') ? { passScorePct: pass } : {}),
      ...(f.type !== 'QUIZ' && changed('knowledgeText') ? { knowledgeText: f.knowledgeText } : {}),
      ...(f.type === 'VIDEO' && changed('transcriptText') ? { transcriptText: f.transcriptText } : {}),
      ...(changed('exercisesText') ? { exercisesText: f.exercisesText } : {}),
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
          <Input label="Mô tả ngắn" maxLength={300} disabled={!knowledgeLoaded} value={f.summary} onChange={(e) => set('summary', e.target.value)} hint="Hiện dưới tên bài trong danh sách bài học" />
        </div>
        <div className="md:col-span-2">
          <Textarea
            label={f.type === 'READING' ? 'Bài giảng (Markdown)' : f.type === 'VIDEO' ? 'Ghi chú bài giảng (Markdown)' : 'Nội dung bài (Markdown)'}
            rows={f.type === 'READING' ? 16 : 6}
            className="font-mono text-xs"
            disabled={!knowledgeLoaded}
            value={f.contentMd}
            onChange={(e) => set('contentMd', e.target.value)}
            hint={`${f.type === 'VIDEO' ? 'Học viên chỉ thấy mục "## Tóm tắt" (ý chính) dưới video — giữ mục này ngắn gọn.' : 'Học viên chỉ thấy mục "## Tóm tắt" (ý chính) dưới khung video.'} Dùng ## tiêu đề mục, ### tiêu đề nhỏ, **in đậm**, *nghiêng*, danh sách "- ", bảng | a | b |, trích dẫn "> ".${f.contentMd.trim() ? ` Hiện ${f.contentMd.trim().split(/\s+/).length.toLocaleString(appLocale())} từ.` : ''}`}
          />
        </div>
        {f.type !== 'QUIZ' && (
          <div className="md:col-span-2">
            <Textarea
              label={f.type === 'VIDEO' ? 'Kiến thức trong video' : 'Kiến thức của bài'}
              rows={8}
              className="font-mono text-xs"
              disabled={!knowledgeLoaded}
              placeholder={KNOWLEDGE_HINT}
              value={f.knowledgeText}
              onChange={(e) => set('knowledgeText', e.target.value)}
              hint="Hiện ở tab Kiến thức cho học viên; đổi kiến thức thì câu bài tập tự sinh được tạo lại (câu soạn tay giữ nguyên). Mục: # Ngữ pháp, # Phát âm, # Mẫu câu, # Kỹ năng, # Từ vựng, # Mệnh đề, # Mạo từ (chỉ ghi ngữ pháp thật vào # Ngữ pháp). Các trường cách nhau dấu |. Mạo từ: thụt 2 dấu cách để thêm từ đi kèm (node con)."
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
        <div className="md:col-span-2 space-y-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <span className="text-sm font-semibold text-slate-700">Bài tập sau bài</span>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              Điểm cần đạt để qua bài
              <input type="number" min={0} max={100} value={f.passScorePct} disabled={!knowledgeLoaded} onChange={(e) => set('passScorePct', e.target.value)} className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm tabular-nums" />%
            </label>
          </div>
          <Textarea
            rows={12}
            className="font-mono text-xs"
            disabled={!knowledgeLoaded}
            placeholder={EXERCISE_HINT}
            value={f.exercisesText}
            onChange={(e) => set('exercisesText', e.target.value)}
            hint={`Mỗi câu: "? yêu cầu", câu hỏi, "* đáp án đúng", "- phương án sai", "> giải thích". Vị trí đáp án đúng được xáo tự động.${fixed ? ` Ngoài ra bài có ${fixed} câu giữ nguyên (câu đề thật có ảnh / audio / đoạn văn hoặc câu tự sinh từ Kiến thức).` : ''}`}
          />
        </div>
        <div className="md:col-span-2">
          <Switch checked={f.isFreePreview} onChange={(v) => set('isFreePreview', v)} label="Cho học thử" description="Khách chưa đăng nhập xem được bài này" />
        </div>
      </div>
    </Modal>
  );
};
