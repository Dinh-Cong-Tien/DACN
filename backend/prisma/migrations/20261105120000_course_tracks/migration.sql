-- Khoá học chia theo 3 mục chính (TOEIC / VSTEP / Tiếng Anh THPT) và nhóm trong mục
CREATE TYPE "course_track" AS ENUM ('TOEIC', 'VSTEP', 'THPT');
ALTER TABLE "courses" ADD COLUMN "track" "course_track";
ALTER TABLE "courses" ADD COLUMN "track_group" VARCHAR(60);
ALTER TABLE "courses" ADD COLUMN "track_order" SMALLINT NOT NULL DEFAULT 0;
CREATE INDEX "courses_track_idx" ON "courses"("track");
