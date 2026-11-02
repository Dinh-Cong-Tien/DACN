import React, { useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileUp, ImageIcon, Loader2, Music2, Upload } from 'lucide-react';
import { Modal } from '@/shared/components/ui';
import { TBtn, TTabs, inputCls } from '@/roles/teacher/components/TeacherKit';
import { cn } from '@/shared/utils';
import { errorMessage } from '@/shared/api/client';
import { toast } from '@/shared/stores/uiStore';
import { importApi, type ImportGroup, type ImportPreview, type ImportQuestion, type ImportResult, type ImportStatus, type PartNo } from '@/shared/api/import';

const PARTS: PartNo[] = [1, 2, 3, 4, 5, 6, 7];
const PART_NAME: Record<PartNo, string> = { 1: 'Mô tả tranh', 2: 'Hỏi đáp', 3: 'Hội thoại', 4: 'Bài nói ngắn', 5: 'Hoàn thành câu', 6: 'Hoàn thành đoạn văn', 7: 'Đọc hiểu' };
const STATUS_OPTS: { value: ImportStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'PENDING_REVIEW', label: 'Gửi duyệt' },
  { value: 'PUBLISHED', label: 'Xuất bản ngay' },
];
const ANSWER_SRC: Record<string, string> = { INLINE: 'ghi trong câu', KEY_TABLE: 'bảng đáp án', FORMAT: 'in đậm / gạch chân' };
const MODE_TEXT: Record<ImportPreview['partMode'], string> = {
  HEADING: 'Chia Part theo tiêu đề PART trong file',
  NUMBER: 'Chia Part theo số câu chuẩn TOEIC',
  GUESS: 'Part được suy đoán theo cấu trúc câu — hãy kiểm tra từng tab',
};

/** Cảnh báo tính lại sau khi người dùng chỉnh (đáp án, Part, audio) */
function liveWarnings(q: ImportQuestion, group: ImportGroup | undefined): string[] {
  const w: string[] = [];
  const need = q.part === 2 ? 3 : 4;
  if (q.options.length !== need) w.push(`Có ${q.options.length} phương án (Part ${q.part} cần ${need})`);
  if (!q.correctAnswer) w.push('Chưa có đáp án');
  if (q.part <= 4 && !(q.audioUrl || group?.audioUrl)) w.push('Chưa gắn audio');
  if (q.part === 1 && !q.imageUrls.length) w.push('Part 1 chưa có ảnh');
  if ((q.part === 6 || q.part === 7) && !q.groupRef) w.push('Thiếu đoạn văn');
  if (q.partSource === 'GUESS') w.push('Part suy đoán');
  return w;
}

