import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { PaperScrap } from '../../../components/Collage';
import { Hypnogram, StageLegend } from '../../../components/Charts';
import { Button, Card, Screen, Section, Segmented, Stat } from '../../../components/Ui';
import { clock, hm } from '../../../data/format';
import { PROVIDER_LABEL, manualSession } from '../../../data/generate';
import { asleepMinutes } from '../../../data/score';
import { useStore } from '../../../data/store';
import type { Night, SleepSession, Visibility } from '../../../data/types';
import { api } from '../../../lib/auth';
import { C, F, R, S, T } from '../../../theme';

function lastEvening(hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}

const pad = (n: number) => String(n).padStart(2, '0');

export default function LogScreen() {
  const { state, refresh } = useStore();
  const [draft, setDraft] = useState<SleepSession | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('followers');
  const [bedMin, setBedMin] = useState(23 * 60 + 15);
  const [wakeMin, setWakeMin] = useState(7 * 60);
  const [busy, setBusy] = useState<'sync' | 'post' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const provider = state.connectedProviders[0];

  const sync = async () => {
    setError(null);
    setBusy('sync');
    try {
      const res = await api<{ session: SleepSession; title: string }>('/sync', { method: 'POST' });
      setDraft(res.session);
      setTitle(res.title);
      setCaption('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed.');
    } finally {
      setBusy(null);
    }
  };

  const manual = () => {
    const bed = lastEvening(Math.floor(bedMin / 60) % 24, bedMin % 60);
    if (bedMin < 12 * 60) bed.setDate(bed.getDate() + 1);
    const wake = new Date();
    wake.setHours(Math.floor(wakeMin / 60), wakeMin % 60, 0, 0);
    if (wake <= bed) return setError('Wake time must be after lights out.');
    setError(null);
    setDraft(manualSession(bed, wake, `manual-${Date.now()}`));
    setTitle('Night');
  };

  const post = async () => {
    if (!draft) return;
    setBusy('post');
    setError(null);
    try {
      const night = await api<Night>('/nights', {
        method: 'POST',
        body: { title: title.trim() || 'Night', caption: caption.trim() || undefined, visibility, session: draft },
      });
      await refresh();
      setDraft(null);
      router.push(`/night/${night.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not post this night.');
    } finally {
      setBusy(null);
    }
  };

  const step = (label: string, value: number, set: (v: number) => void) => (
    <View style={{ flex: 1, alignItems: 'center', gap: S.sm }}>
      <Text style={T.eyebrow}>{label}</Text>
      <Text style={[T.display, { fontVariant: ['tabular-nums'] }]}>
        {pad(Math.floor(value / 60))}:{pad(value % 60)}
      </Text>
      <View style={{ flexDirection: 'row', gap: S.sm }}>
        {[
          ['−', -15, 'earlier'],
          ['+', 15, 'later'],
        ].map(([sym, delta, word]) => (
          <Pressable
            key={String(sym)}
            onPress={() => set((value + Number(delta) + 1440) % 1440)}
            style={{ width: 44, height: 36, borderRadius: R.pill, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper }}
            accessibilityRole="button"
            accessibilityLabel={`${label} 15 minutes ${word}`}
          >
            <Text style={[T.title, { lineHeight: 22 }]}>{sym}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const input = {
    fontFamily: F.sans,
    fontSize: 16,
    color: C.ink,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: C.paper,
  };

  return (
    <Screen>
      <View style={{ marginTop: S.xxl, marginBottom: S.sm }}>
        <PaperScrap width={60} height={40} color={C.marigold} seed={21} rotate={6} style={{ right: 8, top: -2 }} />
        <Text style={T.h1}>Log a night</Text>
        <Text style={[T.body, { color: C.muted, marginTop: 6 }]}>Pull it from your device, or write down when you slept.</Text>
      </View>

      {!draft ? (
        <>
          <Section title="Sync last night">
            <Card style={{ gap: S.lg }}>
              <Text style={T.body}>
                {state.mode === 'open_wearables'
                  ? 'Fetches your latest finished night through Open Wearables.'
                  : provider
                    ? `Fetches last night from your ${PROVIDER_LABEL[provider]}. Demo data for now.`
                    : 'Connect a device on your profile first.'}
              </Text>
              <Button label="Sync now" onPress={sync} busy={busy === 'sync'} full />
            </Card>
          </Section>

          <Section title="Or log it by hand">
            <Card style={{ gap: S.xl }}>
              <View style={{ flexDirection: 'row', gap: S.md }}>
                {step('Lights out', bedMin, setBedMin)}
                <View style={{ width: 1, backgroundColor: C.line }} />
                {step('Woke up', wakeMin, setWakeMin)}
              </View>
              <Button kind="secondary" label="Use these times" onPress={manual} full />
            </Card>
          </Section>
          {error && <Text style={[T.body, { color: C.wine, marginTop: S.lg }]}>{error}</Text>}
        </>
      ) : (
        <Section title="Ready to post">
          <Card style={{ gap: S.lg }}>
            <View style={{ flexDirection: 'row', gap: S.md }}>
              <Stat label="Asleep" value={hm(asleepMinutes(draft))} />
              <Stat label="Lights out" value={clock(draft.start_time)} />
              <Stat label="Woke up" value={clock(draft.end_time)} />
            </View>
            <View style={{ backgroundColor: C.inset, borderRadius: 12, padding: 12, gap: 10 }}>
              <Hypnogram session={draft} />
              {draft.stages?.deep_minutes != null && <StageLegend />}
            </View>
            <View style={{ gap: 6 }}>
              <Text style={T.smallStrong}>Title</Text>
              <TextInput value={title} onChangeText={setTitle} maxLength={80} placeholder="Name this night" placeholderTextColor={C.faint} style={[input, { fontFamily: F.serif, fontSize: 22 }]} accessibilityLabel="Title" />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={T.smallStrong}>How did it feel?</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                maxLength={500}
                placeholder="Optional"
                placeholderTextColor={C.faint}
                style={[input, { minHeight: 76, textAlignVertical: 'top' }]}
                multiline
                accessibilityLabel="How did it feel"
              />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={T.smallStrong}>Who can see it</Text>
              <Segmented<Visibility>
                options={[
                  { value: 'followers', label: 'Followers' },
                  { value: 'only_me', label: 'Only me' },
                ]}
                value={visibility}
                onChange={setVisibility}
              />
            </View>
            {error && <Text style={[T.body, { color: C.wine }]}>{error}</Text>}
            <Button label="Post night" onPress={post} busy={busy === 'post'} full />
            <Button kind="ghost" label="Discard" onPress={() => setDraft(null)} full />
          </Card>
        </Section>
      )}
    </Screen>
  );
}
