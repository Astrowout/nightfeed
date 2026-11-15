import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { Platform, Pressable, Share, Text, View } from 'react-native';
import { Avatar } from '../../../components/Avatar';
import { MascotSays } from '../../../components/MascotSays';
import { ProfileBody } from '../../../components/ProfileBody';
import { Button, Card, Chip, Screen, Section, TextLink } from '../../../components/Ui';
import { PROVIDER_LABEL } from '../../../data/generate';
import { useStore } from '../../../data/store';
import type { ProviderName } from '../../../data/types';
import { API_BASE, api, authClient } from '../../../lib/auth';
import { C, S, T } from '../../../theme';

const CLOUD: ProviderName[] = ['garmin', 'oura', 'whoop', 'polar', 'google_health', 'ultrahuman', 'withings', 'suunto'];
const PHONE: ProviderName[] = ['apple', 'health_connect', 'samsung'];

export default function YouScreen() {
  const { state, refresh, dispatch } = useStore();
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const suggestions = state.sleepers.filter((p) => p.id !== state.meId && !state.following.includes(p.id));
  const followed = state.sleepers.filter((p) => state.following.includes(p.id));

  const connect = async (p: ProviderName) => {
    setNote(null);
    setBusy(p);
    try {
      if (state.mode === 'demo') {
        await api(`/connect/${p}`, { method: 'POST' });
        await refresh();
      } else if (PHONE.includes(p)) {
        setNote(`${PROVIDER_LABEL[p]} syncs from the phone app. Open Kudoze on your phone to allow it.`);
      } else {
        const redirectUri = Platform.OS === 'web' ? `${window.location.origin}/you` : 'kudoze://you';
        const { url } = await api<{ url: string }>(`/connect/${p}`, { method: 'POST', body: { redirectUri } });
        if (Platform.OS === 'web') window.location.assign(url);
        else {
          await WebBrowser.openAuthSessionAsync(url, redirectUri);
          await refresh();
        }
      }
    } catch (e) {
      setNote(e instanceof Error ? e.message : 'Could not connect that device.');
    } finally {
      setBusy(null);
    }
  };

  const exportData = async () => {
    if (Platform.OS === 'web') {
      window.open(`${API_BASE}/api/me/export`, '_blank');
      return;
    }
    const data = await api('/me/export');
    await Share.share({ message: JSON.stringify(data, null, 2), title: 'Kudoze export' });
  };

  const deleteAccount = async () => {
    await api('/me', { method: 'DELETE' });
    await authClient.signOut();
  };

  return (
    <Screen>
      <ProfileBody sleeperId={state.meId} showNights={false} />

      <Section title="Devices">
        <Card style={{ gap: S.lg }}>
          <Text style={T.body}>
            {state.mode === 'demo'
              ? 'Demo mode: pick the devices you wear. Real syncing starts once Open Wearables runs.'
              : 'Connected through Open Wearables. Watches and rings link from the cloud; phone health apps sync from the Kudoze app.'}
          </Text>
          <View style={{ gap: S.sm }}>
            <Text style={T.eyebrow}>Watches and rings</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm }}>
              {CLOUD.map((p) => (
                <Chip key={p} label={busy === p ? '…' : PROVIDER_LABEL[p]} active={state.connectedProviders.includes(p)} onPress={() => connect(p)} />
              ))}
            </View>
          </View>
          <View style={{ gap: S.sm }}>
            <Text style={T.eyebrow}>Phone health apps</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.sm }}>
              {PHONE.map((p) => (
                <Chip key={p} label={busy === p ? '…' : PROVIDER_LABEL[p]} active={state.connectedProviders.includes(p)} onPress={() => connect(p)} />
              ))}
            </View>
          </View>
          {note && <Text style={[T.small, { color: C.ink }]}>{note}</Text>}
        </Card>
      </Section>

      {suggestions.length > 0 && (
        <Section title="Find sleepers">
          <Card style={{ paddingVertical: S.xs }}>
            {suggestions.slice(0, 8).map((p, i, arr) => (
              <View
                key={p.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.md, borderBottomWidth: i < arr.length - 1 ? 1 : 0, borderBottomColor: C.line }}
              >
                <Pressable onPress={() => router.push(`/sleeper/${p.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: S.md, flex: 1, minWidth: 0 }} accessibilityRole="link">
                  <Avatar sleeper={p} size={38} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={T.bodyStrong} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <Text style={T.caption} numberOfLines={1}>
                      {[p.city, PROVIDER_LABEL[p.provider]].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </Pressable>
                <Button small label="Follow" onPress={() => dispatch({ type: 'follow', sleeperId: p.id })} />
              </View>
            ))}
          </Card>
        </Section>
      )}

      {followed.length > 0 && (
        <Section title="Following">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: S.md }}>
            {followed.map((p) => (
              <Pressable key={p.id} onPress={() => router.push(`/sleeper/${p.id}`)} style={{ alignItems: 'center', gap: 6, width: 72 }} accessibilityRole="link">
                <Avatar sleeper={p} size={48} />
                <Text style={[T.caption, { color: C.ink, textAlign: 'center' }]} numberOfLines={1}>
                  {p.name.split(' ')[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>
      )}

      <Section title="Your data">
        <Card style={{ gap: S.lg }}>
          <Text style={T.body}>Sleep data counts as health data. You can take a copy or remove everything at any time.</Text>
          <TextLink label="Download my data" onPress={exportData} />
          {confirmDelete ? (
            <View style={{ gap: S.sm }}>
              <Text style={T.body}>This deletes your account, nights, kudos and comments for good.</Text>
              <View style={{ flexDirection: 'row', gap: S.sm, flexWrap: 'wrap' }}>
                <Button small label="Delete my account" onPress={deleteAccount} />
                <Button small kind="ghost" label="Keep it" onPress={() => setConfirmDelete(false)} />
              </View>
            </View>
          ) : (
            <TextLink label="Delete my account" onPress={() => setConfirmDelete(true)} />
          )}
        </Card>
      </Section>

      <View style={{ marginTop: S.xxl, alignItems: 'center', gap: S.sm }}>
        <MascotSays size={72} mascot={{ state: 'sleeping' }} style={{ marginBottom: S.md }}>
          Sleep well. I’ll keep your nights safe.
        </MascotSays>
        <Button kind="ghost" label="Sign out" onPress={() => authClient.signOut()} />
        <Text style={T.caption}>{state.mode === 'demo' ? 'Demo mode · the other people here are made up' : 'Synced through Open Wearables'}</Text>
      </View>
    </Screen>
  );
}
