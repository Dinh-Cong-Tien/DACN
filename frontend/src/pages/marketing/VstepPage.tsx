import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Headphones, BookOpen, Mic, PenTool, Award, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const VstepPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skills' | 'bands'>('skills');

  const skills = [
    {
      skill: 'Listening',
      icon: Headphones,
      time: '40 phút',
      questions: '35 câu hỏi',
      parts: '3 phần: Part 1 thông báo ngắn (8 câu), Part 2 hội thoại (12 câu), Part 3 bài giảng học thuật (15 câu).',
    },
    {
      skill: 'Reading',
      icon: BookOpen,
      time: '60 phút',
      questions: '40 câu hỏi',
      parts: '4 bài đọc học thuật độ dài 450-500 từ mỗi bài. Kiểm tra tìm ý chính, từ vựng theo ngữ cảnh và suy luận logic.',
    },
    {
      skill: 'Writing',
      icon: PenTool,
      time: '60 phút',
      questions: '2 phần',
      parts: 'Task 1 viết thư điện tử/thư giao dịch (120 từ), Task 2 viết bài luận học thuật giải thích/bàn luận (250 từ). Tích hợp chấm AI chấm theo chuẩn Bộ GD&ĐT.',
    },
    {
      skill: 'Speaking',
      icon: Mic,
      time: '12 phút',
      questions: '3 phần',
      parts: 'Part 1 tương tác xã hội (3-6 câu hỏi), Part 2 giải quyết tình huống (chọn 1 trong 3 phương án và bảo vệ), Part 3 phát triển chủ đề tự chọn.',
    },
  ];

  const bands = [
    { level: 'B1', band: 'Bậc 3 / 6 (4.0 – 5.5)', audience: 'Sinh viên chuẩn bị tốt nghiệp ĐH, công chức ngạch chuyên viên', requirement: 'Hiểu các điểm chính của các cuộc đàm thoại rõ ràng; xử lý hầu hết các tình huống khi đi lại.' },
    { level: 'B2', band: 'Bậc 4 / 6 (6.0 – 8.0)', audience: 'Học viên Thạc sĩ, giáo viên tiếng Anh tiểu học & THCS', requirement: 'Hiểu các văn bản phức tạp về các chủ đề cụ thể và trừu tượng; giao tiếp trôi chảy và tự nhiên.' },
    { level: 'C1', band: 'Bậc 5 / 6 (8.5 – 10.0)', audience: 'Nghiên cứu sinh Tiến sĩ, giảng viên ĐH dạy chuyên ngành', requirement: 'Hiểu các bài viết dài, nhận biết hàm ý; diễn đạt trôi chảy không gặp khó khăn trong việc tìm từ ngữ.' },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-50 border border-violet-100 text-violet-700 text-xs font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Khung năng lực ngoại ngữ 6 bậc dùng cho Việt Nam</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Chinh phục chứng chỉ VSTEP B1 – B2 – C1
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Hệ thống luyện thi duy nhất tích hợp công nghệ AI chấm chữa chi tiết Writing & Speaking theo barem chính thức của Bộ Giáo dục và Đào tạo.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/auth/register"
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl transition"
            >
              Kiểm tra trình độ VSTEP 4 kỹ năng
            </Link>
            <Link
              to="/mock-tests"
              className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-50 transition"
            >
              Bộ đề mô phỏng định dạng máy tính
            </Link>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center border-b border-slate-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('skills')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'skills'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Cấu trúc 4 kỹ năng VSTEP
            </button>
            <button
              onClick={() => setActiveTab('bands')}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                activeTab === 'bands'
                  ? 'border-violet-600 text-violet-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Quy chuẩn Bậc điểm B1, B2, C1
            </button>
          </div>
        </div>

        {/* 4 Skills Grid */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.skill}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:border-violet-200 transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-black text-slate-900">{s.skill}</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      {s.time} • {s.questions}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.parts}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Bands Info */}
        {activeTab === 'bands' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bands.map((b) => (
              <div
                key={b.level}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl">
                  {b.level}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{b.band}</h4>
                  <p className="text-xs font-bold text-violet-600 mt-0.5">{b.audience}</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{b.requirement}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
