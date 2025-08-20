// src/components/pooling/SearchingView.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import ScreenWrapper from '../ScreenWrapper';

interface SearchingViewProps {
  onCancel: () => void;
}

export default function SearchingView({ onCancel }: SearchingViewProps) {
  return (
    <ScreenWrapper style={styles.container}>
      <ActivityIndicator size="large" />
      <Text variant="titleLarge" style={styles.text}>
        Searching for nearby poolers...
      </Text>
      <Button mode="contained" onPress={onCancel} style={styles.button}>
        Cancel Search
      </Button>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});