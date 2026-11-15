import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MoonIcon } from '../../components/Icons';
import { NightCard } from '../../components/NightCard';
import { Button, Card, Screen, Stat, s } from '../../components/Ui';
import { hm } from '../../data/format';
import { feed, periodStats, streak } from '../../data/selectors';
import { useStore } from '../../data/store';
import { C } from '../../theme';

export default function FeedScreen() {
  const { state } = useStore();
  const [limit, setLimit] = useState(20);
  const items = feed(state);
  const week = periodStats(state, state.meId, 7);
  const run = streak(state, state.meId);

  const header = (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.border }}>
      <View style={[s.inner, { flexDirection: 'row', alignItems: 'center', gap: 8, height: 54 }]}>
        <MoonIcon size={22} color={C.moon} filled />
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.8 }}>nightfeed</Text>
      </View>
    </View>
  );

  return (
    <Screen header={header}>
      <Pressable onPress={() => router.push('/you')} accessibilityRole="link">
        <Card style={{ marginTop: 16, marginBottom: 18 }}>
          <Text style={[s.muted, { marginBottom: 10 }]}>Your last 7 nights</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Stat label="Nights" value={`${week.nights}`} />
            <Stat label="Avg asleep" value={week.nights ? hm(week.avgAsleep) : '–'} />
            <Stat label="Streak 70+" value={`${run} 🔥`} />
          </View>
        </Card>
      </Pressable>

      {items.length === 0 && (
        <Card>
          <Text style={s.body}>Nothing here yet. Log a night or follow someone to fill your feed.</Text>
        </Card>
      )}
      {items.slice(0, limit).map((n) => (
        <NightCard key={n.id} night={n} />
      ))}
      {items.length > limit && <Button kind="ghost" label="Show older nights" onPress={() => setLimit(limit + 20)} />}
    </Screen>
  );
}
