import { ThemeProvider as NavigationThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  useFonts as usePlayfairFonts,
  PlayfairDisplay_400Regular,
} from '@expo-google-fonts/playfair-display';
import {
  useFonts as useLatoFonts,
  Lato_400Regular,
  Lato_700Bold,
} from '@expo-google-fonts/lato';

import { theme } from '@/constants/theme';
import { Colors } from '@/constants/colors';

// Prevent auto hide until fonts are loaded
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [playfairLoaded, playfairError] = usePlayfairFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
  });

  const [latoLoaded, latoError] = useLatoFonts({
    'Lato-Regular': Lato_400Regular,
    'Lato-Bold': Lato_700Bold,
  });

  const loaded = playfairLoaded && latoLoaded;
  const error = playfairError || latoError;

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  // Define basic navigation theme based on our dark theme
  const navTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors.accentGold,
      background: Colors.primary,
      card: Colors.card,
      text: Colors.textMain,
      border: Colors.borderSubtle,
      notification: Colors.accentGoldHover,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationThemeProvider value={navTheme}>
        <Stack>
          {/* Index acts as the login page */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="ar-preview" options={{ presentation: 'modal', title: 'AR Scanner', headerShown: false }} />
        </Stack>
        <StatusBar style="light" />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
