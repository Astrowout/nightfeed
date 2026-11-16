import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Avatar } from '../../../components/Avatar';
import { MascotSays } from '../../../components/MascotSays';
import { Button, Card, Progress, Screen } from '../../../components/Ui';
import { sleeper } from '../../../data/selectors';
import { useStore } from '../../../data/store';
import { C, F, R, S, T } from '../../../theme';

const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const PASTEL = [C.mint, C.marigold, C.periwinkle, C.lilac];

export default function ChallengesScreen() {
  const { state, dispatch } = useStore();
  // Read the clock once per mount, not on every render (keeps render pure).
  const [now] = useState(Date.now);

  return (
    <Screen>
      <View style={{ marginTop: S.xxl, marginBottom: S.xl }}>
        <Text style={T.h1}>Challenges</Text>
        <Text style={[T.body, { color: C.muted, marginTop: 6, maxWidth: 420 }]}>
          They reward habits you control: lights out on time, a steady wake-up, enough time in bed. Never the score. Only people who join show on the board.
        </Text>
        <MascotSays size={84} mascot={{ smile: true }} style={{ marginTop: S.lg }}>
          Early to bed is how you win here. I believe in you.
        </MascotSays>
      </View>

      {state.challenges.map((c, i) => {
        const joined = c.participants.includes(state.meId);
        const target = c.kind.nights;
        const board = c.board ?? c.participants.map((p) => ({ userId: p, value: 0 }));
        const mine = board.find((b) => b.userId === state.meId)?.value ?? 0;
        const daysLeft = Math.max(0, Math.ceil((Date.parse(`${c.endDate}T23:59:59`) - now) / 86400000));
        const done = mine >= target;

        return (
          <Card key={c.id} style={{ marginBottom: S.lg, gap: S.lg }}>
            <View style={{ flexDirection: 'row', gap: S.md, alignItems: 'flex-start' }}>
              <View style={{ width: 52, height: 52, borderRadius: R.card, backgroundColor: PASTEL[i % PASTEL.length], alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 24 }}>{c.emoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={T.h2}>{c.name}</Text>
                <Text style={T.body}>{c.blurb}</Text>
                <Text style={T.caption}>
                  {fmt(c.startDate)} – {fmt(c.endDate)} · {daysLeft ? `${daysLeft} days left` : 'ended'} · {c.participants.length} joined
                </Text>
              </View>
            </View>

            {joined && (
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Text style={T.bodyStrong}>{done ? 'Done. Nicely slept.' : 'Your progress'}</Text>
                  <Text style={[T.number, { fontSize: 24 }]}>
                    {Math.min(mine, target)}
                    <Text style={[T.small, { fontFamily: F.sans }]}> / {target}</Text>
                  </Text>
                </View>
                <Progress value={mine} max={target} color={done ? '#6CC384' : C.lagoon} />
              </View>
            )}

            <View style={{ borderTopWidth: 1, borderTopColor: C.line, paddingTop: S.md, gap: 10 }}>
              <Text style={T.eyebrow}>Leaderboard</Text>
              {board.slice(0, 5).map(({ userId, value }, rank) => {
                const p = sleeper(state, userId);
                const isMe = userId === state.meId;
                return (
                  <Pressable
                    key={userId}
                    onPress={() => router.push(`/sleeper/${userId}`)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: 2, borderRadius: 8, backgroundColor: isMe ? 'rgba(212,199,255,0.45)' : 'transparent', paddingHorizontal: isMe ? 6 : 0 }}
                    accessibilityRole="link"
                  >
                    <Text style={[T.smallStrong, { width: 18, color: C.muted, fontVariant: ['tabular-nums'] }]}>{rank + 1}</Text>
                    <Avatar sleeper={p} size={30} />
                    <Text style={[T.body, { flex: 1 }]} numberOfLines={1}>
                      {isMe ? 'You' : p?.name}
                    </Text>
                    <Text style={[T.bodyStrong, { fontVariant: ['tabular-nums'] }]}>
                      {Math.min(value, target)}/{target}
                    </Text>
                  </Pressable>
                );
              })}
              {board.length === 0 && <Text style={T.small}>Nobody has joined yet.</Text>}
            </View>

            <Button
              small
              kind={joined ? 'ghost' : 'primary'}
              label={joined ? 'Leave challenge' : 'Join challenge'}
              onPress={() => dispatch({ type: 'join', challengeId: c.id })}
            />
          </Card>
        );
      })}
      {state.challenges.length === 0 && (
        <MascotSays size={84} mascot={{ state: 'sleeping' }}>
          No challenges running right now. A new round starts every two weeks.
        </MascotSays>
      )}
    </Screen>
  );
}
