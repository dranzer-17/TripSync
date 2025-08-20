// src/components/pooling/IdlePoolingView.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import ScreenWrapper from '../ScreenWrapper';

// Define the props this component will accept
interface IdlePoolingViewProps {
  onFindPoolers: () => void; // A function to call when the button is pressed
  isLoading: boolean;
}

export default function IdlePoolingView({ onFindPoolers, isLoading }: IdlePoolingViewProps) {
  return (
    <ScreenWrapper style={styles.container}>
      <Button
        mode="contained"
        onPress={onFindPoolers}
        loading={isLoading}
        disabled={isLoading}
        contentStyle={{ paddingVertical: 10, paddingHorizontal: 20 }}
        labelStyle={{ fontSize: 18 }}
      >
        Find Nearby Poolers
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});