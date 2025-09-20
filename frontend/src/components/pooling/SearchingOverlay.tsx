// src/components/pooling/SearchingOverlay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';

interface SearchingOverlayProps {
  visible: boolean;
  onCancel: () => void;
}

export default function SearchingOverlay({ visible, onCancel }: SearchingOverlayProps) {
  // We render nothing if the overlay is not supposed to be visible.
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <ActivityIndicator size="large" />
      <Text variant="titleLarge" style={styles.text}>
        Searching for nearby poolers...
      </Text>
      <Button mode="contained" onPress={onCancel} style={styles.button}>
        Cancel Search
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    // This is the key to making it an overlay.
    // It will fill the entire parent container.
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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