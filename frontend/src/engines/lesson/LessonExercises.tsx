import React, { useMemo, useState } from 'react';
import type { IQuestion } from '@toeic-vstep/shared';
import { ArrowRight, ClipboardCheck, PlayCircle, RotateCcw, Target } from 'lucide-react';
import type { LessonExercise } from '@/shared/types';
import { PracticeEngine } from '../practice/PracticeEngine';
import { Button, Card } from '@/shared/components/ui';
import { useT } from '@/shared/i18n';

const KEYS = 'ABCDEFGH';
const TYPE_LABEL: Record<LessonExercise['type'], string> = {
  'vocab-meaning': 'Từ vựng',
  'vocab-context': 'Từ vựng',
  'grammar-formula': 'Ngữ pháp',
  'grammar-name': 'Ngữ pháp',
  'grammar-gap': 'Ngữ pháp',
  'notice-cloze': 'Đọc điền',
  arrange: 'Sắp xếp',
  'text-cloze': 'Điền đoạn văn',
  reading: 'Đọc hiểu',
  'toeic-p1': 'Part 1',
  'toeic-p2': 'Part 2',
  'toeic-p5': 'Part 5',
  'toeic-p6': 'Part 6',
  article: 'Mạo từ',
  phoneme: 'Phát âm',
};

/** Câu bài tập → IQuestion để chạy bằng Practice engine (phản hồi tức thì + giải thích); yêu cầu câu dịch theo ngôn ngữ giao diện */
const toQuestion = (e: LessonExercise, t: (s: string) => string): IQuestion => ({
  id: e.id,
  examType: 'TOEIC',
  type: 'SINGLE_CHOICE',
  skillType: e.type === 'phoneme' ? 'SPEAKING' : e.type.startsWith('vocab') ? 'VOCABULARY' : 'GRAMMAR',
  partOrSkill: TYPE_LABEL[e.type],
  level: '',
  // câu có đoạn văn (dạng đề thi): yêu cầu đặt ở đầu đoạn văn như đề thật, câu hỏi chỉ còn "Question n…"
  stem: e.passage ? (e.text ?? t(e.prompt)) : e.text ? `${t(e.prompt)}${/[.?!]$/.test(e.prompt) ? ' ' : ': '}${e.text}` : t(e.prompt),
  options: e.options.map((text, i) => ({ key: KEYS[i], text })),
  correctAnswer: { key: KEYS[e.answer] },
  explanation: e.explain,
  difficulty: 0,
  tags: [],
  // câu cùng đoạn văn có cùng id đoạn → Practice engine hiện đoạn văn một lần cho cả nhóm
  passage: e.passage
    ? {
        id: e.passage.id ?? `p-${e.passage.title ?? ''}-${e.passage.content.length}`,
        examType: 'TOEIC',
        partOrSkill: TYPE_LABEL[e.type],
        title: e.passage.title,
        content: e.passage.content ? `${e.prompt}

${e.passage.content}` : e.prompt,
        imageUrl: e.passage.imageUrl,
        audioUrl: e.passage.audioUrl,
      }
    : null,
});

/**
 * Bài tập sau bài học / bài kiểm tra chặng: màn mở đầu (số câu, điểm đạt) → làm bài (Practice engine) → tổng kết.
 * Đạt `passPct` → gọi onPassed(điểm %) để hoàn thành bài và mở bài tiếp theo.
 */
export const LessonExercises: React.FC<{
  title: string;
  kind: 'exercise' | 'quiz';
  exercises: LessonExercise[];
  passPct: number;
  done: boolean;
  onPassed: (scorePct: number) => void;
  onNext?: () => void;
  onBackToVideo?: () => void;
}> = ({ title, kind, exercises, passPct, done, onPassed, onNext, onBackToVideo }) => {
  const t = useT();
  const questions = useMemo(() => exercises.map((e) => toQuestion(e, t)), [exercises, t]);
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const need = Math.ceil((passPct / 100) * questions.length);
  const types = [...new Set(exercises.map((e) => TYPE_LABEL[e.type]))];

  if (!started)
    return (
      <Card padding="lg" className="animate-fade-up">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ClipboardCheck className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{kind === 'quiz' ? 'Bài kiểm tra chặng' : 'Bài tập sau bài học'}</p>
            <h3 className="mt-0.5 font-display text-xl font-extrabold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {questions.length} câu trắc nghiệm · {types.join(', ')} · đúng từ {need}/{questions.length} câu ({passPct}%) để {done ? 'giữ kết quả hoàn thành' : 'hoàn thành bài và mở bài tiếp theo'}.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {onBackToVideo && (
            <Button variant="outline" leftIcon={<PlayCircle className="h-4 w-4" />} onClick={onBackToVideo}>
              Xem lại video
            </Button>
          )}
          <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => setStarted(true)}>
            {done ? 'Làm lại bài tập' : 'Bắt đầu làm bài'}
          </Button>
        </div>
      </Card>
    );

  return (
    <PracticeEngine
      key={round}
      title={title}
      questions={questions}
      allowFlagReport={false}
      allowRetry={false}
      onFinishPractice={({ correct, total }) => {
        const pct = Math.round((correct / total) * 100);
        if (pct >= passPct) onPassed(pct);
      }}
      finishNote={({ correct, total, pct }) =>
        pct >= passPct ? (
          <>
            Đúng <b className="text-slate-800">{correct}</b>/{total} câu — {done ? 'bạn đã hoàn thành bài học này.' : 'đạt yêu cầu, bài học đã hoàn thành.'}
          </>
        ) : (
          <>
            Đúng <b className="text-slate-800">{correct}</b>/{total} câu. Cần đúng từ {need} câu ({passPct}%) để hoàn thành bài — xem lại giải thích rồi làm lại nhé.
          </>
        )
      }
      finishActions={({ pct }) => (
        <>
          <Button variant="outline" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={() => setRound((r) => r + 1)}>
            Làm lại
          </Button>
          {pct < passPct && onBackToVideo && (
            <Button variant="soft" leftIcon={<PlayCircle className="h-4 w-4" />} onClick={onBackToVideo}>
              Xem lại video
            </Button>
          )}
          {pct >= passPct && onNext && (
            <Button rightIcon={<ArrowRight className="h-4 w-4" />} onClick={onNext}>
              Học bài tiếp theo
            </Button>
          )}
          {pct >= passPct && !onNext && (
            <Button leftIcon={<Target className="h-4 w-4" />} to="/courses">
              Về khoá học của tôi
            </Button>
          )}
        </>
      )}
    />
  );
};
