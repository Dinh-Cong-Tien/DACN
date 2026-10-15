import { RouteObject } from 'react-router-dom';
import { GoalPage } from '@/pages/onboarding/GoalPage';
import { TargetPage } from '@/pages/onboarding/TargetPage';
import { SchedulePage } from '@/pages/onboarding/SchedulePage';
import { SkillsPage } from '@/pages/onboarding/SkillsPage';
import { PlacementTestPage } from '@/pages/onboarding/PlacementTestPage';
import { PlacementResultPage } from '@/pages/onboarding/PlacementResultPage';
import { AuthGuard } from '../guards/AuthGuard';

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <AuthGuard />,
    children: [
      { path: 'goal', element: <GoalPage /> },
      { path: 'target', element: <TargetPage /> },
      { path: 'schedule', element: <SchedulePage /> },
      { path: 'skills', element: <SkillsPage /> },
      { path: 'placement-test', element: <PlacementTestPage /> },
      { path: 'placement-result', element: <PlacementResultPage /> },
    ],
  },
];
