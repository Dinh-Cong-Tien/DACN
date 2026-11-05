import { Navigate, RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { TeacherLayout } from '@/layouts/teacher/TeacherLayout';
import { TeacherDashboardPage } from '@/roles/teacher/pages/TeacherDashboardPage';
import { TeacherClassesPage } from '@/roles/teacher/pages/TeacherClassesPage';
import { TeacherCoursesPage } from '@/roles/teacher/pages/TeacherCoursesPage';
import { TeacherClassDetailPage } from '@/roles/teacher/pages/TeacherClassDetailPage';
import { TeacherAssignmentsPage } from '@/roles/teacher/pages/TeacherAssignmentsPage';
import { TeacherGradingPage } from '@/roles/teacher/pages/TeacherGradingPage';
import { TeacherLibraryPage } from '@/roles/teacher/pages/TeacherLibraryPage';
import { TeacherSchedulePage } from '@/roles/teacher/pages/TeacherSchedulePage';
import { TeacherAttendancePage } from '@/roles/teacher/pages/TeacherAttendancePage';
import { TeacherGradebookPage } from '@/roles/teacher/pages/TeacherGradebookPage';
import { TeacherStudentsPage } from '@/roles/teacher/pages/TeacherStudentsPage';
import { TeacherMaterialsPage } from '@/roles/teacher/pages/TeacherMaterialsPage';
import { TeacherAnalyticsPage } from '@/roles/teacher/pages/TeacherAnalyticsPage';
import { TeacherAuthoringPage } from '@/roles/teacher/pages/TeacherAuthoringPage';
import { TeacherQuestionBankPage } from '@/roles/teacher/pages/TeacherQuestionBankPage';
import { NotificationsPage } from '@/roles/common/NotificationsPage';
import { AccountSettingsPage } from '@/roles/common/AccountSettingsPage';

export const teacherRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard minRole="TEACHER" />,
        children: [
          {
            path: '/teacher',
            element: <TeacherLayout />,
            children: [
              { index: true, element: <TeacherDashboardPage /> },
              { path: 'dashboard', element: <TeacherDashboardPage /> },
              { path: 'classes', element: <TeacherClassesPage /> },
              { path: 'classes/:id', element: <TeacherClassDetailPage /> },
              { path: 'assignments', element: <TeacherAssignmentsPage /> },
              { path: 'grading', element: <TeacherGradingPage /> },
              { path: 'grading/:submissionId', element: <TeacherGradingPage /> },
              { path: 'library', element: <Navigate to="/teacher/library/courses" replace /> },
              { path: 'library/:kind', element: <TeacherLibraryPage /> },
              { path: 'authoring', element: <TeacherAuthoringPage /> },
              { path: 'question-bank', element: <TeacherQuestionBankPage /> },
              { path: 'schedule', element: <TeacherSchedulePage /> },
              { path: 'attendance', element: <TeacherAttendancePage /> },
              { path: 'attendance/:sessionId', element: <TeacherAttendancePage /> },
              { path: 'gradebook', element: <TeacherGradebookPage /> },
              { path: 'students', element: <TeacherStudentsPage /> },
              { path: 'courses', element: <TeacherCoursesPage /> },
              { path: 'materials', element: <TeacherMaterialsPage /> },
              { path: 'analytics', element: <TeacherAnalyticsPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'settings', element: <AccountSettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
];
