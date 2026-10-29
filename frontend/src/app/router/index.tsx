import { createBrowserRouter } from 'react-router-dom';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { onboardingRoutes } from './onboarding.routes';
import { studentRoutes } from './student.routes';
import { teacherRoutes } from './teacher.routes';
import { headRoutes } from './head.routes';
import { adminRoutes } from './admin.routes';

export const router = createBrowserRouter([...authRoutes, ...onboardingRoutes, ...studentRoutes, ...teacherRoutes, ...headRoutes, ...adminRoutes, ...publicRoutes]);
