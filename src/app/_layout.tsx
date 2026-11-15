import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { DynaPuff_600SemiBold } from '@expo-google-fonts/dynapuff';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authClient } from '../lib/auth';
import { APP_OPEN } from '../lib/config';
import { C } from '../theme';

const WEB = Platform.OS === 'web';
const HINT = 'kudoze.signedIn';

// Before launch the website is only the landing page. Send any other address (an old link to a
// night, /sign-in, /log) to it before the router starts, so the router never has to resolve a
// guarded route, which loops because '/' is both the landing page and the app's feed.
if (WEB && !APP_OPEN && typeof window !== 'undefined' && window.location.pathname !== '/') {
  window.location.replace('/');
}

/** Web only: remembers whether this browser was signed in last time, so we know what to show before the session check returns. */
function readHint(): boolean {
  if (!WEB) return false;
  try {
    return window.localStorage.getItem(HINT) === '1';
  } catch {
    return false;
  }
}

function writeHint(signedIn: boolean) {
  if (!WEB) return;
  try {
    if (signedIn) window.localStorage.setItem(HINT, '1');
    else window.localStorage.removeItem(HINT);
  } catch {
    // storage blocked: the hint is only a speed-up
  }
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    DynaPuff_600SemiBold,
  });
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [hint] = useState(readHint);

  // Before launch nobody counts as signed in, whatever an old cookie says.
  const signedIn = APP_OPEN && Boolean(session?.user);
  useEffect(() => {
    if (!isPending) writeHint(signedIn);
  }, [isPending, signedIn]);

  // Phones: the splash screen covers font loading and the session check.
  // Web: paint straight away. Fonts swap in when they arrive, and visitors who were
  // not signed in last time see the landing page without waiting for the session check.
  const publicPath = pathname === '/' || pathname === '/sign-in';
  const waitForSession = APP_OPEN && isPending && (!WEB || hint || !publicPath);
  if ((!WEB && !fontsLoaded) || waitForSession) {
    return (
      <View style={{ flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.wine} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.canvas } }}>
        {/* Guarded app pages go to /sign-in, never to '/', which would match the guarded feed again. */}
        <Stack.Protected guard={signedIn} redirectTo="/sign-in">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        {/* Landing page: web only; the phone apps open at sign-in. */}
        <Stack.Protected guard={!signedIn && WEB}>
          <Stack.Screen name="index" />
        </Stack.Protected>
        {/* While closed the web has only the landing page; the phone apps show the closed notice on sign-in. */}
        <Stack.Protected guard={!signedIn && (APP_OPEN || !WEB)}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
      </Stack>
    </SafeAreaProvider>
  );
}
