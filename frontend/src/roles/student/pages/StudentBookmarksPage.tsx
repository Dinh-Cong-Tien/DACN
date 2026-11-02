import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX, FileQuestion, BookOpen, PlayCircle, Volume2, Play } from 'lucide-react';
import { useBookmarks, useRemoveBookmark, type BookmarkDto } from '@/shared/api/learner';
import { errorMessage } from '@/shared/api/client';
import { cn } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, EmptyState, PageHeader, Tabs } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

type QDetail = { stem: string; part: string; examType: string; options: { key: string; text: string }[]; correctKey: string };
type LDetail = { courseTitle: string; coverUrl?: string | null; type: string; durationMin: number };
const detailOf = <T,>(b: BookmarkDto) => (b as BookmarkDto & { detail?: T }).detail;

export const StudentBookmarksPage: React.FC = () => {
  useDocumentTitle('Nội dung đã lưu');
  const [tab, setTab] = useState('questions');
  const { data: all = [] } = useBookmarks();
  const remove = useRemoveBookmark();
  const questions = all.filter((b) => b.targetType === 'QUESTION').map((b) => ({ id: b.targetId, ...(detailOf<QDetail>(b) ?? { stem: b.title, part: b.subtitle ?? '', examType: '', options: [], correctKey: '' }) }));
  const words = all.filter((b) => b.targetType === 'WORD').map((b) => ({ id: b.targetId, word: b.title, meaningVi: b.subtitle ?? '', ipa: detailOf<{ ipa: string }>(b)?.ipa ?? '' }));
  const lessons = all.filter((b) => b.targetType === 'LESSON').map((b) => ({ id: b.targetId, title: b.title, link: b.link ?? '#', ...(detailOf<LDetail>(b) ?? { courseTitle: b.subtitle ?? '', type: '', durationMin: 0 }) }));

  const unsave = (label: string, targetId: string) =>
    remove.mutate(targetId, {
      onSuccess: () => toast.info('Đã bỏ lưu', label),
      onError: (e) => toast.error('Chưa bỏ lưu được', errorMessage(e)),
    });

  const speak = (w: string) => {
    try {
      const u = new SpeechSynthesisUtterance(w);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <>
            Nội dung <span className="mark">đã lưu</span>
          </>
        }
        icon={<Bookmark />}
        description="Câu hỏi, từ vựng và bài học bạn đánh dấu để xem lại sau."
      />
      <Tabs
        variant="pill"
        value={tab}
        onChange={setTab}
        items={[
          { key: 'questions', label: 'Câu hỏi', icon: <FileQuestion />, count: questions.length },
          { key: 'words', label: 'Từ vựng', icon: <BookOpen />, count: words.length },
          { key: 'lessons', label: 'Bài học', icon: <PlayCircle />, count: lessons.length },
        ]}
      />

      {tab === 'questions' &&
        (questions.length === 0 ? (
          <Card hard>
            <EmptyState icon={<FileQuestion />} title="Chưa lưu câu hỏi nào" description="Nhấn biểu tượng đánh dấu khi luyện tập để lưu câu hỏi." action={<Button to="/app/practice">Đi luyện tập</Button>} />
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q, i) => (
              <Card key={q.id} hard padding="sm" className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-300 border-2 border-slate-900 font-display font-extrabold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge tone="indigo" size="xs">
                        {q.part.replace('_', ' ')}
                      </Badge>
                      {q.examType && (
                        <Badge tone="slate" size="xs">
                          {q.examType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{q.stem}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((o) => (
                        <span key={o.key} className={cn('text-[11px] px-2 py-0.5 rounded-md border-2', o.key === q.correctKey ? 'bg-emerald-200 border-slate-900 text-slate-900 font-bold' : 'bg-white border-slate-200 text-slate-600')}>
                          {o.key}. {o.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => unsave('Câu hỏi đã được gỡ khỏi danh sách.', q.id)} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition" title="Bỏ lưu">
                    <BookmarkX className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        ))}

      {tab === 'words' &&
        (words.length === 0 ? (
          <Card hard>
            <EmptyState icon={<BookOpen />} title="Chưa lưu từ nào" description="Nhấn vào từ trong transcript bài học để lưu vào đây." action={<Button to="/app/vocabulary">Kho từ vựng</Button>} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {words.map((w, i) => (
              <Card key={w.id} hard padding="sm" className="animate-fade-up flex items-center gap-3" style={{ animationDelay: `${i * 50}ms` }}>
                <button onClick={() => speak(w.word)} className="w-11 h-11 rounded-xl bg-indigo-600 border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm hover:-translate-y-0.5 transition shrink-0">
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-extrabold text-slate-900 text-lg leading-none">
                    {w.word} <span className="text-[11px] font-mono text-indigo-700 font-normal">{w.ipa}</span>
                  </p>
                  <p className="text-sm text-slate-700 font-semibold truncate mt-1">{w.meaningVi}</p>
                </div>
                <button onClick={() => unsave(`"${w.word}" đã được gỡ.`, w.id)} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition">
                  <BookmarkX className="w-4 h-4" />
                </button>
              </Card>
            ))}
          </div>
        ))}

      {tab === 'lessons' &&
        (lessons.length === 0 ? (
          <Card hard>
            <EmptyState icon={<PlayCircle />} title="Chưa lưu bài học nào" action={<Button to="/app/courses">Xem khoá học</Button>} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lessons.map((lesson, i) => (
              <Card key={lesson.id} hard hover padding="none" className="overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Link to={lesson.link} className="block relative h-32">
                  <Img src={lesson.coverUrl ?? PHOTOS.books} alt={lesson.courseTitle} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
                  <div className="absolute inset-0 bg-slate-900/20" />
                  <span className="absolute top-3 left-3 sticker tilt-1 !py-1 !text-[10px]">{lesson.type}</span>
                  <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-violet-500 border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </span>
                </Link>
                <div className="p-4 border-t-2 border-slate-900">
                  <p className="text-[11px] text-slate-500 truncate font-semibold">{lesson.courseTitle}</p>
                  <p className="font-display font-bold text-slate-900 text-sm truncate">{lesson.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-slate-600 font-bold">{lesson.durationMin} phút</span>
                    <Button size="xs" variant="ghost" leftIcon={<BookmarkX className="w-3.5 h-3.5" />} onClick={() => unsave('Bài học đã được gỡ.', lesson.id)}>
                      Bỏ lưu
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ))}
    </div>
  );
};
