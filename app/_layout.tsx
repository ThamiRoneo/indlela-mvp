import { Stack } from 'expo-router';
import { ReactNode } from 'react';
import Welcome from './(auth)/welcome';

const WelcomeScreen: ReactNode = <Welcome />;

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen options={{ headerShown: false }}>
        {WelcomeScreen}
      </Stack.Screen>
    </Stack>
  );
}
