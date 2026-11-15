import { Stack } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { MoonIcon } from '../../components/Icons';
import { Button } from '../../components/Ui';
import { StoreProvider } from '../../data/store';
import { authClient } from '../../lib/auth';
import { C, T } from '../../theme';

function Loading({ error, retry }: { error: string | null; retry: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      <MoonIcon size={28} color={C.wine} filled />
      {error ? (
        <>
          <Text style={[T.body, { textAlign: 'center', maxWidth: 320 }]}>{error}</Text>
          <Button label="Try again" onPress={retry} small />
          <Button label="Sign out" kind="ghost" small onPress={() => authClient.signOut()} />
        </>
      ) : (
        <>
          <ActivityIndicator color={C.wine} />
          <Text style={T.small}>Loading your nights</Text>
        </>
      )}
    </View>
  );
}

export default function AppLayout() {
  return (
    <StoreProvider fallback={(error, retry) => <Loading error={error} retry={retry} />}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.canvas } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="night/[id]" />
        <Stack.Screen name="sleeper/[id]" />
      </Stack>
    </StoreProvider>
  );
}
