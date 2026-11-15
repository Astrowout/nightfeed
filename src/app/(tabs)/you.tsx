import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/Avatar';
import { WatchIcon } from '../../components/Icons';
import { ProfileBody } from '../../components/ProfileBody';
import { Button, Card, Pill, Screen, Section, s } from '../../components/Ui';
import { PROVIDER_LABEL } from '../../data/generate';
import { useStore } from '../../data/store';
import type { ProviderName } from '../../data/types';
import { C } from '../../theme';

const PROVIDERS: ProviderName[] = ['apple', 'health_connect', 'samsung', 'garmin', 'oura', 'whoop', 'polar', 'google_health', 'ultrahuman', 'withings', 'suunto'];

export default function YouScreen() {
  const { state, dispatch } = useStore();
  const [ds, setDs] = useState(state.dataSource);
  const others = state.sleepers.filter((p) => p.id !== state.meId);

  const field = (label: string, key: 'baseUrl' | 'apiKey' | 'userId', secure = false) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={[s.muted, { marginBottom: 4 }]}>{label}</Text>
      <TextInput
        value={ds[key]}
        onChangeText={(v) => setDs({ ...ds, [key]: v })}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor={C.faint}
        placeholder={key === 'baseUrl' ? 'https://ow.example.com' : ''}
        style={{ color: C.text, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, backgroundColor: C.bg }}
        accessibilityLabel={label}
      />
    </View>
  );

  return (
    <Screen>
      <ProfileBody sleeperId={state.meId} showNights={false} />

      <Section title="Devices">
        <Card>
          <Text style={[s.muted, { marginBottom: 12 }]}>
            Connected through Open Wearables. Apple Health and Health Connect sync from the phone app; the others connect
            from the cloud.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {PROVIDERS.map((p) => (
              <Pill
                key={p}
                label={PROVIDER_LABEL[p]}
                active={state.connectedProviders.includes(p)}
                onPress={() => dispatch({ type: 'provider', provider: p })}
              />
            ))}
          </View>
        </Card>
      </Section>

      <Section title="Find sleepers">
        <Card style={{ gap: 4 }}>
          {others.map((p) => {
            const following = state.following.includes(p.id);
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
                <Pressable onPress={() => router.push(`/sleeper/${p.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }} accessibilityRole="link">
                  <Avatar sleeper={p} size={36} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.text, fontWeight: '700' }}>{p.name}</Text>
                    <Text style={s.muted}>
                      {p.city} · {PROVIDER_LABEL[p.provider]}
                    </Text>
                  </View>
                </Pressable>
                <Button small kind={following ? 'ghost' : 'primary'} label={following ? 'Following' : 'Follow'} onPress={() => dispatch({ type: 'follow', sleeperId: p.id })} />
              </View>
            );
          })}
        </Card>
      </Section>

      <Section title="Data source">
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 6 }}>
            <Pill label="Demo data" active={ds.mode === 'demo'} onPress={() => setDs({ ...ds, mode: 'demo' })} />
            <Pill
              label="Open Wearables"
              active={ds.mode === 'open_wearables'}
              onPress={() => setDs({ ...ds, mode: 'open_wearables' })}
            />
          </View>
          {ds.mode === 'open_wearables' && (
            <>
              {field('Server URL', 'baseUrl')}
              {field('User id (UUID)', 'userId')}
              {field('API key (local testing only)', 'apiKey', true)}
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: 10 }}>
                <WatchIcon size={16} color={C.muted} />
                <Text style={[s.muted, { flex: 1, fontSize: 12 }]}>
                  For a real launch the key lives on your own server, never in the app.
                </Text>
              </View>
            </>
          )}
          <Button label="Save" small onPress={() => dispatch({ type: 'dataSource', settings: ds })} />
        </Card>
      </Section>

      <View style={{ marginTop: 28 }}>
        <Button kind="ghost" label="Reset demo data" onPress={() => dispatch({ type: 'reset' })} />
        <Text style={[s.muted, { textAlign: 'center', marginTop: 10, fontSize: 12 }]}>
          Everyone in this demo is made up.
        </Text>
      </View>
    </Screen>
  );
}
