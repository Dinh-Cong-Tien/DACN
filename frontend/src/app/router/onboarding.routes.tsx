import { RouteObject } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard';
import { OnboardingLayout } from '@/layouts/onboarding/OnboardingLayout';
import { GoalPage } from '@/pages/onboarding/GoalPage';
import { TargetPage } from '@/pages/onboarding/TargetPage';
import { SchedulePage } from '@/pages/onboarding/SchedulePage';
import { SkillsPage } from '@/pages/onboarding/SkillsPage';
import { PlacementTestPage } from '@/pages/onboarding/PlacementTestPage';
import { PlacementResultPage } from '@/pages/onboarding/PlacementResultPage';

export const onboardingRoutes: RouteObject[] = [
  {
    path: '/onboarding',
    element: <AuthGuard />,
    children: [
      {
        element: <OnboardingLayout />,
        children: [
          { index: true, element: <GoalPage /> },
          { path: 'goal', element: <GoalPage /> },
          { path: 'target', element: <TargetPage /> },
          { path: 'schedule', element: <SchedulePage /> },
          { path: 'skills', element: <SkillsPage /> },
          { path: 'placement-test', element: <PlacementTestPage /> },
          { path: 'placement-result', element: <PlacementResultPage /> },
        ],
      },
    ],
  },
];
