import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LOOKS, MASCOT_LOOK, NIGHTCAP, type MascotProps } from './mascotConfig';

// iOS and Android: a still drawing of the same mascot. The animated bot-avatars
// port for React Native (Skia + Reanimated) is not on npm yet; swap it in here
// once it is, keeping these props.

const INK = '#292827';

export function Mascot({ size = 64, state = 'default', look = MASCOT_LOOK, label }: MascotProps) {
  const l = LOOKS[look];
  const asleep = state === 'sleeping';
  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={label ?? (look === 'moon' ? 'Moon' : 'Pillow')}>
      <Svg width={size} height={size} viewBox="-6 -10 112 112">
        {l.path ? <Path d={l.path} fill={l.color} /> : <Circle cx={50} cy={52} r={40} fill={l.color} />}
        {l.craters && (
          <>
            <Circle cx={30} cy={40} r={6} fill={l.craters} />
            <Circle cx={70} cy={70} r={8} fill={l.craters} />
            <Circle cx={72} cy={34} r={4} fill={l.craters} />
          </>
        )}
        {asleep ? (
          <>
            <Path d="M36 56q5 5 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M54 56q5 5 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M24 22C30 4 62 -2 80 14L86 6C90 3 95 8 92 12L84 20C72 10 44 10 30 26Z" fill={NIGHTCAP} />
          </>
        ) : (
          <>
            <Circle cx={41} cy={54} r={4.5} fill={INK} />
            <Circle cx={59} cy={54} r={4.5} fill={INK} />
            {state === 'working' && <Path d="M44 66q6 6 12 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />}
          </>
        )}
      </Svg>
    </View>
  );
}
