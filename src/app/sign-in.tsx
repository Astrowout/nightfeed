import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MascotSays } from '../components/MascotSays';
import { Button, Field, Segmented } from '../components/Ui';
import { authClient } from '../lib/auth';
import { C, F, FLOAT, R, S, T } from '../theme';

type Mode = 'sign-in' | 'sign-up';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mode?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'sign-in' ? 'sign-in' : 'sign-up');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.includes('@')) return setError('Enter your email address.');
    if (password.length < 8) return setError('Use a password of at least 8 characters.');
    if (mode === 'sign-up' && !name.trim()) return setError('Tell us what to call you.');
    if (mode === 'sign-up' && !consent) return setError('Tick the box to agree to how we use your sleep data.');
    setBusy(true);
    const res =
      mode === 'sign-up'
        ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim(), healthConsent: true } as Parameters<typeof authClient.signUp.email>[0])
        : await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (res.error) setError(res.error.message ?? 'That did not work. Check your details and try again.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: C.canvas }}>
      <ScrollView contentContainerStyle={[st.page, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
        <View style={st.hero}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[T.title, { fontFamily: F.serif, fontSize: 22 }]}>nightfeed</Text>
          </View>
          <MascotSays size={96} mascot={{ smile: true, bowTie: true }} style={{ marginTop: S.xl }}>
            Hi, I’m Plume. Let’s get you to bed.
          </MascotSays>
          <Text style={[T.display, { marginTop: S.lg, maxWidth: 330 }]}>Your nights, kept together.</Text>
          <Text style={[T.body, { color: C.muted, marginTop: S.md, maxWidth: 360 }]}>
            Post last night from your watch or ring, give friends kudos for a good one, and keep each other to a bedtime.
          </Text>
        </View>

        <View style={[st.card, FLOAT]}>
          <Segmented
            options={[
              { value: 'sign-up', label: 'Create account' },
              { value: 'sign-in', label: 'Sign in' },
            ]}
            value={mode}
            onChange={(m) => {
              setMode(m);
              setError(null);
            }}
          />
          <View style={{ gap: S.lg, marginTop: S.xl }}>
            {mode === 'sign-up' && <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />}
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
              textContentType={mode === 'sign-up' ? 'newPassword' : 'password'}
              onSubmitEditing={submit}
            />

            {mode === 'sign-up' && (
              <Pressable
                onPress={() => setConsent(!consent)}
                style={st.consent}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: consent }}
              >
                <View style={[st.box, consent && st.boxOn]}>{consent && <Text style={st.tick}>✓</Text>}</View>
                <Text style={[T.small, { flex: 1, color: C.ink }]}>
                  I agree that Nightfeed stores my sleep data (health data) to show my nights, and shares nights with my followers unless I set
                  them to “Only me”. I can download or delete everything from my profile.
                </Text>
              </Pressable>
            )}

            {error && (
              <Text style={[T.small, { color: C.wine }]} accessibilityLiveRegion="polite">
                {error}
              </Text>
            )}
            <Button label={mode === 'sign-up' ? 'Create account' : 'Sign in'} onPress={submit} busy={busy} full />
          </View>
        </View>

        <Text style={[T.caption, { textAlign: 'center', marginTop: S.xl }]}>Demo mode: the people you meet inside are made up.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  page: { width: '100%', maxWidth: 480, alignSelf: 'center', paddingHorizontal: S.lg },
  hero: { paddingBottom: S.xxl, overflow: 'visible' },
  card: { backgroundColor: C.paper, borderRadius: R.sheet, padding: S.xl, borderWidth: 1, borderColor: C.line },
  consent: { flexDirection: 'row', gap: S.md, alignItems: 'flex-start' },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.ink, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  boxOn: { backgroundColor: C.lilac },
  tick: { color: C.ink, fontFamily: F.sansBold, fontSize: 13, lineHeight: 16 },
});
