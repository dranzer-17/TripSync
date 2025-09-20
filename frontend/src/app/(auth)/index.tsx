import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // Redirect from /auth to /auth/login
  return <Redirect href="./login" />;
}