import React from 'react';
import { Trophy, Medal, Flame, Star, Award, ArrowUp } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const topUsers = [
    { rank: 1, name: 'Trần Minh Quân', score: 980, streak: 45, xp: 12450, badge: 'Huyền thoại', avatar: 'TQ' },
    { rank: 2, name: 'Nguyễn Thảo Ly', score: 965, streak: 38, xp: 11200, badge: 'Cao thủ', avatar: 'NL' },
    { rank: 3, name: 'Lê Hoàng Nam', score: 945, streak: 32, xp: 9850, badge: 'Cao thủ', avatar: 'LN' },
    { rank: 4, name: 'Phạm Thu Trang', score: 920, streak: 28, xp: 8400, badge: 'Chuyên cần', avatar: 'PT' },
    { rank: 5, name: 'Vũ Đức Duy', score: 890, streak: 21, xp: 7600, badge: 'Chuyên cần', avatar: 'VD' },
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Vinh danh Học viên Xuất sắc tuần này</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bảng Xếp Hạng Toàn Hệ Thống</h1>
          <p className="text-slate-600 text-sm">
            Cạnh tranh tích lũy điểm kinh nghiệm (XP) qua mỗi bài luyện tập, bài thi thử và duy trì chuỗi học tập (Streak) liên tục.
          </p>
        </div>

        {/* Podium Top 3 */}
        <div className="grid grid-cols-3 gap-4 pt-4 pb-2 items-end">
          {/* Rank 2 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 font-black text-slate-700 flex items-center justify-center mx-auto text-sm">
              {topUsers[1].avatar}
            </div>
            <div className="text-xs font-black text-slate-800">{topUsers[1].name}</div>
            <div className="text-sm font-black text-slate-600">{topUsers[1].score} điểm</div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
              Hạng 2 🥈
            </span>
          </div>

          {/* Rank 1 */}
          <div className="bg-gradient-to-b from-amber-500/10 to-amber-500/5 p-6 rounded-3xl border-2 border-amber-400 shadow-md text-center space-y-2 transform -translate-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-white font-black flex items-center justify-center mx-auto text-lg shadow-lg shadow-amber-300/40">
              {topUsers[0].avatar}
            </div>
            <div className="text-sm font-black text-slate-900">{topUsers[0].name}</div>
            <div className="text-base font-black text-amber-600">{topUsers[0].score} điểm</div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider">
              Quán quân 👑
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-50 font-black text-amber-800 flex items-center justify-center mx-auto text-sm">
              {topUsers[2].avatar}
            </div>
            <div className="text-xs font-black text-slate-800">{topUsers[2].name}</div>
            <div className="text-sm font-black text-slate-600">{topUsers[2].score} điểm</div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-[10px] font-bold text-amber-800">
              Hạng 3 🥉
            </span>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
          {topUsers.map((u) => (
            <div key={u.rank} className="p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="w-6 text-center font-black text-sm text-slate-400 font-mono">
                  #{u.rank}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 font-black text-slate-700 flex items-center justify-center text-xs">
                  {u.avatar}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{u.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {u.badge}
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {u.streak} ngày streak
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                  {u.score}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">{u.xp.toLocaleString()} XP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
