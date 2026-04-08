import { MD3DarkTheme, configureFonts } from 'react-native-paper';
import { Colors } from './colors';

export { Colors } from './colors';

const fontConfig = {
  displayMedium: {
    fontFamily: 'PlayfairDisplay-Regular',
    letterSpacing: 0.5,
  },
  titleLarge: {
    fontFamily: 'PlayfairDisplay-Regular',
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: 'Lato-Regular',
    letterSpacing: 0,
  },
  bodyMedium: {
    fontFamily: 'Lato-Regular',
    letterSpacing: 0.25,
  },
  labelLarge: {
    fontFamily: 'Lato-Bold',
    letterSpacing: 1,
  },
};

export const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.accentGold,
    background: Colors.primary,
    surface: Colors.card,
    surfaceVariant: Colors.secondary,
    onSurface: Colors.textMain,
    onSurfaceVariant: Colors.textMuted,
    outline: Colors.borderSubtle,
    error: Colors.error,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

