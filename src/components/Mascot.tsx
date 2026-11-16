import React from 'react';
import { Image, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LOOKS, MASCOT_LOOK, mascotLabel, type MascotProps } from './mascotConfig';

// iOS and Android: a still drawing of the same mascot. The animated bot-avatars
// port for React Native (Skia + Reanimated) is not on npm yet; swap it in here
// once it is, keeping these props. Glasses, headphones and bow tie are web-only for now,
// except the sleep mask, which shows as a still image.

const INK = '#292827';

export function Mascot(props: MascotProps) {
  const { size = 64, state = 'default', look = MASCOT_LOOK, smile, glasses } = props;
  const l = LOOKS[look];
  const asleep = state === 'sleeping';

  // The sleep mask is a still of the web canvas (vendored bot-avatars, sleeping pillow in a
  // Midnight Wine mask). The canvas draws 1.5× its box, the extra room mostly above for hops,
  // and pulls itself back with negative margins; the still does the same.
  if (glasses === 'mask' && look === 'pillow') {
    return (
      <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={mascotLabel(props)}>
        <Image
          source={require('../../assets/plume-mask.png')}
          style={{ width: size * 1.5, height: size * 1.5, marginTop: -size * 0.35, marginLeft: -size * 0.25 }}
        />
      </View>
    );
  }

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
      </Svg>
    </View>
  );
}
