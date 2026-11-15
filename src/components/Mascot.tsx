import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LOOKS, MASCOT_LOOK, NIGHTCAP, mascotLabel, type MascotProps } from './mascotConfig';

// iOS and Android: a still drawing of the same mascot. The animated bot-avatars
// port for React Native (Skia + Reanimated) is not on npm yet; swap it in here
// once it is, keeping these props. Glasses, headphones and bow tie are web-only for now.

const INK = '#292827';

export function Mascot(props: MascotProps) {
  const { size = 64, state = 'default', look = MASCOT_LOOK, smile, hat, accessoryColor } = props;
  const l = LOOKS[look];
  const asleep = state === 'sleeping';
  const cap = hat ?? (asleep ? 'beanie' : 'none');
  const capColor = accessoryColor ?? NIGHTCAP;
  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={mascotLabel(props)}>
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
            <Path d="M36 54q5 5 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
            <Path d="M54 54q5 5 10 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Circle cx={41} cy={52} r={4.5} fill={INK} />
            <Circle cx={59} cy={52} r={4.5} fill={INK} />
            {(smile || state === 'working') && <Path d="M44 64q6 6 12 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />}
          </>
        )}
        {cap === 'beanie' && <Path d="M26 20C30 2 70 2 74 20Z" fill={capColor} />}
        {cap === 'beanie' && <Circle cx={50} cy={1} r={5} fill={capColor} />}
        {cap === 'party' && <Path d="M40 18L50 -6L60 18Z" fill={capColor} />}
        {cap === 'crown' && <Path d="M34 18L36 2L44 10L50 0L56 10L64 2L66 18Z" fill="#D9A93A" />}
      </Svg>
    </View>
  );
}
