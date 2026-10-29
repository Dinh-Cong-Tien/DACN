import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentTitle } from '@/shared/hooks';
import { Breadcrumb } from '@/shared/components/ui';
import { PracticeEngine } from '@/engines';
import { QUESTIONS_BY_PART, TOEIC_PART5, TOEIC_PARTS_INFO } from '@/shared/mocks';
import { toast } from '@/shared/stores/uiStore';

export const StudentPracticeSessionPage: React.FC = () => {
  const { part = 'PART_5' } = useParams<{ part: string }>();
  const questions = useMemo(() => QUESTIONS_BY_PART[part] ?? TOEIC_PART5, [part]);
  const info = TOEIC_PARTS_INFO.find((p) => p.id === part);
  const title = info ? `${info.name} · ${info.nameVi}` : part === 'VSTEP_READING' ? 'VSTEP Reading' : part === 'VSTEP_LISTENING' ? 'VSTEP Listening' : part.replace('_', ' ');
  useDocumentTitle(`Luyện ${title}`);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap animate-fade-down">
        <Breadcrumb items={[{ label: 'Luyện tập', to: '/app/practice' }, { label: title }]} />
        {info && (
          <span className="sticker tilt-2 !text-[10px]">
            {info.questions} câu trong đề thật · {info.skill}
          </span>
        )}
      </div>
      <PracticeEngine
        key={part}
        title={title}
        questions={questions}
        exitTo="/app/practice"
        onMistakeRecorded={() => toast.warning('Đã lưu vào Sổ tay lỗi sai', 'Câu này sẽ xuất hiện trong lịch ôn ngắt quãng.')}
      />
    </div>
  );
};
