import { badRequest } from '../../core/http';
import { authoredChoice, isAuthored, toExercises, type ExerciseType, type LessonExercise } from './lesson-exercises';

/**
 * Bài tập sau bài dạng văn bản để admin sửa trực tiếp.
 *   ? Yêu cầu
 *   Câu cần xét (có thể nhiều dòng, ô trống viết _____)
 *   * đáp án đúng
 *   - phương án sai
 *   > giải thích
 *   @ lời máy đọc (câu nghe: học viên bấm nghe rồi chọn đáp án)
 * Chỉ câu soạn tay không kèm đoạn văn / ảnh / audio (câu nghe máy đọc thì được) mới sửa dạng chữ; câu đề thật (Part 1/2/6),
 * câu đọc hiểu có đoạn văn và câu tự sinh từ "Kiến thức" giữ nguyên.
 */
const speakOnly = (e: LessonExercise) => !!e.passage?.speak && !e.passage.content && !e.passage.imageUrl && !e.passage.audioUrl;
const editable = (e: LessonExercise) => isAuthored(e) && (!e.passage || speakOnly(e));

export function exercisesToText(v: unknown): { text: string; fixed: number } {
  const all = toExercises(v);
  const text = all
    .filter(editable)
    .map((e) => {
      const opts = [e.options[e.answer], ...e.options.filter((_, i) => i !== e.answer)];
      return [`? ${e.prompt}`, ...(e.passage?.speak ? [`@ ${e.passage.speak}`] : []), ...(e.text ? e.text.split('\n') : []), `* ${opts[0]}`, ...opts.slice(1).map((o) => `- ${o}`), ...(e.explain ? e.explain.split('\n').map((l) => `> ${l}`) : [])].join('\n');
    })
    .join('\n\n');
  return { text, fixed: all.length - all.filter(editable).length };
}

/** Văn bản → câu bài tập (đáp án đúng xáo vị trí cố định theo id); giữ nguyên các câu không sửa dạng chữ được */
export function applyExercisesText(lessonId: string, prev: unknown, text: string): LessonExercise[] {
  const old = toExercises(prev);
  const blocks: { prompt: string; text: string[]; right: string[]; wrong: string[]; explain: string[]; speak: string[] }[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith('?')) return void blocks.push({ prompt: line.slice(1).trim(), text: [], right: [], wrong: [], explain: [], speak: [] });
    const b = blocks.at(-1);
    if (!b) throw badRequest(`Bài tập dòng ${i + 1}: mỗi câu phải bắt đầu bằng dòng "? Yêu cầu"`);
    if (line.startsWith('*')) b.right.push(line.slice(1).trim());
    else if (line.startsWith('- ')) b.wrong.push(line.slice(2).trim());
    else if (line.startsWith('>')) b.explain.push(line.slice(1).trim());
    else if (line.startsWith('@')) b.speak.push(line.slice(1).trim());
    else b.text.push(line);
  });
  const editedType = (i: number): ExerciseType => old.filter(editable)[i]?.type ?? 'grammar-gap';
  const stamp = Date.now().toString(36);
  const parsed = blocks.map((b, i) => {
    const n = i + 1;
    if (!b.prompt) throw badRequest(`Câu ${n}: thiếu yêu cầu sau dấu "?"`);
    if (b.right.length !== 1) throw badRequest(`Câu ${n}: cần đúng 1 đáp án đúng (dòng bắt đầu bằng "*")`);
    if (b.wrong.length < 1) throw badRequest(`Câu ${n}: cần ít nhất 1 phương án sai (dòng bắt đầu bằng "- ")`);
    const options = [b.right[0], ...b.wrong];
    if (new Set(options.map((o) => o.toLowerCase())).size !== options.length) throw badRequest(`Câu ${n}: các phương án bị trùng nhau`);
    const id = `sgk-adm-${lessonId.slice(0, 8)}-${stamp}-${n}`;
    const speak = b.speak.join(' ').trim();
    const was = editedType(i);
    const type: ExerciseType = speak ? (was === 'toeic-p2' ? was : 'listening') : was === 'listening' ? 'grammar-gap' : was;
    return authoredChoice(id, { type, prompt: b.prompt, text: b.text.join('\n') || undefined, options, explain: b.explain.join('\n'), ...(speak ? { passage: { id, content: '', speak } } : {}) });
  });
  return [...parsed, ...old.filter((e) => !editable(e))];
}
