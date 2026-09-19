import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider } from '@/lib/auth';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const NavLight = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f1f5f9',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    primary: '#2563eb',
  },
};

const NavDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0b1220',
    card: '#111827',
    text: '#f8fafc',
    border: '#1f2937',
    primary: '#60a5fa',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const scheme = useColorScheme();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={scheme === 'dark' ? NavDark : NavLight}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShadowVisible: false }}>
          <Stack.Screen name="index" options={{ title: 'GitHub Projekty' }} />
          <Stack.Screen
            name="login"
            options={{ title: 'Logowanie', headerBackVisible: false }}
          />
          <Stack.Screen
            name="repo/[owner]/[name]"
            options={{ title: 'Repozytorium' }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
