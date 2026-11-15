import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { Hypnogram, ScoreRing, StageBars } from '../../components/Charts';
import { BackIcon, StarIcon } from '../../components/Icons';
import { Button, Card, Pill, Progress, Screen, Section, Stat, TopBar, s } from '../../components/Ui';
import { ago, clock, hm, nightLabel } from '../../data/format';
import { WEIGHTS, asleepMinutes, scoreLabel, scoreNight } from '../../data/score';
import { sleeper } from '../../data/selectors';
import { useStore } from '../../data/store';
import { C, scoreColor } from '../../theme';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function NightScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const [text, setText] = useState('');
  const night = state.nights.find((n) => n.id === id);

  const bar = (
    <TopBar
      title="Night"
      left={
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" style={{ padding: 6 }}>
          <BackIcon color={C.text} />
        </Pressable>
      }
    />
  );

  if (!night) {
    return (
      <Screen header={bar}>
        <Text style={[s.body, { marginTop: 24 }]}>This night no longer exists.</Text>
      </Screen>
    );
  }

  const who = sleeper(state, night.sleeperId);
  const isMe = night.sleeperId === state.meId;
  const score = scoreNight(night, state.nights);
  const ses = night.session;
  const wakeUps = (ses.sleep_stage_intervals ?? []).filter((i) => i.stage === 'awake').length;
  const gaveKudos = night.kudos.includes(state.meId);

  const pillars: [string, number | null, number, string][] = [
    ['Duration', score.duration, WEIGHTS.duration, '7 to 9 hours asleep scores full marks.'],
    ['Stages', score.stages, WEIGHTS.stages, 'Deep 13–23% and REM 18–25% of sleep.'],
    ['Consistency', score.consistency, WEIGHTS.consistency, 'Bedtime close to your usual one.'],
    ['Interruptions', score.interruptions, WEIGHTS.interruptions, 'Fewer and shorter wake-ups.'],
  ];

  const send = () => {
    const t = text.trim();
    if (!t) return;
    dispatch({ type: 'comment', nightId: night.id, text: t });
    setText('');
  };

  return (
    <Screen header={bar}>
      <Pressable
        onPress={() => router.push(`/sleeper/${night.sleeperId}`)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}
        accessibilityRole="link"
      >
        <Avatar sleeper={who} size={44} />
        <View>
          <Text style={{ color: C.text, fontWeight: '700', fontSize: 16 }}>{isMe ? 'You' : who?.name}</Text>
          <Text style={s.muted}>
            {nightLabel(ses.end_time)} · {ses.source.device_name ?? ses.source.provider}
          </Text>
        </View>
      </Pressable>

      <Text style={[s.h1, { marginTop: 16 }]}>{night.title}</Text>
      {night.caption ? <Text style={[s.body, { marginTop: 6 }]}>{night.caption}</Text> : null}

      <Card style={{ marginTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <ScoreRing score={score.total} size={88} label={scoreLabel(score.total)} />
          <View style={{ flex: 1, gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stat label="Asleep" value={hm(asleepMinutes(ses))} />
              <Stat label="In bed" value={hm((ses.time_in_bed_seconds ?? ses.duration_seconds) / 60)} />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stat label="Lights out" value={clock(ses.start_time)} />
              <Stat label="Woke up" value={clock(ses.end_time)} />
            </View>
          </View>
        </View>
      </Card>

      <Section
        title="Sleep stages"
        right={
          <Text style={s.muted}>
            {wakeUps} wake-ups
            {ses.efficiency_percent != null ? ` · ${Math.round(ses.efficiency_percent)}% efficient` : ''}
          </Text>
        }
      >
        <Card>
          <Hypnogram session={ses} />
          <View style={{ height: 18 }} />
          {ses.stages?.deep_minutes != null ? (
            <StageBars session={ses} />
          ) : (
            <Text style={s.muted}>
              {ses.source.provider === 'internal'
                ? 'Logged by hand, so there are no stages for this night.'
                : 'This device does not share sleep stages, so the score leaves the stages part out.'}
            </Text>
          )}
        </Card>
      </Section>

      <Section title="How the score is built">
        <Card style={{ gap: 14 }}>
          {pillars.map(([label, v, w, help]) => (
            <View key={label}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: C.text, fontWeight: '600' }}>
                  {label} <Text style={s.muted}>· weight {Math.round(w * 100)}%</Text>
                </Text>
                <Text style={{ color: v == null ? C.muted : scoreColor(v), fontWeight: '700' }}>
                  {v == null ? 'left out' : Math.round(v)}
                </Text>
              </View>
              <Progress value={v ?? 0} max={100} color={v == null ? C.faint : scoreColor(v)} />
              <Text style={[s.muted, { marginTop: 4, fontSize: 12 }]}>{help}</Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section
        title={`Kudos (${night.kudos.length})`}
        right={
          !isMe ? (
            <Pressable
              onPress={() => dispatch({ type: 'kudos', nightId: night.id })}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              accessibilityRole="button"
            >
              <StarIcon size={18} color={gaveKudos ? C.moon : C.muted} filled={gaveKudos} />
              <Text style={{ color: gaveKudos ? C.moon : C.muted, fontWeight: '700' }}>
                {gaveKudos ? 'Given' : 'Give kudos'}
              </Text>
            </Pressable>
          ) : undefined
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {night.kudos.length === 0 && <Text style={s.muted}>No kudos yet.</Text>}
          {night.kudos.map((k) => (
            <Avatar key={k} sleeper={sleeper(state, k)} size={34} />
          ))}
        </View>
      </Section>

      <Section title={`Comments (${night.comments.length})`}>
        <View style={{ gap: 12 }}>
          {night.comments.map((c) => {
            const a = sleeper(state, c.authorId);
            return (
              <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Avatar sleeper={a} size={32} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: '700', fontSize: 13 }}>
                    {c.authorId === state.meId ? 'You' : a?.name} <Text style={s.muted}>· {ago(c.createdAt)}</Text>
                  </Text>
                  <Text style={s.body}>{c.text}</Text>
                </View>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={send}
              placeholder="Add a comment"
              placeholderTextColor={C.faint}
              style={{
                flex: 1,
                color: C.text,
                backgroundColor: C.surface,
                borderWidth: 1,
                borderColor: C.border,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                fontSize: 15,
              }}
              accessibilityLabel="Comment"
            />
            <Button label="Post" small onPress={send} disabled={!text.trim()} />
          </View>
        </View>
      </Section>

      {isMe && (
        <Section title="Who can see this night">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Pill
              label="Followers"
              active={night.visibility === 'followers'}
              onPress={() => dispatch({ type: 'visibility', nightId: night.id, visibility: 'followers' })}
            />
            <Pill
              label="Only me"
              active={night.visibility === 'only_me'}
              onPress={() => dispatch({ type: 'visibility', nightId: night.id, visibility: 'only_me' })}
            />
          </View>
          <View style={{ marginTop: 12 }}>
            <Button
              kind="ghost"
              label="Delete this night"
              onPress={() => {
                dispatch({ type: 'deleteNight', nightId: night.id });
                back();
              }}
            />
          </View>
        </Section>
      )}
    </Screen>
  );
}
