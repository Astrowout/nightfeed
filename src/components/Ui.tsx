import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F, MAX_W, R, S, T } from '../theme';

export function Screen({
  children,
  header,
  band,
  scroll = true,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  /** Full-bleed element placed above the content column (the night band). */
  band?: React.ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const body = (
    <>
      {band}
      <View style={s.inner}>{children}</View>
    </>
  );
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 56 }} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

/** Sticky header: parchment with a hairline, blurred on web. */
export function TopBar({ title, left, right, serif }: { title?: string; left?: React.ReactNode; right?: React.ReactNode; serif?: boolean }) {
  return (
    <View style={s.topbarWrap}>
      <View style={s.topbar}>
        <View style={s.side}>{left}</View>
        {title ? (
          <Text style={[serif ? T.h2 : T.title, { flex: 1, textAlign: 'center' }]} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={[s.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Stat({ label, value, dark, valueStyle }: { label: string; value: string; dark?: boolean; valueStyle?: object }) {
  return (
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <Text style={[T.eyebrow, dark && { color: C.onDarkMuted }]}>{label}</Text>
      <Text style={[T.stat, dark && { color: C.onDark }, valueStyle]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: S.section - 8 }}>
      <View style={s.sectionHead}>
        <Text style={T.h2}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'ghost' | 'onDark';

/** Wine pill is the only filled colour; lilac is secondary; ghost is text only. */
export function Button({
  label,
  onPress,
  kind = 'primary',
  small,
  disabled,
  busy,
  icon,
  full,
}: {
  label: string;
  onPress: () => void;
  kind?: ButtonKind;
  small?: boolean;
  disabled?: boolean;
  busy?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}) {
  const textColor = kind === 'primary' || kind === 'onDark' ? C.onDark : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      onPress={onPress}
      disabled={disabled || busy}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        s.btn,
        kind === 'primary' && s.btnPrimary,
        kind === 'secondary' && s.btnSecondary,
        kind === 'ghost' && s.btnGhost,
        kind === 'onDark' && s.btnOnDark,
        small && s.btnSmall,
        full && { alignSelf: 'stretch' },
        hovered && kind === 'primary' && { backgroundColor: '#55262F' },
        hovered && kind === 'ghost' && { backgroundColor: 'rgba(41,40,39,0.05)' },
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[s.btnText, { color: textColor }, small && { fontSize: 14 }]}>{label}</Text>
          {icon}
        </View>
      )}
    </Pressable>
  );
}

/** Superhuman tab strip: white container, lilac for the active option. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={s.segment} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[s.segmentItem, active && s.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[T.smallStrong, { color: active ? C.ink : C.muted }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && s.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
    >
      <Text style={[T.smallStrong, { color: C.ink }]}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, bg }: { label: string; bg: string }) {
  return (
    <View style={[s.tag, { backgroundColor: bg }]}>
      <Text style={[T.caption, { color: C.ink, fontFamily: F.sansSemi }]}>{label}</Text>
    </View>
  );
}

export function Progress({ value, max, color = C.lagoon, track = C.inset }: { value: number; max: number; color?: string; track?: string }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View style={[s.track, { backgroundColor: track }]}>
      <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={T.smallStrong}>{label}</Text>
      <TextInput placeholderTextColor={C.faint} style={s.input} accessibilityLabel={label} {...props} />
    </View>
  );
}

export function TextLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="link">
      {(state) => (
        <Text style={[T.link, (state as { hovered?: boolean }).hovered && { textDecorationLine: 'underline' }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.line }} />;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.canvas },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: S.lg },
  topbarWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
    backgroundColor: Platform.OS === 'web' ? 'rgba(242,240,235,0.86)' : C.canvas,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null),
    zIndex: 5,
  },
  topbar: {
    width: '100%',
    maxWidth: MAX_W,
    alignSelf: 'center',
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: S.md,
  },
  side: { minWidth: 72 },
  card: {
    backgroundColor: C.paper,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: S.md },
  btn: { borderRadius: R.pill, minHeight: 48, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  btnSmall: { minHeight: 36, paddingHorizontal: 16 },
  btnPrimary: { backgroundColor: C.wine },
  btnSecondary: { backgroundColor: C.lilac, borderWidth: 1, borderColor: C.ink },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.line },
  btnOnDark: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.onDark },
  btnText: { fontFamily: F.sansMedium, fontSize: 16, letterSpacing: -0.1 },
  segment: {
    flexDirection: 'row',
    backgroundColor: C.paper,
    borderRadius: R.tab,
    borderWidth: 1,
    borderColor: C.line,
    padding: 3,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 6 },
  segmentActive: { backgroundColor: C.lilac },
  chip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.paper,
  },
  chipActive: { backgroundColor: C.lilac, borderColor: C.ink },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 2, borderRadius: R.pill },
  track: { height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  input: {
    fontFamily: F.sans,
    fontSize: 16,
    color: C.ink,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
