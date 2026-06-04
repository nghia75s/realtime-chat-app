import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import * as SecureStore from 'expo-secure-store';
import { checkAuthAPI } from '@/api/auth.api';
import { View } from 'react-native';
import AnimatedSplashScreen from '@/components/AnimatedSplashScreen';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, setUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  useEffect(() => {
    const checkInitialState = async () => {
      try {
        // Check Onboarding status
        const onboardingStatus = await SecureStore.getItemAsync('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingStatus === 'true');

        // Check Auth token
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          const userData = await checkAuthAPI();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log('Error restoring state', error);
        setUser(null);
      } finally {
        setIsAuthReady(true);
      }
    };
    checkInitialState();
  }, []);

  useEffect(() => {
    // Only navigate when EVERYTHING is ready: auth is checked AND splash animation is done
    if (!isAuthReady || !isSplashComplete || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!hasSeenOnboarding && !inOnboardingGroup) {
      router.replace('./(onboarding)');
    } else if (hasSeenOnboarding && !isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (hasSeenOnboarding && isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isAuthReady, isSplashComplete, hasSeenOnboarding]);

  if (!isSplashComplete) {
    return <AnimatedSplashScreen onAnimationComplete={() => setIsSplashComplete(true)} />;
  }

  // If splash is complete but auth isn't (very rare), show empty view to avoid flicker
  if (!isAuthReady || hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
