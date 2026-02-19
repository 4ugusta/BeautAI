import { Redirect } from 'expo-router';

// Default route - redirect to login
// Auth agent will update this to check authentication state
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
