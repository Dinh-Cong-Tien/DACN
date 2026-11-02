import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { AdminLayout } from '@/layouts/admin/AdminLayout';
import { AdminDashboardPage } from '@/roles/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '@/roles/admin/pages/AdminUsersPage';
import { AdminSkillTagsPage } from '@/roles/admin/pages/AdminSkillTagsPage';
import { AdminCoursesPage } from '@/roles/admin/pages/AdminCoursesPage';
import { AdminQuestionsPage } from '@/roles/admin/pages/AdminQuestionsPage';
import { AdminTestsPage } from '@/roles/admin/pages/AdminTestsPage';
import { AdminBlogPage } from '@/roles/admin/pages/AdminBlogPage';
import { AdminAnalyticsPage } from '@/roles/admin/pages/AdminAnalyticsPage';
import { AdminSystemPage } from '@/roles/admin/pages/AdminSystemPage';
import { AdminAuditLogsPage } from '@/roles/admin/pages/AdminAuditLogsPage';
import { NotificationsPage } from '@/roles/common/NotificationsPage';
import { AdminSettingsPage } from '@/roles/admin/pages/AdminSettingsPage';
import { AdminLearningPage } from '@/roles/admin/pages/AdminLearningPage';
import { AdminClassesPage } from '@/roles/admin/pages/AdminClassesPage';
import { AdminSupportPage } from '@/roles/admin/pages/AdminSupportPage';
import { AdminBillingPage } from '@/roles/admin/pages/AdminBillingPage';
import { AdminBroadcastsPage } from '@/roles/admin/pages/AdminBroadcastsPage';

export const adminRoutes: RouteObject[] = [
  {
    element: <AuthGuard />,
    children: [
      {
        element: <RoleGuard minRole="ADMIN" />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: 'dashboard', element: <AdminDashboardPage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'skill-tags', element: <AdminSkillTagsPage /> },
              { path: 'courses', element: <AdminCoursesPage /> },
              { path: 'questions', element: <AdminQuestionsPage /> },
              { path: 'tests', element: <AdminTestsPage /> },
              { path: 'blog', element: <AdminBlogPage /> },
              { path: 'analytics', element: <AdminAnalyticsPage /> },
              { path: 'system', element: <AdminSystemPage /> },
              { path: 'audit-logs', element: <AdminAuditLogsPage /> },
              { path: 'settings', element: <AdminSettingsPage /> },
              { path: 'notifications', element: <NotificationsPage /> },
              { path: 'learning', element: <AdminLearningPage /> },
              { path: 'learning/:kind', element: <AdminLearningPage /> },
              { path: 'classes', element: <AdminClassesPage /> },
              { path: 'support', element: <AdminSupportPage /> },
              { path: 'billing', element: <AdminBillingPage /> },
              { path: 'broadcasts', element: <AdminBroadcastsPage /> },
            ],
          },
        ],
      },
    ],
  },
];
