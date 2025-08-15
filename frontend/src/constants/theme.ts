// src/constants/theme.ts

import { MD3DarkTheme as DefaultTheme, configureFonts } from 'react-native-paper';

// You can define custom fonts here if you add them to your assets folder later
const fontConfig = {
  // font family settings
};

export const theme = {
  ...DefaultTheme,
  // Specify custom property overrides
  colors: {
    ...DefaultTheme.colors,
    primary: '#6495ED', // A nice cornflower blue
    background: '#121212', // A standard dark background
    surface: '#1E1E1E', // For card backgrounds, etc.
  },
  fonts: configureFonts({config: fontConfig}),
};