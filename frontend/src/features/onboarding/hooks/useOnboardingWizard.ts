import { useState } from 'react';

export function useOnboardingWizard() {
  const [step, setStep] = useState(1);
  return { step, nextStep: () => setStep((s) => s + 1), prevStep: () => setStep((s) => s - 1) };
}
