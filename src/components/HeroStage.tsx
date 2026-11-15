import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { buildSession, rng } from '../data/generate';
import type { Sleeper } from '../data/types';
import { C, F, FLOAT, R, S, T, scoreTag } from '../theme';
import { Avatar, AvatarStack } from './Avatar';
import { SleepStrip } from './Charts';
import { CommentIcon, StarIcon } from './Icons';
import { Mascot } from './Mascot';
import { Tag } from './Ui';

// The landing hero: a phone on a night sky with your post from last night, Plume asleep on top,
// and the morning's social moments popping in one after the other (kudos, a comment, a leaderboard
// climb). It is the only scripted motion on the page and it respects reduced motion.

const person = (name: string, color: string) => ({ id: name, name, color }) as unknown as Sleeper;
const YOU = person('You', C.lilac);
const JONAS = person('Jonas De Smet', C.mint);
const SAM = person('Sam Peeters', C.marigold);
const MIRA = person('Mira Vos', C.periwinkle);
const LOTTE = person('Lotte Claes', C.peach);

function prefersReducedMotion() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Drives the morning sequence: 0 nothing yet, 1 kudos, 2 comment, 3 leaderboard. */
function useMorning() {
  const [reduced] = useState(prefersReducedMotion);
  const [step, setStep] = useState(reduced ? 3 : 0);
  const [anims] = useState(() => [0, 1, 2].map(() => new Animated.Value(reduced ? 1 : 0)));
  useEffect(() => {
    if (reduced) return;
    const timers = [700, 1700, 2700].map((ms, i) =>
      setTimeout(() => {
        setStep(i + 1);
        Animated.timing(anims[i], { toValue: 1, duration: 420, easing: Easing.out(Easing.back(1.4)), useNativeDriver: Platform.OS !== 'web' }).start();
      }, ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [anims, reduced]);
  return { step, anims };
}

const pop = (a: Animated.Value) => ({
  opacity: a,
  transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }],
});

export function HeroStage({ width }: { width: number }) {
  const narrow = width < 460;
  const phoneW = narrow ? Math.min(250, width - 72) : 286;
  const stageH = narrow ? 540 : 620;
  const phoneTop = narrow ? 70 : 84;
  // Wide: the phone sits left of centre so the notifications have room on the right.
  const phoneLeft = narrow ? (width - phoneW) / 2 : Math.max(24, width * 0.12);
  const { step, anims } = useMorning();

  return (
    <View style={{ width, height: stageH }} accessibilityLabel="Example: your night posted on Kudoze, with kudos and a comment from friends and a bedtime leaderboard">
      {/* The night sky clips the phone, so it reads as rising out of the frame */}
      <View style={[StyleSheet.absoluteFill, st.sky]}>
        <Stars width={width} height={stageH} />
        <View style={{ position: 'absolute', top: phoneTop, left: phoneLeft }}>
          <Phone width={phoneW} kudos={step >= 1 ? 12 : 11} comments={step >= 2 ? 3 : 2} narrow={narrow} />
        </View>
      </View>

      {/* Plume sleeping on top of the phone, like a pillow on a bed */}
      <View style={{ position: 'absolute', top: phoneTop - (narrow ? 62 : 74), left: phoneLeft + phoneW / 2 - (narrow ? 50 : 60) }} pointerEvents="box-none">
        <Mascot size={narrow ? 100 : 120} state="sleeping" label="Plume the pillow, asleep on the phone" />
      </View>

      <Animated.View style={[st.toast, FLOAT, pop(anims[0]), narrow ? { bottom: 108, left: -6, width: 220 } : { top: 118, right: -16, width: 236 }]}>
        <View style={st.kudosBadge}>
          <StarIcon size={16} color={C.onDark} filled />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[T.smallStrong, narrow && { fontSize: 12 }]}>Jonas gave you kudos</Text>
          <Text style={[T.caption, narrow && { fontSize: 11 }]} numberOfLines={1}>
            on “Finally beat my bedtime”
          </Text>
        </View>
      </Animated.View>

      <Animated.View style={[st.toast, FLOAT, pop(anims[1]), { alignItems: 'flex-start' }, narrow ? { bottom: 10, right: -6, width: 232 } : { top: 330, right: -16, width: 236 }]}>
        <Avatar sleeper={SAM} size={30} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[T.smallStrong, narrow && { fontSize: 12 }]}>Sam</Text>
          <Text style={[T.small, { color: C.ink }, narrow && { fontSize: 12, lineHeight: 17 }]}>Who are you and what did you do with the night owl?</Text>
        </View>
      </Animated.View>

      {!narrow && (
        <Animated.View style={[st.board, FLOAT, pop(anims[2])]}>
          <Text style={T.smallStrong}>Lights out by 23:00</Text>
          <Text style={[T.caption, { marginBottom: 6 }]}>This week, 4 friends</Text>
          <BoardRow rank={1} who={MIRA} nights={6} />
          <BoardRow rank={2} who={YOU} nights={5} you climbed={step >= 3} />
          <BoardRow rank={3} who={JONAS} nights={5} />
        </Animated.View>
      )}
    </View>
  );
}

function BoardRow({ rank, who, nights, you, climbed }: { rank: number; who: Sleeper; nights: number; you?: boolean; climbed?: boolean }) {
  return (
    <View style={[st.row, you && { backgroundColor: C.lilac }]}>
      <Text style={[T.smallStrong, { width: 14, color: C.muted }]}>{rank}</Text>
      <Avatar sleeper={who} size={24} />
      <Text style={[T.small, { color: C.ink, flex: 1 }, you && { fontFamily: F.sansSemi }]} numberOfLines={1}>
        {you ? 'You' : who.name.split(' ')[0]}
      </Text>
      {you && climbed && <Tag label="Up 1" bg={C.mint} />}
      <Text style={[T.small, { color: C.ink, fontVariant: ['tabular-nums'] }]}>{nights} of 7</Text>
    </View>
  );
}

