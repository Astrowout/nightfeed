import React from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, type ImageStyle, type StyleProp } from 'react-native';
import type { NightPhotoRef } from '../data/types';
import { API_BASE, authHeaders } from '../lib/auth';
import { C, S, T } from '../theme';

/** The photo of the day on a night, at its own shape but never taller than 4:5 or wider than 16:9. */
export function NightPhoto({ photo, uri, style }: { photo: Pick<NightPhotoRef, 'width' | 'height'> & { id?: string }; uri?: string; style?: StyleProp<ImageStyle> }) {
  const ratio = Math.min(16 / 9, Math.max(4 / 5, photo.width / photo.height));
  const source = uri ? { uri } : { uri: `${API_BASE}/api/photos/${photo.id}`, headers: authHeaders() };
  return (
    <Image
      source={source}
      resizeMode="cover"
      accessibilityLabel="Photo of the day"
      style={[{ width: '100%', aspectRatio: ratio, borderRadius: 12, backgroundColor: C.inset }, style]}
    />
  );
}

/** Empty state for the owner: a dashed drop zone that opens the photo picker. */
export function AddPhotoButton({ onPress, busy }: { onPress: () => void; busy?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="Add a photo of your day"
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [st.add, (hovered || pressed) && { backgroundColor: C.paper, borderColor: C.ink }]}
    >
      {busy ? (
        <ActivityIndicator color={C.wine} />
      ) : (
        <>
          <Text style={T.bodyStrong}>Add a photo of your day</Text>
          <Text style={T.caption}>Optional. Your coffee, your run, the view from bed.</Text>
        </>
      )}
    </Pressable>
  );
}

const st = StyleSheet.create({
  add: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.faint,
    backgroundColor: C.inset,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: S.lg,
  },
});
