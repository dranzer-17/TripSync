import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from 'react-native-paper'; // Import the useTheme hook

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function ScreenWrapper({ children, style }: ScreenWrapperProps) {
  const theme = useTheme(); // Get the theme object

  // Create a dynamic background color style
  const containerStyle = {
    backgroundColor: theme.colors.background,
  };

  return (
    <SafeAreaView style={[styles.safeArea, containerStyle]}>
      <View style={[styles.container, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});