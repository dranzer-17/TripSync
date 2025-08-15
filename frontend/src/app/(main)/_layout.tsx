// src/app/(main)/_layout.tsx

import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack>
       {/* We will add screens here later */}
       <Stack.Screen name="home" options={{ title: 'Home' }} />
    </Stack>
  );
}