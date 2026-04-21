/**
 * FloatingReaction — Instagram-live-style emoji that floats up, drifts, fades.
 */
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface Props {
  id: string;
  emoji: string;
  startX: number; // 0..1 of container
  onDone: (id: string) => void;
  variant?: 'float' | 'burst';
}

export const FloatingReaction: React.FC<Props> = ({ id, emoji, startX, onDone, variant = 'float' }) => {
  const progress = useSharedValue(0);
  const drift = useMemo(() => (Math.random() - 0.5) * 140, []);
  const size = useMemo(() => 28 + Math.random() * 18, []);
  const rot = useMemo(() => (Math.random() - 0.5) * 45, []);
  const duration = variant === 'burst' ? 1400 : 2800;

  useEffect(() => {
    progress.value = withTiming(
      1,
      { duration, easing: Easing.out(Easing.cubic) },
      fin => {
        if (fin) runOnJS(onDone)(id);
      },
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [
        { translateY: -220 * p },
        { translateX: drift * p * (0.5 + 0.5 * Math.sin(p * Math.PI * 2)) },
        { rotate: `${rot * p}deg` },
        { scale: 1 + 0.1 * Math.sin(p * Math.PI * 4) },
      ],
      opacity: p < 0.1 ? p * 10 : 1 - Math.pow(Math.max(0, p - 0.4), 2) * 2.8,
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { left: `${startX * 100}%` },
        style,
      ]}
    >
      <Text style={{ fontSize: size, lineHeight: size + 4 }}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 80,
    width: 0, height: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
