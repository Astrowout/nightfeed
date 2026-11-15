import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { Button, Card, Progress, Screen, s } from '../../components/Ui';
import { challengeProgress, challengeTarget, sleeper } from '../../data/selectors';
import { useStore } from '../../data/store';
import { C } from '../../theme';

const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function ChallengesScreen() {
  const { state, dispatch } = useStore();

  return (
    <Screen>
      <Text style={[s.h1, { marginTop: 20 }]}>Challenges</Text>
      <Text style={[s.muted, { marginTop: 4, marginBottom: 16 }]}>
        Rewarding consistency, not the most hours. Leaderboards only show people who joined.
      </Text>

      {state.challenges.map((c) => {
        const joined = c.participants.includes(state.meId);
        const target = challengeTarget(c);
        const board = c.participants
          .map((pid) => ({ pid, value: challengeProgress(state, c, pid) }))
          .sort((a, b) => b.value - a.value);
        const mine = challengeProgress(state, c, state.meId);
        const daysLeft = Math.max(0, Math.ceil((Date.parse(c.endDate) + 86400000 - Date.now()) / 86400000));

        return (
          <Card key={c.id} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: C.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.text, fontSize: 17, fontWeight: '800' }}>{c.name}</Text>
                <Text style={[s.body, { fontSize: 14, marginTop: 2 }]}>{c.blurb}</Text>
                <Text style={[s.muted, { marginTop: 4, fontSize: 12 }]}>
                  {fmt(c.startDate)} – {fmt(c.endDate)} · {daysLeft} days left · {c.participants.length} joined
                </Text>
              </View>
            </View>

            {joined && (
              <View style={{ marginTop: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ color: C.text, fontWeight: '600' }}>Your progress</Text>
                  <Text style={{ color: mine >= target ? C.good : C.text, fontWeight: '700' }}>
                    {Math.min(mine, target)}/{target} {mine >= target ? '✓' : ''}
                  </Text>
                </View>
                <Progress value={mine} max={target} color={mine >= target ? C.good : C.moon} />
              </View>
            )}

            <View style={{ marginTop: 14, gap: 8 }}>
              {board.slice(0, 5).map(({ pid, value }, i) => {
                const p = sleeper(state, pid);
                return (
                  <Pressable
                    key={pid}
                    onPress={() => router.push(`/sleeper/${pid}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    accessibilityRole="link"
                  >
                    <Text style={{ color: C.muted, width: 18, fontWeight: '700' }}>{i + 1}</Text>
                    <Avatar sleeper={p} size={28} />
                    <Text style={{ color: pid === state.meId ? C.moon : C.text, flex: 1, fontWeight: '600' }}>
                      {pid === state.meId ? 'You' : p?.name}
                    </Text>
                    <Text style={{ color: C.text, fontWeight: '700' }}>
                      {Math.min(value, target)}/{target}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 14 }}>
              <Button
                small
                kind={joined ? 'ghost' : 'primary'}
                label={joined ? 'Leave challenge' : 'Join challenge'}
                onPress={() => dispatch({ type: 'join', challengeId: c.id })}
              />
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
