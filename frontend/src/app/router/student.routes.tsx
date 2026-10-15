import { RouteObject } from 'react-router-dom';
import { StudentLayout } from '../../layouts/student/StudentLayout';
import { StudentDashboardPage } from '../../roles/student/pages/StudentDashboardPage';
import { StudentLearningPathPage } from '../../roles/student/pages/StudentLearningPathPage';
import { StudentPracticePage } from '../../roles/student/pages/StudentPracticePage';
import { StudentMockTestsPage } from '../../roles/student/pages/StudentMockTestsPage';
import { StudentExamPage } from '../../roles/student/pages/StudentExamPage';
import { StudentExamResultPage } from '../../roles/student/pages/StudentExamResultPage';
import { StudentMistakesPage } from '../../roles/student/pages/StudentMistakesPage';
import { StudentReviewPage } from '../../roles/student/pages/StudentReviewPage';
import { StudentVocabularyPage } from '../../roles/student/pages/StudentVocabularyPage';
import { StudentGrammarPage } from '../../roles/student/pages/StudentGrammarPage';
import { StudentWritingPage } from '../../roles/student/pages/StudentWritingPage';
import { StudentSpeakingPage } from '../../roles/student/pages/StudentSpeakingPage';
import { StudentProgressPage } from '../../roles/student/pages/StudentProgressPage';
import { StudentAchievementsPage } from '../../roles/student/pages/StudentAchievementsPage';
import { StudentLeaderboardPage } from '../../roles/student/pages/StudentLeaderboardPage';
import { StudentBookmarksPage } from '../../roles/student/pages/StudentBookmarksPage';
import { StudentProfilePage } from '../../roles/student/pages/StudentProfilePage';
import { StudentSettingsPage } from '../../roles/student/pages/StudentSettingsPage';

export const studentRoutes: RouteObject[] = [
  // Fullscreen Focus Exam Route (Distraction-free)
  {
    path: '/app/mock-tests/:id/exam',
    element: <StudentExamPage />,
  },
  {
    path: '/app/exam/:id',
    element: <StudentExamPage />,
  },
  {
    path: '/app/exam/result/:id',
    element: <StudentExamResultPage />,
  },
  // Main Student Portal Routes (Wrapped by StudentLayout)
  {
    path: '/app',
    element: <StudentLayout />,
    children: [
      { path: '', element: <StudentDashboardPage /> },
      { path: 'dashboard', element: <StudentDashboardPage /> },
      { path: 'learning-path', element: <StudentLearningPathPage /> },
      { path: 'practice', element: <StudentPracticePage /> },
      { path: 'mock-tests', element: <StudentMockTestsPage /> },
      { path: 'mock-tests/:id/result', element: <StudentExamResultPage /> },
      { path: 'mock-tests/:id/analysis', element: <StudentMistakesPage /> },
      { path: 'mistakes', element: <StudentMistakesPage /> },
      { path: 'review', element: <StudentReviewPage /> },
      { path: 'vocabulary', element: <StudentVocabularyPage /> },
      { path: 'grammar', element: <StudentGrammarPage /> },
      { path: 'courses', element: <StudentLearningPathPage /> },
      { path: 'courses/:id', element: <StudentPracticePage /> },
      { path: 'question-bank', element: <StudentPracticePage /> },
      { path: 'listening', element: <StudentPracticePage /> },
      { path: 'reading', element: <StudentPracticePage /> },
      { path: 'speaking', element: <StudentSpeakingPage /> },
      { path: 'writing', element: <StudentWritingPage /> },
      { path: 'progress', element: <StudentProgressPage /> },
      { path: 'achievements', element: <StudentAchievementsPage /> },
      { path: 'leaderboard', element: <StudentLeaderboardPage /> },
      { path: 'bookmarks', element: <StudentBookmarksPage /> },
      { path: 'profile', element: <StudentProfilePage /> },
      { path: 'notifications', element: <StudentDashboardPage /> },
      { path: 'settings', element: <StudentSettingsPage /> },
    ],
  },
];
