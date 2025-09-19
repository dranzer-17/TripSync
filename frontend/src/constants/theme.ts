// src/constants/theme.ts
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

const customColors = {
  primary: '#6A5AE0',       // A modern, vibrant purple
  accent: '#F9A826',         // A warm, contrasting gold/yellow
  background: '#F0F2F5',     // A very light, clean off-white
  surface: '#FFFFFF',        // Pure white for cards
  text: '#0D0D0D',           // A strong, near-black for text
  secondaryText: '#6C757D',  // A softer grey for metadata
  placeholder: '#ADB5BD',
  success: '#28A745',
  error: '#DC3545',
  border: '#E9ECEF',         // A light, subtle border color
  // A gradient for primary buttons
  primaryGradient: ['#8E81F3', '#6A5AE0'], 
};

export const theme = {
  ...DefaultTheme,
  roundness: 12, // More rounded corners for a modern feel
  colors: {
    ...DefaultTheme.colors,
    primary: customColors.primary,
    background: customColors.background,
    surface: customColors.surface,
    onSurface: customColors.text,
    onSurfaceVariant: customColors.secondaryText,
    error: customColors.error,
    outline: customColors.border,
    elevation: {
      ...DefaultTheme.colors.elevation,
      level1: customColors.surface,
      level2: customColors.surface,
    },
    custom: { // Keep custom for non-standard colors
        accent: customColors.accent,
        secondaryText: customColors.secondaryText,
        success: customColors.success,
        border: customColors.border,
        primaryGradient: customColors.primaryGradient,
    }
  },
};