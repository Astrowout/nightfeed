import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { C, F } from '../theme';
import { Mascot } from './Mascot';

/**
 * The Kudoze logo: Plume plus the wordmark in Fraunces Black Italic, soft and a little sleepy.
 * Pass onPress to make it a home link.
 */
export function Wordmark({ size = 24, mascot = size * 1.4, onPress, label = 'Kudoze home' }: { size?: number; mascot?: number; onPress?: () => void; label?: string }) {
  const mark = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Math.round(size / 3) }}>
      <Mascot size={mascot} interactive={false} />
      <Text style={{ fontFamily: F.logo, fontSize: size, lineHeight: size * 1.15, letterSpacing: -size * 0.02, color: C.ink }}>kudoze</Text>
    </View>
  );
  if (!onPress) return mark;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [{ borderRadius: 12, paddingVertical: 2, paddingRight: 4 }, (hovered || pressed) && { opacity: 0.8 }]}
    >
      {mark}
    </Pressable>
  );
}
