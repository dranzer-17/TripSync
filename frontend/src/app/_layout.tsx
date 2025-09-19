// src/app/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    // The AuthProvider must wrap everything.
    <AuthProvider>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        {/* This simple Stack navigator correctly defines the app's sections */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}