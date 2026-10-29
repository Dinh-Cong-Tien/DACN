import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX, FileQuestion, BookOpen, PlayCircle, Volume2, Play } from 'lucide-react';
import { ALL_QUESTIONS, MOCK_COURSES, MOCK_VOCAB } from '@/shared/mocks';
import type { Course, Lesson } from '@/shared/types';
import { cn, getCorrectKey } from '@/shared/utils';
import { useDocumentTitle } from '@/shared/hooks';
import { toast } from '@/shared/stores/uiStore';
import { Badge, Button, Card, EmptyState, PageHeader, Tabs } from '@/shared/components/ui';
import { Img, PHOTOS } from '@/shared/components/media/Img';

interface LessonBookmark {
  course: Course;
  lesson: Lesson;
}

export const StudentBookmarksPage: React.FC = () => {
  useDocumentTitle('Nội dung đã lưu');
  const [tab, setTab] = useState('questions');
  const [questions, setQuestions] = useState(ALL_QUESTIONS.slice(0, 4));
  const [words, setWords] = useState(MOCK_VOCAB.slice(0, 5));
  const [lessons, setLessons] = useState<LessonBookmark[]>(MOCK_COURSES.slice(0, 3).map((course) => ({ course, lesson: course.sections[0].lessons[0] })));

  const unsave = (label: string, fn: () => void) => {
    fn();
    toast.info('Đã bỏ lưu', label);
  };

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
                        {q.partOrSkill.replace('_', ' ')}
                      </Badge>
                      <Badge tone="slate" size="xs">
                        {q.examType}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{q.stem}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.options.map((o) => (
                        <span key={o.key} className={cn('text-[11px] px-2 py-0.5 rounded-md border-2', o.key === getCorrectKey(q) ? 'bg-emerald-200 border-slate-900 text-slate-900 font-bold' : 'bg-white border-slate-200 text-slate-600')}>
                          {o.key}. {o.text}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => unsave('Câu hỏi đã được gỡ khỏi danh sách.', () => setQuestions((s) => s.filter((x) => x.id !== q.id)))} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition" title="Bỏ lưu">
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
                <button onClick={() => unsave(`"${w.word}" đã được gỡ.`, () => setWords((s) => s.filter((x) => x.id !== w.id)))} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition">
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
            {lessons.map(({ course, lesson }, i) => (
              <Card key={lesson.id + course.id} hard hover padding="none" className="overflow-hidden animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <Link to={`/app/courses/${course.id}/lessons/${lesson.id}`} className="block relative h-32">
                  <Img src={course.coverUrl ?? PHOTOS.books} alt={course.title} wrapperClass="absolute inset-0" fallbackClass="bg-indigo-200" />
                  <div className="absolute inset-0 bg-slate-900/20" />
                  <span className="absolute top-3 left-3 sticker tilt-1 !py-1 !text-[10px]">{lesson.type}</span>
                  <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-violet-500 border-2 border-slate-900 text-white flex items-center justify-center shadow-hard-sm">
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  </span>
                </Link>
                <div className="p-4 border-t-2 border-slate-900">
                  <p className="text-[11px] text-slate-500 truncate font-semibold">{course.title}</p>
                  <p className="font-display font-bold text-slate-900 text-sm truncate">{lesson.title}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-slate-600 font-bold">{lesson.durationMin} phút</span>
                    <Button size="xs" variant="ghost" leftIcon={<BookmarkX className="w-3.5 h-3.5" />} onClick={() => unsave('Bài học đã được gỡ.', () => setLessons((s) => s.filter((x) => x.lesson.id !== lesson.id || x.course.id !== course.id)))}>
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
