import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { RoleGuard } from '../guards/RoleGuard';
import { HeadTeacherLayout } from '@/layouts/head/HeadTeacherLayout';
import { HeadDashboardPage } from '@/roles/head/pages/HeadDashboardPage';
import { HeadSubjectsPage } from '@/roles/head/pages/HeadSubjectsPage';
import { HeadQuestionBankPage } from '@/roles/head/pages/HeadQuestionBankPage';
import { HeadTeachersPage } from '@/roles/head/pages/HeadTeachersPage';
import { HeadClassesPage } from '@/roles/head/pages/HeadClassesPage';
import { HeadApprovalsPage } from '@/roles/head/pages/HeadApprovalsPage';
import { HeadReportsPage } from '@/roles/head/pages/HeadReportsPage';
import { HeadComplaintsPage } from '@/roles/head/pages/HeadComplaintsPage';
import { NotificationsPage } from '@/roles/common/NotificationsPage';
import { AccountSettingsPage } from '@/roles/common/AccountSettingsPage';

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
              { path: 'classes', element: <HeadClassesPage /> },
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
