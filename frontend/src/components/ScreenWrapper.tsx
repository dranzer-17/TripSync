// src/components/ScreenWrapper.tsx

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';

// This allows our wrapper to accept all the standard View props
interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

export default function ScreenWrapper({ children, style, ...rest }: ScreenWrapperProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }, // Apply theme background color
        style, // Allow custom styles to be passed in
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});