import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../../components/Avatar';
import { ScoreRing, SleepStrip, StageBars } from '../../../components/Charts';
import { BackIcon, StarIcon } from '../../../components/Icons';
import { AddPhotoButton, NightPhoto } from '../../../components/NightPhoto';
import { Button, Card, Divider, Progress, Screen, Section, Segmented, Stat, TopBar } from '../../../components/Ui';
import { ago, clock, hm, nightLabel } from '../../../data/format';
import { PROVIDER_LABEL } from '../../../data/generate';
import { WEIGHTS, asleepMinutes, scoreNight } from '../../../data/score';
import { sleeper } from '../../../data/selectors';
import { useStore } from '../../../data/store';
import type { Visibility } from '../../../data/types';
import { pickDayPhoto, removeDayPhoto, uploadDayPhoto } from '../../../lib/photo';
import { C, F, MAX_W, R, S, T, scoreTag } from '../../../theme';

const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

export default function NightScreen() {
  const { id, photo: photoParam } = useLocalSearchParams<{ id: string; photo?: string }>();
  const { state, dispatch, refresh } = useStore();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoNote, setPhotoNote] = useState<string | null>(
    photoParam === 'failed' ? 'Your night is posted, but the photo didn’t upload. Try adding it again.' : null,
  );
  const [text, setText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const night = state.nights.find((n) => n.id === id);

  const bar = (
    <TopBar
      title="Night"
      left={
        <Pressable onPress={back} accessibilityRole="button" accessibilityLabel="Back" style={{ padding: 8 }}>
          <BackIcon color={C.ink} />
        </Pressable>
      }
    />
  );

  if (!night) {
    return (
      <Screen header={bar}>
        <Text style={[T.body, { marginTop: S.xl }]}>This night is not here any more, or it is private.</Text>
      </Screen>
    );
  }

  const who = sleeper(state, night.sleeperId);
  const isMe = night.sleeperId === state.meId;
  const score = scoreNight(night, state.nights);
  const tag = scoreTag(score.total);
  const ses = night.session;
  const wakeUps = (ses.sleep_stage_intervals ?? []).filter((i) => i.stage === 'awake').length;
  const given = night.kudos.includes(state.meId);
  const device = ses.source.device_name ?? PROVIDER_LABEL[String(ses.source.provider)] ?? ses.source.provider;

  const pillars: [string, number | null, number, string][] = [
    ['Duration', score.duration, WEIGHTS.duration, '7 to 9 hours asleep scores full marks.'],
    ['Lights out', score.bedtime, WEIGHTS.bedtime, 'Within 15 minutes of your usual bedtime.'],
    ['Wake-up', score.wake, WEIGHTS.wake, 'Within 15 minutes of your usual wake time, weekends too.'],
    ['Interruptions', score.interruptions, WEIGHTS.interruptions, 'Fewer and shorter wake-ups.'],
  ];

  const send = () => {
    const t = text.trim();
    if (!t) return;
    dispatch({ type: 'comment', nightId: night.id, text: t });
    setText('');
  };

  const band = (
    <View style={{ backgroundColor: C.lagoon }}>
      <View style={{ width: '100%', maxWidth: MAX_W, alignSelf: 'center', paddingHorizontal: S.lg, paddingVertical: S.xl, gap: S.lg }}>
        <Pressable onPress={() => router.push(`/sleeper/${night.sleeperId}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: S.md }} accessibilityRole="link">
          <Avatar sleeper={who} size={36} ring={C.lagoon} />
          <Text style={[T.small, { color: C.onDarkMuted, flex: 1 }]}>
            <Text style={{ color: C.onDark, fontFamily: F.sansSemi }}>{isMe ? 'You' : who?.name}</Text> · {nightLabel(ses.end_time)} · {device}
          </Text>
        </Pressable>
        <Text style={[T.display, { color: C.onDark }]}>{night.title}</Text>
        {night.caption ? <Text style={{ fontFamily: F.serifItalic, fontSize: 18, lineHeight: 26, color: C.onDarkMuted }}>“{night.caption}”</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.xl }}>
          <ScoreRing score={score.total} size={96} dark label={tag.label} />
          <View style={{ flex: 1, gap: S.lg }}>
            <View style={{ flexDirection: 'row', gap: S.md }}>
              <Stat dark label="Asleep" value={hm(asleepMinutes(ses))} />
              <Stat dark label="In bed" value={hm((ses.time_in_bed_seconds ?? ses.duration_seconds) / 60)} />
            </View>
            <View style={{ flexDirection: 'row', gap: S.md }}>
              <Stat dark label="Lights out" value={clock(ses.start_time)} />
              <Stat dark label="Woke up" value={clock(ses.end_time)} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const choosePhoto = async () => {
    setPhotoNote(null);
    try {
      const picked = await pickDayPhoto();
      if (!picked) return;
      setPhotoBusy(true);
      await uploadDayPhoto(night.id, picked);
      await refresh();
    } catch (e) {
      setPhotoNote(e instanceof Error ? e.message : 'The photo didn’t upload. Try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    setPhotoNote(null);
    try {
      await removeDayPhoto(night.id);
      await refresh();
    } catch (e) {
      setPhotoNote(e instanceof Error ? e.message : 'Couldn’t remove the photo. Try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <Screen header={bar} band={band}>
      {(night.photo || isMe) && (
        <View style={{ marginTop: S.xl, gap: S.sm }}>
          {night.photo ? (
            <>
              <NightPhoto photo={night.photo} />
              {isMe && (
                <View style={{ flexDirection: 'row', gap: S.sm }}>
                  <Button small kind="ghost" label="Change photo" onPress={choosePhoto} busy={photoBusy} />
                  <Button small kind="ghost" label="Remove photo" onPress={removePhoto} disabled={photoBusy} />
                </View>
              )}
            </>
          ) : (
            <AddPhotoButton onPress={choosePhoto} busy={photoBusy} />
          )}
          {photoNote && <Text style={[T.small, { color: C.ink }]}>{photoNote}</Text>}
        </View>
      )}
      <Section
        title="Sleep stages"
        right={
          <Text style={T.small}>
            {wakeUps} wake-ups{ses.efficiency_percent != null ? ` · ${Math.round(ses.efficiency_percent)}% efficient` : ''}
          </Text>
        }
      >
        <Card style={{ gap: S.lg }}>
          <SleepStrip session={ses} height={20} />
          <Divider />
          {ses.stages?.deep_minutes != null ? (
            <StageBars session={ses} />
          ) : (
            <Text style={T.small}>
              {ses.source.provider === 'internal'
                ? 'Logged by hand, so this night has no stages.'
                : 'This device does not share sleep stages, so the score leaves that part out.'}
            </Text>
          )}
        </Card>
      </Section>

      <Section title="How the score is built">
        <Card style={{ gap: S.lg }}>
          {pillars.map(([label, v, w, help]) => (
            <View key={label} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={T.bodyStrong}>
                  {label} <Text style={T.small}>· {Math.round(w * 100)}%</Text>
                </Text>
                <Text style={[T.bodyStrong, { fontVariant: ['tabular-nums'], color: v == null ? C.faint : C.ink }]}>{v == null ? 'left out' : Math.round(v)}</Text>
              </View>
              <Progress value={v ?? 0} max={100} color={v == null ? C.line : C.lagoon} />
              <Text style={T.caption}>{help}</Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section
        title={`Kudos · ${night.kudos.length}`}
        right={
          !isMe ? (
            <Button
              small
              kind={given ? 'secondary' : 'primary'}
              label={given ? 'Kudos given' : 'Give kudos'}
              icon={<StarIcon size={16} color={given ? C.ink : C.onDark} filled={given} />}
              onPress={() => dispatch({ type: 'kudos', nightId: night.id })}
            />
          ) : undefined
        }
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm }}>
          {night.kudos.length === 0 && <Text style={T.small}>No kudos yet.</Text>}
          {night.kudos.map((k) => (
            <Pressable key={k} onPress={() => router.push(`/sleeper/${k}`)} accessibilityRole="link" accessibilityLabel={sleeper(state, k)?.name}>
              <Avatar sleeper={sleeper(state, k)} size={36} />
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title={`Comments · ${night.comments.length}`}>
        <Card style={{ gap: S.lg }}>
          {night.comments.length === 0 && <Text style={T.small}>Be the first to say something nice.</Text>}
          {night.comments.map((c) => {
            const a = sleeper(state, c.authorId);
            return (
              <View key={c.id} style={{ flexDirection: 'row', gap: S.md }}>
                <Avatar sleeper={a} size={32} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={T.smallStrong}>
                    {c.authorId === state.meId ? 'You' : a?.name} <Text style={T.caption}>· {ago(c.createdAt)}</Text>
                  </Text>
                  <Text style={T.body}>{c.text}</Text>
                </View>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', gap: S.sm, alignItems: 'center' }}>
            <TextInput
              value={text}
              onChangeText={setText}
              onSubmitEditing={send}
              placeholder="Add a comment"
              placeholderTextColor={C.faint}
              maxLength={500}
              style={{
                flex: 1,
                fontFamily: F.sans,
                fontSize: 15,
                color: C.ink,
                backgroundColor: C.inset,
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: R.input,
                paddingHorizontal: 14,
                paddingVertical: 11,
              }}
              accessibilityLabel="Comment"
            />
            <Button label="Post" small onPress={send} disabled={!text.trim()} />
          </View>
        </Card>
      </Section>

      {isMe && (
        <Section title="Who can see this night">
          <Segmented<Visibility>
            options={[
              { value: 'followers', label: 'Followers' },
              { value: 'only_me', label: 'Only me' },
            ]}
            value={night.visibility}
            onChange={(v) => dispatch({ type: 'visibility', nightId: night.id, visibility: v })}
          />
          <View style={{ marginTop: S.xl, alignItems: 'flex-start', gap: S.sm }}>
            {confirmDelete ? (
              <>
                <Text style={T.body}>Delete this night for good? Kudos and comments go with it.</Text>
                <View style={{ flexDirection: 'row', gap: S.sm }}>
                  <Button
                    small
                    label="Delete night"
                    onPress={() => {
                      dispatch({ type: 'deleteNight', nightId: night.id });
                      back();
                    }}
                  />
                  <Button small kind="ghost" label="Keep it" onPress={() => setConfirmDelete(false)} />
                </View>
              </>
            ) : (
              <Button small kind="ghost" label="Delete this night" onPress={() => setConfirmDelete(true)} />
            )}
          </View>
        </Section>
      )}
    </Screen>
  );
}
