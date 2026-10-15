import React, { useState } from 'react';
import { PracticeEngine } from '../../../engines/practice/PracticeEngine';
import { IQuestion, TOEIC_PARTS } from '@toeic-vstep/shared';
import { Layers, Headphones, BookOpen, Mic, PenTool, CheckCircle } from 'lucide-react';

const samplePracticeQuestions: IQuestion[] = [
  {
    id: 'pr-1',
    examType: 'TOEIC',
    type: 'SINGLE_CHOICE',
    skillType: 'READING',
    partOrSkill: 'PART_5',
    level: '550+',
    stem: 'Ms. Jenkins was promoted to senior manager because she has ______ completed all major projects ahead of schedule.',
    options: [
      { key: 'A', text: 'consistent' },
      { key: 'B', text: 'consistently' },
      { key: 'C', text: 'consistency' },
      { key: 'D', text: 'consisting' },
    ],
    correctAnswer: { key: 'A' },
    explanation: 'Cần một trạng từ (Adverb) "consistently" đứng giữa trợ động từ "has" và động từ "completed" để bổ nghĩa cho động tác hoàn thành.',
    difficulty: 2,
    tags: ['adverb', 'part_5'],
  },
];

export const StudentPracticePage: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-indigo-600" />
          <span>Trung tâm luyện tập kỹ năng (Skill Practice Hub)</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Luyện tập theo từng phần cụ thể, có giải thích tức thì và tự động đưa câu trả lời sai vào Sổ tay lỗi sai.
        </p>
      </div>

      {!selectedPart ? (
        <div className="space-y-6">
          <h2 className="text-base font-bold text-slate-800">Chọn phần thi TOEIC bạn muốn tăng tốc:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TOEIC_PARTS.map((part) => (
              <div
                key={part.id}
                onClick={() => setSelectedPart(part.id)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {part.skill}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2">{part.id}: {part.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Chuẩn đề thi: {part.questionCount} câu</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-indigo-600">
                  <span>Luyện ngay</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedPart(null)}
            className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
          >
            ← Quay lại danh sách kỹ năng
          </button>
          <PracticeEngine
            questions={samplePracticeQuestions}
            onFinishPractice={() => setSelectedPart(null)}
          />
        </div>
      )}
    </div>
  );
};
