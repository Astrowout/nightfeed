import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider } from '../data/store';
import { C } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="night/[id]" />
          <Stack.Screen name="sleeper/[id]" />
        </Stack>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
