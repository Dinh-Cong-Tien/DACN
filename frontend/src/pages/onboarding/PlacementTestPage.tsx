import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import { useCountdown, useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, ProgressBar, Modal } from '@/shared/components/ui';
import { QuestionRenderer } from '@/engines';
import { TOEIC_PART5, TOEIC_PART2, TOEIC_PART7, VSTEP_READING } from '@/shared/mocks';
import { cn, formatClock, getCorrectKey } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

const TOTAL_SEC = 15 * 60;

export const PlacementTestPage: React.FC = () => {
  useDocumentTitle('Bài thi xếp lớp');
  const navigate = useNavigate();
  const questions = useMemo(() => [...TOEIC_PART5.slice(0, 4), ...TOEIC_PART2.slice(0, 2), ...TOEIC_PART7, ...VSTEP_READING.slice(0, 1)], []);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const finish = () => {
    if (done) return;
    setDone(true);
    const correct = questions.filter((q) => answers[q.id] === getCorrectKey(q)).length;
    localStorage.setItem('orbi-placement', JSON.stringify({ correct, total: questions.length, answers }));
    navigate('/onboarding/placement-result');
  };

  const remaining = useCountdown(TOTAL_SEC, () => {
    toast.warning('Hết giờ', 'Tự động nộp bài xếp lớp.');
    finish();
  }, started && !done);

  const q = questions[index];
  const answered = Object.keys(answers).length;

  if (!started) {
    return (
      <Card padding="lg" className="animate-scale-in text-center space-y-6 max-w-2xl mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center mx-auto shadow-lift animate-float">
          <Sparkles className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <Badge tone="indigo">Bước 5 / 6</Badge>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Bài thi xếp lớp 15 phút</h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">{questions.length} câu trộn Nghe – Đọc – Ngữ pháp. Kết quả dùng để ước lượng năng lực ban đầu θ₀ và sinh lộ trình phù hợp.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            [`${questions.length}`, 'câu hỏi'],
            ['15', 'phút'],
            ['1 lần', 'phát audio'],
          ].map(([v, l], i) => (
            <div key={l} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 animate-pop" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-2xl font-black text-indigo-700">{v}</p>
              <p className="text-[10px] font-bold uppercase text-slate-400">{l}</p>
            </div>
          ))}
        </div>
        <Button size="xl" variant="gradient" className="shine" onClick={() => setStarted(true)}>
          Bắt đầu làm bài
        </Button>
        <p className="text-xs text-slate-400">Không chắc câu nào? Cứ chọn phương án bạn nghĩ là đúng — hệ thống cần thấy điểm mạnh/yếu thật của bạn.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card padding="sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge tone="indigo">
              Câu {index + 1}/{questions.length}
            </Badge>
            <span className="text-xs text-slate-500 font-semibold">{answered} đã trả lời</span>
          </div>
          <div className={cn('flex items-center gap-2 px-3 h-9 rounded-xl font-mono font-black', remaining < 120 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-900 text-white')}>
            <Clock className="w-4 h-4" />
            {formatClock(Math.max(0, remaining))}
          </div>
        </div>
        <ProgressBar value={(answered / questions.length) * 100} size="sm" className="mt-3" />
      </Card>

      {q && (
        <div key={q.id} className="animate-slide-in-right">
          <QuestionRenderer question={q} index={index} selectedAnswer={answers[q.id]} onSelectAnswer={(k) => setAnswers((a) => ({ ...a, [q.id]: k }))} examMode allowFlagReport={false} />
        </div>
      )}

      <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border border-slate-200 shadow-soft">
        <Button variant="outline" size="sm" disabled={index === 0} leftIcon={<ChevronLeft className="w-4 h-4" />} onClick={() => setIndex((i) => i - 1)}>
          Câu trước
        </Button>
        {index === questions.length - 1 ? (
          <Button size="sm" variant="success" rightIcon={<Send className="w-4 h-4" />} onClick={() => setConfirm(true)}>
            Nộp bài
          </Button>
        ) : (
          <Button size="sm" rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => setIndex((i) => i + 1)}>
            Câu tiếp
          </Button>
        )}
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Nộp bài xếp lớp?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(false)}>
              Làm tiếp
            </Button>
            <Button variant="success" onClick={finish}>
              Nộp bài
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Bạn đã trả lời <b>{answered}</b>/{questions.length} câu. {answered < questions.length && 'Câu bỏ trống sẽ tính là sai.'}
        </p>
      </Modal>
    </div>
  );
};
