import React, { useState } from 'react';
import { User, Mail, Target, Calendar, Award, Flame, Save, CheckCircle2 } from 'lucide-react';

export const StudentProfilePage: React.FC = () => {
  const [fullName, setFullName] = useState('Lê Minh Anh');
  const [email] = useState('student@orbi.edu.vn');
  const [targetExam, setTargetExam] = useState<'TOEIC' | 'VSTEP'>('TOEIC');
  const [targetScore, setTargetScore] = useState('750');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <User className="w-6 h-6 text-indigo-600" />
          <span>Hồ sơ học viên (Profile)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý thông tin cá nhân và thiết lập mục tiêu học tập của bạn.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-xl flex items-center justify-center shadow-md">
            MA
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
            <span className="text-xs text-slate-400">{email}</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Vai trò: Học viên
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500" /> 5 Ngày Streak
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Họ và tên học viên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Kỳ thi mục tiêu</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
              >
                <option value="TOEIC">TOEIC (Listening & Reading)</option>
                <option value="VSTEP">VSTEP (4 Kỹ năng B1-B2-C1)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Điểm số kỳ vọng</label>
              <input
                type="text"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" />
                Cập nhật thông tin thành công!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
