import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight, History, Lock, RotateCcw, Volume2, X, BookmarkPlus, FileText, HelpCircle, Video } from 'lucide-react';
import type { Course, DictionaryEntry, Lesson } from '@/shared/types';
import { LessonKnowledge } from './LessonKnowledge';
import { catalogApi } from '@/shared/api/catalog';
import { api, errorMessage, tokenStore } from '@/shared/api/client';
import { cn, formatClock } from '@/shared/utils';
import { embedSrc, useWatchPosition, videoSource } from './useWatchPosition';
import { Badge, Button, Card, ProgressBar } from '@/shared/components/ui';
import { toast } from '@/shared/stores/uiStore';

interface LessonEngineProps {
  course: Course;
  lesson: Lesson;
  onSelectLesson: (lessonId: string) => void;
  onComplete?: (lessonId: string) => void;
}

const LESSON_ICON = { VIDEO: Video, READING: FileText, QUIZ: HelpCircle } as const;

type WordEntry = DictionaryEntry & { id?: string };

/** Tra từ trong kho words; không có thì trả mục rỗng để popover báo chưa có nghĩa */
const lookupWord = async (word: string): Promise<WordEntry> => {
  const key = word.toLowerCase();
  const hits = (await catalogApi.dictionary(key, 5).catch(() => [])) as WordEntry[];
  return hits.find((h) => h.word.toLowerCase() === key) ?? hits[0] ?? { word: key, ipa: '', pos: '', meaningVi: 'Chưa có trong từ điển của OrbiLingo.', meaningEn: '', example: '' };
};

