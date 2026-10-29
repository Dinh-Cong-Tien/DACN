import React, { useMemo, useState } from 'react';
import { Headphones, Play, Check, ArrowRight, RotateCcw, Trophy, Eye, EyeOff, Volume2 } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks';
import { Badge, Button, Card, CardHeader, PageHeader, ProgressBar, RingProgress, StatCard, Textarea } from '@/shared/components/ui';
import { Stagger } from '@/shared/components/motion';
import { cn } from '@/shared/utils';
import { toast } from '@/shared/stores/uiStore';

interface DictationItem {
  id: string;
  text: string;
  textVi: string;
  level: 'Dễ' | 'Vừa' | 'Khó';
  topic: string;
}

const ITEMS: DictationItem[] = [
  { id: 'd1', text: 'The meeting has been moved to Thursday afternoon.', textVi: 'Cuộc họp đã được dời sang chiều thứ Năm.', level: 'Dễ', topic: 'Office' },
  { id: 'd2', text: 'Please submit your quarterly budget by the end of this week.', textVi: 'Vui lòng nộp ngân sách quý trước cuối tuần này.', level: 'Dễ', topic: 'Finance' },
  { id: 'd3', text: 'Members of our loyalty program receive an additional five percent discount.', textVi: 'Thành viên chương trình khách hàng thân thiết được giảm thêm 5%.', level: 'Vừa', topic: 'Retail' },
  { id: 'd4', text: 'The newly appointed director implemented a series of cost-cutting measures.', textVi: 'Giám đốc mới được bổ nhiệm đã triển khai một loạt biện pháp cắt giảm chi phí.', level: 'Vừa', topic: 'Management' },
  { id: 'd5', text: 'Despite the heavy rain, the outdoor product launch proceeded as scheduled.', textVi: 'Dù mưa lớn, buổi ra mắt sản phẩm ngoài trời vẫn diễn ra đúng kế hoạch.', level: 'Khó', topic: 'Marketing' },
  { id: 'd6', text: 'Sign up before June thirtieth and receive your first month at twenty percent off.', textVi: 'Đăng ký trước ngày 30/6 để được giảm 20% tháng đầu tiên.', level: 'Khó', topic: 'Advertising' },
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s']/g, '').split(/\s+/).filter(Boolean);

export const StudentDictationPage: React.FC = () => {
  useDocumentTitle('Nghe chép chính tả');
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [showVi, setShowVi] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [plays, setPlays] = useState(0);
  const [rate, setRate] = useState(0.9);
  const [finished, setFinished] = useState(false);

  const item = ITEMS[index];
  const target = useMemo(() => normalize(item.text), [item]);
  const typed = useMemo(() => normalize(input), [input]);

  const diff = useMemo(() => target.map((w, i) => ({ word: item.text.split(/\s+/)[i] ?? w, ok: typed[i] === w })), [target, typed, item]);
  const accuracy = target.length ? Math.round((diff.filter((d) => d.ok).length / target.length) * 100) : 0;

  const speak = () => {
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(item.text);
      u.lang = 'en-US';
      u.rate = rate;
      window.speechSynthesis.speak(u);
      setPlays((p) => p + 1);
    } catch {
      toast.error('Trình duyệt không hỗ trợ phát âm');
    }
  };

  const check = () => {
    if (!input.trim()) return toast.warning('Hãy nhập câu bạn nghe được');
    setChecked(true);
    if (accuracy === 100) toast.success('Chính xác 100%!', 'Tai nghe của bạn rất tốt.');
  };

  const next = () => {
    const r = [...results, accuracy];
    setResults(r);
    setInput('');
    setChecked(false);
    setShowVi(false);
    setPlays(0);
    if (index + 1 < ITEMS.length) setIndex((i) => i + 1);
    else setFinished(true);
  };

  const restart = () => {
    setIndex(0);
    setInput('');
    setChecked(false);
    setResults([]);
    setFinished(false);
    setPlays(0);
  };

  if (finished) {
    const avg = Math.round(results.reduce((a, b) => a + b, 0) / results.length);
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="lg" className="text-center space-y-5 animate-scale-in">
          <div className="relative inline-flex">
            <RingProgress value={avg} size={150} stroke={12} tone={avg >= 80 ? 'emerald' : avg >= 50 ? 'amber' : 'rose'}>
              <div>
                <p className="text-3xl font-black text-slate-900">{avg}%</p>
                <p className="text-[10px] font-bold uppercase text-slate-400">Trung bình</p>
              </div>
            </RingProgress>
            <Trophy className="absolute -top-2 -right-2 w-9 h-9 text-amber-400 animate-bounce-soft" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900">Hoàn thành {ITEMS.length} câu!</h3>
            <p className="text-sm text-slate-500 mt-1">Nghe chép chính tả giúp bạn bắt âm cuối, nối âm và từ chức năng — những thứ dễ bị bỏ sót trong Part 2–4.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {results.map((r, i) => (
              <div key={i} className={cn('rounded-xl p-2 text-center animate-pop', r >= 80 ? 'bg-emerald-50 text-emerald-700' : r >= 50 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700')} style={{ animationDelay: `${i * 60}ms` }}>
                <p className="text-sm font-black">{r}%</p>
                <p className="text-[10px] font-bold">Câu {i + 1}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={restart}>
              Luyện lại
            </Button>
            <Button to="/app/practice">Về luyện tập</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader icon={<Headphones />} title="Nghe chép chính tả" description="Nghe câu tiếng Anh và gõ lại chính xác từng từ. Hệ thống so khớp từng từ và chỉ ra chỗ bạn nghe sót." />

      <Stagger className="grid grid-cols-3 gap-4 mb-6" step={70}>
        <StatCard label="Tiến độ" value={`${index + 1}/${ITEMS.length}`} icon={<Headphones />} tone="indigo" />
        <StatCard label="Độ chính xác TB" value={results.length ? Math.round(results.reduce((a, b) => a + b, 0) / results.length) : 0} suffix="%" icon={<Check />} tone="emerald" />
        <StatCard label="Lượt nghe câu này" value={plays} icon={<Volume2 />} tone="amber" hint="Thi thật chỉ nghe 1 lần" />
      </Stagger>

      <div className="max-w-3xl mx-auto space-y-4">
        <ProgressBar value={(index / ITEMS.length) * 100} size="sm" />
        <Card key={item.id} className="animate-slide-in-right">
          <CardHeader
            title={`Câu ${index + 1}`}
            subtitle={`Chủ đề ${item.topic} · ${target.length} từ`}
            action={
              <Badge tone={item.level === 'Dễ' ? 'emerald' : item.level === 'Vừa' ? 'amber' : 'rose'}>
                {item.level}
              </Badge>
            }
          />
          <div className="flex flex-col sm:flex-row items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
            <button onClick={speak} className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lift hover:scale-110 active:scale-95 transition-transform relative shrink-0">
              <Play className="w-7 h-7 ml-1" />
              <span className="absolute inset-0 rounded-full bg-indigo-500/40 animate-pulse-ring" />
            </button>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-slate-900">Nhấn để nghe câu</p>
              <p className="text-xs text-slate-500 mt-0.5">Nghe tối đa 3 lần rồi gõ lại. Bạn có thể giảm tốc độ nếu cần.</p>
              <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                {[0.7, 0.9, 1.1].map((r) => (
                  <button key={r} onClick={() => setRate(r)} className={cn('px-2.5 py-1 rounded-lg text-[11px] font-bold border transition', rate === r ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200 text-slate-600')}>
                    {r === 0.7 ? 'Chậm' : r === 0.9 ? 'Chuẩn' : 'Nhanh'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Textarea label="Bạn nghe được gì?" placeholder="Gõ lại câu vừa nghe..." value={input} onChange={(e) => setInput(e.target.value)} disabled={checked} className={cn(checked && (accuracy === 100 ? 'border-emerald-300 bg-emerald-50/40' : 'border-amber-300 bg-amber-50/30'))} />
          </div>

          {checked && (
            <div className="mt-4 space-y-3 animate-fade-up">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-800">Kết quả so khớp</p>
                <Badge tone={accuracy >= 80 ? 'emerald' : accuracy >= 50 ? 'amber' : 'rose'} size="md">
                  {accuracy}% chính xác
                </Badge>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap gap-1.5 text-base leading-relaxed">
                {diff.map((d, i) => (
                  <span key={i} className={cn('px-1.5 py-0.5 rounded-md font-semibold animate-pop', d.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 underline decoration-wavy')} style={{ animationDelay: `${i * 30}ms` }}>
                    {d.word}
                  </span>
                ))}
              </div>
              <button onClick={() => setShowVi((v) => !v)} className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline">
                {showVi ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {showVi ? 'Ẩn nghĩa' : 'Xem nghĩa tiếng Việt'}
              </button>
              {showVi && <p className="text-sm text-slate-600 italic animate-fade-in">"{item.textVi}"</p>}
            </div>
          )}

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
            <Button variant="ghost" size="sm" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={() => { setInput(''); setChecked(false); }}>
              Nhập lại
            </Button>
            {checked ? (
              <Button variant={index + 1 < ITEMS.length ? 'primary' : 'success'} rightIcon={<ArrowRight className="w-4 h-4" />} onClick={next} className="animate-pop">
                {index + 1 < ITEMS.length ? 'Câu tiếp theo' : 'Xem tổng kết'}
              </Button>
            ) : (
              <Button leftIcon={<Check className="w-4 h-4" />} onClick={check}>
                Kiểm tra
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
