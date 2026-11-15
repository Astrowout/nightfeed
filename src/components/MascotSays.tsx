import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, F, R, S } from '../theme';
import { Mascot } from './Mascot';
import type { MascotProps } from './mascotConfig';

/**
 * Plume with a speech bubble: the mascot's voice. Keep lines short and warm,
 * in the first person, the way a brand mascot talks.
 */
export function MascotSays({
  children,
  mascot,
  size = 88,
  side = 'right',
  onDark,
  style,
}: {
  children: React.ReactNode;
  mascot?: MascotProps;
  size?: number;
  /** where the bubble sits next to Plume */
  side?: 'right' | 'left';
  onDark?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bubble = (
    <View style={[st.bubble, onDark && st.bubbleDark, side === 'right' ? { marginLeft: 6 } : { marginRight: 6 }]}>
      <View
        style={[
          st.tail,
          onDark && st.tailDark,
          side === 'right' ? { left: -6, borderRightWidth: 0, borderTopWidth: 0 } : { right: -6, borderLeftWidth: 0, borderBottomWidth: 0 },
        ]}
      />
      {typeof children === 'string' ? <Text style={[st.text, onDark && { color: C.onDark }]}>{children}</Text> : children}
    </View>
  );
  return (
    <View style={[st.row, style]}>
      {side === 'left' && bubble}
      <Mascot size={size} onDark={onDark} {...mascot} />
      {side === 'right' && bubble}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  bubble: {
    flexShrink: 1,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.card,
    paddingHorizontal: S.lg,
    paddingVertical: S.md,
    maxWidth: 320,
  },
  bubbleDark: { backgroundColor: '#1F5354', borderColor: C.onDarkLine },
  tail: {
    position: 'absolute',
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    transform: [{ rotate: '45deg' }],
  },
  tailDark: { backgroundColor: '#1F5354', borderColor: C.onDarkLine },
  text: { fontFamily: F.serifItalic, fontSize: 17, lineHeight: 24, color: C.ink },
});
