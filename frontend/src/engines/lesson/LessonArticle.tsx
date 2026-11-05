import React from 'react';
import './lesson-article.css';

/**
 * Nội dung bài học viết (lessons.content_md) — Markdown rút gọn, dựng thành phần tử React (không dùng innerHTML):
 * ## / ### tiêu đề · đoạn văn · "- " danh sách · "1. " danh sách số · "> " ô ví dụ / lưu ý · bảng "| a | b |"
 * · **đậm** · *nghiêng* · `mã`. Nội dung tiếng Anh trong `…` / ví dụ vẫn theo dõi được bởi tầng dịch (chỉ chữ tiếng Việt được dịch).
 */
type Block =
  | { k: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { k: 'ul' | 'ol'; items: string[] }
  | { k: 'table'; head: string[]; rows: string[][] };

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  const out: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push({ k: 'p', text: para.join(' ') });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = /^(#{2,3})\s+(.*)$/.exec(t))) {
      flush();
      out.push({ k: m[1].length === 2 ? 'h2' : 'h3', text: m[2] });
    } else if (/^[-*]\s+/.test(t) || /^\d+[.)]\s+/.test(t)) {
      flush();
      const ordered = /^\d+[.)]\s+/.test(t);
      const items: string[] = [];
      for (; i < lines.length; i++) {
        const x = lines[i].trim();
        const mm = ordered ? /^\d+[.)]\s+(.*)$/.exec(x) : /^[-*]\s+(.*)$/.exec(x);
        if (!mm) break;
        items.push(mm[1]);
      }
      i--;
      out.push({ k: ordered ? 'ol' : 'ul', items });
    } else if (t.startsWith('>')) {
      flush();
      const q: string[] = [];
      for (; i < lines.length && lines[i].trim().startsWith('>'); i++) q.push(lines[i].trim().replace(/^>\s?/, ''));
      i--;
      out.push({ k: 'quote', text: q.join('\n') });
    } else if (t.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].trim().startsWith('|'); i++) {
        const cells = lines[i].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
        if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // dòng kẻ |---|
        rows.push(cells);
      }
      i--;
      if (rows.length) out.push({ k: 'table', head: rows[0], rows: rows.slice(1) });
    } else para.push(t);
  }
  flush();
  return out;
}

/** **đậm**, *nghiêng*, `mã` trong một dòng */
function inline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g);
  return parts.map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(p)) return <code key={i} className="la-code">{p.slice(1, -1)}</code>;
    if (/^\*[^*\s][^*]*\*$/.test(p)) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
}

export const LessonArticle: React.FC<{ markdown: string }> = ({ markdown }) => (
  <article className="lesson-article">
    {parse(markdown).map((b, i) => {
      switch (b.k) {
        case 'h2':
          return <h2 key={i}>{inline(b.text)}</h2>;
        case 'h3':
          return <h3 key={i}>{inline(b.text)}</h3>;
        case 'p':
          return <p key={i}>{inline(b.text)}</p>;
        case 'quote':
          return (
            <blockquote key={i}>
              {b.text.split('\n').map((l, j) => (
                <p key={j}>{inline(l)}</p>
              ))}
            </blockquote>
          );
        case 'ul':
        case 'ol': {
          const Tag = b.k;
          return (
            <Tag key={i}>
              {b.items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </Tag>
          );
        }
        case 'table':
          return (
            <div key={i} className="la-table">
              <table>
                <thead>
                  <tr>
                    {b.head.map((h, j) => (
                      <th key={j}>{inline(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.map((r, j) => (
                    <tr key={j}>
                      {r.map((c, k) => (
                        <td key={k}>{inline(c)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
      }
    })}
  </article>
);
