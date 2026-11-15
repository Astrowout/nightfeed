import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { FeedIcon, PlusIcon, TrophyIcon, UserIcon } from '../../../components/Icons';
import { C, F, FLOAT } from '../../../theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.wine,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: C.paper,
          borderTopColor: C.line,
          ...FLOAT,
          ...(Platform.OS === 'web' ? { height: 74, paddingTop: 8, paddingBottom: 14 } : null),
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: F.sansMedium },
        sceneStyle: { backgroundColor: C.canvas },
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
                backgroundColor: C.wine,
                borderRadius: 999,
                width: 34,
                height: 34,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: focused ? 1 : 0.92,
              }}
            >
              <PlusIcon size={20} color={C.onDark} />
            </View>
          ),
        }}
      />
      <Tabs.Screen name="challenges" options={{ title: 'Challenges', tabBarIcon: ({ color }) => <TrophyIcon color={String(color)} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <UserIcon color={String(color)} /> }} />
    </Tabs>
  );
}
