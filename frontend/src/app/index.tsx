import { Redirect } from 'expo-router';

export default function StartPage() {
  // This component will immediately redirect the user from the root '/'
  // to the '/landing' screen within the (auth) group.
  return <Redirect href="./(auth)/landing" />;
}