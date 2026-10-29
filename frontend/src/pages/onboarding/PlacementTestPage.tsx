import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Send, Headphones, BookOpen, Timer } from 'lucide-react';
import { useCountdown, useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, ProgressBar, Modal } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';
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
      <Card hard padding="none" className="animate-scale-in overflow-hidden max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px]">
          <div className="p-7 md:p-10 space-y-6">
            <span className="sticker tilt-1">Bước 5 / 6</span>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bài thi xếp lớp <span className="mark">15 phút</span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">{questions.length} câu trộn Nghe – Đọc – Ngữ pháp, lấy từ đề ETS 2024 và đề mẫu VSTEP. Kết quả dùng để ước lượng năng lực ban đầu và sinh lộ trình 3 chặng phù hợp.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { v: `${questions.length}`, l: 'câu hỏi', Icon: BookOpen, cls: 'bg-indigo-100' },
                { v: '15', l: 'phút', Icon: Timer, cls: 'bg-amber-100' },
                { v: '1 lần', l: 'phát audio', Icon: Headphones, cls: 'bg-violet-100' },
              ].map((s, i) => (
                <div key={s.l} className={cn('rounded-2xl border-2 border-slate-900 p-3 text-center animate-pop', s.cls)} style={{ animationDelay: `${i * 80}ms` }}>
                  <s.Icon className="w-4 h-4 mx-auto text-slate-700 mb-1" />
                  <p className="font-display text-2xl font-extrabold text-slate-900 leading-none">{s.v}</p>
                  <p className="text-[10px] font-extrabold uppercase text-slate-600 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Button size="xl" variant="gradient" onClick={() => setStarted(true)}>
                Bắt đầu làm bài
              </Button>
              <p className="text-xs text-slate-500">Không chắc câu nào? Cứ chọn đáp án bạn nghĩ là đúng — hệ thống cần thấy điểm mạnh/yếu thật.</p>
            </div>
          </div>
          <div className="relative bg-indigo-600 min-h-[260px]">
            <Img src={PHOTOS.writing} alt="Làm bài xếp lớp" wrapperClass="absolute inset-0" fallbackClass="bg-indigo-600" />
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-2xl border-2 border-slate-900 p-3 shadow-hard-sm tilt-3">
              <p className="text-[11px] font-extrabold uppercase text-slate-500">Mẹo nhỏ</p>
              <p className="text-xs font-bold text-slate-900">Đeo tai nghe, tắt thông báo, ngồi 15 phút không gián đoạn.</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <Card hard padding="sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge tone="indigo" solid>
              Câu {index + 1}/{questions.length}
            </Badge>
            <span className="text-xs text-slate-600 font-bold">{answered} đã trả lời</span>
          </div>
          <div className={cn('flex items-center gap-2 px-3 h-9 rounded-xl border-2 border-slate-900 font-mono font-black', remaining < 120 ? 'bg-violet-500 text-white animate-pulse' : 'bg-slate-900 text-amber-300')}>
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

      <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl border-2 border-slate-900 shadow-hard">
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
