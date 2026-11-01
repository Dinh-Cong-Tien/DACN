import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { GRAMMAR_TOPICS, MOCK_CLASSES, MOCK_COURSES, MOCK_TESTS, TOEIC_PARTS_INFO, VOCAB_TOPICS, VSTEP_PARTS_INFO, VSTEP_SPEAKING_PARTS, VSTEP_WRITING_TASKS, describeTarget } from '@/shared/mocks';
import type { Assignment, AssignmentTarget, AssignmentType } from '@/shared/types';
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

/** Viết / Nói không làm trong phòng thi trắc nghiệm, giao riêng bằng đề Viết / đề Nói */
const OUTSIDE = ['VSTEP_WRITING', 'VSTEP_SPEAKING'];
const PART_INFO = [...TOEIC_PARTS_INFO, ...VSTEP_PARTS_INFO];
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
export const AssignDialog: React.FC<{ open: boolean; onClose: () => void; onSave: (a: Assignment) => void; initial?: { classId?: string; target?: AssignmentTarget } }> = ({ open, onClose, onSave, initial }) => {
  const [classId, setClassId] = useState(MOCK_CLASSES[0].id);
  const [kind, setKind] = useState<AssignKind>('EXAM');
  const cls = MOCK_CLASSES.find((c) => c.id === classId)!;
  const tests = MOCK_TESTS.filter((t) => t.examType === cls.examType);
  const [testId, setTestId] = useState(tests[0].id);
  const [parts, setParts] = useState<string[]>([]);
  const [time, setTime] = useState<'auto' | 'none' | number>('auto');
  const [courseId, setCourseId] = useState(MOCK_COURSES[0].id);
  const [lessonIds, setLessonIds] = useState<string[]>([]);
  const [slug, setSlug] = useState(GRAMMAR_TOPICS[0].slug);
  const [topicId, setTopicId] = useState(VOCAB_TOPICS[0].id);
  const [taskId, setTaskId] = useState(VSTEP_WRITING_TASKS[0].id);
  const [partId, setPartId] = useState(VSTEP_SPEAKING_PARTS[0].id);
  const [title, setTitle] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);
  const [due, setDue] = useState(defaultDue());
  const [note, setNote] = useState('');

  // Mở hộp thoại: nạp lớp / nội dung truyền vào (từ trang Học liệu hoặc trang lớp)
  useEffect(() => {
    if (!open) return;
    const t = initial?.target;
    const c = MOCK_CLASSES.find((x) => x.id === initial?.classId) ?? (t?.kind === 'EXAM' ? MOCK_CLASSES.find((x) => x.examType === MOCK_TESTS.find((m) => m.id === t.testId)?.examType) : undefined) ?? MOCK_CLASSES[0];
    setClassId(c.id);
    setKind(t?.kind ?? 'EXAM');
    if (t?.kind === 'EXAM') setTestId(t.testId);
    else setTestId(MOCK_TESTS.find((m) => m.examType === c.examType)!.id);
    if (t?.kind === 'LESSON') {
      setCourseId(t.courseId);
      setLessonIds(t.lessonIds);
    } else setLessonIds([]);
    if (t?.kind === 'GRAMMAR') setSlug(t.slug);
    if (t?.kind === 'VOCAB') setTopicId(t.topicId);
    if (t?.kind === 'WRITING') setTaskId(t.taskId);
    if (t?.kind === 'SPEAKING') setPartId(t.partId);
    setTime('auto');
    setTitleEdited(false);
    setDue(defaultDue());
    setNote('');
  }, [open, initial]);

  const test = MOCK_TESTS.find((t) => t.id === testId) ?? tests[0];
  const testParts = PART_INFO.filter((p) => test.partIds.includes(p.id) && !OUTSIDE.includes(p.id));
  useEffect(() => setParts(testParts.map((p) => p.id)), [testId]); // eslint-disable-line react-hooks/exhaustive-deps

  const allParts = parts.length === testParts.length;
  const suggested = testParts.filter((p) => parts.includes(p.id)).reduce((a, p) => a + (p.minutes ?? Math.ceil(p.questions / 2)), 0);
  const full = allParts && time === 'auto';
  const course = MOCK_COURSES.find((c) => c.id === courseId)!;
  const lessons = course.sections.flatMap((s) => s.lessons);

  const target: AssignmentTarget | null = useMemo(() => {
    switch (kind) {
      case 'EXAM':
        if (!parts.length) return null;
        return { kind, testId: test.id, setup: full ? { mode: 'FULL', parts: test.partIds, minutes: test.durationMinutes } : { mode: 'PRACTICE', parts: testParts.filter((p) => parts.includes(p.id)).map((p) => p.id), minutes: time === 'none' ? null : time === 'auto' ? suggested : time } };
      case 'LESSON':
        return lessonIds.length ? { kind, courseId, lessonIds: lessons.filter((l) => lessonIds.includes(l.id)).map((l) => l.id) } : null;
      case 'GRAMMAR':
        return { kind, slug };
      case 'VOCAB':
        return { kind, topicId };
      case 'WRITING':
        return { kind, taskId };
      case 'SPEAKING':
        return { kind, partId };
    }
  }, [kind, parts, test, full, testParts, time, suggested, lessonIds, courseId, lessons, slug, topicId, taskId, partId]);

  const type: AssignmentType = kind === 'EXAM' ? (full ? 'MOCK_TEST' : 'PRACTICE') : kind === 'WRITING' ? 'ESSAY' : kind;

  // Tiêu đề gợi ý theo nội dung, tới khi giáo viên tự sửa
  const autoTitle = useMemo(() => {
    if (!target) return '';
    switch (target.kind) {
      case 'EXAM':
        if (full) return test.title;
        const picked = testParts.filter((p) => parts.includes(p.id));
        return `${test.title} · ${test.examType === 'TOEIC' ? `Part ${picked.map((p) => p.name.replace('Part ', '')).join(', ')}` : picked.map((p) => p.nameVi).join(', ')}`;
      case 'LESSON': {
        const nums = target.lessonIds.map((id) => lessons.findIndex((l) => l.id === id) + 1);
        return `${course.title} — Bài ${nums.join(', ')}`;
      }
      case 'GRAMMAR':
        return `Ngữ pháp — ${GRAMMAR_TOPICS.find((g) => g.slug === target.slug)?.title}`;
      case 'VOCAB':
        return `Từ vựng — ${VOCAB_TOPICS.find((v) => v.id === target.topicId)?.name}`;
      case 'WRITING':
        return `Writing ${VSTEP_WRITING_TASKS.find((w) => w.id === target.taskId)?.task}`;
      case 'SPEAKING':
        return `Speaking ${VSTEP_SPEAKING_PARTS.find((p) => p.id === target.partId)?.part}`;
    }
  }, [target, full, test, testParts, parts, lessons, course]);
  useEffect(() => {
    if (!titleEdited) setTitle(autoTitle);
  }, [autoTitle, titleEdited]);

  const save = (status: Assignment['status']) => {
    if (!target || !title.trim()) return;
    onSave({ id: `as-${Date.now().toString(36)}`, classId: cls.id, className: cls.name, title: title.trim(), type, dueDate: new Date(due).toISOString(), submitted: 0, total: cls.studentsCount, status, createdAt: new Date().toISOString().slice(0, 10), target, note: note.trim() || undefined });
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

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
          <TBtn disabled={!target || !title.trim()} onClick={() => save('DRAFT')}>
            Lưu nháp
          </TBtn>
          <TBtn variant="primary" disabled={!target || !title.trim()} onClick={() => save('OPEN')}>
            Giao bài
          </TBtn>
        </>
      }
    >
      <div className="space-y-5">
        <label className="block">
          <Label>Lớp</Label>
          <select
            value={classId}
            onChange={(e) => {
              const c = MOCK_CLASSES.find((x) => x.id === e.target.value)!;
              setClassId(c.id);
              if (test.examType !== c.examType) setTestId(MOCK_TESTS.find((m) => m.examType === c.examType)!.id);
            }}
            className={fieldCls}
          >
            {MOCK_CLASSES.map((c) => (
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

        {kind === 'EXAM' && (
          <div className="space-y-4">
            <label className="block">
              <Label>Đề thi ({cls.examType})</Label>
              <select value={testId} onChange={(e) => setTestId(e.target.value)} className={fieldCls}>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} · {t.totalQuestions} câu · {t.durationMinutes} phút
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
                          {p.name} <span className="text-slate-500">· {p.nameVi}</span>
                        </span>
                        <span className="tabular-nums text-[12px] text-slate-500">{p.questions} câu</span>
                      </button>
                    );
                  })}
                </div>
                {test.examType === 'VSTEP' && test.partIds.some((p) => OUTSIDE.includes(p)) && <p className="mt-1.5 text-[12px] text-slate-500">Viết và Nói giao riêng ở mục Đề Viết / Đề Nói để giáo viên chấm.</p>}
              </div>
              <label className="block">
                <Label>Thời gian làm bài</Label>
                <select value={String(time)} onChange={(e) => setTime(e.target.value === 'auto' || e.target.value === 'none' ? e.target.value : Number(e.target.value))} className={fieldCls}>
                  <option value="auto">{allParts ? `Như thi thật (${test.durationMinutes} phút)` : `Theo gợi ý (${suggested} phút)`}</option>
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
        )}

        {kind === 'LESSON' && (
          <div className="space-y-4">
            <label className="block">
              <Label>Khoá học</Label>
              <select
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setLessonIds([]);
                }}
                className={fieldCls}
              >
                {MOCK_COURSES.map((c) => (
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
            <select value={slug} onChange={(e) => setSlug(e.target.value)} className={fieldCls}>
              {GRAMMAR_TOPICS.map((g) => (
                <option key={g.slug} value={g.slug}>
                  {g.title} · {g.level} · {g.questionsCount} câu
                </option>
              ))}
            </select>
          </label>
        )}

        {kind === 'VOCAB' && (
          <label className="block">
            <Label>Bộ flashcard</Label>
            <select value={topicId} onChange={(e) => setTopicId(e.target.value)} className={fieldCls}>
              {VOCAB_TOPICS.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.total} từ
                </option>
              ))}
            </select>
          </label>
        )}

        {(kind === 'WRITING' || kind === 'SPEAKING') && (
          <div>
            <Label>{kind === 'WRITING' ? 'Đề Viết' : 'Đề Nói'}</Label>
            <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
              {(kind === 'WRITING' ? VSTEP_WRITING_TASKS.map((w) => ({ id: w.id, name: w.task, meta: `${w.minutes} phút · tối thiểu ${w.minWords} từ`, prompt: w.prompt })) : VSTEP_SPEAKING_PARTS.map((p) => ({ id: p.id, name: p.part, meta: `${p.minutes} phút`, prompt: p.prompt }))).map((o) => {
                const on = (kind === 'WRITING' ? taskId : partId) === o.id;
                return (
                  <button key={o.id} type="button" role="radio" aria-checked={on} onClick={() => (kind === 'WRITING' ? setTaskId(o.id) : setPartId(o.id))} className={cn('flex w-full gap-3 px-3 py-2.5 text-left hover:bg-slate-50', on && 'bg-indigo-500/[0.05]')}>
                    <span className={cn('mt-0.5 h-4 w-4 shrink-0 rounded-full border', on ? 'border-[5px] border-indigo-600' : 'border-slate-300')} />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-slate-900">
                        {o.name} <span className="font-normal text-slate-500">· {o.meta}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-[13px] text-slate-600">{o.prompt}</span>
                    </span>
                  </button>
                );
              })}
            </div>
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
              <span className="text-slate-500">Học viên sẽ làm:</span> <span className="font-medium text-slate-900">{describeTarget(target)}</span>
            </p>
            <p className="mt-0.5 font-mono text-[12px] text-slate-500">{assignmentHref(target)}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
