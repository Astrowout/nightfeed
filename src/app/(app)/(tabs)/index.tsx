import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../../../components/Avatar';
import { WeekBars } from '../../../components/Charts';
import { Mascot } from '../../../components/Mascot';
import { MascotSays } from '../../../components/MascotSays';
import { Wordmark } from '../../../components/Wordmark';
import { NightCard } from '../../../components/NightCard';
import { Button, Card, Screen, TopBar } from '../../../components/Ui';
import { clock, hm, nightLabel } from '../../../data/format';
import { asleepMinutes, scoreNight } from '../../../data/score';
import { feed, lastNDays, nightsOf, periodStats, sleeper, streak } from '../../../data/selectors';
import { useStore } from '../../../data/store';
import { C, MAX_W, S, T, scoreTag } from '../../../theme';

function NightBand() {
  const { state } = useStore();
  // Read the clock once per mount, not on every render (keeps render pure).
  const [now] = useState(Date.now);
  const last = nightsOf(state, state.meId).find((n) => !n.session.is_nap);
  const lastIsRecent = last && now - Date.parse(last.session.end_time) < 30 * 3600000;
  const week = periodStats(state, state.meId, 7);
  const run = streak(state, state.meId);

  return (
    <View style={{ backgroundColor: C.lagoon }}>
      <View
        style={{
          width: '100%',
          maxWidth: MAX_W,
          alignSelf: 'center',
          paddingHorizontal: S.lg,
          paddingTop: S.xl,
          paddingBottom: S.xl + 4,
          gap: S.lg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.lg }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            {lastIsRecent && last ? (
              <Pressable onPress={() => router.push(`/night/${last.id}`)} accessibilityRole="link" style={{ gap: 6 }}>
                <Text style={[T.eyebrow, { color: C.onDarkMuted }]}>{nightLabel(last.session.end_time)}</Text>
                <Text style={[T.display, { color: C.onDark, fontSize: 48, lineHeight: 52 }]}>{hm(asleepMinutes(last.session))}</Text>
                <Text style={[T.body, { color: C.onDarkMuted }]}>
                  Score {scoreNight(last, state.nights).total} · {scoreTag(scoreNight(last, state.nights).total).label} · lights out{' '}
                  {clock(last.session.start_time)}
                </Text>
              </Pressable>
            ) : (
              <View style={{ gap: S.md, alignItems: 'flex-start' }}>
                <Text style={[T.eyebrow, { color: C.onDarkMuted }]}>Last night</Text>
                <Text style={[T.h1, { color: C.onDark }]}>Nothing posted yet.</Text>
                <Button kind="onDark" small label="Log last night" onPress={() => router.push('/log')} />
              </View>
            )}
          </View>
          <Mascot size={88} onDark state={lastIsRecent ? 'default' : 'sleeping'} />
        </View>
        <View style={{ flexDirection: 'row', gap: S.xl, alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <WeekBars data={lastNDays(state, state.meId, 7)} dark />
          </View>
          <View style={{ gap: 10, minWidth: 96 }}>
            <View>
              <Text style={[T.eyebrow, { color: C.onDarkMuted }]}>7-night avg</Text>
              <Text style={[T.stat, { color: C.onDark }]}>{week.nights ? hm(week.avgAsleep) : '–'}</Text>
            </View>
            <View>
              <Text style={[T.eyebrow, { color: C.onDarkMuted }]}>Streak 70+</Text>
              <Text style={[T.stat, { color: C.onDark }]}>
                {run} {run === 1 ? 'night' : 'nights'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { state, error } = useStore();
  const [limit, setLimit] = useState(15);
  const items = feed(state);
  const me = sleeper(state, state.meId);

  const header = (
    <TopBar
      left={
        <View style={{ paddingLeft: 4 }}>
          <Wordmark size={24} onPress={() => router.navigate('/')} label="Kudoze feed" />
        </View>
      }
      right={
        <Pressable
          onPress={() => router.push('/you')}
          accessibilityRole="link"
          accessibilityLabel="Your profile"
          style={{ paddingRight: 4 }}
        >
          <Avatar sleeper={me} size={32} />
        </Pressable>
      }
    />
  );

  return (
    <Screen header={header} band={<NightBand />}>
      {error && (
        <Card
          style={{
            marginTop: S.lg,
            backgroundColor: C.marigold,
            borderColor: C.marigold,
          }}
        >
          <Text style={T.body}>{error}</Text>
        </Card>
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: S.xl,
          marginBottom: S.lg,
        }}
      >
        <Text style={T.h1}>Following</Text>
        <Text style={T.small}>{state.following.length} sleepers</Text>
      </View>
      {items.length === 0 && (
        <MascotSays size={84} mascot={{ state: 'sleeping' }}>
          It’s quiet in here. Log a night or follow someone and I’ll fill your feed.
        </MascotSays>
      )}
      {items.slice(0, limit).map((n) => (
        <NightCard key={n.id} night={n} />
      ))}
      {items.length > limit && <Button kind="ghost" label="Show older nights" onPress={() => setLimit(limit + 15)} />}
    </Screen>
  );
}
