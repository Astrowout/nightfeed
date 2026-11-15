import { router } from 'expo-router';
import Head from 'expo-router/head';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { BRANDS, BrandMark, BrandWall } from '../components/BrandLogos';
import { HeroStage } from '../components/HeroStage';
import { Mascot } from '../components/Mascot';
import type { MascotProps } from '../components/mascotConfig';
import { MascotSays } from '../components/MascotSays';
import { Button, TextLink } from '../components/Ui';
import { C, F, R, S, T } from '../theme';

// Public landing page. Only signed-out visitors on the web reach it (see app/_layout.tsx);
// the phone apps open straight at sign-in.

const PAGE_W = 1120;
const WIDE = 900;

const signUp = (email = '') =>
  router.push(email.trim() ? `/sign-in?mode=sign-up&email=${encodeURIComponent(email.trim())}` : '/sign-in?mode=sign-up');
const HERO_BRANDS = BRANDS.filter((b) => ['Apple Watch', 'Garmin', 'Oura', 'Whoop'].includes(b.name));
const logIn = () => router.push('/sign-in?mode=sign-in');

export default function Landing() {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;
  const [artW, setArtW] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: C.canvas }}>
      <Head>
        <title>Kudoze: the social feed for sleep</title>
        <meta
          name="description"
          content="Post last night from your watch or ring, give friends kudos for a good night and keep each other to a bedtime."
        />
      </Head>

      <Nav />

      <ScrollView>
        {/* Hero */}
        <View style={[st.wrap, st.hero, wide && st.heroWide]}>
          <View style={[{ gap: S.lg }, wide && { flex: 1, paddingRight: 56 }]}>
            <Text style={[st.headline, wide ? { fontSize: 72, lineHeight: 74 } : { fontSize: 46, lineHeight: 50 }]}>Sleep is a team sport now.</Text>
            <Text style={st.lede}>
              Kudoze is the social feed for sleep. Your watch or ring posts last night, friends give kudos, and a bedtime leaderboard keeps
              everyone honest.
            </Text>
            <EmailJoin />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6 }}>
              <Text style={T.small}>Free, and your nights are followers-only.</Text>
              <TextLink label="Already in? Log in" onPress={logIn} />
            </View>
            <View style={st.syncs}>
              <Text style={T.small}>Syncs with</Text>
              {HERO_BRANDS.map((b) => (
                <View key={b.name} style={{ transform: [{ scale: 0.78 }], marginHorizontal: -6 }}>
                  <BrandMark brand={b} color={C.muted} />
                </View>
              ))}
              <Text style={T.small}>and 7 more</Text>
            </View>
          </View>

          <View
            style={[wide ? { flex: 1.05 } : { marginTop: S.section + 24 }]}
            onLayout={(e) => setArtW(Math.round(e.nativeEvent.layout.width))}
          >
            {artW > 0 && <HeroStage width={artW} />}
          </View>
        </View>

        {/* Devices */}
        <View style={st.devices}>
          <View style={st.wrap}>
            <View style={{ alignItems: 'center', marginBottom: S.xl }}>
              <MascotSays size={76} mascot={{ headphones: true }}>
                I listen to your watch, ring or phone. You just sleep.
              </MascotSays>
            </View>
            <Text style={[T.eyebrow, { textAlign: 'center', marginBottom: S.xl }]}>Works with what you already wear</Text>
            <BrandWall />
          </View>
        </View>

        {/* Features */}
        <View style={[st.wrap, { paddingVertical: 88 }]}>
          <Text style={[T.h1, { maxWidth: 560 }, wide && { fontSize: 44, lineHeight: 48, letterSpacing: -1.4 }]}>
            Everything a good night deserves, and a little nudge for the bad ones.
          </Text>
          <View style={[st.features, wide && { flexDirection: 'row' }]}>
            <Feature
              color={C.periwinkle}
              plume={{ state: 'working' }}
              title="Post last night"
              body="Your night syncs from your device each morning: time asleep, stages and a score. Add a note, then post it or keep it to yourself."
            />
            <Feature
              color={C.peach}
              plume={{ hat: 'party', smile: true, accessoryColor: C.violet }}
              title="Kudos and comments"
              body="Follow friends, family or your running club. Give kudos for a solid eight hours and a kind word after a rough one."
            />
            <Feature
              color={C.marigold}
              plume={{ hat: 'crown', smile: true }}
              title="Bedtime challenges"
              body="Join a challenge, from lights out before 23:00 to seven nights in a row of seven hours, and climb the leaderboard together."
            />
          </View>
        </View>

        {/* Privacy band */}
        <View style={st.band}>
          <View style={[st.wrap, wide && { flexDirection: 'row', alignItems: 'flex-start', gap: 64 }]}>
            <View style={[{ gap: S.md }, wide && { flex: 1 }]}>
              <MascotSays size={96} onDark mascot={{ glasses: 'shades' }} style={{ marginBottom: S.md }}>
                What happens in bed stays in bed.
              </MascotSays>
              <Text style={[T.h1, { color: C.onDark }, wide && { fontSize: 40, lineHeight: 44 }]}>Your sleep stays yours.</Text>
              <Text style={[T.body, { color: C.onDarkMuted, maxWidth: 440 }]}>
                Sleep data is health data, so we treat it that way. You decide who sees each night, and you can take everything with you.
              </Text>
            </View>
            <View style={[{ gap: S.lg, marginTop: S.xxl }, wide && { flex: 1, marginTop: 0 }]}>
              <Point title="Followers-only by default" body="Nobody outside the people you approve sees your nights." />
              <Point title="“Only me” for any night" body="Keep a night private with one tap, before or after you post it." />
              <Point title="Download or delete, any time" body="Export all your data or remove your account from your profile." />
            </View>
          </View>
        </View>

        {/* Closing call to action */}
        <View style={[st.wrap, { paddingVertical: 96, alignItems: 'center' }]}>
          <Mascot size={150} state="sleeping" />
          <Text style={[T.caption, { marginTop: S.sm, fontFamily: F.serifItalic, fontSize: 15 }]}>Plume is already in bed. Zzz…</Text>
          <Text style={[T.h1, { textAlign: 'center', marginTop: S.lg }, wide && { fontSize: 48, lineHeight: 52, letterSpacing: -1.5 }]}>
            Tonight is a good night to start.
          </Text>
          <Text style={[T.body, { color: C.muted, textAlign: 'center', marginTop: S.md, maxWidth: 420 }]}>
            Connect your device, follow a few friends and see who sleeps best this week.
          </Text>
          <View style={{ marginTop: S.xl, width: '100%', maxWidth: 460 }}>
            <EmailJoin />
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

