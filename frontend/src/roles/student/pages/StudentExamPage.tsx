import React, { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ExamRunner } from '@/engines';
import { useDocumentTitle } from '@/shared/hooks';
import { MOCK_TESTS, buildMockTest } from '@/shared/mocks';
import { parseExamSetup } from '@/shared/utils';

export const StudentExamPage: React.FC = () => {
  const { id = 'ets-2024-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const summary = MOCK_TESTS.find((t) => t.id === id);
  // ?parts=…&time=… → luyện tập theo Part; không có query → full test
  const setup = useMemo(() => parseExamSetup(search, summary?.partIds ?? [], summary?.durationMinutes ?? 120), [search, summary]);
  const test = useMemo(() => buildMockTest(id, summary?.examType ?? 'TOEIC', summary?.title, setup), [id, summary, setup]);
  useDocumentTitle(`Phòng thi · ${test.title}`);

  return (
    <div className="fixed inset-0 z-50 bg-paper overflow-y-auto">
      <ExamRunner
        test={test}
        onSubmitExam={(r) => {
          localStorage.setItem('orbi-last-result', JSON.stringify({ ...r, testId: id, title: test.title, examType: test.examType, setup }));
          navigate(`/app/mock-tests/${id}/result`);
        }}
        onExit={() => navigate(`/app/mock-tests/${id}`)}
      />
    </div>
  );
};
