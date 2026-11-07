import React, { useEffect, useState } from 'react';
import { AudioLines, BookText, Languages, Lightbulb, ListTree, MessageSquareQuote, Quote, Volume2 } from 'lucide-react';
import type { ArticleGraphIndex } from '@toeic-vstep/shared';
import type { KnowledgePoint, LessonKnowledge as Knowledge } from '@/shared/types';
import { Card, Tabs } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import { ArticleGraph } from './ArticleGraph';

type Key = keyof Knowledge;
const TABS: { key: Key; label: string; icon: React.ReactNode }[] = [
  { key: 'grammar', label: 'Ngữ pháp', icon: <BookText /> },
  { key: 'pronunciation', label: 'Phát âm', icon: <AudioLines /> },
  { key: 'phrases', label: 'Mẫu câu', icon: <MessageSquareQuote /> },
  { key: 'vocab', label: 'Từ vựng', icon: <Languages /> },
  { key: 'clauses', label: 'Mệnh đề', icon: <Quote /> },
  { key: 'articles', label: 'Mạo từ', icon: <ListTree /> },
  { key: 'tips', label: 'Kỹ năng', icon: <Lightbulb /> },
];
const POINT_TABS: Key[] = ['grammar', 'pronunciation', 'phrases', 'tips'];

const speak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch {
    /* trình duyệt không hỗ trợ */
  }
};

/** Số mục của từng tab — tab Mạo từ lấy từ đồ thị GraphRAG (số cụm khác nhau trong bài) */
const sizeOf = (k: Knowledge | undefined, graph: ArticleGraphIndex | undefined, key: Key) =>
  key === 'articles' ? new Set(graph?.claims.map((c) => c.phrase.toLowerCase())).size : (k?.[key] ?? []).length;

/** Kiến thức trong bài: ngữ pháp, từ vựng, mệnh đề, mạo từ (GraphRAG) — hiện ngay dưới player / bài giảng */
export const LessonKnowledge: React.FC<{ knowledge?: Knowledge; articleGraph?: ArticleGraphIndex; onWord?: (e: React.MouseEvent, word: string) => void }> = ({ knowledge, articleGraph, onWord }) => {
  const tabs = TABS.filter((t) => sizeOf(knowledge, articleGraph, t.key) > 0);
  const [tab, setTab] = useState<Key>(tabs[0]?.key ?? 'grammar');
  useEffect(() => setTab(tabs[0]?.key ?? 'grammar'), [knowledge, articleGraph]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!tabs.length) return null;

  return (
    <Card padding="none" className="animate-fade-up overflow-hidden">
      <div className="px-5 pt-4">
        <p className="font-bold text-slate-900 text-sm">Kiến thức trong bài</p>
        <p className="text-[11px] text-slate-500">Ôn lại ngữ pháp, phát âm, từ vựng và mẫu câu được dùng trong bài</p>
      </div>
      <Tabs className="px-3 mt-2" value={tab} onChange={(k) => setTab(k as Key)} items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon, count: sizeOf(knowledge, articleGraph, t.key) }))} />
      <div className="p-5">
        {POINT_TABS.includes(tab) && (
          <ul className="space-y-3">
            {((knowledge?.[tab] ?? []) as KnowledgePoint[]).map((g, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{g.title}</p>
                {g.formula && <p className="mt-2 inline-block rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs text-white">{g.formula}</p>}
                {g.note && <p className="mt-2 text-sm text-slate-600">{g.note}</p>}
                {g.example && (
                  <div className="mt-2 flex items-start gap-2 border-l-2 border-indigo-200 pl-3">
                    <p className="flex-1 text-sm italic text-slate-700">{g.example}</p>
                    {tab === 'pronunciation' && (
                      <button type="button" className="rounded-lg p-1 text-indigo-600 hover:bg-indigo-50" onClick={() => speak(g.example!.replace(/\/[^/]*\//g, ''))} aria-label={`Nghe ${g.example}`}>
                        <Volume2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {tab === 'vocab' && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {(knowledge?.vocab ?? []).map((v, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="text-left" onClick={(e) => onWord?.(e, v.word)} title="Tra từ điển / lưu vào sổ từ">
                    <span className="font-black text-slate-900 hover:text-indigo-700">{v.word}</span>
                    {(v.ipa || v.pos) && (
                      <span className="ml-2 font-mono text-xs text-indigo-600">
                        {v.ipa} {v.pos && <i className="text-slate-500">{v.pos}</i>}
                      </span>
                    )}
                  </button>
                  <button type="button" className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50" onClick={() => speak(v.word)} aria-label={`Phát âm ${v.word}`}>
                    <Volume2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-700">{v.meaningVi}</p>
                {v.example && <p className="mt-1 text-xs italic text-slate-500">{v.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'clauses' && (
          <ul className="space-y-3">
            {(knowledge?.clauses ?? []).map((c, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{c.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.markers.map((m) => (
                    <span key={m} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                      {m}
                    </span>
                  ))}
                </div>
                {c.note && <p className="mt-2 text-sm text-slate-600">{c.note}</p>}
                {c.example && <p className="mt-2 border-l-2 border-indigo-200 pl-3 text-sm italic text-slate-700">{c.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'articles' && articleGraph && <ArticleGraph graph={articleGraph} />}
      </div>
    </Card>
  );
};
