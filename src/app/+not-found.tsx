import { Link, Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Mascot } from '../components/Mascot';
import { C, S, T } from '../theme';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={{ flex: 1, backgroundColor: C.canvas, alignItems: 'center', justifyContent: 'center', padding: S.xl, gap: S.lg }}>
        <Mascot size={160} state="sleeping" />
        <Text style={[T.h1, { textAlign: 'center' }]}>This page is fast asleep.</Text>
        <Text style={[T.body, { color: C.muted, textAlign: 'center', maxWidth: 360 }]}>
          Plume looked under every pillow and could not find it. Let’s go back to the feed.
        </Text>
        <Link href="/" style={T.link}>
          Take me home
        </Link>
      </View>
    </>
  );
}
