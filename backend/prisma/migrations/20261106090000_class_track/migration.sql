-- Lớp học chia theo 3 mục như khoá học của học viên: TOEIC / VSTEP / Tiếng Anh THPT (exam_type giữ để quy đổi điểm)
ALTER TABLE "classes" ADD COLUMN "track" "course_track";
UPDATE "classes" SET "track" = "exam_type"::text::"course_track";
CREATE INDEX "classes_track_idx" ON "classes"("track");
