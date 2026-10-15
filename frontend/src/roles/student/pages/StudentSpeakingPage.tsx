import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Square,
  Clock,
  Sparkles,
  Volume2,
  AlertCircle,
  Send,
  RotateCcw,
} from 'lucide-react';

export const StudentSpeakingPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [prepTime, setPrepTime] = useState(60);
  const [speakTime, setSpeakTime] = useState(120);

  const startRecording = () => {
    setIsRecording(true);
    setHasRecorded(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-600" />
            <span>Phòng luyện Speaking có ghi âm (Audio Studio)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mô phỏng thời gian chuẩn bị & thời gian nói chuẩn format VSTEP & TOEIC Speaking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Microphone sẵn sàng
          </span>
        </div>
      </div>

      {/* Speaking Topic Card */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg space-y-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded">
          VSTEP Speaking Part 2: Thảo luận giải pháp
        </span>
        <h3 className="text-base font-bold leading-relaxed">
          &quot;Your university is planning to improve campus facilities for students. Three options are suggested:
          1. Upgrading the computer lab with high-speed internet.
          2. Building a modern outdoor sports facility.
          3. Expanding the central library study rooms.
          Which option do you think is the best choice? Explain your reasons.&quot;
        </h3>
        <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Chuẩn bị: 1 phút</span>
          <span>•</span>
          <span>Nói: 2 phút</span>
        </div>
      </div>

      {/* Recording Control Console */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {isRecording ? 'Đang ghi âm câu trả lời của bạn...' : 'Sẵn sàng ghi âm'}
          </span>
          <div className="text-4xl font-black font-mono text-slate-800">
            {isRecording ? '01:24' : '02:00'}
          </div>
        </div>

        {/* Pulse Button */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-200 transition-all hover:scale-105"
            >
              <Mic className="w-8 h-8" />
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-20 h-20 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-lg transition-all animate-pulse"
            >
              <Square className="w-8 h-8 fill-white" />
            </button>
          )}
        </div>

        <p className="text-xs text-slate-400">
          {isRecording ? 'Nhấn nút vuông để kết thúc ghi âm' : 'Nhấn nút mic đỏ để bắt đầu nói'}
        </p>

        {/* Playback & Submit */}
        {hasRecorded && !isRecording && (
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition">
              <Play className="w-4 h-4 fill-slate-700" />
              <span>Nghe lại bản thu âm</span>
            </button>

            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thu âm lại</span>
            </button>

            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition">
              <Send className="w-4 h-4" />
              <span>Nộp audio để chấm điểm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
