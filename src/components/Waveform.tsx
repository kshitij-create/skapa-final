import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface WaveformProps {
  colorStart?: string;
  colorEnd?: string;
}

const Bar = ({ 
  delay, 
  duration, 
  colorStart, 
  colorEnd 
}: { 
  delay: number, 
  duration: number,
  colorStart: string,
  colorEnd: string
}) => {
  const scaleY = useSharedValue(0.3);

  useEffect(() => {
    scaleY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: scaleY.value }],
    transformOrigin: 'bottom' as any, // Only works partially in RN, fallback to flex-end layout
  }));

  return (
    <View style={styles.barContainer}>
      <Animated.View style={[styles.barWrapper, animatedStyle]}>
        <LinearGradient
          colors={[colorStart, colorEnd]}
          style={styles.bar}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

export const Waveform: React.FC<WaveformProps> = ({ 
  colorStart = '#ff6a00', 
  colorEnd = '#ffb340' 
}) => {
  return (
    <View style={styles.container}>
      <Bar delay={0} duration={1200} colorStart={colorStart} colorEnd={colorEnd} />
      <Bar delay={200} duration={1200} colorStart={colorStart} colorEnd={colorEnd} />
      <Bar delay={400} duration={1200} colorStart={colorStart} colorEnd={colorEnd} />
      <Bar delay={100} duration={1200} colorStart={colorStart} colorEnd={colorEnd} />
      <Bar delay={300} duration={1200} colorStart={colorStart} colorEnd={colorEnd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32, // h-8
    gap: 6, // gap-1.5
  },
  barContainer: {
    height: '100%',
    justifyContent: 'flex-end',
    width: 6, // w-1.5
  },
  barWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  }
});
