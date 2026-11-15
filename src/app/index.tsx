import { router } from 'expo-router';
import Head from 'expo-router/head';
import React, { useMemo } from 'react';
import { Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { BrandWall } from '../components/BrandLogos';
import { Hypnogram, ScoreRing } from '../components/Charts';
import { PaperScrap } from '../components/Collage';
import { CommentIcon, LockIcon, MoonIcon, StarIcon, TrophyIcon, WatchIcon } from '../components/Icons';
import { Button, Stat, Tag } from '../components/Ui';
import { buildSession, rng } from '../data/generate';
import { C, F, FLOAT, R, S, T, scoreTag } from '../theme';

// Public landing page. Only signed-out visitors on the web reach it (see app/_layout.tsx);
// the phone apps open straight at sign-in.

const PAGE_W = 1120;
const WIDE = 900;

const signUp = () => router.push('/sign-in?mode=sign-up');
const logIn = () => router.push('/sign-in?mode=sign-in');

export default function Landing() {
  const { width } = useWindowDimensions();
  const wide = width >= WIDE;

  return (
    <View style={{ flex: 1, backgroundColor: C.canvas }}>
      <Head>
        <title>Nightfeed: the social feed for sleep</title>
        <meta
          name="description"
          content="Post last night from your watch or ring, give friends kudos for a good night and keep each other to a bedtime."
        />
      </Head>

      <Nav />

      <ScrollView>
        {/* Hero */}
        <View style={[st.wrap, st.hero, wide && st.heroWide]}>
          <View style={[{ gap: S.lg }, wide && { flex: 1.15, paddingRight: S.section }]}>
            <Text style={T.eyebrow}>The social feed for sleep</Text>
            <Text style={[st.headline, wide ? { fontSize: 68, lineHeight: 72 } : { fontSize: 44, lineHeight: 48 }]}>
              Sleep better, together.
            </Text>
            <Text style={st.lede}>
              Nightfeed turns last night from your watch or ring into a post. Give friends kudos for a good night, compare bedtimes and keep
              each other honest.
            </Text>
            <View style={st.ctaRow}>
              <Button label="Join for free" onPress={signUp} />
              <Button label="Log in" kind="ghost" onPress={logIn} />
            </View>
            <Text style={T.caption}>Free to join. Your nights are followers-only unless you choose otherwise.</Text>
          </View>

          <View style={[st.heroArt, wide ? { flex: 1 } : { marginTop: S.section + 8 }]}>
            <PaperScrap width={150} height={96} color={C.mint} seed={4} rotate={-8} style={{ top: -34, left: -18 }} />
            <PaperScrap width={110} height={140} color={C.periwinkle} seed={9} rotate={6} style={{ bottom: -30, right: -14 }} />
            <PaperScrap width={84} height={54} color={C.marigold} seed={15} rotate={-4} style={{ top: 40, right: -26 }} />
            <SampleNight />
          </View>
        </View>

        {/* Devices */}
        <View style={st.devices}>
          <View style={st.wrap}>
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
              icon={<WatchIcon size={22} color={C.ink} />}
              title="Post last night"
              body="Your night syncs from your device each morning: time asleep, stages and a score. Add a note, then post it or keep it to yourself."
            />
            <Feature
              color={C.peach}
              icon={<StarIcon size={22} color={C.ink} />}
              title="Kudos and comments"
              body="Follow friends, family or your running club. Give kudos for a solid eight hours and a kind word after a rough one."
            />
            <Feature
              color={C.marigold}
              icon={<TrophyIcon size={22} color={C.ink} />}
              title="Bedtime challenges"
              body="Join a challenge, from lights out before 23:00 to seven nights in a row of seven hours, and climb the leaderboard together."
            />
          </View>
        </View>

        {/* Privacy band */}
        <View style={st.band}>
          <View style={[st.wrap, wide && { flexDirection: 'row', alignItems: 'flex-start', gap: 64 }]}>
            <View style={[{ gap: S.md }, wide && { flex: 1 }]}>
              <LockIcon size={26} color={C.mint} />
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
          <MoonIcon size={30} color={C.wine} filled />
          <Text style={[T.h1, { textAlign: 'center', marginTop: S.lg }, wide && { fontSize: 48, lineHeight: 52, letterSpacing: -1.5 }]}>
            Tonight is a good night to start.
          </Text>
          <Text style={[T.body, { color: C.muted, textAlign: 'center', marginTop: S.md, maxWidth: 420 }]}>
            Connect your device, follow a few friends and see who sleeps best this week.
          </Text>
          <View style={[st.ctaRow, { justifyContent: 'center', marginTop: S.xl }]}>
            <Button label="Join for free" onPress={signUp} />
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
          <MoonIcon size={22} color={C.wine} filled />
          <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, letterSpacing: -0.4 }}>nightfeed</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          <Button label="Log in" kind="ghost" small onPress={logIn} />
          <Button label="Sign up" small onPress={signUp} />
        </View>
      </View>
    </View>
  );
}

