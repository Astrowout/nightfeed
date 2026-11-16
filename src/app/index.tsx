import { router } from 'expo-router';
import Head from 'expo-router/head';
import React, { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { BrandMark, BrandWall, LAUNCH_BRAND } from '../components/BrandLogos';
import { HeroStage } from '../components/HeroStage';
import { JOIN_ROW, WIDE, lp } from '../components/landingCss';
import { Mascot } from '../components/Mascot';
import type { MascotProps } from '../components/mascotConfig';
import { MascotSays } from '../components/MascotSays';
import { Wordmark } from '../components/Wordmark';
import { Button, Tag } from '../components/Ui';
import { ApiError, api } from '../lib/auth';
import { APP_OPEN } from '../lib/config';
import { C, F, R, S, T } from '../theme';

// Public landing page. Only signed-out visitors on the web reach it (see app/_layout.tsx);
// the phone apps open straight at sign-in. Kudoze is not open yet, so the page collects
// emails for a waitlist (POST /api/waitlist) instead of sending people to sign up.

const PAGE_W = 1120;
const WEB = Platform.OS === 'web';

const logIn = () => router.push('/sign-in?mode=sign-in');

export default function Landing() {
  // Web: always the narrow layout here; CSS media queries widen it (landingCss.ts).
  const { width } = useWindowDimensions();
  const wide = !WEB && width >= WIDE;
  const [artW, setArtW] = useState(0);
  const [joined, setJoined] = useState<string | null>(null);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const heroInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const toForm = () => {
    scroll.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => heroInput.current?.focus(), 300);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.canvas }}>
      <Head>
        <title>Kudoze: the social feed for sleep, coming soon</title>
        <meta
          name="description"
          content="Kudoze is coming soon: post last night from your watch or ring, give friends kudos for a good night and keep each other to a bedtime. Leave your email to hear when it opens."
        />
      </Head>

      <Nav onKeepPosted={toForm} onHome={() => scroll.current?.scrollTo({ y: 0, animated: true })} joined={!!joined} />

      <ScrollView ref={scroll}>
        {/* Hero */}
        <View style={[st.wrap, st.hero, wide && st.heroWide]} {...lp('hero')}>
          <View style={[{ gap: S.lg }, wide && { flex: 1, paddingRight: 56 }]} {...lp('hero-text')}>
            <View style={st.soon}>
              <View style={st.soonDot} />
              <Text style={[T.smallStrong, { color: C.ink }]}>Coming soon to iPhone, Android and the web</Text>
            </View>
            <Text style={[st.headline, wide ? { fontSize: 72, lineHeight: 74 } : { fontSize: 46, lineHeight: 50 }]} {...lp('headline')}>Sleep is a team sport now.</Text>
            <Text style={st.lede}>
              Kudoze is the social feed for sleep. Your watch or ring posts last night, friends give kudos, and a bedtime leaderboard keeps
              everyone honest. Interested? Leave your email and you’ll hear first when it opens.
            </Text>
            <EmailJoin joined={joined} onJoined={setJoined} inputRef={heroInput} source="hero" />
            <View style={st.syncs}>
              <Text style={T.small}>Syncs with</Text>
              <BrandMark brand={LAUNCH_BRAND} color={C.muted} scale={0.72} />
              <Tag label="More brands soon" bg={C.lilac} />
            </View>
          </View>

          <View
            style={[wide ? { flex: 1.05 } : { marginTop: S.section + 24 }]}
            {...lp('hero-art')}
            onLayout={(e) => setArtW(Math.round(e.nativeEvent.layout.width))}
          >
            {artW > 0 && <HeroStage width={artW} />}
          </View>
        </View>

        {/* Devices */}
        <View style={st.devices}>
          <View style={st.wrap}>
            <Text style={[T.eyebrow, { textAlign: 'center', marginBottom: S.xl }]}>Made for what you already wear</Text>
            <BrandWall />
          </View>
        </View>

        {/* Features */}
        <View style={[st.wrap, { paddingVertical: 88 }]}>
          <Text style={[T.h1, { maxWidth: 560 }, wide && { fontSize: 44, lineHeight: 48, letterSpacing: -1.4 }]} {...lp('features-title')}>
            Everything a good night deserves, and a little nudge for the bad ones.
          </Text>
          <View style={[st.features, wide && { flexDirection: 'row' }]} {...lp('features')}>
            <Feature
              color={C.periwinkle}
              plume={{ state: 'working' }}
              title="Post last night"
              body="Your night syncs from your device each morning: time asleep, lights out, wake-up and a score. Add a note, then post it or keep it to yourself."
            />
            <Feature
              color={C.peach}
              plume={{ smile: true, bowTie: true, accessoryColor: C.violet }}
              title="Kudos and comments"
              body="Follow friends, family or your running club. Give kudos for a solid eight hours and a kind word after a rough one."
            />
            <Feature
              color={C.marigold}
              plume={{ smile: true, headphones: true }}
              title="Bedtime challenges"
              body="Join a challenge, from lights out before 23:00 to seven nights in a row of seven hours, and climb the leaderboard together."
            />
          </View>
        </View>

        {/* Privacy band */}
        <View style={st.band}>
          <View style={[st.wrap, wide && { flexDirection: 'row', alignItems: 'flex-start', gap: 64 }]} {...lp('band')}>
            <View style={[{ gap: S.md }, wide && { flex: 1 }]} {...lp('band-text')}>
              <MascotSays size={96} onDark mascot={{ state: 'sleeping', glasses: 'mask' }} style={{ marginBottom: S.md }}>
                What happens in bed stays in bed.
              </MascotSays>
              <Text style={[T.h1, { color: C.onDark }, wide && { fontSize: 40, lineHeight: 44 }]} {...lp('band-title')}>Your sleep stays yours.</Text>
              <Text style={[T.body, { color: C.onDarkMuted, maxWidth: 440 }]}>
                Sleep data is health data, so we treat it that way. You decide who sees each night, and you can take everything with you.
              </Text>
            </View>
            <View style={[{ gap: S.lg, marginTop: S.xxl }, wide && { flex: 1, marginTop: 0 }]} {...lp('band-points')}>
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
          <Text style={[T.h1, { textAlign: 'center', marginTop: S.lg }, wide && { fontSize: 48, lineHeight: 52, letterSpacing: -1.5 }]} {...lp('close-title')}>
            Tonight is a good night to start.
          </Text>
          <Text style={[T.body, { color: C.muted, textAlign: 'center', marginTop: S.md, maxWidth: 420 }]}>
            Interested? Leave your email and we’ll let you know the day it opens. Bring a friend who stays up too late.
          </Text>
          <View style={{ marginTop: S.xl, width: '100%', maxWidth: 460 }}>
            <EmailJoin joined={joined} onJoined={setJoined} source="closing" />
          </View>
        </View>

        <Footer onHome={() => scroll.current?.scrollTo({ y: 0, animated: true })} />
      </ScrollView>
    </View>
  );
}

