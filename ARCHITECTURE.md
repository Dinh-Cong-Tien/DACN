# System Architecture: TOEIC & VSTEP Prep Platform

## 1. System Layouts
- `GuestLayout`: Home, Courses, Pricing, Blog, FAQ, About, Contact.
- `AuthLayout`: Login, Register, Verify, Forgot/Reset Password.
- `OnboardingLayout`: Flow Goal -> Target -> Schedule -> Skills -> Placement Test -> Result.
- `StudentLayout`: Sidebar/Topbar navigation cho Dashboard, Skills Hub, Practice, Progress, Settings.
- `AdminLayout`: Enterprise dashboard sidebar (Users, Content, Questions, Exams, Analytics, System).
- `FocusLayout`: Fullscreen không sidebar/distraction-free, dành riêng cho `/mock-tests/:id/exam` và `/courses/:courseId/lessons/:lessonId`.

## 2. Reusable UI Engines (Không tạo duplicate components)
- **PracticeEngine (`/app/practice/*`, `/app/toeic/practice/:partId`, `/app/vstep/:skillId`):**
  - Chế độ tự do, audio/timer/script toggles, hiện đáp án & giải thích tức thì hoặc sau khi nộp, tự động push câu sai vào `MistakeNotebook`.
- **ExamRunner (`/app/mock-tests/:id/exam`):**
  - Fullscreen Focus Mode, đếm ngược toàn bài, question grid navigator, auto-save draft bài làm (30s), submit -> tính điểm + phân tích điểm yếu (Weak Areas).
- **VocabFlashcardEngine (`/app/vocabulary/*`):**
  - Spaced Repetition System (SRS): Mặt trước (từ/IPA/audio/hình) -> Lật mặt sau (nghĩa/collocation/ví dụ) -> Đánh giá (Know / Don't Know).
- **AdminContentStudio (`/admin/*`):**
  - Question Editor: Multi-choice, Audio/Image uploader, Passage Rich Text, Tagging (TOEIC Part 1-7, VSTEP Level A1-C1). Hỗ trợ parent-child question grouping.

## 3. Database Core Entities & Schema Alignment
- `User`: id, email, passwordHash, role (STUDENT, ADMIN), currentLevel, targetLevel, targetExam, streakCount, lastStudyAt.
- `Question`: id, examType, type, partOrSkill, level, passageText, audioUrl, imageUrl, stem, options (JSON), correctAnswer (JSON), explanation, difficulty, tags, parentId (group passage/audio), orderInGroup.
- `MockTest`: id, title, examType, durationMinutes, totalQuestions, status.
- `MockTestQuestion`: testId, questionId, orderIndex, section, points (n-n relation).
- `ExamAttempt`: id, userId, testId, status, answers (JSON), flagged (string[]), score, correctCount, timeSpentSec, remainingSec, weakSkills (JSON).
- `MistakeNotebook`: id, userId, questionId, userWrongAnswer (JSON), mistakeCount, source, nextReviewAt, isResolved.
- `LearningPath`: id, userId, currentStage, stages (Milestones: Foundation -> Skills -> Mock Test), isActive.

## 4. Primary Student Core Flow
Register -> Onboarding (Placement Test) -> Result -> Learning Path -> Practice / Course -> Mock Test -> Result Analysis -> Mistake Notebook -> Daily Review.