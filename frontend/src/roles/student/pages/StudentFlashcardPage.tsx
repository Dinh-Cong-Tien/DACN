import React from 'react';
import { useParams } from 'react-router-dom';
import { Layers, RotateCcw } from 'lucide-react';
import { useReview, useReviewDue, useVocabWords } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Breadcrumb, Badge } from '@/shared/components/ui';
import { Doodles } from '@/shared/components/motion';
import { VocabFlashcardEngine } from '@/engines';

export const StudentFlashcardPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const { data: topicData, isLoading: loadingTopic } = useVocabWords(topicId);
  const { data: dueData, isLoading: loadingDue } = useReviewDue();
  const review = useReview();
  const topic = topicData?.topic;
  // Bộ từ: ưu tiên từ đến hạn hoặc chưa học, tối đa 20 thẻ mỗi phiên
  const now = Date.now();
  const cards = topicId
    ? (topicData?.words ?? []).filter((w) => !w.isLearning || new Date(w.nextReviewAt).getTime() <= now).slice(0, 20)
    : (dueData?.words ?? []);
  const loading = topicId ? loadingTopic : loadingDue;
  const title = topic ? topic.name : 'Thẻ đến hạn ôn hôm nay';
  useDocumentTitle(`Flashcard · ${title}`);

  return (
    <div className="relative space-y-6">
      <Doodles className="opacity-50" />
      <div className="relative">
        <Breadcrumb items={[{ label: 'Từ vựng', to: '/app/vocabulary' }, { label: 'Flashcard' }, { label: title }]} />
      </div>
      <div className="relative text-center space-y-3 animate-fade-down">
        <span className="sticker tilt-2 !bg-amber-300">
          <RotateCcw className="w-3.5 h-3.5" /> Phiên ôn SM-2
        </span>
        <h1 className="font-display text-3xl font-extrabold text-slate-900">{title}</h1>
        <div className="flex items-center justify-center gap-2">
          <Badge tone="indigo" icon={<Layers className="w-3 h-3" />}>
            {cards.length} thẻ
          </Badge>
          <Badge tone="slate">Lật thẻ · đánh giá · lặp lại</Badge>
        </div>
      </div>
      <div className="relative">
        {cards.length === 0 ? (
          <p className="text-center text-sm text-slate-500">{loading ? 'Đang tải thẻ…' : topicId ? 'Bạn đã ôn hết các thẻ đến hạn của bộ này.' : 'Hôm nay không có thẻ nào đến hạn. Chọn một chủ đề để học từ mới.'}</p>
        ) : (
        <VocabFlashcardEngine
          key={topicId ?? 'due'}
          cards={cards}
          exitTo="/app/vocabulary"
          // Mỗi lần đánh giá thẻ → cập nhật SM-2 trên máy chủ (tạo thẻ nếu từ chưa học)
          onSubmitReview={(wordId, quality) => review.mutate({ wordId, quality }, { onError: (e) => toast.error('Chưa lưu được kết quả ôn', errorMessage(e)) })}
          onCompleteSession={(s) => toast.success('Phiên ôn hoàn tất', `Nhớ tốt ${s.good + s.easy}/${cards.length} thẻ.`)}
        />
        )}
      </div>
    </div>
  );
};
