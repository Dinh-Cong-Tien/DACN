import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { TeacherLayout } from '@/layouts/teacher/TeacherLayout';
import { TeacherDashboardPage } from '@/roles/teacher/pages/TeacherDashboardPage';
import { TeacherClassesPage } from '@/roles/teacher/pages/TeacherClassesPage';
import { TeacherClassDetailPage } from '@/roles/teacher/pages/TeacherClassDetailPage';
import { TeacherAssignmentsPage } from '@/roles/teacher/pages/TeacherAssignmentsPage';
import { TeacherGradingPage } from '@/roles/teacher/pages/TeacherGradingPage';
import { TeacherCoursesPage } from '@/roles/teacher/pages/TeacherCoursesPage';
import { TeacherMaterialsPage } from '@/roles/teacher/pages/TeacherMaterialsPage';
import { TeacherAnalyticsPage } from '@/roles/teacher/pages/TeacherAnalyticsPage';
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