function Nav() {
  return (
    <View style={st.nav}>
      <View style={[st.wrap, st.navInner]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Mascot size={36} />
          <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, letterSpacing: -0.4 }}>kudoze</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          <Button label="Log in" kind="ghost" small onPress={logIn} />
          <Button label="Sign up" small onPress={() => signUp()} />
        </View>
      </View>
    </View>
  );
}

/** Email first, like the big fitness apps: one field and one button, the rest happens on the next screen. */
function EmailJoin() {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const { width } = useWindowDimensions();
  const stacked = width < 520;
  return (
    <View style={[st.join, stacked && st.joinStacked, focused && { borderColor: C.ink }]}>
      <TextInput
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onSubmitEditing={() => signUp(email)}
        placeholder="Your email"
        placeholderTextColor={C.faint}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        returnKeyType="go"
        accessibilityLabel="Your email"
        style={[st.joinInput, stacked && { paddingVertical: 12 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
      />
      <Button label="Join for free" onPress={() => signUp(email)} full={stacked} />
    </View>
  );
}

function Feature({ color, plume, title, body }: { color: string; plume: MascotProps; title: string; body: string }) {
  return (
    <View style={st.feature}>
      <View style={[st.featureArt, { backgroundColor: color }]}>
        <Mascot size={112} {...plume} />
      </View>
      <Text style={[T.title, { marginTop: S.lg }]}>{title}</Text>
      <Text style={[T.body, { color: C.muted, marginTop: S.sm }]}>{body}</Text>
    </View>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <View style={{ borderTopWidth: 1, borderTopColor: C.onDarkLine, paddingTop: S.lg }}>
      <Text style={[T.title, { color: C.onDark }]}>{title}</Text>
      <Text style={[T.body, { color: C.onDarkMuted, marginTop: 4 }]}>{body}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={st.footer}>
      <View style={[st.wrap, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: S.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Mascot size={28} interactive={false} />
          <Text style={T.small}>© {new Date().getFullYear()} Kudoze</Text>
        </View>
        <Text style={T.small}>Demo mode: the people you meet inside are made up.</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { width: '100%', maxWidth: PAGE_W, alignSelf: 'center', paddingHorizontal: S.xl },
  nav: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.line,
    backgroundColor: Platform.OS === 'web' ? 'rgba(242,240,235,0.86)' : C.canvas,
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(12px)' } as object) : null),
    zIndex: 5,
  },
  navInner: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { paddingTop: 56, paddingBottom: 88 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 72, paddingBottom: 104 },
  headline: { fontFamily: F.serif, color: C.ink, letterSpacing: -2 },
  lede: { ...T.body, fontSize: 18, lineHeight: 27, color: C.muted, maxWidth: 500 },
  join: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.sm,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.pill,
    padding: 5,
    paddingLeft: 20,
    maxWidth: 460,
    marginTop: S.sm,
  },
  joinStacked: { flexDirection: 'column', alignItems: 'stretch', borderRadius: R.card + 4, padding: 6, paddingLeft: 6 },
  joinInput: { flex: 1, minWidth: 0, fontFamily: F.sans, fontSize: 16, color: C.ink, paddingVertical: 8, paddingHorizontal: 8 },
  syncs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 14, rowGap: 6, marginTop: S.md },
  devices: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingVertical: 44 },
  features: { marginTop: 48, gap: S.lg },
  feature: { flex: 1, backgroundColor: C.paper, borderRadius: R.card, borderWidth: 1, borderColor: C.line, padding: S.xl },
  featureArt: { height: 150, borderRadius: R.input, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  band: { backgroundColor: C.lagoon, paddingVertical: 88 },
  footer: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: S.xl },
});
