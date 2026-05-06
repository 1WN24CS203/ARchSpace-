import { ThemeProvider as NavigationThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
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
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Prevent auto hide until fonts are loaded
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

// ── Inner layout — has access to AuthContext ─────────────────────────────────
function InnerLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isHydrating } = useAuth();

  useEffect(() => {
    if (isHydrating) return;

    const firstSegment = segments[0] ? String(segments[0]) : '';
    const inAuthGroup = firstSegment === '(tabs)';

    if (!user && inAuthGroup) {
      // Not logged in but inside tabs — send back to login
      router.replace('/');
    } else if (user && !inAuthGroup && (firstSegment === 'index' || firstSegment === '')) {
      // Logged in but on login screen — go to dashboard
      router.replace('/(tabs)/dashboard' as any);
    }
  }, [user, isHydrating, segments, router]);

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
    <NavigationThemeProvider value={navTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="ar-preview" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="new-project" options={{ headerShown: false }} />
        <Stack.Screen name="edit-project" options={{ headerShown: false }} />
        <Stack.Screen name="model-manager" options={{ headerShown: false }} />
        <Stack.Screen name="model-viewer" options={{ headerShown: false }} />
        <Stack.Screen name="ar-place" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </NavigationThemeProvider>
  );
}

// ── Root layout — loads fonts, shows splash ──────────────────────────────────
export default function RootLayout() {
  const [fontsReady, setFontsReady] = useState(false);

  const [playfairLoaded, playfairError] = usePlayfairFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
  });

  const [latoLoaded, latoError] = useLatoFonts({
    'Lato-Regular': Lato_400Regular,
    'Lato-Bold': Lato_700Bold,
  });

  useEffect(() => {
    // Fonts loaded or errored — either way hide the splash
    if ((playfairLoaded || playfairError) && (latoLoaded || latoError)) {
      setFontsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [playfairLoaded, playfairError, latoLoaded, latoError]);

  // Safety timeout — if fonts take > 5 s (e.g. network issue), unblock the app
  useEffect(() => {
    const t = setTimeout(() => {
      setFontsReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider theme={theme}>
          <InnerLayout />
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
