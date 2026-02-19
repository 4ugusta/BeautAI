import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="brands" />
      <Stack.Screen name="routine" />
      <Stack.Screen name="vibe" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
