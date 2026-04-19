import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { HomeScreen } from '../screens/HomeScreen';
import { LivePresenceScreen } from '../screens/LivePresenceScreen';
import { ListeningRoomScreen } from '../screens/ListeningRoomScreen';
import { RoomsScreen } from '../screens/RoomsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <BlurView intensity={80} tint="dark" style={styles.blurView}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isCenter = index === 2; // Map is the 3rd tab (index 2)

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

          if (isCenter) {
            // Render the uplifted Map button — floats above the pill
            return (
              <View key={route.key} style={styles.centerTabWrapper}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={onPress}
                  style={styles.centerTabButton}
                >
                  <Ionicons name="map-outline" size={26} color="#000" />
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              activeOpacity={0.8}
              onPress={onPress}
              style={[
                styles.tabButton,
                isFocused && styles.tabButtonActive,
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
      {/* Tab 1: Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }: any) => (
            <Ionicons
              name="home-outline"
              size={22}
              color={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
            />
          ),
        }}
      />
      {/* Tab 2: Discover / Grid */}
      <Tab.Screen
        name="Discover"
        component={RoomsScreen}
        options={{
          tabBarIcon: ({ focused }: any) => (
            <Ionicons
              name="grid-outline"
              size={22}
              color={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
            />
          ),
        }}
      />
      {/* Tab 3: Map (center, uplifted white circle) */}
      <Tab.Screen
        name="Map"
        component={LivePresenceScreen}
        options={{
          tabBarIcon: () => null, // Rendered manually in CustomTabBar
        }}
      />
      {/* Tab 4: Rooms / Radio with badge */}
      <Tab.Screen
        name="Rooms"
        component={ListeningRoomScreen}
        options={{
          tabBarIcon: ({ focused }: any) => (
            <View style={{ position: 'relative' }}>
              <Ionicons
                name="radio-outline"
                size={22}
                color={focused ? '#fff' : 'rgba(255,255,255,0.4)'}
              />
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>5</Text>
              </View>
            </View>
          ),
        }}
      />
      {/* Tab 5: Profile */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }: any) => (
            <View style={[styles.profileImageWrap, focused && styles.profileImageWrapActive]}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/300?u=user1' }}
                style={styles.profileImage}
              />
            </View>
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
    width: '85%',
    borderRadius: 9999,
    overflow: 'visible', // lets the uplifted button overflow the pill
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 30,
  },
  blurView: {
    flexDirection: 'row',
    backgroundColor: 'rgba(18, 18, 22, 0.9)',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'visible',
  },
  tabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Placeholder so the pill lays out evenly with 5 items
  centerTabWrapper: {
    width: 56,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The actual uplifted white circle — positioned above the pill
  centerTabButton: {
    position: 'absolute',
    bottom: 10,   // rises above the pill surface
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: '#ef4444',
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
  profileImageWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    opacity: 0.75,
  },
  profileImageWrapActive: {
    opacity: 1,
    borderColor: '#ffae45',
    borderWidth: 1.5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
});