function Nav({ onKeepPosted, onHome, joined }: { onKeepPosted: () => void; onHome: () => void; joined: boolean }) {
  return (
    <View style={st.nav}>
      <View style={[st.wrap, st.navInner]}>
        <Wordmark size={27} onPress={onHome} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: S.sm }}>
          {APP_OPEN && <Button label="Log in" kind="ghost" small onPress={logIn} />}
          {!joined && <Button label="Keep me posted" small onPress={onKeepPosted} />}
        </View>
      </View>
    </View>
  );
}

/** The waitlist form: one field and one button. After a successful submit it thanks the person instead. */
function EmailJoin({
  joined,
  onJoined,
  inputRef,
  source,
}: {
  joined: string | null;
  onJoined: (email: string) => void;
  inputRef?: React.Ref<React.ComponentRef<typeof TextInput>>;
  source: string;
}) {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Web: always stacked here; CSS puts the field and button in a row (landingCss.ts).
  const { width } = useWindowDimensions();
  const stacked = WEB || width < JOIN_ROW;

  const submit = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError('Enter a valid email address, like name@example.com.');
    setError(null);
    setBusy(true);
    try {
      await api('/waitlist', { method: 'POST', body: { email: value, source } });
      onJoined(value);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'We couldn’t save your email. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (joined) {
    return (
      <View style={[st.joined, { marginTop: S.sm }]} accessibilityLiveRegion="polite">
        <Mascot size={56} smile interactive={false} />
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          <Text style={T.bodyStrong}>You’re on the list.</Text>
          <Text style={T.small}>We’ll email {joined} when Kudoze opens. That’s the only email you’ll get from us.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ gap: S.sm, marginTop: S.sm, maxWidth: 460, width: '100%' }}>
      <View style={[st.join, stacked && st.joinStacked, focused && { borderColor: C.ink }, !!error && { borderColor: C.papaya }]} {...lp('join')}>
        <TextInput
          ref={inputRef}
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (error) setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={submit}
          placeholder="Your email"
          placeholderTextColor={C.faint}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="send"
          accessibilityLabel="Your email"
          style={[st.joinInput, stacked && { paddingVertical: 12 }, Platform.OS === 'web' && ({ outlineStyle: 'none' } as object)]}
          {...lp('join-input')}
        />
        <View style={stacked && { alignSelf: 'stretch' }} {...lp('join-button')}>
          <Button label="Keep me posted" onPress={submit} busy={busy} full={stacked} />
        </View>
      </View>
      {error ? (
        <Text style={[T.small, { color: C.ink }]} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : (
        <Text style={T.small}>One email when we open. Nothing else.</Text>
      )}
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

function Footer({ onHome }: { onHome: () => void }) {
  return (
    <View style={st.footer}>
      <View style={[st.wrap, { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: S.md }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Mascot size={28} interactive={false} />
          <Wordmark size={20} onPress={onHome} label="Back to top" />
          <Text style={T.small}>© {new Date().getFullYear()}</Text>
        </View>
        <Text style={T.small}>Coming soon to iPhone, Android and the web.</Text>
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
  soon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  soonDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.mint, borderWidth: 1, borderColor: '#6CC384' },
  joined: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: S.md,
    backgroundColor: C.paper,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.card,
    padding: S.md,
    maxWidth: 460,
    width: '100%',
  },
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
