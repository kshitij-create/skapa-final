import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme';

interface OnboardingProgressProps {
  step: 1 | 2 | 3;
  total?: number;
}

const AnimatedSegment: React.FC<{ index: number; active: boolean; complete: boolean }> = ({
  index,
  active,
  complete,
}) => {
  const fill = useSharedValue(complete ? 1 : active ? 1 : 0);
  const glow = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    fill.value = withTiming(complete || active ? 1 : 0, {
      duration: 450,
      easing: Easing.out(Easing.cubic),
    });
    glow.value = withTiming(active ? 1 : 0, { duration: 350 });
  }, [active, complete]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    opacity: complete ? 0.6 : 1,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.8,
  }));

  return (
    <View style={styles.segment}>
      <View style={styles.segmentTrack} />
      <Animated.View style={[styles.segmentFill, fillStyle]} />
      <Animated.View style={[styles.segmentGlow, glowStyle]} pointerEvents="none" />
    </View>
  );
};

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ step, total = 3 }) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <AnimatedSegment
          key={i}
          index={i}
          active={i + 1 === step}
          complete={i + 1 < step}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    width: '100%',
  },
  segment: {
    height: 3,
    flex: 1,
    borderRadius: 2,
    backgroundColor: 'transparent',
    overflow: 'visible',
    position: 'relative',
  },
  segmentTrack: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
  },
  segmentFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  segmentGlow: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: 0,
    right: 0,
    borderRadius: 4,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: COLORS.primary,
  },
});
