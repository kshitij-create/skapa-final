import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  useSharedValue, 
  withSequence,
  Easing
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING } from '../theme';

interface FriendCardProps {
  name: string;
  status: string;
  imageUrl: string;
  emoji?: string;
  isLive?: boolean;
  inRoom?: boolean;
  liveColors?: [string, string, ...string[]];
  isIdle?: boolean;
}

const EqBar = ({ delay = 0, isActive }: { delay?: number; isActive: boolean }) => {
  const height = useSharedValue(4);

  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        height.value = withRepeat(
          withSequence(
            withTiming(14, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(4, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }, delay);
    } else {
      height.value = withTiming(4, { duration: 300 });
    }
  }, [isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.eqBar, animatedStyle]} />;
};

export const FriendCard: React.FC<FriendCardProps> = ({
  name,
  status,
  imageUrl,
  emoji,
  isLive = false,
  inRoom = false,
  liveColors = ['#a855f7', '#3b82f6'],
  isIdle = false,
}) => {
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.8);

  useEffect(() => {
    if (isLive || inRoom) {
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      ringOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.8, { duration: 1500 })
        ),
        -1,
        true
      );
    }
  }, [isLive, inRoom]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={[styles.container, isIdle && styles.idleContainer]}>
      <View style={styles.avatarContainer}>
        {(isLive || inRoom) && (
          <Animated.View style={[StyleSheet.absoluteFill, ringStyle, styles.ringWrapper]}>
            <LinearGradient
              colors={liveColors}
              style={styles.ring}
            />
          </Animated.View>
        )}
        <Image source={{ uri: imageUrl }} style={[styles.avatar, (isLive || inRoom) && styles.activeAvatar]} />
        {emoji && (
          <View style={styles.emojiBadge}>
            <Text style={{ fontSize: 10 }}>{emoji}</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {isLive && (
            <View style={styles.eqContainer}>
              <EqBar isActive={true} />
              <EqBar isActive={true} delay={200} />
              <EqBar isActive={true} delay={400} />
            </View>
          )}
          {inRoom && (
            <View style={styles.inRoomBadge}>
              <Text style={styles.inRoomText}>In Room</Text>
            </View>
          )}
        </View>
        <Text style={styles.status} numberOfLines={1}>{status}</Text>
      </View>

      {!isIdle && (
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons 
            name={isLive ? "headset-outline" : "arrow-forward-outline"} 
            size={18} 
            color="rgba(255,255,255,0.8)" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  idleContainer: {
    opacity: 0.6,
  },
  avatarContainer: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  ringWrapper: {
    top: -4, left: -4, right: -4, bottom: -4,
  },
  ring: {
    flex: 1,
    borderRadius: BORDER_RADIUS.full,
    opacity: 0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: 'transparent',
    zIndex: 10,
  },
  activeAvatar: {
    borderColor: COLORS.surface,
  },
  emojiBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: 2,
    zIndex: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  status: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eqContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 2,
  },
  eqBar: {
    width: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  inRoomBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  inRoomText: {
    fontSize: 10,
    color: COLORS.warning,
    fontWeight: '500',
  },
});