/** Popover từ điển 1 chạm */
const DictionaryPopover: React.FC<{ entry: WordEntry; x: number; y: number; onClose: () => void }> = ({ entry, x, y, onClose }) => {
  const speak = () => {
    try {
      const u = new SpeechSynthesisUtterance(entry.word);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  };
  return (
    <div className="fixed z-[90] w-72 bg-white rounded-2xl border-2 border-slate-900 shadow-hard p-4 animate-scale-in" style={{ left: Math.min(x, window.innerWidth - 300), top: y + 12 }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-black text-slate-900 text-lg leading-tight">{entry.word}</p>
          {(entry.ipa || entry.pos) && (
            <p className="text-xs text-indigo-600 font-mono mt-0.5">
              {entry.ipa}
              {entry.ipa && entry.pos ? ' · ' : ''}
              <span className="italic text-slate-500">{entry.pos}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={speak} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50" title="Phát âm">
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-2">{entry.meaningVi}</p>
      <p className="text-xs text-slate-500 mt-0.5">{entry.meaningEn}</p>
      {entry.example && <p className="text-xs text-slate-600 italic mt-2 pl-2 border-l-2 border-indigo-200">"{entry.example}"</p>}
      <Button
        size="xs"
        variant="soft"
        fullWidth
        className="mt-3"
        leftIcon={<BookmarkPlus className="w-3.5 h-3.5" />}
        disabled={!entry.id}
        onClick={() => {
          if (!tokenStore.get()) {
            toast.info('Đăng nhập để lưu từ', 'Từ đã lưu sẽ xuất hiện trong lịch ôn tập của bạn.');
            return;
          }
          api
            .post('/learner/vocab/learn', { wordIds: [entry.id] })
            .then(() => toast.success('Đã thêm vào sổ từ', `"${entry.word}" sẽ xuất hiện trong lịch ôn SRS.`))
            .catch((e) => toast.error('Chưa lưu được từ', errorMessage(e)))
            .finally(onClose);
        }}
      >
        Lưu vào sổ từ vựng
      </Button>
    </div>
  );
};

/** Engine bài học: video (không hiện script) + kiến thức trong bài (ngữ pháp, từ vựng, mệnh đề, cây giới từ) + từ điển popover + mục lục khoá học */
export const LessonEngine: React.FC<LessonEngineProps> = ({ course, lesson, onSelectLesson, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [popover, setPopover] = useState<{ entry: WordEntry; x: number; y: number } | null>(null);
  const [done, setDone] = useState(lesson.isCompleted);

  useEffect(() => {
    setDone(lesson.isCompleted);
    setPopover(null);
  }, [lesson.id, lesson.isCompleted]);

  const onWordClick = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const clean = word.replace(/[^a-zA-Z'-]/g, '');
    if (!clean) return;
    const { clientX: x, clientY: y } = e;
    void lookupWord(clean).then((entry) => setPopover({ entry, x, y }));
  };

  const markDone = () => {
    if (done) return;
    setDone(true);
    onComplete?.(lesson.id);
    toast.success('Hoàn thành bài học!', 'Bài tiếp theo đã được mở khoá.');
  };
  const source = useMemo(() => (lesson.type === 'VIDEO' && lesson.videoUrl ? videoSource(lesson.videoUrl) : null), [lesson.type, lesson.videoUrl]);
  // vị trí đã xem lần trước — chốt 1 lần khi có link video để iframe không bị nạp lại
  const resumeAt = useMemo(() => (source ? Math.floor(lesson.lastPositionSec ?? 0) : 0), [source]); // eslint-disable-line react-hooks/exhaustive-deps
  const watch = useWatchPosition({ lessonId: lesson.id, source, resumeAt, iframeRef, videoRef, onEnded: markDone });

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  const next = allLessons[idx + 1];
  const completedCount = allLessons.filter((l) => l.isCompleted || l.id === (done ? lesson.id : '')).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-5 min-w-0">
        {/* Player */}
        <Card padding="none" className="overflow-hidden animate-scale-in">
          {source && source.kind !== 'file' ? (
            <div className="relative bg-black aspect-video">
              <iframe ref={iframeRef} src={embedSrc(source, resumeAt)} title={lesson.title} className="w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
          ) : source ? (
            <div className="relative bg-black aspect-video">
              <video ref={videoRef} src={source.url} controls className="w-full h-full" controlsList="nodownload" {...watch.videoProps} />
            </div>
          ) : lesson.type === 'READING' ? (
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <BookOpen className="w-4 h-4" /> Bài đọc lý thuyết
              </div>
              {(lesson.content ?? '').split(/\n{2,}/).map((para, k) => (
                <p key={k} className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <HelpCircle className="w-10 h-10 text-indigo-500 mx-auto animate-float" />
              <p className="font-bold text-slate-900">Bài kiểm tra củng cố</p>
              <p className="text-sm text-slate-500">Hoàn thành bài quiz ngắn để khoá kiến thức vừa học.</p>
              <Button to="/app/practice/session/PART_5" rightIcon={<ChevronRight className="w-4 h-4" />}>
                Bắt đầu làm bài
              </Button>
            </div>
          )}
          {source && resumeAt > 0 && !watch.restarted && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-amber-50 border-t border-amber-100 text-sm">
              <span className="inline-flex items-center gap-2 text-amber-900">
                <History className="w-4 h-4" /> Bạn đã học tới <b>{formatClock(resumeAt)}</b> — video đang phát tiếp từ đây
              </span>
              <button type="button" onClick={() => watch.seek(0)} className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline">
                <RotateCcw className="w-3.5 h-3.5" /> Xem lại từ đầu
              </button>
            </div>
          )}
          <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge tone="indigo" size="xs">
                  {lesson.type}
                </Badge>
                <span className="text-[11px] text-slate-400">{lesson.durationMin} phút</span>
                {done && (
                  <Badge tone="emerald" size="xs" icon={<CheckCircle2 className="w-3 h-3" />}>
                    Đã hoàn thành
                  </Badge>
                )}
              </div>
              <h2 className="font-black text-slate-900 text-lg">{lesson.title}</h2>
              <p className="text-xs text-slate-500">{course.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {!done && (
                <Button variant="success" size="sm" leftIcon={<CheckCircle2 className="w-4 h-4" />} onClick={markDone}>
                  Đánh dấu hoàn thành
                </Button>
              )}
              {next && (
                <Button size="sm" variant={done ? 'primary' : 'outline'} rightIcon={<ChevronRight className="w-4 h-4" />} onClick={() => onSelectLesson(next.id)}>
                  Bài tiếp
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Kiến thức trong bài (thay cho script) */}
        {lesson.knowledge && <LessonKnowledge knowledge={lesson.knowledge} onWord={onWordClick} />}
      </div>

      {/* Course outline */}
      <aside className="space-y-4">
        <Card padding="sm" className="animate-slide-in-right">
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-slate-900 text-sm">Nội dung khoá học</p>
            <span className="text-[11px] font-bold text-slate-500">
              {completedCount}/{allLessons.length}
            </span>
          </div>
          <ProgressBar value={(completedCount / allLessons.length) * 100} size="sm" tone="emerald" />
        </Card>
        <div className="space-y-3">
          {course.sections.map((sec, si) => (
            <Card key={sec.id} padding="none" className="overflow-hidden animate-fade-up" style={{ animationDelay: `${si * 80}ms` }}>
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">{sec.title}</p>
              </div>
              <ul>
                {sec.lessons.map((l) => {
                  const Icon = LESSON_ICON[l.type];
                  const isActive = l.id === lesson.id;
                  const isDone = l.isCompleted || (done && l.id === lesson.id);
                  return (
                    <li key={l.id}>
                      <button
                        disabled={l.isLocked}
                        onClick={() => onSelectLesson(l.id)}
                        className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2', isActive ? 'bg-indigo-50/70 border-indigo-600' : 'border-transparent hover:bg-slate-50', l.isLocked && 'opacity-50 cursor-not-allowed')}
                      >
                        <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', isDone ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500')}>
                          {l.isLocked ? <Lock className="w-3.5 h-3.5" /> : isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={cn('block text-sm truncate', isActive ? 'font-bold text-indigo-900' : 'font-medium text-slate-700')}>{l.title}</span>
                          <span className="block text-[11px] text-slate-400">
                            Bài {allLessons.indexOf(l) + 1} · {l.durationMin} phút
                            {!isDone && (isActive ? watch.position : l.lastPositionSec ?? 0) >= 5 && <span className="text-amber-700 font-semibold"> · đã học tới {formatClock(isActive ? watch.position : l.lastPositionSec ?? 0)}</span>}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ))}
        </div>
      </aside>

      {popover && (
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setPopover(null)} />
          <DictionaryPopover {...popover} onClose={() => setPopover(null)} />
        </>
      )}
    </div>
  );
};