/** A made-up night as it appears in the feed, so visitors see what a post looks like. */
function SampleNight() {
  const session = useMemo(() => {
    const bed = new Date();
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 12, 0, 0);
    return buildSession(rng(11), bed, 452, 'oura');
  }, []);
  const tag = scoreTag(86);

  return (
    <View style={[st.sample, FLOAT]} accessibilityLabel="Example post: Mira slept 7 hours 32 minutes with a score of 86 and got 12 kudos">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.md }}>
        <View style={st.avatar}>
          <Text style={T.smallStrong}>MV</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={T.bodyStrong}>Mira V.</Text>
          <Text style={T.caption}>Last night · Oura Ring</Text>
        </View>
        <Tag label={tag.label} bg={tag.bg} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.lg, marginTop: S.lg }}>
        <ScoreRing score={86} size={68} />
        <Stat label="Asleep" value="7h 32m" />
        <Stat label="Lights out" value="23:12" />
      </View>
      <View style={st.chart}>
        <Hypnogram session={session} compact />
      </View>
      <View style={st.sampleFoot}>
        <View style={st.meta}>
          <StarIcon size={17} color={C.wine} filled />
          <Text style={T.small}>12 kudos</Text>
        </View>
        <View style={st.meta}>
          <CommentIcon size={17} color={C.muted} />
          <Text style={T.small}>“Finally beat my bedtime!”</Text>
        </View>
      </View>
    </View>
  );
}

function Feature({ color, icon, title, body }: { color: string; icon: React.ReactNode; title: string; body: string }) {
  return (
    <View style={st.feature}>
      <View style={[st.featureIcon, { backgroundColor: color }]}>{icon}</View>
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
          <MoonIcon size={16} color={C.muted} filled />
          <Text style={T.small}>© {new Date().getFullYear()} Nightfeed</Text>
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
  hero: { paddingTop: 72, paddingBottom: 96 },
  heroWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 104, paddingBottom: 120 },
  headline: { fontFamily: F.serif, color: C.ink, letterSpacing: -2 },
  lede: { ...T.body, fontSize: 18, lineHeight: 27, color: C.muted, maxWidth: 500 },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: S.md, marginTop: S.sm },
  heroArt: { alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  sample: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: C.paper,
    borderRadius: R.sheet,
    borderWidth: 1,
    borderColor: C.line,
    padding: S.xl,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.lilac,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(41,40,39,0.12)',
  },
  chart: { marginTop: S.lg, backgroundColor: C.inset, borderRadius: R.input, padding: S.md },
  sampleFoot: { marginTop: S.lg, gap: S.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  devices: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line, backgroundColor: C.paper, paddingVertical: 44 },
  features: { marginTop: 48, gap: S.lg },
  feature: { flex: 1, backgroundColor: C.paper, borderRadius: R.card, borderWidth: 1, borderColor: C.line, padding: S.xl },
  featureIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  band: { backgroundColor: C.lagoon, paddingVertical: 88 },
  footer: { borderTopWidth: 1, borderTopColor: C.line, paddingVertical: S.xl },
});