function Stars({ width, height }: { width: number; height: number }) {
  const dots = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 46 }, () => ({ x: r() * width, y: r() * height * 0.9, r: r() < 0.15 ? 1.6 : 0.9, o: 0.25 + r() * 0.5 }));
  }, [width, height]);
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((d, i) => (
        <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFFFFF" opacity={d.o} />
      ))}
    </Svg>
  );
}

/** A phone showing the Kudoze feed, with your post from last night on top. */
function Phone({ width, kudos, comments, narrow }: { width: number; kudos: number; comments: number; narrow: boolean }) {
  const session = useMemo(() => {
    const bed = new Date();
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 12, 0, 0);
    return buildSession(rng(11), bed, 452, 'oura');
  }, []);
  const tag = scoreTag(86);
  const k = narrow ? 0.88 : 1;

  return (
    <View style={[st.phone, { width, height: width * 2.05, borderRadius: width * 0.16 }]}>
      <View style={[st.screen, { borderRadius: width * 0.16 - 8 }]}>
        <View style={st.statusBar}>
          <Text style={[st.status, { fontSize: 12 * k }]}>7:02</Text>
          <View style={st.island} />
          <View style={st.battery}>
            <View style={st.batteryFill} />
          </View>
        </View>
        <View style={st.appBar}>
          <Text style={{ fontFamily: F.logo, fontSize: 18 * k, color: C.ink, letterSpacing: -0.4 }}>kudoze</Text>
          <Avatar sleeper={YOU} size={24} />
        </View>

        <View style={[st.post, { padding: 12 * k }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Avatar sleeper={YOU} size={30} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[T.smallStrong, { fontSize: 13 * k }]}>You</Text>
              <Text style={[T.caption, { fontSize: 11 * k, lineHeight: 15 }]} numberOfLines={1}>
                Last night, Oura Ring
              </Text>
            </View>
            <Tag label={tag.label} bg={tag.bg} />
          </View>
          <Text style={{ fontFamily: F.serif, fontSize: 18 * k, lineHeight: 22 * k, letterSpacing: -0.4, color: C.ink, marginTop: 10 }}>
            Finally beat my bedtime
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            <MiniStat label="Asleep" value="7h 32m" k={k} />
            <MiniStat label="Lights out" value="23:12" k={k} />
            <MiniStat label="Score" value="86" k={k} />
          </View>
          <View style={{ marginTop: 12 }}>
            <SleepStrip session={session} height={10} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 8 }}>
            <AvatarStack people={[JONAS, SAM, MIRA]} size={20} />
            <Text style={[T.caption, { flex: 1, fontSize: 11 * k, color: C.ink }]} numberOfLines={1}>
              {kudos} kudos
            </Text>
            <View style={st.meta}>
              <StarIcon size={15} color={C.wine} filled={kudos > 11} />
              <CommentIcon size={15} color={C.muted} />
              <Text style={[T.caption, { fontSize: 11 * k }]}>{comments}</Text>
            </View>
          </View>
        </View>

        {/* The next post in the feed, cut off by the frame */}
        <View style={[st.post, { padding: 12 * k, marginTop: 8 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Avatar sleeper={LOTTE} size={30} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[T.smallStrong, { fontSize: 13 * k }]}>Lotte Claes</Text>
              <Text style={[T.caption, { fontSize: 11 * k, lineHeight: 15 }]}>Last night, Garmin</Text>
            </View>
          </View>
          <Text style={{ fontFamily: F.serif, fontSize: 18 * k, lineHeight: 22 * k, letterSpacing: -0.4, color: C.ink, marginTop: 10 }}>
            Eight hours, no snooze
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            <MiniStat label="Asleep" value="8h 04m" k={k} />
            <MiniStat label="Lights out" value="22:41" k={k} />
            <MiniStat label="Score" value="91" k={k} />
          </View>
        </View>
      </View>
    </View>
  );
}

function MiniStat({ label, value, k }: { label: string; value: string; k: number }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text style={[T.caption, { fontSize: 10 * k, lineHeight: 13 }]}>{label}</Text>
      <Text style={{ fontFamily: F.sansMedium, fontSize: 16 * k, lineHeight: 21 * k, color: C.ink, letterSpacing: -0.3, fontVariant: ['tabular-nums'] }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  sky: { backgroundColor: C.lagoon, borderRadius: 32, overflow: 'hidden' },
  phone: { backgroundColor: '#1F1E1D', padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  screen: { flex: 1, backgroundColor: C.canvas, overflow: 'hidden', paddingHorizontal: 10 },
  statusBar: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  status: { fontFamily: F.sansSemi, color: C.ink },
  island: { width: 70, height: 20, borderRadius: 10, backgroundColor: '#1F1E1D' },
  battery: { width: 22, height: 11, borderRadius: 3, borderWidth: 1, borderColor: C.ink, padding: 1 },
  batteryFill: { width: '80%', height: '100%', borderRadius: 1, backgroundColor: C.ink },
  appBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 8 },
  post: { backgroundColor: C.paper, borderRadius: R.card, borderWidth: 1, borderColor: C.line },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toast: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.paper,
    borderRadius: R.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  kudosBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.wine, alignItems: 'center', justifyContent: 'center' },
  board: {
    position: 'absolute',
    left: -28,
    bottom: 36,
    width: 236,
    backgroundColor: C.paper,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 6, borderRadius: 8 },
});
