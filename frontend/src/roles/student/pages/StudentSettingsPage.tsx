import React, { useState } from 'react';
import { Settings, Lock, Bell, Moon, Shield, Save, CheckCircle2 } from 'lucide-react';

export const StudentSettingsPage: React.FC = () => {
  const [emailNotif, setEmailNotif] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>Cài đặt hệ thống (Settings)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tùy chỉnh thông báo nhắc nhở ôn tập Spaced Repetition và bảo mật tài khoản.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Thông báo & Nhắc nhở</span>
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <strong className="block text-slate-800">Nhắc nhở ôn tập ngắt quãng (SRS) hàng ngày</strong>
                <span className="text-slate-400">Gửi thông báo khi có từ vựng hoặc câu sai đến hạn ôn</span>
              </div>
              <input
                type="checkbox"
                checked={dailyReminder}
                onChange={(e) => setDailyReminder(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
              <div>
                <strong className="block text-slate-800">Âm thanh phản hồi khi luyện tập</strong>
                <span className="text-slate-400">Phát âm thanh khi trả lời đúng / sai</span>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Password update */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>Đổi mật khẩu bảo mật</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-emerald-600 font-bold text-xs flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              Đã lưu cài đặt!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tất cả thiết lập</span>
          </button>
        </div>
      </form>
    </div>
  );
};
