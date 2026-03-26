import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EmotionalHookScreen, ConnectMusicScreen, ChooseVibeScreen } from '../screens/onboarding';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <>
      <StatusBar hidden />
      <Stack.Navigator
        initialRouteName="EmotionalHook"
        screenOptions={{
          headerShown: false,
          animation: 'fade', // using fade to make it feel more seamless
          contentStyle: { backgroundColor: '#050505' },
        }}
      >
        <Stack.Screen name="EmotionalHook" component={EmotionalHookScreen} />
        <Stack.Screen name="ConnectMusic" component={ConnectMusicScreen} />
        <Stack.Screen name="ChooseVibe" component={ChooseVibeScreen} />
      </Stack.Navigator>
    </>
  );
};
