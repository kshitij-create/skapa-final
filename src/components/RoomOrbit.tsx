/**
 * RoomOrbit — member avatars orbiting around an album cover.
 * Slow rotation, pulsing "host" crown, smooth enter/exit per member.
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
} from 'react-native-reanimated';
import type { RoomMember } from '../hooks/useRoomSocket';

interface Props {
  members: RoomMember[];
  hostId: string;
  radius?: number;
  color?: string;
}

const OrbitingAvatar: React.FC<{
  member: RoomMember;
  index: number;
  total: number;
  radius: number;
  orbit: Animated.SharedValue<number>;
  isHost: boolean;
  color: string;
}> = ({ member, index, total, radius, orbit, isHost, color }) => {
  const angleOffset = (index / Math.max(total, 1)) * Math.PI * 2;

  const style = useAnimatedStyle(() => {
    const theta = orbit.value + angleOffset;
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    return {
      transform: [{ translateX: x }, { translateY: y }],
    };
  });

  return (
    <Animated.View
      entering={FadeIn.duration(300).springify()}
      exiting={FadeOut.duration(200)}
      style={[styles.orbitSlot, style]}
    >
      <View style={[styles.avatarOuter, isHost && { borderColor: color, borderWidth: 2 }]}>
        {member.avatar ? (
          <Image source={{ uri: member.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarInitial}>{member.name[0]?.toUpperCase() ?? '·'}</Text>
          </View>
        )}
        {isHost && (
          <View style={styles.hostCrown}>
            <Text style={{ fontSize: 10, lineHeight: 12 }}>👑</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{member.name}</Text>
    </Animated.View>
  );
};

export const RoomOrbit: React.FC<Props> = ({ members, hostId, radius = 110, color = '#8A2BE2' }) => {
  const orbit = useSharedValue(0);

  useEffect(() => {
    orbit.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 45000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  return (
    <View style={[styles.container, { width: radius * 2 + 80, height: radius * 2 + 80 }]}>
      {/* Orbit rings */}
      <View style={[styles.orbitRing, { width: radius * 2 + 20, height: radius * 2 + 20, borderRadius: radius + 10, borderColor: `${color}33` }]} />
      <View style={[styles.orbitRing, { width: radius * 2 + 60, height: radius * 2 + 60, borderRadius: radius + 30, borderColor: `${color}15` }]} />

      {members.map((m, i) => (
        <OrbitingAvatar
          key={m.id}
          member={m}
          index={i}
          total={members.length}
          radius={radius}
          orbit={orbit}
          isHost={m.id === hostId}
          color={color}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitRing: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  orbitSlot: {
    position: 'absolute',
    alignItems: 'center',
  },
  avatarOuter: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  avatar: {
    width: '100%', height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#fff', fontSize: 14, fontWeight: '700',
  },
  hostCrown: {
    position: 'absolute',
    top: -6, right: -6,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#0a0a0a',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 9,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: -0.1,
    maxWidth: 60,
  },
});
