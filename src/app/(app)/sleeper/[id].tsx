import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { BackIcon } from '../../../components/Icons';
import { ProfileBody } from '../../../components/ProfileBody';
import { Screen, TopBar } from '../../../components/Ui';
import { C } from '../../../theme';

export default function SleeperScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Screen
      header={
        <TopBar
          title="Profile"
          left={
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              accessibilityRole="button"
              accessibilityLabel="Back"
              style={{ padding: 8 }}
            >
              <BackIcon color={C.ink} />
            </Pressable>
          }
        />
      }
    >
      <ProfileBody sleeperId={id ?? ''} />
    </Screen>
  );
}
