/**
 * Rooms stack — browse → listen.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoomsScreen } from '../screens/RoomsScreen';
import { ListeningRoomScreen } from '../screens/ListeningRoomScreen';

const Stack = createNativeStackNavigator();

export const RoomsStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: '#050505' },
    }}
  >
    <Stack.Screen name="RoomsList" component={RoomsScreen} />
    <Stack.Screen
      name="ListeningRoom"
      component={ListeningRoomScreen}
      options={{ animation: 'slide_from_bottom' }}
    />
  </Stack.Navigator>
);
