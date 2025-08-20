// src/app/_layout.tsx OR src/app/(root)/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme'; // Adjust path if needed
import { AuthProvider } from '../context/AuthContext'; // <-- IMPORT

export default function RootLayout() {
  return (
    // The AuthProvider now wraps everything
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}