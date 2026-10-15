import { RouteObject } from 'react-router-dom';
import { TeacherLayout } from '../../layouts/teacher/TeacherLayout';
import { TeacherDashboardPage } from '../../roles/teacher/pages/TeacherDashboardPage';
import { TeacherClassesPage } from '../../roles/teacher/pages/TeacherClassesPage';
import { TeacherAssignmentsPage } from '../../roles/teacher/pages/TeacherAssignmentsPage';
import { TeacherGradingPage } from '../../roles/teacher/pages/TeacherGradingPage';
import { TeacherCoursesPage } from '../../roles/teacher/pages/TeacherCoursesPage';
import { TeacherAnalyticsPage } from '../../roles/teacher/pages/TeacherAnalyticsPage';

export const teacherRoutes: RouteObject[] = [
  {
    path: '/teacher',
    element: <TeacherLayout />,
    children: [
      { path: '', element: <TeacherDashboardPage /> },
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'classes', element: <TeacherClassesPage /> },
      { path: 'classes/:id', element: <TeacherClassesPage /> },
      { path: 'assignments', element: <TeacherAssignmentsPage /> },
      { path: 'grading', element: <TeacherGradingPage /> },
      { path: 'grading/:submissionId', element: <TeacherGradingPage /> },
      { path: 'courses', element: <TeacherCoursesPage /> },
      { path: 'analytics', element: <TeacherAnalyticsPage /> },
    ],
  },
];
