import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Hypnogram } from '../../components/Charts';
import { Button, Card, Pill, Screen, Section, Stat, s } from '../../components/Ui';
import { clock, hm } from '../../data/format';
import { PROVIDER_LABEL, buildSession, gauss, manualSession, rng } from '../../data/generate';
import { fetchSleepSessions } from '../../data/openWearables';
import { asleepMinutes, bedtimeMinutes } from '../../data/score';
import { titleFor } from '../../data/seed';
import { useStore } from '../../data/store';
import type { SleepSession, Visibility } from '../../data/types';
import { C } from '../../theme';

function lastEvening(hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export default function LogScreen() {
  const { state, dispatch } = useStore();
  const [draft, setDraft] = useState<SleepSession | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('followers');
  const [bedMin, setBedMin] = useState(23 * 60 + 15);
  const [wakeMin, setWakeMin] = useState(7 * 60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = state.connectedProviders[0];

  const prepare = (ses: SleepSession) => {
    const r = rng(Date.now());
    setDraft(ses);
    setTitle(titleFor(bedtimeMinutes(ses.start_time), asleepMinutes(ses), r));
    setCaption('');
    setError(null);
  };

  const sync = async () => {
    setError(null);
    if (state.dataSource.mode === 'open_wearables') {
      setBusy(true);
      try {
        const to = new Date();
        const from = new Date(to.getTime() - 2 * 86400000);
        const list = await fetchSleepSessions(state.dataSource, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10));
        const latest = list.filter((x) => !x.is_nap).sort((a, b) => (a.end_time < b.end_time ? 1 : -1))[0];
        if (!latest) setError('No finished night found in the last two days.');
        else prepare(latest);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sync failed.');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!provider) {
      setError('Connect a device first, on the You tab.');
      return;
    }
    // Demo: simulate what Open Wearables would return for last night.
    const r = rng(Date.now());
    const bed = lastEvening(23, Math.round(gauss(r, 15, 20)));
    prepare(buildSession(r, bed, Math.round(gauss(r, 430, 35)), provider));
  };

  const manual = () => {
    const bed = lastEvening(Math.floor(bedMin / 60) % 24, bedMin % 60);
    if (bedMin < 12 * 60) bed.setDate(bed.getDate() + 1); // after midnight
    const wake = new Date();
    wake.setHours(Math.floor(wakeMin / 60), wakeMin % 60, 0, 0);
    if (wake <= bed) {
      setError('Wake time must be after bedtime.');
      return;
    }
    prepare(manualSession(bed, wake, `manual-${Date.now()}`));
  };

  const post = () => {
    if (!draft) return;
    const id = draft.id;
    dispatch({
      type: 'addNights',
      nights: [{ id, sleeperId: state.meId, title: title.trim() || 'Night', caption: caption.trim() || undefined, visibility, session: draft, kudos: [], comments: [] }],
    });
    setDraft(null);
    router.push(`/night/${id}`);
  };

  const step = (label: string, value: number, set: (v: number) => void) => (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={s.muted}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <Pressable onPress={() => set((value - 15 + 1440) % 1440)} style={stepBtn} accessibilityRole="button" accessibilityLabel={`${label} 15 minutes earlier`}>
          <Text style={{ color: C.text, fontSize: 18 }}>−</Text>
        </Pressable>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '800', minWidth: 64, textAlign: 'center' }}>
          {String(Math.floor(value / 60)).padStart(2, '0')}:{String(value % 60).padStart(2, '0')}
        </Text>
        <Pressable onPress={() => set((value + 15) % 1440)} style={stepBtn} accessibilityRole="button" accessibilityLabel={`${label} 15 minutes later`}>
          <Text style={{ color: C.text, fontSize: 18 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen>
      <Text style={[s.h1, { marginTop: 20 }]}>Log a night</Text>

      {!draft ? (
        <>
          <Section title="Sync last night">
            <Card>
              <Text style={[s.body, { marginBottom: 14 }]}>
                {state.dataSource.mode === 'open_wearables'
                  ? 'Pulls your latest finished night from your Open Wearables server.'
                  : provider
                    ? `Pulls last night from your ${PROVIDER_LABEL[provider]} (demo data).`
                    : 'No device connected yet.'}
              </Text>
              {busy ? <ActivityIndicator color={C.moon} /> : <Button label="Sync now" onPress={sync} />}
            </Card>
          </Section>

          <Section title="Or log it by hand">
            <Card>
              <View style={{ flexDirection: 'row' }}>
                {step('Lights out', bedMin, setBedMin)}
                {step('Woke up', wakeMin, setWakeMin)}
              </View>
              <View style={{ marginTop: 16 }}>
                <Button kind="ghost" label="Use these times" onPress={manual} />
              </View>
            </Card>
          </Section>
          {error && <Text style={{ color: C.bad, marginTop: 14 }}>{error}</Text>}
        </>
      ) : (
        <Section title="Ready to post">
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Stat label="Asleep" value={hm(asleepMinutes(draft))} />
              <Stat label="Lights out" value={clock(draft.start_time)} />
              <Stat label="Woke up" value={clock(draft.end_time)} />
            </View>
            <Hypnogram session={draft} />
            <TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={C.faint} style={input} accessibilityLabel="Title" />
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="How did it feel? (optional)"
              placeholderTextColor={C.faint}
              style={[input, { minHeight: 70, textAlignVertical: 'top' }]}
              multiline
              accessibilityLabel="Caption"
            />
            <View>
              <Text style={[s.muted, { marginBottom: 8 }]}>Who can see it</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                <Pill label="Followers" active={visibility === 'followers'} onPress={() => setVisibility('followers')} />
                <Pill label="Only me" active={visibility === 'only_me'} onPress={() => setVisibility('only_me')} />
              </View>
            </View>
            <Button label="Post night" onPress={post} />
            <Button kind="ghost" label="Discard" onPress={() => setDraft(null)} />
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const stepBtn = {
  width: 36,
  height: 36,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: C.border,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};

const input = {
  color: C.text,
  borderWidth: 1,
  borderColor: C.border,
  borderRadius: 12,
  padding: 12,
  fontSize: 15,
  backgroundColor: C.bg,
};
