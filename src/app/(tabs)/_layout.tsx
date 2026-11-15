import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { FeedIcon, PlusIcon, TrophyIcon, UserIcon } from '../../components/Icons';
import { C } from '../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.moon,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopColor: C.border,
          ...(Platform.OS === 'web' ? { height: 64, paddingTop: 6, paddingBottom: 8 } : null),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: C.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Feed', tabBarIcon: ({ color }) => <FeedIcon color={String(color)} /> }} />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log night',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                backgroundColor: focused ? C.moon : C.surface2,
                borderRadius: 999,
                padding: 4,
                borderWidth: 1,
                borderColor: focused ? C.moon : C.border,
              }}
            >
              <PlusIcon size={20} color={focused ? C.moonInk : C.text} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{ title: 'Challenges', tabBarIcon: ({ color }) => <TrophyIcon color={String(color)} /> }}
      />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <UserIcon color={String(color)} /> }} />
    </Tabs>
  );
}
