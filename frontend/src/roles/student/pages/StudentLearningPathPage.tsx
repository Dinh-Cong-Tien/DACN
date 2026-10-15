import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Calendar,
  Flame,
  Award,
  Layers,
} from 'lucide-react';

interface IStage {
  id: string;
  stageName: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'LOCKED';
  progressPct: number;
  milestones: {
    title: string;
    type: 'LESSON' | 'PRACTICE' | 'TEST';
    isCompleted: boolean;
    duration: string;
    link: string;
  }[];
}

const mockStages: IStage[] = [
  {
    id: 'stage-1',
    stageName: 'GIAI ĐOẠN 1',
    title: 'Nền tảng Ngữ pháp & Từ vựng trọng tâm',
    description: 'Xây dựng lại hệ thống 12 thì, mệnh đề quan hệ và 600 từ vựng cốt lõi thường gặp nhất.',
    status: 'COMPLETED',
    progressPct: 100,
    milestones: [
      { title: 'Chinh phục 6 thì động từ cơ bản trong Business', type: 'LESSON', isCompleted: true, duration: '20 phút', link: '/app/practice' },
      { title: 'Bộ 200 từ vựng văn phòng & hợp đồng', type: 'PRACTICE', isCompleted: true, duration: '25 phút', link: '/app/vocabulary' },
      { title: 'Mini Test kiểm tra củng cố Giai đoạn 1', type: 'TEST', isCompleted: true, duration: '30 phút', link: '/app/mock-tests' },
    ],
  },
  {
    id: 'stage-2',
    stageName: 'GIAI ĐOẠN 2',
    title: 'Bứt phá kỹ năng Đọc hiểu & Nghe đoạn hội thoại',
    description: 'Luyện kỹ năng Scanning, Skimming cho Part 7 và chiến lược bắt từ khóa cho Part 3-4.',
    status: 'IN_PROGRESS',
    progressPct: 45,
    milestones: [
      { title: 'Kỹ thuật định vị thông tin nhanh trong đoạn đơn Part 7', type: 'LESSON', isCompleted: true, duration: '30 phút', link: '/app/practice' },
      { title: 'Phân tích bẫy Paraphrase câu hỏi Where & When Part 3', type: 'LESSON', isCompleted: false, duration: '25 phút', link: '/app/practice' },
      { title: 'Luyện 50 câu Part 5 tập trung từ loại & liên từ', type: 'PRACTICE', isCompleted: false, duration: '40 phút', link: '/app/practice' },
      { title: 'Khắc phục toàn bộ câu sai trong Sổ tay lỗi sai', type: 'PRACTICE', isCompleted: false, duration: '15 phút', link: '/app/mistakes' },
    ],
  },
  {
    id: 'stage-3',
    stageName: 'GIAI ĐOẠN 3',
    title: 'Luyện đề tổng hợp & Tối ưu thời gian thi thực tế',
    description: 'Rèn luyện tốc độ làm bài 120 phút liên tục, kiểm soát phân bổ thời gian từng phần.',
    status: 'LOCKED',
    progressPct: 0,
    milestones: [
      { title: 'Giải Full Test 01 - ETS 2024 có bấm giờ nghiêm ngặt', type: 'TEST', isCompleted: false, duration: '120 phút', link: '/app/mock-tests' },
      { title: 'Phân tích điểm yếu và ôn tập ngắt quãng lần cuối', type: 'PRACTICE', isCompleted: false, duration: '60 phút', link: '/app/review' },
      { title: 'Thi thử chung kết mô phỏng phòng thi thật', type: 'TEST', isCompleted: false, duration: '120 phút', link: '/app/mock-tests' },
    ],
  },
];

export const StudentLearningPathPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Lộ trình thích ứng thông minh (Adaptive Path)</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Lộ trình cá nhân hóa của bạn</h1>
          <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
            Mục tiêu: <strong className="text-white font-bold">TOEIC 750</strong> • Dự kiến hoàn thành sau{' '}
            <strong className="text-white font-bold">60 ngày</strong> học đều đặn.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0 z-10 min-w-[160px]">
          <span className="text-xs text-indigo-200 block mb-1">Tiến độ toàn bộ lộ trình</span>
          <div className="text-3xl font-black text-white">48%</div>
          <span className="text-[11px] text-emerald-300 font-semibold">Đang ở Giai đoạn 2</span>
        </div>
      </div>

      {/* Stages Timeline */}
      <div className="space-y-6">
        {mockStages.map((stage, idx) => {
          const isCompleted = stage.status === 'COMPLETED';
          const isInProgress = stage.status === 'IN_PROGRESS';
          const isLocked = stage.status === 'LOCKED';

          return (
            <div
              key={stage.id}
              className={`bg-white rounded-3xl border p-7 shadow-sm transition-all relative ${
                isInProgress
                  ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                  : isCompleted
                  ? 'border-slate-200/80 bg-slate-50/50'
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInProgress
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isLocked ? <Lock className="w-4 h-4" /> : `0${idx + 1}`}
                  </span>
                  <div>
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                      {stage.stageName}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">{stage.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-slate-700">{stage.progressPct}%</span>
                    <div className="w-28 h-2 rounded-full bg-slate-100 mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                        style={{ width: `${stage.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isInProgress
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? 'Đã hoàn thành' : isInProgress ? 'Đang học' : 'Chưa mở khóa'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-6 leading-relaxed">{stage.description}</p>

              {/* Milestones List */}
              <div className="space-y-2.5">
                {stage.milestones.map((m, mIdx) => (
                  <div
                    key={mIdx}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                      m.isCompleted
                        ? 'bg-emerald-50/40 border-emerald-100 text-emerald-950'
                        : isInProgress
                        ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          m.isCompleted ? 'text-emerald-600' : 'text-slate-300'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className={`font-semibold ${m.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                        {m.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-400">{m.duration}</span>
                      {!m.isCompleted && isInProgress ? (
                        <Link
                          to={m.link}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Bắt đầu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
