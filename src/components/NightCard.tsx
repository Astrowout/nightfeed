import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { clock, hm, nightLabel } from '../data/format';
import { asleepMinutes, scoreLabel, scoreNight } from '../data/score';
import { isMonthBest, sleeper } from '../data/selectors';
import { useStore } from '../data/store';
import type { Night } from '../data/types';
import { C, R, scoreColor } from '../theme';
import { Avatar } from './Avatar';
import { Hypnogram } from './Charts';
import { CommentIcon, LockIcon, StarIcon, TrophyIcon } from './Icons';
import { Stat } from './Ui';

export function NightCard({ night }: { night: Night }) {
  const { state, dispatch } = useStore();
  const who = sleeper(state, night.sleeperId);
  const score = scoreNight(night, state.nights);
  const mine = night.kudos.includes(state.meId);
  const isMe = night.sleeperId === state.meId;
  const best = isMonthBest(state, night);
  const open = () => router.push(`/night/${night.id}`);

  return (
    <View style={st.card}>
      <Pressable onPress={() => router.push(`/sleeper/${night.sleeperId}`)} style={st.head} accessibilityRole="link">
        <Avatar sleeper={who} size={38} />
        <View style={{ flex: 1 }}>
          <Text style={st.name}>{isMe ? 'You' : who?.name}</Text>
          <Text style={st.meta}>
            {nightLabel(night.session.end_time)} · {night.session.source.device_name ?? night.session.source.provider}
          </Text>
        </View>
        {night.visibility === 'only_me' && <LockIcon size={16} color={C.muted} />}
      </Pressable>

      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={`Open ${night.title}`}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
          <Text style={st.title} numberOfLines={1}>
            {night.title}
          </Text>
          {best && (
            <View style={st.badge}>
              <TrophyIcon size={13} color={C.moonInk} />
              <Text style={st.badgeText}>28-day best</Text>
            </View>
          )}
        </View>
        {night.caption ? <Text style={st.caption}>{night.caption}</Text> : null}

        <View style={st.stats}>
          <Stat label="Asleep" value={hm(asleepMinutes(night.session))} />
          <Stat label="Score" value={`${score.total}`} color={scoreColor(score.total)} />
          <Stat label="Lights out" value={clock(night.session.start_time)} />
        </View>
        <Text style={[st.meta, { marginTop: 2 }]}>{scoreLabel(score.total)}</Text>

        <View style={st.hypno}>
          <Hypnogram session={night.session} compact />
        </View>
      </Pressable>

      <View style={st.footer}>
        <Text style={st.meta}>
          {night.kudos.length} kudos · {night.comments.length} {night.comments.length === 1 ? 'comment' : 'comments'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {!isMe && (
            <Pressable
              onPress={() => dispatch({ type: 'kudos', nightId: night.id })}
              style={st.action}
              accessibilityRole="button"
              accessibilityLabel={mine ? 'Remove kudos' : 'Give kudos'}
            >
              <StarIcon size={20} color={mine ? C.moon : C.muted} filled={mine} />
            </Pressable>
          )}
          <Pressable onPress={open} style={st.action} accessibilityRole="button" accessibilityLabel="Comment">
            <CommentIcon size={20} color={C.muted} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.border,
    padding: 16,
    marginBottom: 14,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: C.text, fontWeight: '700', fontSize: 15 },
  meta: { color: C.muted, fontSize: 12.5 },
  title: { color: C.text, fontSize: 19, fontWeight: '800', letterSpacing: -0.4, flexShrink: 1 },
  caption: { color: C.text, opacity: 0.85, marginTop: 4, fontSize: 14 },
  stats: { flexDirection: 'row', gap: 12, marginTop: 14 },
  hypno: { marginTop: 12, backgroundColor: C.bg, borderRadius: R.md, padding: 8 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  action: { padding: 8, borderRadius: R.pill, backgroundColor: C.surface2 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.moon,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: R.pill,
  },
  badgeText: { color: C.moonInk, fontSize: 11, fontWeight: '800' },
});
