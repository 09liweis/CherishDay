import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DateProvider } from '@/contexts/DateContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { FriendsProvider } from '@/contexts/FriendsContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <FriendsProvider>
        <DateProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </DateProvider>
      </FriendsProvider>
    </AuthProvider>
  );
}