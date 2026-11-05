import { Navigate, RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { HeadTeacherLayout } from '@/layouts/head/HeadTeacherLayout';
import { HeadDashboardPage } from '@/roles/head/pages/HeadDashboardPage';
import { HeadSubjectsPage } from '@/roles/head/pages/HeadSubjectsPage';
import { HeadQuestionBankPage } from '@/roles/head/pages/HeadQuestionBankPage';
import { HeadTeachersPage } from '@/roles/head/pages/HeadTeachersPage';
import { HeadTeacherDetailPage } from '@/roles/head/pages/HeadTeacherDetailPage';
import { HeadClassesPage } from '@/roles/head/pages/HeadClassesPage';
import { HeadClassDetailPage } from '@/roles/head/pages/HeadClassDetailPage';
import { HeadStudentsPage } from '@/roles/head/pages/HeadStudentsPage';
import { HeadSchedulePage } from '@/roles/head/pages/HeadSchedulePage';
import { HeadGradingReviewPage } from '@/roles/head/pages/HeadGradingReviewPage';
import { HeadLibraryPage } from '@/roles/head/pages/HeadLibraryPage';
import { HeadApprovalsPage } from '@/roles/head/pages/HeadApprovalsPage';
import { HeadReportsPage } from '@/roles/head/pages/HeadReportsPage';
import { HeadComplaintsPage } from '@/roles/head/pages/HeadComplaintsPage';
import { HeadAssignmentsPage } from '@/roles/head/pages/HeadAssignmentsPage';
import { HeadResultsPage } from '@/roles/head/pages/HeadResultsPage';
import { HeadClassContentPage } from '@/roles/head/pages/HeadClassContentPage';
import { HeadStudentDetailPage } from '@/roles/head/pages/HeadStudentDetailPage';
import { NotificationsPage } from '@/roles/common/NotificationsPage';
import { AccountSettingsPage } from '@/roles/common/AccountSettingsPage';
import { HeadCoursesPage } from '@/roles/teacher/pages/TeacherCoursesPage';

export const headRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard minRole="HEAD_TEACHER" />,
        children: [
          {
            path: '/head',
            element: <HeadTeacherLayout />,
            children: [
              { index: true, element: <HeadDashboardPage /> },
              { path: 'dashboard', element: <HeadDashboardPage /> },
              { path: 'subjects', element: <HeadSubjectsPage /> },
              { path: 'question-bank', element: <HeadQuestionBankPage /> },
              { path: 'teachers', element: <HeadTeachersPage /> },
              { path: 'teachers/:id', element: <HeadTeacherDetailPage /> },
              { path: 'courses', element: <HeadCoursesPage /> },
              { path: 'classes', element: <HeadClassesPage /> },
              { path: 'classes/:id', element: <HeadClassDetailPage /> },
              { path: 'students', element: <HeadStudentsPage /> },
              { path: 'students/:id', element: <HeadStudentDetailPage /> },
              { path: 'assignments', element: <HeadAssignmentsPage /> },
              { path: 'results', element: <HeadResultsPage /> },
              { path: 'class-content', element: <HeadClassContentPage /> },
              { path: 'schedule', element: <HeadSchedulePage /> },
              { path: 'grading-review', element: <HeadGradingReviewPage /> },
              { path: 'grading-review/:reviewId', element: <HeadGradingReviewPage /> },
              { path: 'library', element: <Navigate to="/head/library/courses" replace /> },
              { path: 'library/:kind', element: <HeadLibraryPage /> },
              { path: 'approvals', element: <HeadApprovalsPage /> },
              { path: 'reports', element: <HeadReportsPage /> },
              { path: 'complaints', element: <HeadComplaintsPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'settings', element: <AccountSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
];
