import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, BookOpen, Repeat, Compass } from 'lucide-react';

export const PlacementResultPage: React.FC = () => {
  const navigate = useNavigate();
  const goalType = localStorage.getItem('onboarding_goal') || 'TOEIC';
  const score = Number(localStorage.getItem('placement_score') || '580');
  const correctCount = Number(localStorage.getItem('placement_correct_count') || '4');

  const handleStartLearning = () => {
    navigate('/app/learning-path');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto w-full">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Hoàn tất khảo sát đầu vào thành công!</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Báo cáo chẩn đoán năng lực ban đầu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Dựa trên kết quả bài kiểm tra và mục tiêu đã đặt, AI đã tổng hợp hồ sơ năng lực của bạn.
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 rounded-3xl p-8 text-white shadow-xl shadow-indigo-900/20 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
                Ước lượng năng lực hiện tại
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-5xl font-black tracking-tight text-white">{score}</span>
                <span className="text-lg font-bold text-indigo-200">
                  {goalType === 'TOEIC' ? '/ 990 ETS' : 'CEFR B1+'}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-2">
                Đúng {correctCount}/5 câu test sàng lọc • Trình độ Trung cấp
              </p>
            </div>

            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-2">
              <Trophy className="w-8 h-8 text-amber-300 mb-1" />
              <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">
                Mục tiêu
              </span>
              <span className="text-sm font-black text-white">650+</span>
            </div>
          </div>
        </div>

        {/* Diagnostic breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Điểm mạnh đã xác nhận</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Nắm chắc cấu trúc ngữ pháp thì quá khứ đơn và mệnh đề cơ bản.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span>Khả năng đọc quét thông tin thông báo văn phòng ngắn (Part 7).</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Lỗ hổng kiến thức cần bù đắp</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Hòa hợp chủ vị với liên từ tương quan <em>(Neither... nor...)</em>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>Phản xạ bẫy đồng âm và câu trả lời gián tiếp Part 2 Listening.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Next step recommendation */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-5 mb-8 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider">
              Hệ thống đã tự động kích hoạt Lộ trình học 4 Chặng
            </h4>
            <p className="text-xs text-indigo-700/90 mt-1 leading-relaxed">
              Các câu sai trong bài test đã được lưu tự động vào <strong>Sổ tay lỗi cá nhân</strong> và lên lịch ôn ngắt quãng sau 24h.
            </p>
          </div>
        </div>

        {/* Call to action */}
        <div className="flex justify-end">
          <button
            onClick={handleStartLearning}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 group transition"
          >
            <span>Bắt đầu Lộ trình học cá nhân hóa ngay</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
