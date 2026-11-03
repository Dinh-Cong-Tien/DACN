-- Sửa chất lượng dữ liệu trên CSDL đang chạy (khớp với các sửa đổi trong seed). Chạy trong 1 transaction.
-- psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/seed/fix-data-quality.sql
SET client_encoding = 'UTF8';
BEGIN;

-- 1. Ngữ pháp: bỏ phương án chữ rỗng (không phải đáp án) rồi đánh lại khoá A, B, C…
WITH bad AS (
  SELECT q.id, q.correct_answer->'keys'->>0 AS ans,
         (SELECT jsonb_agg(o ORDER BY ord) FROM jsonb_array_elements(q.options) WITH ORDINALITY x(o, ord) WHERE btrim(o->>'text') <> '') AS kept
  FROM questions q
  WHERE q.skill = 'GRAMMAR' AND EXISTS (SELECT 1 FROM jsonb_array_elements(q.options) o WHERE btrim(coalesce(o->>'text','')) = '')
), rekey AS (
  SELECT b.id,
         (SELECT jsonb_agg(jsonb_build_object('key', substr('ABCDEF', i::int, 1), 'text', o->>'text') ORDER BY i) FROM jsonb_array_elements(b.kept) WITH ORDINALITY y(o, i)) AS options,
         (SELECT substr('ABCDEF', i::int, 1) FROM jsonb_array_elements(b.kept) WITH ORDINALITY y(o, i) WHERE o->>'key' = b.ans) AS ans
  FROM bad b
)
UPDATE questions q SET options = r.options, correct_answer = jsonb_build_object('keys', jsonb_build_array(r.ans)), updated_at = now()
FROM rekey r WHERE q.id = r.id AND r.ans IS NOT NULL;

-- 2. Ngữ pháp trùng hoàn toàn (cùng đề + phương án + đáp án): giữ 1 câu, gộp nhãn chủ điểm, xoá bản thừa
CREATE TEMP TABLE dup_groups AS
SELECT (array_agg(id ORDER BY created_at, id))[1] AS keep_id, array_agg(id ORDER BY created_at, id) AS ids
FROM questions WHERE skill = 'GRAMMAR' AND deleted_at IS NULL AND passage_id IS NULL
GROUP BY stem, options::text, correct_answer::text HAVING count(*) > 1;
UPDATE questions q SET tag_ids = ARRAY(SELECT DISTINCT t FROM questions x, unnest(x.tag_ids) t WHERE x.id = ANY (d.ids)), updated_at = now()
FROM dup_groups d WHERE q.id = d.keep_id;
DELETE FROM questions q USING dup_groups d
WHERE q.id = ANY (d.ids) AND q.id <> d.keep_id
  AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.question_id = q.id);

-- 3. Nhãn kỹ năng cho câu Viết / Nói TOEIC và câu VSTEP mẫu
INSERT INTO skill_tags (slug, name, skill, exam_type, updated_at) VALUES
  ('toeic-writing', 'TOEIC Writing', 'WRITING', 'TOEIC', now()),
  ('toeic-speaking', 'TOEIC Speaking', 'SPEAKING', 'TOEIC', now()),
  ('vstep-listening', 'VSTEP Listening', 'LISTENING', 'VSTEP', now()),
  ('vstep-reading', 'VSTEP Reading', 'READING', 'VSTEP', now()),
  ('vstep-writing', 'VSTEP Writing', 'WRITING', 'VSTEP', now()),
  ('vstep-speaking', 'VSTEP Speaking', 'SPEAKING', 'VSTEP', now())
ON CONFLICT (slug) DO NOTHING;
UPDATE questions q SET tag_ids = ARRAY[(SELECT id FROM skill_tags WHERE slug = lower(q.exam_type::text) || '-' || lower(q.skill::text))], updated_at = now()
WHERE cardinality(q.tag_ids) = 0 AND (q.exam_type = 'VSTEP' OR q.skill IN ('WRITING', 'SPEAKING'));

-- 4. Đoạn VSTEP mẫu: tiêu đề + thứ tự câu trong đoạn
UPDATE passages p SET title = 'VSTEP ' || CASE WHEN p.part::text LIKE 'VSTEP_L%' THEN 'Listening' ELSE 'Reading' END || ' — ' || replace(p.part::text, 'VSTEP_', ''), updated_at = now()
WHERE (p.title IS NULL OR btrim(p.title) = '') AND p.exam_type = 'VSTEP';
UPDATE questions q SET order_in_passage = r.rn
FROM (SELECT id, row_number() OVER (PARTITION BY passage_id ORDER BY created_at, id) rn FROM questions WHERE passage_id IS NOT NULL AND order_in_passage IS NULL) r
WHERE q.id = r.id;

