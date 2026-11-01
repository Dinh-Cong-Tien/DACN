import { Navigate, RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { StudentLayout } from '@/layouts/student/StudentLayout';
import { StudentLearningPathPage } from '@/roles/student/pages/StudentLearningPathPage';
import { StudentLessonPage } from '@/roles/student/pages/StudentLessonPage';
import { StudentPracticePage } from '@/roles/student/pages/StudentPracticePage';
import { StudentPracticeSessionPage } from '@/roles/student/pages/StudentPracticeSessionPage';
import { StudentMockTestsPage } from '@/roles/student/pages/StudentMockTestsPage';
import { StudentMockTestDetailPage } from '@/roles/student/pages/StudentMockTestDetailPage';
import { StudentExamPage } from '@/roles/student/pages/StudentExamPage';
import { StudentExamResultPage } from '@/roles/student/pages/StudentExamResultPage';
import { StudentMistakesPage } from '@/roles/student/pages/StudentMistakesPage';
import { StudentReviewPage } from '@/roles/student/pages/StudentReviewPage';
import { StudentDrillsPage } from '@/roles/student/pages/StudentDrillsPage';
import { StudentDictationPage } from '@/roles/student/pages/StudentDictationPage';
import { StudentVocabularyPage } from '@/roles/student/pages/StudentVocabularyPage';
import { StudentFlashcardPage } from '@/roles/student/pages/StudentFlashcardPage';
import { StudentGrammarPage } from '@/roles/student/pages/StudentGrammarPage';
import { StudentWritingPage } from '@/roles/student/pages/StudentWritingPage';
import { StudentSpeakingPage } from '@/roles/student/pages/StudentSpeakingPage';
import { StudentProgressPage } from '@/roles/student/pages/StudentProgressPage';
import { StudentAchievementsPage } from '@/roles/student/pages/StudentAchievementsPage';
import { StudentLeaderboardPage } from '@/roles/student/pages/StudentLeaderboardPage';
import { StudentBookmarksPage } from '@/roles/student/pages/StudentBookmarksPage';
import { StudentProfilePage } from '@/roles/student/pages/StudentProfilePage';
import { StudentSettingsPage } from '@/roles/student/pages/StudentSettingsPage';
import { StudentClassesPage } from '@/roles/student/pages/StudentClassesPage';
import { NotificationsPage } from '@/roles/common/NotificationsPage';

export const studentRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard minRole="STUDENT" />,
        children: [
          // Phòng thi focus mode (không sidebar)
          { path: '/app/exam/:id', element: <StudentExamPage /> },
          {
            path: '/app',
            element: <StudentLayout />,
            children: [
              { index: true, element: <Navigate to="/" replace /> },
              // Trang Tổng quan đã gộp vào trang chủ (khối "Góc học tập")
              { path: 'dashboard', element: <Navigate to="/" replace /> },
              { path: 'learning-path', element: <StudentLearningPathPage /> },
              { path: 'classes', element: <StudentClassesPage /> },
              // Danh sách khoá học dùng chung trang /courses (học viên thấy tiến độ ngay trên đó)
              { path: 'courses', element: <Navigate to="/courses" replace /> },
              { path: 'courses/:id', element: <StudentLessonPage /> },
              { path: 'courses/:id/lessons/:lessonId', element: <StudentLessonPage /> },
              { path: 'practice', element: <StudentPracticePage /> },
              { path: 'practice/session/:part', element: <StudentPracticeSessionPage /> },
              { path: 'mock-tests', element: <StudentMockTestsPage /> },
              { path: 'mock-tests/:id', element: <StudentMockTestDetailPage /> },
              { path: 'mock-tests/:id/result', element: <StudentExamResultPage /> },
              { path: 'mistakes', element: <StudentMistakesPage /> },
              { path: 'review', element: <StudentReviewPage /> },
              { path: 'drills', element: <StudentDrillsPage /> },
              { path: 'dictation', element: <StudentDictationPage /> },
              { path: 'vocabulary', element: <StudentVocabularyPage /> },
              { path: 'vocabulary/flashcards', element: <StudentFlashcardPage /> },
              { path: 'vocabulary/flashcards/:topicId', element: <StudentFlashcardPage /> },
              { path: 'grammar', element: <StudentGrammarPage /> },
              { path: 'grammar/:slug', element: <StudentGrammarPage /> },
              { path: 'writing', element: <StudentWritingPage /> },
              { path: 'speaking', element: <StudentSpeakingPage /> },
              { path: 'progress', element: <StudentProgressPage /> },
              { path: 'achievements', element: <StudentAchievementsPage /> },
              { path: 'leaderboard', element: <StudentLeaderboardPage /> },
              { path: 'bookmarks', element: <StudentBookmarksPage /> },
              { path: 'profile', element: <StudentProfilePage /> },
              { path: 'settings', element: <StudentSettingsPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
            ],
          },
        ],
      },
    ],
  },
];