const AudioPick: React.FC<{ url?: string | null; onChange: (url: string | null) => void; label: string }> = ({ url, onChange, label }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const pick = async (f?: File) => {
    if (!f) return;
    setBusy(true);
    try {
      onChange((await importApi.uploadAudio(f)).url);
    } catch (e) {
      toast.error('Không tải được audio', errorMessage(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input ref={ref} type="file" accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,.mp3,.m4a,.wav,.ogg" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {url ? (
        <>
          <audio src={url} controls className="h-8 max-w-[260px]" />
          <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-500 hover:text-rose-600">
            Bỏ audio
          </button>
        </>
      ) : (
        <TBtn size="sm" icon={busy ? <Loader2 className="animate-spin" /> : <Music2 />} onClick={() => ref.current?.click()} disabled={busy}>
          {label}
        </TBtn>
      )}
    </div>
  );
};

const QuestionCard: React.FC<{
  q: ImportQuestion;
  group?: ImportGroup;
  onChange: (patch: Partial<ImportQuestion>) => void;
  onMove: (part: PartNo) => void;
}> = ({ q, group, onChange, onMove }) => {
  const warns = liveWarnings(q, group);
  const bad = warns.some((w) => !/audio|suy đoán|ảnh/.test(w));
  return (
    <li className={cn('rounded-xl border bg-white p-3.5', bad ? 'border-rose-300 bg-rose-50/40' : warns.length ? 'border-amber-200' : 'border-slate-200')}>
      <div className="flex flex-wrap items-start gap-2">
        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-xs font-bold tabular-nums text-white">{q.questionNo}</span>
        <p className="min-w-0 flex-1 whitespace-pre-line text-sm text-slate-800">{q.stem || <span className="italic text-slate-400">(không có đề — câu nghe)</span>}</p>
        <label className="flex items-center gap-1 text-xs text-slate-500">
          Part
          <select value={q.part} onChange={(e) => onMove(Number(e.target.value) as PartNo)} className="h-7 rounded-md border border-slate-200 bg-white px-1 text-xs text-slate-800">
            {PARTS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
      </div>
      {q.imageUrls.length > 0 && (
        <div className="mt-2 flex gap-2">
          {q.imageUrls.map((u) => (
            <img key={u} src={u} alt={`Ảnh câu ${q.questionNo}`} className="h-16 rounded-md border border-slate-200 object-cover" />
          ))}
        </div>
      )}
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {q.options.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange({ correctAnswer: o.key })}
            title="Bấm để chọn làm đáp án đúng"
            className={cn('flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[13px] transition-colors', q.correctAnswer === o.key ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-slate-200 hover:border-slate-300')}
          >
            <span className={cn('font-bold', q.correctAnswer === o.key ? 'text-emerald-700' : 'text-slate-500')}>{o.key}</span>
            <span className="min-w-0 break-words">{o.text || '—'}</span>
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
        {q.correctAnswer ? (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Đáp án {q.correctAnswer}
            {q.answerSource ? ` · ${ANSWER_SRC[q.answerSource]}` : ' · chọn tay'}
          </span>
        ) : null}
        {warns.map((w) => (
          <span key={w} className={cn('inline-flex items-center gap-1', /audio|suy đoán|ảnh/.test(w) ? 'text-amber-700' : 'text-rose-600')}>
            <AlertTriangle className="h-3.5 w-3.5" /> {w}
          </span>
        ))}
      </div>
      {q.explanation && <p className="mt-1.5 whitespace-pre-line rounded-md bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">Giải thích: {q.explanation}</p>}
      {(q.part === 1 || q.part === 2) && !q.groupRef && (
        <div className="mt-2">
          <AudioPick url={q.audioUrl} onChange={(audioUrl) => onChange({ audioUrl })} label="Gắn audio câu này" />
        </div>
      )}
    </li>
  );
};

/**
 * Nhập đề TOEIC từ file Word: tải file → xem trước chia Part 1–7 → chỉnh đáp án/Part, gắn audio → lưu vào ngân hàng câu hỏi.
 * Giáo viên luôn lưu Nháp (gửi duyệt ở "Học liệu của tôi"); trưởng bộ môn / admin chọn trạng thái.
 */
export const WordImportDialog: React.FC<{ open: boolean; onClose: () => void; canChooseStatus: boolean; onDone?: (r: ImportResult) => void }> = ({ open, onClose, canChooseStatus, onDone }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState<'upload' | 'save' | null>(null);
  const [drag, setDrag] = useState(false);
  const [data, setData] = useState<ImportPreview | null>(null);
  const [tab, setTab] = useState<string>('1');
  const [status, setStatus] = useState<ImportStatus>('DRAFT');
  const [makeTest, setMakeTest] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [onlyIssues, setOnlyIssues] = useState(false);

  const reset = () => {
    setData(null);
    setFileName('');
    setTab('1');
    setMakeTest(false);
    setTestTitle('');
    setOnlyIssues(false);
  };
  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const upload = async (f?: File) => {
    if (!f) return;
    if (!/\.docx$/i.test(f.name)) {
      toast.error('Chỉ nhận file Word .docx', 'File .doc cũ: mở bằng Word rồi lưu lại thành .docx.');
      return;
    }
    setBusy('upload');
    setFileName(f.name);
    try {
      const d = await importApi.preview(f);
      setData(d);
      const first = d.parts.find((p) => p.count)?.part ?? 1;
      setTab(String(first));
      setTestTitle(f.name.replace(/\.docx$/i, ''));
      if (!d.total) toast.error('Không tìm thấy câu hỏi', 'Kiểm tra lại định dạng theo file mẫu.');
    } catch (e) {
      toast.error('Không đọc được file', errorMessage(e));
      setFileName('');
    } finally {
      setBusy(null);
    }
  };

  const groupMap = useMemo(() => new Map((data?.groups ?? []).map((g) => [g.ref, g])), [data]);
  const counts = useMemo(() => Object.fromEntries(PARTS.map((p) => [p, (data?.questions ?? []).filter((q) => q.part === p).length])) as Record<PartNo, number>, [data]);
  const issues = useMemo(() => (data?.questions ?? []).filter((q) => liveWarnings(q, q.groupRef ? groupMap.get(q.groupRef) : undefined).some((w) => !/audio|suy đoán|ảnh/.test(w))), [data, groupMap]);

  const patchQ = (ref: string, patch: Partial<ImportQuestion>) => setData((d) => (d ? { ...d, questions: d.questions.map((q) => (q.ref === ref ? { ...q, ...patch } : q)) } : d));
  const patchG = (ref: string, patch: Partial<ImportGroup>) => setData((d) => (d ? { ...d, groups: d.groups.map((g) => (g.ref === ref ? { ...g, ...patch } : g)) } : d));
  /** Đổi Part: câu trong nhóm thì chuyển cả nhóm (nhóm luôn cùng một Part) */
  const move = (q: ImportQuestion, part: PartNo) =>
    setData((d) => {
      if (!d) return d;
      if (!q.groupRef) return { ...d, questions: d.questions.map((x) => (x.ref === q.ref ? { ...x, part, partSource: 'HEADING' } : x)) };
      return {
        ...d,
        groups: d.groups.map((g) => (g.ref === q.groupRef ? { ...g, part } : g)),
        questions: d.questions.map((x) => (x.groupRef === q.groupRef ? { ...x, part, partSource: 'HEADING' } : x)),
      };
    });

  const save = async () => {
    if (!data) return;
    // Nháp cho phép thiếu đáp án; gửi duyệt / xuất bản phải đủ phương án và đáp án
    if (canChooseStatus && status !== 'DRAFT' && issues.length) {
      toast.error(`Còn ${issues.length} câu cần sửa`, 'Gửi duyệt / xuất bản cần đủ phương án và đáp án. Lưu Nháp nếu muốn sửa sau.');
      return;
    }
    if (makeTest && testTitle.trim().length < 3) {
      toast.error('Nhập tên đề thi (tối thiểu 3 ký tự)');
      return;
    }
    setBusy('save');
    try {
      const r = await importApi.confirm({ status: canChooseStatus ? status : 'DRAFT', groups: data.groups, questions: data.questions, createTest: makeTest ? { title: testTitle.trim(), isFree: true } : null });
      toast.success(`Đã nhập ${r.created} câu hỏi`, `${r.passages} đoạn văn / nhóm câu${r.test ? ` · đề "${r.test.title}"` : ''} · trạng thái ${STATUS_OPTS.find((s) => s.value === r.status)?.label ?? r.status}`);
      onDone?.(r);
      reset();
      onClose();
    } catch (e) {
      toast.error('Chưa lưu được', errorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const part = Number(tab) as PartNo;
  const list = (data?.questions ?? []).filter((q) => q.part === part).filter((q) => !onlyIssues || issues.includes(q));
  const listGroups = [...new Set(list.map((q) => q.groupRef).filter(Boolean))] as string[];

  return (
    <Modal
      open={open}
      onClose={close}
      title="Nhập đề từ file Word"
      description={data ? `${fileName} · ${data.total} câu · ${MODE_TEXT[data.partMode]}` : 'Tải file .docx — hệ thống tự chia câu hỏi vào Part 1–7'}
      size="xl"
      footer={
        data ? (
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={makeTest} onChange={(e) => setMakeTest(e.target.checked)} className="h-4 w-4 accent-indigo-600" />
                Tạo đề thi từ file này
              </label>
              {makeTest && <input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} placeholder="Tên đề thi" className={cn(inputCls, 'h-9 w-56')} />}
              {canChooseStatus ? (
                <select value={status} onChange={(e) => setStatus(e.target.value as ImportStatus)} className={cn(inputCls, 'h-9')} aria-label="Trạng thái sau khi nhập">
                  {STATUS_OPTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-slate-500">Lưu ở trạng thái Nháp — gửi duyệt trong "Học liệu của tôi"</span>
              )}
            </div>
            <div className="flex gap-2">
              <TBtn variant="ghost" onClick={reset} disabled={!!busy}>
                Chọn file khác
              </TBtn>
              <TBtn variant="primary" onClick={save} disabled={!!busy || !data.total} icon={busy === 'save' ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}>
                Lưu {data.total} câu
              </TBtn>
            </div>
          </div>
        ) : undefined
      }
    >
      {!data ? (
        <div className="space-y-4">
          <input ref={fileRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              upload(e.dataTransfer.files?.[0]);
            }}
            disabled={!!busy}
            className={cn('flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors', drag ? 'border-indigo-400 bg-indigo-50/60' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')}
          >
            {busy === 'upload' ? <Loader2 className="h-8 w-8 animate-spin text-indigo-600" /> : <FileUp className="h-8 w-8 text-indigo-600" />}
            <span className="font-display text-base font-bold text-slate-900">{busy === 'upload' ? `Đang đọc ${fileName}…` : 'Kéo thả file Word vào đây hoặc bấm để chọn'}</span>
            <span className="text-sm text-slate-500">Chỉ nhận .docx, tối đa 20 MB · ảnh trong file (Part 1, biểu đồ) được giữ lại</span>
          </button>
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-[13px] leading-relaxed text-slate-600">
            <p className="mb-1.5 font-semibold text-slate-800">Định dạng hệ thống nhận ra</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Mỗi phần bắt đầu bằng dòng <b>PART 1</b> … <b>PART 7</b>. Không có dòng PART thì chia theo số câu chuẩn TOEIC (1–6, 7–31, 32–70, 71–100, 101–130, 131–146, 147–200).</li>
              <li>Mỗi câu bắt đầu bằng số câu: <b>101.</b> hoặc <b>Câu 101:</b>. Phương án <b>(A) …</b> hoặc <b>A. …</b>, có thể nhiều phương án trên một dòng.</li>
              <li>Nhóm câu dùng chung hội thoại / đoạn văn: dòng <b>Questions 131-134 refer to the following …</b>, đoạn văn viết ngay dưới.</li>
              <li>Đáp án: <b>Đáp án: B</b> dưới câu, hoặc in đậm / gạch chân phương án đúng, hoặc bảng đáp án cuối file sau dòng <b>ĐÁP ÁN</b>.</li>
              <li>Audio Part 1–4 không có trong Word — gắn ở bước xem trước hoặc sau khi lưu.</li>
            </ul>
            <a href={importApi.templateUrl} className="mt-3 inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700" download>
              <Download className="h-4 w-4" /> Tải file mẫu .docx
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tổng quan từng Part */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {PARTS.map((p) => {
              const c = counts[p];
              const std = data.parts.find((x) => x.part === p)?.expected ?? 0;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setTab(String(p))}
                  className={cn('rounded-xl border px-2 py-2 text-left transition-colors', tab === String(p) ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:bg-slate-50', !c && 'opacity-60')}
                >
                  <span className="block text-[11px] font-semibold text-slate-500">Part {p}</span>
                  <span className="font-display text-lg font-extrabold tabular-nums text-slate-900">{c}</span>
                  <span className="block text-[10px] text-slate-400">chuẩn {std}</span>
                </button>
              );
            })}
          </div>
          {(data.warnings.length > 0 || issues.length > 0) && (
            <div className="space-y-1 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5 text-[13px] text-amber-900">
              {data.warnings.map((w) => (
                <p key={w} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
                </p>
              ))}
              {issues.length > 0 && (
                <p className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {issues.length} câu thiếu đáp án hoặc sai số phương án — bấm vào phương án để chọn đáp án.
                </p>
              )}
            </div>
          )}
          <div className="flex flex-wrap items-end justify-between gap-2">
            <TTabs value={tab} onChange={setTab} items={PARTS.map((p) => ({ key: String(p), label: `Part ${p}`, count: counts[p] }))} className="min-w-0 flex-1" />
            <label className="flex items-center gap-2 pb-2 text-xs text-slate-600">
              <input type="checkbox" checked={onlyIssues} onChange={(e) => setOnlyIssues(e.target.checked)} className="h-3.5 w-3.5 accent-rose-600" />
              Chỉ câu cần sửa
            </label>
          </div>
          <p className="text-[13px] text-slate-500">
            Part {part} — {PART_NAME[part]}
          </p>
          {!list.length ? (
            <p className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-500">{onlyIssues ? 'Không có câu cần sửa ở Part này.' : 'File không có câu nào thuộc Part này.'}</p>
          ) : (
            <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">
              {/* Câu lẻ */}
              <ul className="space-y-2.5">
                {list
                  .filter((q) => !q.groupRef)
                  .map((q) => (
                    <QuestionCard key={q.ref} q={q} onChange={(p) => patchQ(q.ref, p)} onMove={(p) => move(q, p)} />
                  ))}
              </ul>
              {/* Nhóm câu (Part 3, 4, 6, 7) */}
              {listGroups.map((ref) => {
                const g = groupMap.get(ref)!;
                return (
                  <section key={ref} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
                    <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800">{g.title}</p>
                      {g.part <= 4 && <AudioPick url={g.audioUrl} onChange={(audioUrl) => patchG(ref, { audioUrl })} label="Gắn audio nhóm" />}
                    </header>
                    {g.imageUrls.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {g.imageUrls.map((u) => (
                          <img key={u} src={u} alt="Hình của nhóm câu" className="h-20 rounded-md border border-slate-200 object-cover" />
                        ))}
                      </div>
                    )}
                    {g.content ? (
                      <p className="mb-2 max-h-40 overflow-y-auto whitespace-pre-line rounded-lg bg-white px-3 py-2 text-[13px] text-slate-700">{g.content}</p>
                    ) : g.part >= 6 ? (
                      <p className="mb-2 flex items-center gap-1.5 text-xs text-rose-600">
                        <ImageIcon className="h-3.5 w-3.5" /> Nhóm chưa có đoạn văn
                      </p>
                    ) : null}
                    <ul className="space-y-2.5">
                      {list
                        .filter((q) => q.groupRef === ref)
                        .map((q) => (
                          <QuestionCard key={q.ref} q={q} group={g} onChange={(p) => patchQ(q.ref, p)} onMove={(p) => move(q, p)} />
                        ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

/** Nút mở hộp thoại nhập đề (dùng ở trang ngân hàng câu hỏi của GV / TBM / admin) */
export const WordImportButton: React.FC<{ canChooseStatus: boolean; onDone?: (r: ImportResult) => void; label?: string }> = ({ canChooseStatus, onDone, label = 'Nhập đề từ Word' }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TBtn variant="primary" icon={<Upload />} onClick={() => setOpen(true)}>
        {label}
      </TBtn>
      <WordImportDialog open={open} onClose={() => setOpen(false)} canChooseStatus={canChooseStatus} onDone={onDone} />
    </>
  );
};

