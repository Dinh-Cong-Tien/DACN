import React, { useEffect, useMemo, useState } from 'react';
import { BookText, Languages, ListTree, Network, Volume2 } from 'lucide-react';
import type { KnowledgeNode, LessonKnowledge as Knowledge } from '@/shared/types';
import { Card, Tabs } from '@/shared/components/ui';
import { cn } from '@/shared/utils';
import './lesson-knowledge.css';

type Key = keyof Knowledge;
const TABS: { key: Key; label: string; icon: React.ReactNode }[] = [
  { key: 'grammar', label: 'Ngữ pháp', icon: <BookText /> },
  { key: 'vocab', label: 'Từ vựng', icon: <Languages /> },
  { key: 'clauses', label: 'Mệnh đề', icon: <ListTree /> },
  { key: 'prepositions', label: 'Giới từ', icon: <Network /> },
];

const speak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  } catch {
    /* trình duyệt không hỗ trợ */
  }
};

/** Một node của cây giới từ: bấm node có con để mở / thu gọn, bấm node bất kỳ để xem nghĩa + ví dụ */
const TreeNode: React.FC<{ node: KnowledgeNode; path: string; open: Set<string>; selected: string | null; onToggle: (p: string, n: KnowledgeNode) => void }> = ({ node, path, open, selected, onToggle }) => {
  const kids = node.children ?? [];
  const expanded = open.has(path);
  return (
    <li>
      <button
        type="button"
        className={cn('kt-node', kids.length > 0 && 'kt-node--parent', path === selected && 'kt-node--selected')}
        aria-expanded={kids.length ? expanded : undefined}
        onClick={() => onToggle(path, node)}
        title={node.meaningVi}
      >
        <span className="kt-node__label">{node.label}</span>
        {kids.length > 0 && <span className="kt-node__count">{expanded ? '−' : kids.length}</span>}
      </button>
      {kids.length > 0 && expanded && (
        <ul>
          {kids.map((c, i) => (
            <TreeNode key={i} node={c} path={`${path}.${i}`} open={open} selected={selected} onToggle={onToggle} />
          ))}
        </ul>
      )}
    </li>
  );
};

const PrepositionTree: React.FC<{ roots: KnowledgeNode[] }> = ({ roots }) => {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [sel, setSel] = useState<{ path: string; node: KnowledgeNode } | null>(null);
  const toggle = (p: string, n: KnowledgeNode) => {
    setSel({ path: p, node: n });
    if (!n.children?.length) return;
    setOpen((s) => {
      const next = new Set(s);
      // thu gọn node cha → thu luôn các nhánh con bên dưới
      if (next.has(p)) [...next].forEach((k) => (k === p || k.startsWith(p + '.')) && next.delete(k));
      else next.add(p);
      return next;
    });
  };
  const allPaths = useMemo(() => {
    const out: string[] = [];
    const walk = (n: KnowledgeNode, p: string) => n.children?.length && (out.push(p), n.children.forEach((c, i) => walk(c, `${p}.${i}`)));
    roots.forEach((r, i) => walk(r, String(i)));
    return out;
  }, [roots]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-500">Bấm vào giới từ để xem các từ đi kèm; bấm lại để thu gọn.</p>
        <div className="flex gap-2">
          <button type="button" className="text-xs font-bold text-indigo-600 hover:underline" onClick={() => setOpen(new Set(allPaths))}>
            Mở tất cả
          </button>
          <button type="button" className="text-xs font-bold text-slate-500 hover:underline" onClick={() => setOpen(new Set())}>
            Thu gọn
          </button>
        </div>
      </div>
      <div className="kt-scroll">
        {roots.map((r, i) => (
          <ul key={i} className="kt-tree">
            <TreeNode node={r} path={String(i)} open={open} selected={sel?.path ?? null} onToggle={toggle} />
          </ul>
        ))}
      </div>
      {sel && (sel.node.meaningVi || sel.node.example) && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3" aria-live="polite">
          <p className="font-bold text-slate-900">
            {sel.node.label}
            {sel.node.meaningVi && <span className="font-medium text-slate-600"> — {sel.node.meaningVi}</span>}
          </p>
          {sel.node.example && <p className="mt-1 text-sm italic text-slate-600">"{sel.node.example}"</p>}
        </div>
      )}
    </div>
  );
};

/** Kiến thức trong video: ngữ pháp, từ vựng, mệnh đề, cây giới từ — hiện ngay dưới player */
export const LessonKnowledge: React.FC<{ knowledge: Knowledge; onWord?: (e: React.MouseEvent, word: string) => void }> = ({ knowledge, onWord }) => {
  const tabs = TABS.filter((t) => knowledge[t.key].length > 0);
  const [tab, setTab] = useState<Key>(tabs[0]?.key ?? 'grammar');
  useEffect(() => setTab(tabs[0]?.key ?? 'grammar'), [knowledge]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!tabs.length) return null;

  return (
    <Card padding="none" className="animate-fade-up overflow-hidden">
      <div className="px-5 pt-4">
        <p className="font-bold text-slate-900 text-sm">Kiến thức trong bài</p>
        <p className="text-[11px] text-slate-500">Vừa xem video vừa ôn lại ngữ pháp, từ vựng và cấu trúc được dùng trong bài</p>
      </div>
      <Tabs className="px-3 mt-2" value={tab} onChange={(k) => setTab(k as Key)} items={tabs.map((t) => ({ key: t.key, label: t.label, icon: t.icon, count: knowledge[t.key].length }))} />
      <div className="p-5">
        {tab === 'grammar' && (
          <ul className="space-y-3">
            {knowledge.grammar.map((g, i) => (
              <li key={i} className="rounded-xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{g.title}</p>
                {g.formula && <p className="mt-2 inline-block rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-xs text-white">{g.formula}</p>}
                {g.note && <p className="mt-2 text-sm text-slate-600">{g.note}</p>}
                {g.example && <p className="mt-2 border-l-2 border-indigo-200 pl-3 text-sm italic text-slate-700">{g.example}</p>}
              </li>
            ))}
          </ul>
        )}
        {tab === 'vocab' && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {knowledge.vocab.map((v, i) => (
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
            {knowledge.clauses.map((c, i) => (
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
        {tab === 'prepositions' && <PrepositionTree roots={knowledge.prepositions} />}
      </div>
    </Card>
  );
};
