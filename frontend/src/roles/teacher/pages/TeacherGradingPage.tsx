import React, { useState } from 'react';
import { CheckSquare, Volume2, Save, Send, Sparkles, Award } from 'lucide-react';

export const TeacherGradingPage: React.FC = () => {
  const [taskScore, setTaskScore] = useState(7.0);
  const [coherenceScore, setCoherenceScore] = useState(6.5);
  const [lexicalScore, setLexicalScore] = useState(7.5);
  const [grammarScore, setGrammarScore] = useState(7.0);
  const [feedback, setFeedback] = useState(
    'Bài viết lập luận rõ ràng, ví dụ thực tế phong phú. Cần lưu ý sử dụng thêm các cấu trúc câu đảo ngữ và mệnh đề quan hệ rút gọn để tăng điểm phần Ngữ pháp.'
  );
  const [isSaved, setIsSaved] = useState(false);

  const averageScore = ((taskScore + coherenceScore + lexicalScore + grammarScore) / 4).toFixed(1);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 uppercase">
            Hàng đợi chấm điểm • VSTEP Writing Task 2
          </span>
          <h1 className="text-xl font-black text-slate-900 mt-1">
            Học viên: Nguyễn Văn An (Lớp TOEIC-750-K28)
          </h1>
          <p className="text-xs text-slate-500">Nộp bài lúc: 14:20 ngày 15/10/2026 • Độ dài: 268 từ</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-bold">Điểm tổng kết</span>
            <span className="text-2xl font-black text-emerald-600">{averageScore} / 10</span>
          </div>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Công bố điểm & Nhận xét</span>
          </button>
        </div>
      </div>

      {/* 2 Columns: Submission Content vs Rubric Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Student Submission Text */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Nội dung bài làm của học viên:</h3>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-800 font-serif whitespace-pre-line max-h-[460px] overflow-y-auto">
              {`In recent years, the rapid advancement of modern technology has revolutionized higher education worldwide. While some educators argue that online learning will ultimately replace conventional physical classrooms, I firmly believe that traditional universities continue to offer indispensable pedagogical and interpersonal benefits that virtual platforms cannot substitute.

First and foremost, physical campus environments cultivate direct collaboration and meaningful interpersonal interactions. When students attend physical lecture halls, they participate in spontaneous debates, group presentations, and face-to-face mentorship with professors. Such interactions develop vital soft skills, such as conflict resolution, team leadership, and emotional intelligence, which are crucial for subsequent workplace success.

Secondly, specialized disciplines like medicine, engineering, and laboratory chemistry necessitate hands-on experimental equipment and supervised physical laboratories. Virtual simulations, regardless of their visual sophistication, cannot replace the practical precision demanded in real surgical or mechanical procedures.

In conclusion, although digital courses provide unprecedented flexibility for remote learners, traditional classrooms remain the bedrock of comprehensive academic development.`}
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>268 words • Đã qua kiểm tra đạo văn (0% AI detected)</span>
          </div>
        </div>

        {/* Right Column: 4 Rubric Criteria Sliders */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Đánh giá theo Rubric chuẩn 4 tiêu chí</span>
          </h3>

          <div className="space-y-4 text-xs">
            {/* Criterion 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">1. Đáp ứng yêu cầu đề (Task Fulfillment)</span>
                <span className="text-emerald-600 font-mono text-sm">{taskScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={taskScore}
                onChange={(e) => setTaskScore(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Criterion 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">2. Độ mạch lạc & Liên kết (Coherence & Cohesion)</span>
                <span className="text-emerald-600 font-mono text-sm">{coherenceScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={coherenceScore}
                onChange={(e) => setCoherenceScore(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Criterion 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">3. Vốn từ vựng & Thuật ngữ (Lexical Resource)</span>
                <span className="text-emerald-600 font-mono text-sm">{lexicalScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={lexicalScore}
                onChange={(e) => setLexicalScore(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Criterion 4 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-bold">
                <span className="text-slate-800">4. Độ chính xác ngữ pháp (Grammatical Accuracy)</span>
                <span className="text-emerald-600 font-mono text-sm">{grammarScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={grammarScore}
                onChange={(e) => setGrammarScore(parseFloat(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Written Feedback */}
            <div className="pt-2">
              <label className="block font-bold text-slate-800 mb-1">Lời nhận xét chi tiết của Giảng viên:</label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
