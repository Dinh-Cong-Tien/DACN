-- Bài tập sau mỗi bài học (sinh từ kiến thức của bài) và bài kiểm tra cuối chặng
ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "exercises" JSONB;
