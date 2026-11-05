-- Lớp học thuộc một khoá học: khoá quản lý các lớp của nó, học viên vào lớp được ghi danh khoá
ALTER TABLE "classes" ADD COLUMN "course_id" UUID;
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX "classes_course_id_idx" ON "classes"("course_id");
