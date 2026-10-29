import React from 'react';
import { useParams } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { MOCK_VOCAB, VOCAB_TOPICS } from '@/shared/mocks';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Breadcrumb, Badge } from '@/shared/components/ui';
import { VocabFlashcardEngine } from '@/engines';

export const StudentFlashcardPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = VOCAB_TOPICS.find((t) => t.id === topicId);
  const now = Date.now();
  const byTopic = topic ? MOCK_VOCAB.filter((w) => w.topic === topic.name) : [];
  const due = MOCK_VOCAB.filter((w) => new Date(w.nextReviewAt).getTime() <= now);
  const cards = topic ? (byTopic.length ? byTopic : MOCK_VOCAB.slice(0, 6)) : due.length ? due : MOCK_VOCAB.slice(0, 6);
  const title = topic ? topic.name : 'Thẻ đến hạn ôn hôm nay';
  useDocumentTitle(`Flashcard · ${title}`);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Từ vựng', to: '/app/vocabulary' }, { label: 'Flashcard' }, { label: title }]} />
      <div className="text-center space-y-2 animate-fade-down">
        <div className="inline-flex items-center gap-2">
          {topic && <span className="text-2xl">{topic.icon}</span>}
          <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Badge tone="indigo" icon={<Layers className="w-3 h-3" />}>
            {cards.length} thẻ
          </Badge>
          <Badge tone="slate">SM-2 Spaced Repetition</Badge>
        </div>
      </div>
      <VocabFlashcardEngine
        key={topicId ?? 'due'}
        cards={cards}
        exitTo="/app/vocabulary"
        onCompleteSession={(s) => toast.success('Phiên ôn hoàn tất', `Nhớ tốt ${s.good + s.easy}/${cards.length} thẻ. +${cards.length * 2} điểm nỗ lực.`)}
      />
    </div>
  );
};
