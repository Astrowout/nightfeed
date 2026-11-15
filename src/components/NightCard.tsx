import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { clock, hm, nightLabel } from '../data/format';
import { PROVIDER_LABEL } from '../data/generate';
import { asleepMinutes, scoreNight } from '../data/score';
import { isMonthBest, sleeper } from '../data/selectors';
import { useStore } from '../data/store';
import type { Night } from '../data/types';
import { C, F, R, S, T, scoreTag } from '../theme';
import { Avatar, AvatarStack } from './Avatar';
import { Hypnogram } from './Charts';
import { CommentIcon, LockIcon, StarIcon, TrophyIcon } from './Icons';
import { Stat, Tag } from './Ui';

export function NightCard({ night }: { night: Night }) {
  const { state, dispatch } = useStore();
  const who = sleeper(state, night.sleeperId);
  const score = scoreNight(night, state.nights);
  const tag = scoreTag(score.total);
  const given = night.kudos.includes(state.meId);
  const isMe = night.sleeperId === state.meId;
  const best = isMonthBest(state, night);
  const open = () => router.push(`/night/${night.id}`);
  const device = night.session.source.device_name ?? PROVIDER_LABEL[String(night.session.source.provider)] ?? night.session.source.provider;

  return (
    <View style={st.card}>
      <Pressable onPress={() => router.push(`/sleeper/${night.sleeperId}`)} style={st.head} accessibilityRole="link">
        <Avatar sleeper={who} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={T.bodyStrong} numberOfLines={1}>
            {isMe ? 'You' : who?.name}
          </Text>
          <Text style={T.caption} numberOfLines={1}>
            {nightLabel(night.session.end_time)} · {device}
          </Text>
        </View>
        {night.visibility === 'only_me' && (
          <View style={st.private}>
            <LockIcon size={13} color={C.muted} />
            <Text style={T.caption}>Only you</Text>
          </View>
        )}
      </Pressable>

      <Pressable onPress={open} accessibilityRole="link" accessibilityLabel={`Open ${night.title}`} style={{ gap: S.md, marginTop: S.md }}>
        <View style={{ gap: 6 }}>
          <Text style={T.h2} numberOfLines={2}>
            {night.title}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Tag label={tag.label} bg={tag.bg} />
            {best && (
              <View style={st.best}>
                <TrophyIcon size={12} color={C.ink} />
                <Text style={[T.caption, { color: C.ink, fontFamily: F.sansSemi }]}>Best in 28 days</Text>
              </View>
            )}
          </View>
          {night.caption ? <Text style={[T.body, { fontFamily: F.serifItalic, fontSize: 16 }]}>“{night.caption}”</Text> : null}
        </View>

        <View style={st.stats}>
          <Stat label="Asleep" value={hm(asleepMinutes(night.session))} />
          <View style={st.vr} />
          <Stat label="Score" value={`${score.total}`} />
          <View style={st.vr} />
          <Stat label="Lights out" value={clock(night.session.start_time)} />
        </View>

        <View style={st.well}>
          <Hypnogram session={night.session} compact />
        </View>
      </Pressable>

      <View style={st.footer}>
        <Pressable onPress={open} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }} accessibilityRole="link">
          {night.kudos.length > 0 && <AvatarStack people={night.kudos.map((k) => sleeper(state, k))} size={22} />}
          <Text style={T.caption}>
            {night.kudos.length ? `${night.kudos.length} kudos` : 'No kudos yet'}
            {night.comments.length ? ` · ${night.comments.length} ${night.comments.length === 1 ? 'comment' : 'comments'}` : ''}
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {!isMe && (
            <Pressable
              onPress={() => dispatch({ type: 'kudos', nightId: night.id })}
              style={[st.action, given && st.actionOn]}
              accessibilityRole="button"
              accessibilityState={{ selected: given }}
              accessibilityLabel={given ? 'Remove kudos' : 'Give kudos'}
            >
              <StarIcon size={18} color={C.ink} filled={given} />
            </Pressable>
          )}
          <Pressable onPress={open} style={st.action} accessibilityRole="button" accessibilityLabel="Comment">
            <CommentIcon size={18} color={C.ink} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card: {
    backgroundColor: C.paper,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.lg,
    marginBottom: S.lg,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: S.md },
  private: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  best: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.marigold, paddingHorizontal: 9, paddingVertical: 2, borderRadius: R.pill },
  stats: { flexDirection: 'row', alignItems: 'stretch', gap: S.md },
  vr: { width: 1, backgroundColor: C.line },
  well: { backgroundColor: C.inset, borderRadius: 12, padding: 10 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: S.md,
    paddingTop: S.md,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  action: {
    width: 40,
    height: 40,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.paper,
  },
  actionOn: { backgroundColor: C.lilac, borderColor: C.ink },
});
