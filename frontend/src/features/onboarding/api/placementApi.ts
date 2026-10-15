export const placementApi = {
  getPlacementTest: async (examType: 'TOEIC' | 'VSTEP') => {
    return { examType, questions: [] };
  },
  submitPlacementTest: async (answers: unknown) => {
    return { estimatedScore: 650, recommendedPathId: 'path-foundation' };
  },
};
