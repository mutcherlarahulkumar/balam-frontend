import { MD3LightTheme, configureFonts } from 'react-native-paper';

const PRIMARY = '#1a3c5e';
const SECONDARY = '#2d6a9f';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: PRIMARY,
    primaryContainer: '#d0e4f7',
    secondary: SECONDARY,
    secondaryContainer: '#c5ddf4',
    surface: '#ffffff',
    surfaceVariant: '#f3f6fa',
    background: '#f0f4f8',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    error: '#ba1a1a',
    onError: '#ffffff',
    outline: '#c4cdd6',
  },
};

export type AppTheme = typeof theme;
