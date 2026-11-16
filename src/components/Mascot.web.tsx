// bot-avatars is vendored (vendor/bot-avatars) for Plume's sleep mask; see vendor/bot-avatars/KUDOZE.md.
import { BotAvatar } from '../../vendor/bot-avatars';
import React from 'react';
import { View } from 'react-native';
import { LOOKS, MASCOT_LOOK, ACCESSORY, mascotLabel, type MascotProps } from './mascotConfig';

/** Web: the animated plush avatar from bot-avatars, drawn on a canvas. */
export function Mascot(props: MascotProps) {
  const { size = 64, state = 'default', onDark, look = MASCOT_LOOK, interactive = true, smile, glasses, headphones, bowTie, accessoryColor } = props;
  const l = LOOKS[look];
  return (
    <View style={{ width: size, height: size }} pointerEvents={interactive ? 'auto' : 'none'}>
      <BotAvatar
        type={l.type}
        path={l.path}
        color={l.color}
        ink="#292827"
        face={smile || state === 'working' ? 'mouth' : 'eyes'}
        state={state}
        size={size}
        theme={onDark ? 'dark' : 'light'}
        saturation={1}
        brightness={l.brightness}
        furLength={0.55}
        furFuzz={0.55}
        furCurl={0.35}
        hat="none"
        glasses={glasses ?? 'none'}
        headphones={headphones}
        bowTie={bowTie}
        accessoryColor={accessoryColor ?? ACCESSORY}
        interactive={interactive}
        aria-label={mascotLabel(props)}
      />
    </View>
  );
}
