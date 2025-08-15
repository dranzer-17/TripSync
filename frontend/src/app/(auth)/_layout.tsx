// src/app/_layout.tsx

import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../constants/theme';

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="light" />
      
      {/* This Stack is now the single source of truth for navigation */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* We define all screens here, letting the layouts in each group handle their children */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(main)" />
        {/* The index screen is just a redirector, it doesn't need a UI */}
        <Stack.Screen name="index" /> 
      </Stack>
    </PaperProvider>
  );
}