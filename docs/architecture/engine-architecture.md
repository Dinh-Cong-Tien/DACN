# Reusable UI Engines (frontend/src/engines)

Hệ thống chỉ có 5 engine UI dùng chung, tái sử dụng qua data props/config — không tạo component riêng cho từng Part TOEIC hay Skill VSTEP.

| Engine | File | Dùng cho | Props chính |
|---|---|---|---|
| **ExamRunner** | `exam/ExamRunner.tsx` | Thi thử Full/Part Test (focus mode, đếm ngược, auto-submit, bảng câu hỏi, cờ đánh dấu, audio 1 lần không tua, phím tắt) | `test: IMockTest`, `onSubmitExam(result)`, `onExit` |
| **PracticeEngine** | `practice/PracticeEngine.tsx` | Luyện tập từng Part/Skill, ôn lỗi sai, luyện điểm yếu, placement quiz (phản hồi tức thì + giải thích + combo + tổng kết) | `questions: IQuestion[]`, `onMistakeRecorded`, `onFinishPractice`, `exitTo` |
| **LessonEngine** | `lesson/LessonEngine.tsx` | Bài học video/đọc/quiz: HTML5 player + transcript đồng bộ + song ngữ + từ điển popover 1 chạm + mục lục khoá học | `course`, `lesson`, `onSelectLesson`, `onComplete` |
| **VocabFlashcardEngine** | `vocab-flashcard/VocabFlashcardEngine.tsx` | Flashcard SRS (SM-2 từ `@toeic-vstep/shared`), lật 3D, 4 mức đánh giá | `cards: VocabWord[]`, `onCompleteSession`, `onSubmitReview` |
| **CrudEditor** | `crud-editor/CrudEditor.tsx` | Mọi màn CRUD của Admin / Head Teacher / Teacher: bảng + tìm kiếm + lọc + phân trang + form tạo/sửa + xoá + CSV + bulk actions | `rows`, `columns: Column<T>[]`, `fields: CrudField<T>[]`, `filters`, `rowActions` |

`QuestionRenderer` (`exam/QuestionRenderer.tsx`) là khối hiển thị câu hỏi chung (passage/audio/ảnh, options, giải thích, báo lỗi câu hỏi) được cả ExamRunner và PracticeEngine sử dụng.

## Nguyên tắc
- Engine không gọi API trực tiếp; page cung cấp data (mock trong `shared/mocks`, sau này thay bằng TanStack Query).
- Animation dùng Tailwind keyframes (`tailwind.config.js`) + helper `Reveal/Stagger/CountUp/PageTransition` trong `shared/components/motion`.
- Contract types UI nằm ở `shared/types/index.ts`, mở rộng từ `packages/shared`.
