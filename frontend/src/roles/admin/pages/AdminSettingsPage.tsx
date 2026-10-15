import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [easeFactor, setEaseFactor] = useState('2.5');
  const [autoSaveSec, setAutoSaveSec] = useState('30');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-rose-500" />
          <span>Cấu hình tham số hệ thống (System Settings)</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Điều chỉnh các hệ số thuật toán Spaced Repetition, chu kỳ lưu bài tự động và bảo mật.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-slate-950 rounded-3xl p-7 border border-slate-800 shadow-sm space-y-6">
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Hệ số ghi nhớ ban đầu (SM-2 Initial Ease Factor):
            </label>
            <input
              type="text"
              value={easeFactor}
              onChange={(e) => setEaseFactor(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Mặc định chuẩn thuật toán SuperMemo là 2.50. Ngưỡng tối thiểu là 1.30.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Khoảng thời gian tự động lưu bài thi (Auto-save Interval):
            </label>
            <input
              type="text"
              value={autoSaveSec}
              onChange={(e) => setAutoSaveSec(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Thời gian gửi bản nháp đáp án về máy chủ (tính bằng giây). Khuyến nghị: 30s.
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saved && (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Đã cập nhật cấu hình hệ thống!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-900/40 transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </form>
    </div>
  );
};
