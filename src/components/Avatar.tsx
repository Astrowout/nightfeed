import React from 'react';
import { Text, View } from 'react-native';
import { initials } from '../data/format';
import type { Sleeper } from '../data/types';

export function Avatar({ sleeper, size = 40 }: { sleeper?: Sleeper; size?: number }) {
  const color = sleeper?.color ?? '#555';
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '33',
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontWeight: '800', fontSize: size * 0.36 }}>{sleeper ? initials(sleeper.name) : '?'}</Text>
    </View>
  );
}
