import React from 'react';
import { Pressable, Text } from 'react-native';
import { C, F } from '../theme';

/**
 * The Kudoze logo: the word alone, in DynaPuff. Plume is not part of it, because the
 * mascot already shows up large on every screen the logo is on.
 * Pass onPress to make it a home link.
 */
export function Wordmark({ size = 26, onPress, label = 'Kudoze home' }: { size?: number; onPress?: () => void; label?: string }) {
  const word = (
    <Text style={{ fontFamily: F.logo, fontSize: size, lineHeight: size * 1.2, letterSpacing: -size * 0.01, color: C.ink }} accessibilityRole={onPress ? undefined : 'header'}>
      kudoze
    </Text>
  );
  if (!onPress) return word;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [{ borderRadius: 8, paddingVertical: 2 }, (hovered || pressed) && { opacity: 0.75 }]}
    >
      {word}
    </Pressable>
  );
}
