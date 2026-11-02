import React, { useEffect, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { useTeacherClasses, useTeacherLibrary, type AssignmentInput, type LibPrompt } from '@/shared/api/teacher';
import { OUTSIDE_PARTS, PART_FORMAT, describeTarget, partName, promptName } from '@/shared/constants/teacher';
import type { AssignmentTarget, AssignmentType } from '@/shared/types';
import { assignmentHref, cn } from '@/shared/utils';
import { Modal } from '@/shared/components/ui';
import { TBtn, TTabs, inputCls } from './TeacherKit';

export type AssignKind = AssignmentTarget['kind'];

const KINDS: { key: AssignKind; label: string }[] = [
  { key: 'EXAM', label: 'Đề thi thử' },
  { key: 'LESSON', label: 'Bài giảng' },
  { key: 'GRAMMAR', label: 'Ngữ pháp' },
  { key: 'VOCAB', label: 'Từ vựng' },
  { key: 'WRITING', label: 'Đề Viết' },
  { key: 'SPEAKING', label: 'Đề Nói' },
];

const TIMES = [10, 15, 20, 30, 45, 60, 90, 120];

const fieldCls = cn(inputCls, 'w-full');
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="mb-1.5 block text-[13px] font-medium text-slate-700">{children}</span>;

/** Mặc định hạn nộp: 7 ngày sau, 23:59 */
const defaultDue = () => {
  const d = new Date(Date.now() + 7 * 86400000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T23:59`;
};

/**
 * Giao bài cho một lớp. Nội dung chọn từ đúng kho học viên đang dùng (đề thi thử, khoá học, ngữ pháp, từ vựng, đề Viết / Nói),
 * nên học viên bấm vào bài được giao là mở đúng trang làm bài với cấu hình giáo viên đặt.
 */
export const AssignDialog: React.FC<{ open: boolean; onClose: () => void; onSave: (a: AssignmentInput) => void; saving?: boolean; initial?: { classId?: string; target?: AssignmentTarget } }> = ({ open, onClose, onSave, saving, initial }) => {
  const classes = useTeacherClasses().data ?? [];
  const lib = useTeacherLibrary();
  const [classId, setClassId] = useState('');
  const [kind, setKind] = useState<AssignKind>('EXAM');
  const cls = classes.find((c) => c.id === classId) ?? classes[0];
  const exam = cls?.examType ?? 'TOEIC';
  const tests = lib.tests.filter((t) => t.examType === exam);
  const [testId, setTestId] = useState('');
  const [parts, setParts] = useState<string[]>([]);
  const [time, setTime] = useState<'auto' | 'none' | number>('auto');
  const [courseId, setCourseId] = useState('');
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [slug, setSlug] = useState('');
  const [topicId, setTopicId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [partId, setPartId] = useState('');
  const [promptQ, setPromptQ] = useState('');
  const [title, setTitle] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);
  const [due, setDue] = useState(defaultDue());
  const [note, setNote] = useState('');

  // Mở hộp thoại: nạp lớp / nội dung truyền vào (từ trang Học liệu hoặc trang lớp)
  useEffect(() => {
    if (!open) return;
    const t = initial?.target;
    const testOfTarget = t?.kind === 'EXAM' ? lib.tests.find((m) => m.id === t.testId || m.slug === t.testId) : undefined;
    const c = classes.find((x) => x.id === initial?.classId) ?? (testOfTarget ? classes.find((x) => x.examType === testOfTarget.examType) : undefined) ?? classes[0];
    setClassId(c?.id ?? '');
    setKind(t?.kind ?? 'EXAM');
    setTestId(testOfTarget?.id ?? '');
    if (t?.kind === 'LESSON') {
      setCourseId(lib.courses.find((x) => x.id === t.courseId || x.slug === t.courseId)?.id ?? '');
      setLessonIds(t.lessonIds);
    } else setLessonIds([]);
    setSlug(t?.kind === 'GRAMMAR' ? t.slug : '');
    setTopicId(t?.kind === 'VOCAB' ? lib.vocab.find((v) => v.id === t.topicId || v.slug === t.topicId)?.id ?? '' : '');
    setTaskId(t?.kind === 'WRITING' ? t.taskId : '');
    setPartId(t?.kind === 'SPEAKING' ? t.partId : '');
    setPromptQ('');
    setTime('auto');
    setTitleEdited(false);
    setDue(defaultDue());
    setNote('');
  }, [open, initial, classes.length, lib.isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const test = tests.find((t) => t.id === testId) ?? tests[0];
  const testParts = useMemo(() => (test?.parts ?? []).filter((p) => !OUTSIDE_PARTS.includes(p.id)), [test]);
  useEffect(() => setParts(testParts.map((p) => p.id)), [test?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const allParts = testParts.length > 0 && parts.length === testParts.length;
  const suggested = testParts.filter((p) => parts.includes(p.id)).reduce((a, p) => a + (PART_FORMAT[p.id]?.minutes ?? Math.ceil(p.questions / 2)), 0);
  const full = allParts && time === 'auto';
  const course = lib.courses.find((c) => c.id === courseId) ?? lib.courses[0];
  const lessons = useMemo(() => course?.sections.flatMap((s) => s.lessons) ?? [], [course]);
  const grammar = lib.grammar.find((g) => g.slug === slug) ?? lib.grammar[0];
  const vocab = lib.vocab.find((v) => v.id === topicId) ?? lib.vocab.find((v) => !v.examType || v.examType === exam) ?? lib.vocab[0];
  const prompts: LibPrompt[] = (kind === 'WRITING' ? lib.writing : lib.speaking).filter((p) => p.examType === exam);
  const shownPrompts = prompts.filter((p) => !promptQ.trim() || p.prompt.toLowerCase().includes(promptQ.trim().toLowerCase())).slice(0, 60);
  const writing = lib.writing.find((w) => w.id === taskId) ?? lib.writing.find((w) => w.examType === exam);
  const speaking = lib.speaking.find((w) => w.id === partId) ?? lib.speaking.find((w) => w.examType === exam);

  const target: AssignmentTarget | null = useMemo(() => {
    switch (kind) {
      case 'EXAM':
        if (!test || !parts.length) return null;
        return {
          kind,
          testId: test.slug,
          setup: full ? { mode: 'FULL', parts: test.parts.map((p) => p.id), minutes: test.durationMin } : { mode: 'PRACTICE', parts: testParts.filter((p) => parts.includes(p.id)).map((p) => p.id), minutes: time === 'none' ? null : time === 'auto' ? suggested : time },
        };
      case 'LESSON':
        return course && lessonIds.length ? { kind, courseId: course.slug, lessonIds: lessons.filter((l) => lessonIds.includes(l.id)).map((l) => l.id) } : null;
      case 'GRAMMAR':
        return grammar ? { kind, slug: grammar.slug } : null;
      case 'VOCAB':
        return vocab ? { kind, topicId: vocab.slug } : null;
      case 'WRITING':
        return writing ? { kind, taskId: writing.id } : null;
      case 'SPEAKING':
        return speaking ? { kind, partId: speaking.id } : null;
    }
  }, [kind, parts, test, full, testParts, time, suggested, lessonIds, course, lessons, grammar, vocab, writing, speaking]);

  const type: AssignmentType = kind === 'EXAM' ? (full ? 'MOCK_TEST' : 'PRACTICE') : kind === 'WRITING' ? 'ESSAY' : kind;

  // Tiêu đề gợi ý theo nội dung, tới khi giáo viên tự sửa
  const autoTitle = useMemo(() => {
    if (!target) return '';
    switch (target.kind) {
      case 'EXAM': {
        if (!test) return '';
        if (full) return test.title;
        const picked = testParts.filter((p) => parts.includes(p.id));
        return `${test.title} · ${test.examType === 'TOEIC' ? `Part ${picked.map((p) => partName(p.id).replace('Part ', '')).join(', ')}` : picked.map((p) => PART_FORMAT[p.id]?.nameVi ?? p.title).join(', ')}`;
      }
      case 'LESSON': {
        const nums = target.lessonIds.map((id) => lessons.findIndex((l) => l.id === id) + 1);
        return `${course?.title ?? ''} — Bài ${nums.join(', ')}`;
      }
      case 'GRAMMAR':
        return `Ngữ pháp — ${grammar?.title ?? ''}`;
      case 'VOCAB':
        return `Từ vựng — ${vocab?.name ?? ''}`;
      case 'WRITING':
        return writing ? `Writing · ${promptName(writing, 'WRITING')}` : 'Writing';
      case 'SPEAKING':
        return speaking ? `Speaking · ${promptName(speaking, 'SPEAKING')}` : 'Speaking';
    }
  }, [target, full, test, testParts, parts, lessons, course, grammar, vocab, writing, speaking]);
  useEffect(() => {
    if (!titleEdited) setTitle(autoTitle);
  }, [autoTitle, titleEdited]);

  const save = (status: 'DRAFT' | 'OPEN') => {
    if (!target || !title.trim() || !cls) return;
    onSave({ classId: cls.id, title: title.trim(), type, target, status, dueDate: due ? new Date(due).toISOString() : null, note: note.trim() || null });
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const canSave = !!target && !!title.trim() && !!cls && !saving;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="Giao bài tập"
      description="Học viên trong lớp nhận thông báo và mở đúng bài theo cấu hình bên dưới."
      footer={
        <>
          <TBtn variant="ghost" onClick={onClose}>
            Huỷ
          </TBtn>
          <TBtn disabled={!canSave} onClick={() => save('DRAFT')}>
            Lưu nháp
          </TBtn>
          <TBtn variant="primary" disabled={!canSave} onClick={() => save('OPEN')}>
            {saving ? 'Đang giao…' : 'Giao bài'}
          </TBtn>
        </>
      }
    >
      {!classes.length ? (
        <p className="py-6 text-center text-sm text-slate-500">Bạn chưa có lớp nào để giao bài. Tạo lớp ở mục Lớp học trước.</p>
      ) : lib.isLoading ? (
        <p className="py-6 text-center text-sm text-slate-500">Đang tải kho học liệu…</p>
      ) : (
        <div className="space-y-5">
          <label className="block">
            <Label>Lớp</Label>
            <select value={cls?.id ?? ''} onChange={(e) => setClassId(e.target.value)} className={fieldCls}>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.examType} · {c.studentsCount} học viên
                </option>
              ))}
            </select>
          </label>

          <div>
            <Label>Nội dung</Label>
            <TTabs items={KINDS} value={kind} onChange={(k) => setKind(k as AssignKind)} />
          </div>

          {kind === 'EXAM' &&
            (!test ? (
              <p className="text-sm text-slate-500">Chưa có đề thi {exam} nào được xuất bản.</p>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <Label>Đề thi ({exam})</Label>
                  <select value={test.id} onChange={(e) => setTestId(e.target.value)} className={fieldCls}>
                    {tests.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} · {t.totalQuestions} câu · {t.durationMin} phút
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[13px] font-medium text-slate-700">Phần thi</span>
                      {testParts.length > 1 && (
                        <button type="button" onClick={() => setParts(allParts ? [] : testParts.map((p) => p.id))} className="text-[13px] text-indigo-700 hover:underline">
                          {allParts ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
                      {testParts.map((p) => {
                        const on = parts.includes(p.id);
                        return (
                          <button key={p.id} type="button" role="checkbox" aria-checked={on} onClick={() => setParts(toggle(parts, p.id))} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-slate-50">
                            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white')}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                            <span className="flex-1 text-slate-800">
                              {partName(p.id)} <span className="text-slate-500">· {PART_FORMAT[p.id]?.nameVi ?? p.title}</span>
                            </span>
                            <span className="tabular-nums text-[12px] text-slate-500">{p.questions} câu</span>
                          </button>
                        );
                      })}
                    </div>
                    {test.examType === 'VSTEP' && test.parts.some((p) => OUTSIDE_PARTS.includes(p.id)) && <p className="mt-1.5 text-[12px] text-slate-500">Viết và Nói giao riêng ở mục Đề Viết / Đề Nói để giáo viên chấm.</p>}
                  </div>
                  <label className="block">
                    <Label>Thời gian làm bài</Label>
                    <select value={String(time)} onChange={(e) => setTime(e.target.value === 'auto' || e.target.value === 'none' ? e.target.value : Number(e.target.value))} className={fieldCls}>
                      <option value="auto">{allParts ? `Như thi thật (${test.durationMin} phút)` : `Theo gợi ý (${suggested} phút)`}</option>
                      <option value="none">Không giới hạn</option>
                      {TIMES.map((m) => (
                        <option key={m} value={m}>
                          {m} phút
                        </option>
                      ))}
                    </select>
                    <span className="mt-1.5 block text-[12px] text-slate-500">{full ? 'Làm full test, có quy đổi điểm.' : 'Luyện tập, tính theo số câu đúng.'}</span>
                  </label>
                </div>
              </div>
            ))}

          {kind === 'LESSON' && course && (
            <div className="space-y-4">
              <label className="block">
                <Label>Khoá học</Label>
                <select
                  value={course.id}
                  onChange={(e) => {
                    setCourseId(e.target.value);
                    setLessonIds([]);
                  }}
                  className={fieldCls}
                >
                  {lib.courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} · {c.lessonsCount} bài
                    </option>
                  ))}
                </select>
              </label>
              <div>
                <Label>Chọn bài ({lessonIds.length} đã chọn)</Label>
                <div className="max-h-64 overflow-y-auto rounded-md border border-slate-200">
                  {course.sections.map((sec) => (
                    <div key={sec.id}>
                      <p className="sticky top-0 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-500">{sec.title}</p>
                      {sec.lessons.map((l) => {
                        const on = lessonIds.includes(l.id);
                        return (
                          <button key={l.id} type="button" role="checkbox" aria-checked={on} onClick={() => setLessonIds(toggle(lessonIds, l.id))} className="flex w-full items-center gap-3 px-3 py-1.5 text-left text-sm hover:bg-slate-50">
                            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white')}>{on && <Check className="h-3 w-3" strokeWidth={3} />}</span>
                            <span className="w-12 shrink-0 tabular-nums text-[12px] text-slate-400">Bài {lessons.indexOf(l) + 1}</span>
                            <span className="flex-1 text-slate-800">{l.title}</span>
                            <span className="text-[12px] text-slate-500">{l.durationMin} phút</span>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {kind === 'GRAMMAR' && (
            <label className="block">
              <Label>Chủ điểm ngữ pháp</Label>
              <select value={grammar?.slug ?? ''} onChange={(e) => setSlug(e.target.value)} className={fieldCls}>
                {lib.grammar.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.title}
                    {g.level ? ` · ${g.level}` : ''}
                    {g.questionsCount ? ` · ${g.questionsCount} câu` : ''}
                  </option>
                ))}
              </select>
            </label>
          )}

          {kind === 'VOCAB' && (
            <label className="block">
              <Label>Bộ flashcard</Label>
              <select value={vocab?.id ?? ''} onChange={(e) => setTopicId(e.target.value)} className={fieldCls}>
                {lib.vocab.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} · {v.wordsCount} từ
                  </option>
                ))}
              </select>
            </label>
          )}

          {(kind === 'WRITING' || kind === 'SPEAKING') && (
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="text-[13px] font-medium text-slate-700">
                  {kind === 'WRITING' ? 'Đề Viết' : 'Đề Nói'} {exam} · {prompts.length} đề
                </span>
                <span className="relative w-52">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input value={promptQ} onChange={(e) => setPromptQ(e.target.value)} placeholder="Tìm trong đề" className={cn(inputCls, 'h-8 w-full pl-8 text-[13px]')} />
                </span>
              </div>
              {prompts.length === 0 ? (
                <p className="rounded-md border border-slate-200 px-3 py-4 text-center text-sm text-slate-500">Chưa có đề {kind === 'WRITING' ? 'Viết' : 'Nói'} {exam}.</p>
              ) : (
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
                  {shownPrompts.map((o) => {
                    const on = (kind === 'WRITING' ? writing?.id : speaking?.id) === o.id;
                    const minutes = o.taskConfig?.minutes;
                    return (
                      <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => (kind === 'WRITING' ? setTaskId(o.id) : setPartId(o.id))} className={cn('flex w-full gap-3 px-3 py-2.5 text-left hover:bg-slate-50', on && 'bg-indigo-500/[0.05]')}>
                        <span className={cn('mt-0.5 h-4 w-4 shrink-0 rounded-full border', on ? 'border-[5px] border-indigo-600' : 'border-slate-300')} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900">
                            {promptName(o, kind)}
                            {(minutes || o.taskConfig?.minWords) && (
                              <span className="font-normal text-slate-500">
                                {minutes ? ` · ${minutes} phút` : ''}
                                {o.taskConfig?.minWords ? ` · tối thiểu ${o.taskConfig.minWords} từ` : ''}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 line-clamp-2 block text-[13px] text-slate-600">{o.prompt}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-[1fr_210px]">
            <label className="block">
              <Label>Tên bài tập</Label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setTitleEdited(true);
                }}
                className={fieldCls}
              />
            </label>
            <label className="block">
              <Label>Hạn nộp</Label>
              <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} className={fieldCls} />
            </label>
          </div>
          <label className="block">
            <Label>Lời dặn cho học viên (không bắt buộc)</Label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={cn(fieldCls, 'h-auto py-2')} placeholder="VD: Làm trong một lần, không tạm dừng." />
          </label>

          {target && (
            <div className="rounded-md bg-slate-50 px-3 py-2.5 text-[13px] text-slate-600">
              <p>
                <span className="text-slate-500">Học viên sẽ làm:</span> <span className="font-medium text-slate-900">{describeTarget(target, lib)}</span>
              </p>
              <p className="mt-0.5 break-all font-mono text-[12px] text-slate-500">{assignmentHref(target)}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
