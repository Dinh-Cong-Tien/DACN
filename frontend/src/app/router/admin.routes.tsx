import { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../../layouts/admin/AdminLayout';
import { AdminDashboardPage } from '../../roles/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '../../roles/admin/pages/AdminUsersPage';
import { AdminQuestionsPage } from '../../roles/admin/pages/AdminQuestionsPage';
import { AdminTestsPage } from '../../roles/admin/pages/AdminTestsPage';
import { AdminCoursesPage } from '../../roles/admin/pages/AdminCoursesPage';
import { AdminAnalyticsPage } from '../../roles/admin/pages/AdminAnalyticsPage';
import { AdminAuditLogsPage } from '../../roles/admin/pages/AdminAuditLogsPage';
import { AdminSettingsPage } from '../../roles/admin/pages/AdminSettingsPage';

export const adminRoutes: RouteObject[] = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { path: '', element: <AdminDashboardPage /> },
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'users', element: <AdminUsersPage /> },
      { path: 'questions', element: <AdminQuestionsPage /> },
      { path: 'tests', element: <AdminTestsPage /> },
      { path: 'courses', element: <AdminCoursesPage /> },
      { path: 'analytics', element: <AdminAnalyticsPage /> },
      { path: 'blog', element: <AdminDashboardPage /> },
      { path: 'audit-logs', element: <AdminAuditLogsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
    ],
  },
];
