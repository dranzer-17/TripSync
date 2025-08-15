// src/app/(main)/home.tsx

import React from 'react';
import { Text } from 'react-native-paper';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function HomeScreen() {
  return (
    <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="headlineMedium">Main App Screen</Text>
    </ScreenWrapper>
  );
}