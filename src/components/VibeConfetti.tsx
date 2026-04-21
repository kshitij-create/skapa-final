/**
 * VibeConfetti — lightweight particle burst on mood selection.
 * 24 particles flung radially, each fading + rotating.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface ParticleProps {
  index: number;
  color: string;
  onDone?: () => void;
}

const COUNT = 24;

const Particle: React.FC<ParticleProps> = ({ index, color, onDone }) => {
  const progress = useSharedValue(0);
  const angle = (index / COUNT) * Math.PI * 2;
  const dist = 90 + Math.random() * 50;
  const dx = Math.cos(angle) * dist;
  const dy = Math.sin(angle) * dist;
  const size = 6 + Math.random() * 6;
  const rotEnd = (Math.random() * 720 - 360);

  useEffect(() => {
    progress.value = withDelay(
      index * 8,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }, finished => {
        if (finished && onDone && index === 0) runOnJS(onDone)();
      }),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;
    return {
      transform: [
        { translateX: dx * p },
        { translateY: dy * p - 40 * (1 - Math.pow(1 - p, 2)) },
        { rotate: `${rotEnd * p}deg` },
        { scale: 1 - 0.3 * p },
      ],
      opacity: 1 - Math.pow(p, 2),
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        { width: size, height: size, backgroundColor: color },
        style,
      ]}
    />
  );
};

interface VibeConfettiProps {
  trigger: number; // bump to re-fire
  color?: string;
  color2?: string;
  onDone?: () => void;
}

export const VibeConfetti: React.FC<VibeConfettiProps> = ({
  trigger,
  color = '#ffae45',
  color2 = '#8A2BE2',
  onDone,
}) => {
  return (
    <View pointerEvents="none" style={styles.wrap} key={trigger}>
      {Array.from({ length: COUNT }).map((_, i) => (
        <Particle
          key={`${trigger}-${i}`}
          index={i}
          color={i % 2 === 0 ? color : color2}
          onDone={i === 0 ? onDone : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 3,
  },
});
