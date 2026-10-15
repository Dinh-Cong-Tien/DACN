import { env } from '@/app/config/env';

export const onboardingApi = {
  saveGoal: async (goalData: unknown) => {
    // API call placeholder
    return { success: true, data: goalData };
  },
  saveSchedule: async (scheduleData: unknown) => {
    return { success: true, data: scheduleData };
  },
};
