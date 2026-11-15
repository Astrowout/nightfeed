import React from 'react';
import { Text, View } from 'react-native';
import { initials } from '../data/format';
import type { Sleeper } from '../data/types';
import { C, F } from '../theme';

export function Avatar({ sleeper, size = 40, ring }: { sleeper?: Sleeper; size?: number; ring?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: sleeper?.color ?? C.inset,
        borderWidth: ring ? 2 : 1,
        borderColor: ring ?? 'rgba(41,40,39,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: C.ink, fontFamily: F.sansSemi, fontSize: size * 0.36, letterSpacing: -0.2 }}>
        {sleeper ? (size < 30 ? initials(sleeper.name).slice(0, 1) : initials(sleeper.name)) : '?'}
      </Text>
    </View>
  );
}

/** Overlapping avatars, as in a kudos row. */
export function AvatarStack({ people, size = 24, max = 4 }: { people: (Sleeper | undefined)[]; size?: number; max?: number }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {people.slice(0, max).map((p, i) => (
        <View key={p?.id ?? i} style={{ marginLeft: i ? -size * 0.32 : 0 }}>
          <Avatar sleeper={p} size={size} ring={C.paper} />
        </View>
      ))}
    </View>
  );
}
