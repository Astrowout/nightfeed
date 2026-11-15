import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { hm, nightLabel } from '../data/format';
import { lastNDays, nightsOf, periodStats, personalBests, sleeper, streak } from '../data/selectors';
import { useStore } from '../data/store';
import { PROVIDER_LABEL } from '../data/generate';
import { C, scoreColor } from '../theme';
import { Avatar } from './Avatar';
import { WeekBars } from './Charts';
import { ChevronIcon, LockIcon } from './Icons';
import { NightCard } from './NightCard';
import { Button, Card, Section, Stat, s } from './Ui';

export function ProfileBody({ sleeperId, showNights = true }: { sleeperId: string; showNights?: boolean }) {
  const { state, dispatch } = useStore();
  const who = sleeper(state, sleeperId);
  const isMe = sleeperId === state.meId;
  const following = state.following.includes(sleeperId);
  const canSee = isMe || following;
  const month = periodStats(state, sleeperId, 28);
  const prev = periodStats(state, sleeperId, 56, 28);
  const delta = month.nights && prev.nights ? Math.round(month.avgAsleep - prev.avgAsleep) : null;
  const nights = nightsOf(state, sleeperId).filter((n) => isMe || n.visibility === 'followers');

  if (!who) return <Text style={s.body}>Unknown sleeper.</Text>;

  return (
    <View>
      <View style={{ alignItems: 'center', marginTop: 22 }}>
        <Avatar sleeper={who} size={84} />
        <Text style={[s.h1, { marginTop: 12 }]}>{isMe ? 'You' : who.name}</Text>
        <Text style={s.muted}>
          @{who.handle} · {who.city} · {PROVIDER_LABEL[who.provider]}
        </Text>
        {isMe && (
          <Text style={[s.muted, { marginTop: 10 }]}>
            Following <Text style={{ color: C.text, fontWeight: '800' }}>{state.following.length}</Text> sleepers
          </Text>
        )}
        {!isMe && (
          <View style={{ marginTop: 14, minWidth: 160 }}>
            <Button
              label={following ? 'Following' : 'Follow'}
              kind={following ? 'ghost' : 'primary'}
              onPress={() => dispatch({ type: 'follow', sleeperId })}
            />
          </View>
        )}
      </View>

      {!canSee ? (
        <Card style={{ marginTop: 24, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <LockIcon color={C.muted} />
          <Text style={[s.body, { flex: 1 }]}>Nights are shared with followers only. Follow to see them.</Text>
        </Card>
      ) : (
        <>
          <Section title="Last 28 days">
            <Card>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Stat label="Nights" value={`${month.nights}`} />
                <Stat label="Avg asleep" value={month.nights ? hm(month.avgAsleep) : '–'} />
                <Stat
                  label="Avg score"
                  value={month.nights ? `${Math.round(month.avgScore)}` : '–'}
                  color={month.nights ? scoreColor(month.avgScore) : undefined}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
                <Stat label="Streak 70+" value={`${streak(state, sleeperId)}`} />
                <Stat
                  label="vs prior 28 days"
                  value={delta == null ? '–' : `${delta >= 0 ? '+' : '−'}${hm(Math.abs(delta))}`}
                  color={delta == null ? undefined : delta >= 0 ? C.good : C.bad}
                />
                <Stat label="Total asleep" value={`${Math.round(month.totalAsleep / 60)} h`} />
              </View>
            </Card>
          </Section>

          <Section title="This week" right={<Text style={s.muted}>goal line = 7h</Text>}>
            <Card>
              <WeekBars data={lastNDays(state, sleeperId, 7)} />
            </Card>
          </Section>

          <Section title="Trophy case">
            <Card style={{ gap: 4 }}>
              {personalBests(state, sleeperId).map(({ night, score }, i) => (
                <Pressable
                  key={night.id}
                  onPress={() => router.push(`/night/${night.id}`)}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 }}
                  accessibilityRole="link"
                >
                  <Text style={{ fontSize: 20 }}>{['🥇', '🥈', '🥉'][i]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontWeight: '700' }}>{night.title}</Text>
                    <Text style={s.muted}>{nightLabel(night.session.end_time)}</Text>
                  </View>
                  <Text style={{ color: scoreColor(score), fontWeight: '800', fontSize: 18 }}>{score}</Text>
                  <ChevronIcon size={18} color={C.faint} />
                </Pressable>
              ))}
            </Card>
          </Section>

          {showNights && (
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
