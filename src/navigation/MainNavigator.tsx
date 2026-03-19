import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HomeScreen } from '../screens/HomeScreen';
import { LivePresenceScreen } from '../screens/LivePresenceScreen';
import { ListeningRoomScreen } from '../screens/ListeningRoomScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();

// Dummy screen for Profile since it hasn't been implemented yet
const DummyScreen = () => <View style={{ flex: 1, backgroundColor: COLORS.background }} />;

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate({ name: route.name, merge: true });
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              style={[
                styles.tabButton,
                isFocused && styles.tabButtonActive
              ]}
            >
              {options.tabBarIcon && options.tabBarIcon({ focused: isFocused })}
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarIcon: ({ focused }: any) => (
            <Ionicons name="home-outline" size={28} color={focused ? "#fff" : "rgba(255,255,255,0.4)"} />
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={LivePresenceScreen} 
        options={{
          tabBarIcon: ({ focused }: any) => (
            <Ionicons name="map-outline" size={28} color={focused ? "#fff" : "rgba(255,255,255,0.4)"} />
          ),
        }}
      />
      <Tab.Screen 
        name="Room" 
        component={ListeningRoomScreen} 
        options={{
          tabBarIcon: ({ focused }: any) => (
            <View style={{ position: 'relative' }}>
              <Ionicons name="pulse-outline" size={28} color={focused ? "#fff" : "rgba(255,255,255,0.4)"} />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={DummyScreen} 
        options={{
          tabBarIcon: () => (
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?u=user1' }} 
              style={styles.profileImage} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    width: '90%',
    borderRadius: 9999, // fully rounded
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  blurView: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 22, 0.9)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444', // red-500
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#121216',
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 11,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
