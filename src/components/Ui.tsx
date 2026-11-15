import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, MAX_W, R } from '../theme';

export function Screen({
  children,
  header,
  scroll = true,
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const body = <View style={s.inner}>{children}</View>;
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {header}
      {scroll ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </View>
  );
}

export function TopBar({ title, left, right }: { title: string; left?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <View style={s.topbarWrap}>
      <View style={s.topbar}>
        <View style={s.side}>{left}</View>
        <Text style={s.topTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[s.side, { alignItems: 'flex-end' }]}>{right}</View>
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, color ? { color } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  small,
  disabled,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'ghost';
  small?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.btn,
        kind === 'primary' ? s.btnPrimary : s.btnGhost,
        small && s.btnSmall,
        (pressed || disabled) && { opacity: 0.6 },
      ]}
    >
      <Text style={[s.btnText, kind === 'primary' ? { color: C.moonInk } : { color: C.text }, small && { fontSize: 13 }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.pill, active && s.pillActive]} accessibilityRole="button">
      <Text style={[s.pillText, active && { color: C.moonInk }]}>{label}</Text>
    </Pressable>
  );
}

export function Progress({ value, max, color = C.moon }: { value: number; max: number; color?: string }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  inner: { width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: 16 },
  topbarWrap: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, backgroundColor: C.bg },
  topbar: {
    width: '100%',
    maxWidth: MAX_W,
    alignSelf: 'center',
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  side: { width: 72 },
  topTitle: { flex: 1, textAlign: 'center', color: C.text, fontSize: 17, fontWeight: '700' },
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    padding: 16,
  },
  statLabel: { color: C.muted, fontSize: 12, marginBottom: 2 },
  statValue: { color: C.text, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  btn: { borderRadius: R.pill, paddingVertical: 13, paddingHorizontal: 20, alignItems: 'center' },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 14 },
  btnPrimary: { backgroundColor: C.moon },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border },
  btnText: { fontWeight: '700', fontSize: 15 },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.border,
    marginRight: 8,
    marginBottom: 8,
  },
  pillActive: { backgroundColor: C.moon, borderColor: C.moon },
  pillText: { color: C.text, fontSize: 13, fontWeight: '600' },
  track: { height: 8, borderRadius: 4, backgroundColor: C.surface2, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  muted: { color: C.muted, fontSize: 13 },
  h1: { color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  body: { color: C.text, fontSize: 15, lineHeight: 21 },
});