-- 5. Lớp thuộc bộ môn cùng kỳ thi
UPDATE classes c SET department_id = (SELECT id FROM departments d WHERE d.exam_type = c.exam_type AND d.deleted_at IS NULL ORDER BY d.code LIMIT 1), updated_at = now()
FROM departments d WHERE d.id = c.department_id AND d.exam_type <> c.exam_type;

-- 6. IPA thống nhất dạng /…/
UPDATE words SET ipa_uk = '/' || btrim(ipa_uk, '/ ') || '/' WHERE ipa_uk IS NOT NULL AND ipa_uk !~ '^/.+/$' AND btrim(ipa_uk, '/ ') <> '';
UPDATE words SET ipa_us = '/' || btrim(ipa_us, '/ ') || '/' WHERE ipa_us IS NOT NULL AND ipa_us !~ '^/.+/$' AND btrim(ipa_us, '/ ') <> '';

-- 7. Bài học rỗng (video không có link, bài đọc không có nội dung) → nháp; tính lại số bài và thời lượng khoá
UPDATE lessons SET status = 'DRAFT', updated_at = now()
WHERE deleted_at IS NULL AND status = 'PUBLISHED' AND ((type = 'VIDEO' AND video_url IS NULL) OR (type = 'READING' AND content_md IS NULL AND transcript IS NULL));
UPDATE courses c SET
  lessons_count = (SELECT count(*) FROM lessons l JOIN course_sections s ON s.id = l.section_id WHERE s.course_id = c.id AND l.deleted_at IS NULL AND l.status = 'PUBLISHED'),
  duration_min  = (SELECT coalesce(sum(l.duration_min), 0) FROM lessons l JOIN course_sections s ON s.id = l.section_id WHERE s.course_id = c.id AND l.deleted_at IS NULL AND l.status = 'PUBLISHED'),
  updated_at = now();

-- 8. Đếm lại số câu theo nhãn
UPDATE skill_tags t SET questions_count = (SELECT count(*) FROM questions q WHERE t.id = ANY (q.tag_ids) AND q.deleted_at IS NULL);

COMMIT;
REFRESH MATERIALIZED VIEW mv_question_stats;

-- 9. Câu không xác định được đáp án / sai dạng đề → ARCHIVED (ẩn khỏi luyện tập, không xoá, khôi phục được)
BEGIN;
UPDATE questions q SET status = 'ARCHIVED', review_note = 'Tự động lưu trữ: phương án trùng chữ, không xác định được đáp án (dữ liệu nguồn mất gạch chân / lỗi nguồn)', updated_at = now()
WHERE q.deleted_at IS NULL AND q.status = 'PUBLISHED' AND q.type = 'SINGLE_CHOICE' AND q.source = 'IMPORT' AND q.skill IN ('GRAMMAR', 'READING')
  AND (SELECT count(DISTINCT lower(btrim(o->>'text'))) FROM jsonb_array_elements(q.options) o) < jsonb_array_length(q.options)
  AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.question_id = q.id);
UPDATE questions q SET status = 'ARCHIVED', review_note = 'Tự động lưu trữ: bài đọc phổ thông 2–3 phương án, không đúng dạng TOEIC Part 7', updated_at = now()
WHERE q.deleted_at IS NULL AND q.status = 'PUBLISHED' AND q.part = 'TOEIC_P7' AND q.source = 'IMPORT' AND jsonb_array_length(q.options) <> 4
  AND NOT EXISTS (SELECT 1 FROM mock_test_questions m WHERE m.question_id = q.id);
-- Đoạn văn không còn câu nào đang dùng → lưu trữ theo
UPDATE passages p SET status = 'ARCHIVED', updated_at = now()
WHERE p.deleted_at IS NULL AND p.purpose = 'EXAM' AND p.status = 'PUBLISHED'
  AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.passage_id = p.id AND q.deleted_at IS NULL AND q.status = 'PUBLISHED');
UPDATE skill_tags t SET questions_count = (SELECT count(*) FROM questions q WHERE t.id = ANY (q.tag_ids) AND q.deleted_at IS NULL);
COMMIT;
REFRESH MATERIALIZED VIEW mv_question_stats;
