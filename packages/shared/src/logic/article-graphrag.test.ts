import { describe, it, expect } from 'vitest';
import { buildArticleGraph, globalSearch, leiden, localSearch, modularity, startsWithVowelSound } from './article-graphrag';

describe('GraphRAG mạo từ', () => {
  it('Leiden tách 2 cụm liên kết dày nối bằng 1 cạnh yếu', () => {
    // 2 tam giác (0-1-2) và (3-4-5) nối bằng cạnh 2-3
    const edges: [number, number, number][] = [
      [0, 1, 1], [1, 2, 1], [0, 2, 1],
      [3, 4, 1], [4, 5, 1], [3, 5, 1],
      [2, 3, 1],
    ];
    const part = leiden(6, edges);
    expect(part[0]).toBe(part[1]);
    expect(part[1]).toBe(part[2]);
    expect(part[3]).toBe(part[4]);
    expect(part[4]).toBe(part[5]);
    expect(part[0]).not.toBe(part[3]);
    expect(modularity(6, edges, part)).toBeGreaterThan(0.3);
  });

  it('a / an xét theo ÂM đầu, không theo chữ cái', () => {
    expect(startsWithVowelSound('hour')).toBe(true);
    expect(startsWithVowelSound('university')).toBe(false);
    expect(startsWithVowelSound('MBA')).toBe(true);
    expect(startsWithVowelSound('one')).toBe(false);
    expect(startsWithVowelSound('apple')).toBe(true);
    expect(startsWithVowelSound('ecosystem', '/ˈiːkəʊsɪstəm/')).toBe(true);
  });

  it('trích claim, nhận "đã nhắc ở trước", xét a/an theo từ ngay sau mạo từ', () => {
    const g = buildArticleGraph({
      content: 'Ví dụ:\n\n> I wrote a report. The report was the best report of the year.\n\n> She is an honest teacher.\n\n> We had a busy day at a university, then waited an hour for an important email.',
    })!;
    const phrase = (p: string) => g.claims.find((c) => c.phrase === p);
    expect(phrase('a report')?.rules).toEqual(['A_CONSONANT']);
    expect(phrase('the report')?.rules).toEqual(['THE_ANAPHORA']);
    expect(phrase('the best report')?.rules).toEqual(['THE_SUPERLATIVE']);
    expect(phrase('an honest teacher')?.rules).toEqual(['A_CLASSIFY']);
    expect(phrase('the year')?.rules).toEqual(['THE_CONTEXT']);
    expect(phrase('a busy day')?.rules).toEqual(['A_ADJ']);
    expect(phrase('a university')?.rules).toEqual(['A_YU']);
    expect(phrase('an hour')?.rules).toEqual(['AN_SILENT_H']);
    expect(phrase('an important email')?.rules).toEqual(['AN_ADJ']);
    // đồ thị có cộng đồng + báo cáo, truy vấn trả lời kèm dẫn chứng
    expect(g.communities.length).toBeGreaterThan(0);
    expect(globalSearch(g).points.length).toBeGreaterThan(0);
    const r = localSearch(g, { phrase: 'an honest teacher' });
    expect(r.answer[0]).toContain('honest');
    expect(r.evidence[0].unit.text).toContain('honest teacher');
  });

  it('có lời thoại video thì chỉ lấy kiến thức từ video, không suy từ bảng từ vựng', () => {
    const g = buildArticleGraph({
      content: '> The manager sent a letter.',
      transcript: [{ startMs: 0, en: 'I need an umbrella for the trip.' }, { startMs: 3000, en: 'We have an important meeting every week, and the meeting lasts an hour.' }],
      vocab: [{ word: 'ticket', ipa: '/ˈtɪkɪt/', pos: 'n', meaningVi: 'vé' }],
    })!;
    expect(g.claims.map((c) => c.phrase).sort()).toEqual(['an hour', 'an important meeting', 'an umbrella', 'the meeting', 'the trip']);
    expect(g.textUnits.every((u) => u.source === 'video')).toBe(true);
  });

  it('bỏ câu sai đứng trước "→" và phương án trắc nghiệm', () => {
    const g = buildArticleGraph({ content: '> I have a homework. → I have homework to do.\n\n(A) a book (B) an book (C) the book' });
    expect(g?.claims.some((c) => c.phrase === 'an book')).toBeFalsy();
    expect(g?.claims.some((c) => c.phrase === 'a homework')).toBeFalsy();
  });
});
