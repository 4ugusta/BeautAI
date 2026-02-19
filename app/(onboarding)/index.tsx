import { Redirect } from 'expo-router';

// Default onboarding route - redirect to first step (brands)
export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/brands" />;
}
