import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamRunner } from '../../../engines/exam/ExamRunner';
import { IMockTest } from '@toeic-vstep/shared';

const mockSampleTest: IMockTest = {
  id: 'sample-toeic-test',
  title: 'ETS TOEIC Practice Test - Part 5 Mini (Demonstration)',
  slug: 'sample-toeic-test',
  examType: 'TOEIC',
  durationMinutes: 15,
  totalQuestions: 5,
  sections: [
    {
      id: 'sec-1',
      name: 'Incomplete Sentences (Part 5)',
      skillType: 'READING',
      orderIndex: 1,
      questions: [
        {
          id: 'q-101',
          examType: 'TOEIC',
          type: 'SINGLE_CHOICE',
          skillType: 'READING',
          partOrSkill: 'PART_5',
          level: '550+',
          stem: 'Mr. Tanaka requested that all department managers submit their quarterly budgets ______ Friday afternoon.',
          options: [
            { key: 'A', text: 'by' },
            { key: 'B', text: 'until' },
            { key: 'C', text: 'since' },
            { key: 'D', text: 'during' },
          ],
          correctAnswer: { key: 'A' },
          explanation: 'Dùng giới từ "by" để chỉ hạn chót (trước hoặc muộn nhất là thời điểm nào). "Until" dùng cho hành động kéo dài liên tục.',
          difficulty: 2,
          tags: ['preposition', 'deadline_trap'],
        },
        {
          id: 'q-102',
          examType: 'TOEIC',
          type: 'SINGLE_CHOICE',
          skillType: 'READING',
          partOrSkill: 'PART_5',
          level: '650+',
          stem: 'The newly appointed director has implemented a series of ______ measures to reduce operational costs.',
          options: [
            { key: 'A', text: 'economize' },
            { key: 'B', text: 'economic' },
            { key: 'C', text: 'economical' },
            { key: 'D', text: 'economist' },
          ],
          correctAnswer: { key: 'C' },
          explanation: '"Economical" là tính từ mang nghĩa tiết kiệm. "Economic" là tính từ thuộc về kinh tế.',
          difficulty: 3,
          tags: ['confusing_adjectives', 'word_form'],
        },
      ],
    },
  ],
};

export const StudentExamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleSaveAnswer = (questionId: string, selectedKey: string) => {
    console.log(`Auto-saving answer for question ${questionId}: ${selectedKey}`);
  };

  const handleSubmitExam = (answers: Record<string, string>, timeSpentSec: number) => {
    console.log('Submitting exam with answers:', answers, 'Time spent:', timeSpentSec);
    // Điều hướng sang trang xem kết quả
    navigate(`/app/mock-tests/${id || 'sample'}/result`);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-50 overflow-y-auto">
      <ExamRunner
        test={mockSampleTest}
        attemptId="attempt-123"
        onSaveAnswer={handleSaveAnswer}
        onSubmitExam={handleSubmitExam}
      />
    </div>
  );
};
