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

/** Khu Đào tạo của admin dùng lại các trang học vụ của Trưởng bộ môn (API /head, phạm vi = toàn hệ thống) */
import { HeadSubjectsPage } from '@/roles/head/pages/HeadSubjectsPage';
import { HeadTeachersPage } from '@/roles/head/pages/HeadTeachersPage';
import { HeadTeacherDetailPage } from '@/roles/head/pages/HeadTeacherDetailPage';
import { HeadClassDetailPage } from '@/roles/head/pages/HeadClassDetailPage';
import { HeadStudentsPage } from '@/roles/head/pages/HeadStudentsPage';
import { HeadStudentDetailPage } from '@/roles/head/pages/HeadStudentDetailPage';
import { HeadSchedulePage } from '@/roles/head/pages/HeadSchedulePage';
import { HeadAssignmentsPage } from '@/roles/head/pages/HeadAssignmentsPage';
import { HeadResultsPage } from '@/roles/head/pages/HeadResultsPage';
import { HeadClassContentPage } from '@/roles/head/pages/HeadClassContentPage';
import { HeadApprovalsPage } from '@/roles/head/pages/HeadApprovalsPage';
import { HeadGradingReviewPage } from '@/roles/head/pages/HeadGradingReviewPage';
import { HeadComplaintsPage } from '@/roles/head/pages/HeadComplaintsPage';
import { HeadReportsPage } from '@/roles/head/pages/HeadReportsPage';

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
              { path: 'classes/:id', element: <HeadClassDetailPage /> },
              { path: 'departments', element: <HeadSubjectsPage /> },
              { path: 'teachers', element: <HeadTeachersPage /> },
              { path: 'teachers/:id', element: <HeadTeacherDetailPage /> },
              { path: 'students', element: <HeadStudentsPage /> },
              { path: 'students/:id', element: <HeadStudentDetailPage /> },
              { path: 'schedule', element: <HeadSchedulePage /> },
              { path: 'assignments', element: <HeadAssignmentsPage /> },
              { path: 'results', element: <HeadResultsPage /> },
              { path: 'class-content', element: <HeadClassContentPage /> },
              { path: 'approvals', element: <HeadApprovalsPage /> },
              { path: 'grading-review', element: <HeadGradingReviewPage /> },
              { path: 'grading-review/:reviewId', element: <HeadGradingReviewPage /> },
              { path: 'complaints', element: <HeadComplaintsPage /> },
              { path: 'reports', element: <HeadReportsPage /> },
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
