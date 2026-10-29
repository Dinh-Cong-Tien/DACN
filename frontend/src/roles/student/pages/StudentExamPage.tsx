import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExamRunner } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_TESTS, buildMockTest } from '@/shared/mocks';

export const StudentExamPage: React.FC = () => {
  const { id = 'ets-2024-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const summary = MOCK_TESTS.find((t) => t.id === id);
  const test = useMemo(() => buildMockTest(id, summary?.examType ?? 'TOEIC', summary?.title), [id, summary]);
  useDocumentTitle(`Phòng thi · ${test.title}`);

  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      <ExamRunner
        test={test}
        onSubmitExam={(r) => {
          localStorage.setItem('orbi-last-result', JSON.stringify({ ...r, testId: id, title: test.title, examType: test.examType }));
          navigate(`/app/mock-tests/${id}/result`);
        }}
        onExit={() => navigate('/app/mock-tests')}
      />
    </div>
  );
};
