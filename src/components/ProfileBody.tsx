import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { hm, nightLabel } from '../data/format';
import { PROVIDER_LABEL } from '../data/generate';
import { lastNDays, nightsOf, periodStats, personalBests, sleeper, streak } from '../data/selectors';
import { useStore } from '../data/store';
import { C, S, T, scoreTag } from '../theme';
import { Avatar } from './Avatar';
import { WeekBars } from './Charts';
import { PaperScrap } from './Collage';
import { ChevronIcon, LockIcon } from './Icons';
import { NightCard } from './NightCard';
import { Button, Card, Section, Stat, Tag } from './Ui';

export function ProfileBody({ sleeperId, showNights = true }: { sleeperId: string; showNights?: boolean }) {
  const { state, dispatch } = useStore();
  const who = sleeper(state, sleeperId);
  const isMe = sleeperId === state.meId;
  const following = state.following.includes(sleeperId);
  const canSee = isMe || following;
  const recent = periodStats(state, sleeperId, 14);
  const prev = periodStats(state, sleeperId, 28, 14);
  const delta = recent.nights && prev.nights ? Math.round(recent.avgAsleep - prev.avgAsleep) : null;
  const nights = nightsOf(state, sleeperId).filter((n) => isMe || n.visibility === 'followers');

  if (!who) return <Text style={[T.body, { marginTop: S.xl }]}>We could not find this sleeper.</Text>;

  return (
    <View>
      <View style={{ alignItems: 'center', paddingTop: S.xxl, paddingBottom: S.sm }}>
        <PaperScrap width={140} height={86} color={C.mint} seed={sleeperId.length + 2} rotate={-6} style={{ top: 18, left: '12%' }} />
        <PaperScrap width={110} height={74} color={C.marigold} seed={sleeperId.length + 9} rotate={8} style={{ top: 64, right: '10%' }} />
        <PaperScrap width={76} height={58} color={C.periwinkle} seed={sleeperId.length + 15} rotate={-12} style={{ top: 6, right: '24%' }} />
        <Avatar sleeper={who} size={96} ring={C.paper} />
        <Text style={[T.h1, { marginTop: S.lg, textAlign: 'center' }]}>{isMe ? who.name : who.name}</Text>
        <Text style={[T.small, { textAlign: 'center', marginTop: 4 }]}>
          @{who.handle}
          {who.city ? ` · ${who.city}` : ''} · {PROVIDER_LABEL[who.provider] ?? 'No device yet'}
        </Text>
        {isMe ? (
          <Text style={[T.small, { marginTop: S.sm }]}>
            Following <Text style={T.smallStrong}>{state.following.length}</Text> sleepers
          </Text>
        ) : (
          <View style={{ marginTop: S.lg, minWidth: 168 }}>
            <Button label={following ? 'Following' : 'Follow'} kind={following ? 'secondary' : 'primary'} onPress={() => dispatch({ type: 'follow', sleeperId })} />
          </View>
        )}
      </View>

      {!canSee ? (
        <Card style={{ marginTop: S.xl, flexDirection: 'row', gap: S.md, alignItems: 'center' }}>
          <LockIcon color={C.muted} />
          <Text style={[T.body, { flex: 1 }]}>Nights are shared with followers only. Follow {who.name.split(' ')[0]} to see them.</Text>
        </Card>
      ) : (
        <>
          <Section title="Last 14 nights">
            <Card style={{ gap: S.lg }}>
              <View style={{ flexDirection: 'row', gap: S.md }}>
                <Stat label="Nights" value={`${recent.nights}`} />
                <Stat label="Avg asleep" value={recent.nights ? hm(recent.avgAsleep) : '–'} />
                <Stat label="Avg score" value={recent.nights ? `${Math.round(recent.avgScore)}` : '–'} />
              </View>
              <View style={{ height: 1, backgroundColor: C.line }} />
              <View style={{ flexDirection: 'row', gap: S.md }}>
                <Stat label="Streak 70+" value={`${streak(state, sleeperId)}`} />
                <Stat label="vs 14 before" value={delta == null ? '–' : `${delta >= 0 ? '+' : '−'}${hm(Math.abs(delta))}`} />
                <Stat label="Total asleep" value={`${Math.round(recent.totalAsleep / 60)} h`} />
              </View>
            </Card>
          </Section>

          <Section title="This week" right={<Text style={T.small}>dashed line = 7 h</Text>}>
            <Card>
              <WeekBars data={lastNDays(state, sleeperId, 7)} />
            </Card>
          </Section>

          <Section title="Trophy case">
            <Card style={{ paddingVertical: S.sm }}>
              {personalBests(state, sleeperId).map(({ night, score }, i, arr) => (
                <Pressable
                  key={night.id}
                  onPress={() => router.push(`/night/${night.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: S.md, gap: S.md, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.line }}
                  accessibilityRole="link"
                >
                  <Text style={{ fontSize: 22 }}>{['🥇', '🥈', '🥉'][i]}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={T.bodyStrong}>{night.title}</Text>
                    <Text style={T.caption}>{nightLabel(night.session.end_time)}</Text>
                  </View>
                  <Tag label={scoreTag(score).label} bg={scoreTag(score).bg} />
                  <Text style={[T.number, { fontSize: 24, minWidth: 34, textAlign: 'right' }]}>{score}</Text>
                  <ChevronIcon size={16} color={C.faint} />
                </Pressable>
              ))}
              {personalBests(state, sleeperId).length === 0 && <Text style={[T.small, { paddingVertical: S.md }]}>No nights yet.</Text>}
            </Card>
          </Section>

          {showNights && nights.length > 0 && (
            <Section title="Nights">
              {nights.slice(0, 10).map((n) => (
                <NightCard key={n.id} night={n} />
              ))}
            </Section>
          )}
        </>
      )}
    </View>
  );
}
