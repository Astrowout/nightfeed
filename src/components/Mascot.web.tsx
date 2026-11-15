import { BotAvatar } from 'bot-avatars';
import React from 'react';
import { View } from 'react-native';
import { LOOKS, MASCOT_LOOK, NIGHTCAP, type MascotProps } from './mascotConfig';

/** Web: the animated plush avatar from bot-avatars, drawn on a canvas. */
export function Mascot({ size = 64, state = 'default', onDark, look = MASCOT_LOOK, interactive = true, label }: MascotProps) {
  const l = LOOKS[look];
  return (
    <View style={{ width: size, height: size }} pointerEvents={interactive ? 'auto' : 'none'}>
      <BotAvatar
        type={l.type}
        path={l.path}
        color={l.color}
        ink="#292827"
        face={state === 'working' ? 'mouth' : 'eyes'}
        state={state}
        size={size}
        theme={onDark ? 'dark' : 'light'}
        saturation={1}
        brightness={l.brightness}
        furLength={0.55}
        furFuzz={0.55}
        furCurl={0.35}
        hat={state === 'sleeping' ? 'beanie' : 'none'}
        accessoryColor={NIGHTCAP}
        interactive={interactive}
        aria-label={label ?? (look === 'moon' ? `Moon, ${state === 'default' ? 'awake' : state}` : `Pillow, ${state === 'default' ? 'awake' : state}`)}
      />
    </View>
  );
}
