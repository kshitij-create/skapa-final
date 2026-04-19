import React from 'react';
import { StyleSheet, Text, Pressable, PressableProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme';

interface OnboardingCTAProps extends PressableProps {
  title: string;
  subtitle?: string;
  disabled?: boolean;
}

const AnimPressable = Animated.createAnimatedComponent(Pressable);

export const OnboardingCTA: React.FC<OnboardingCTAProps> = ({
  title,
  subtitle,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.35);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={styles.container}>
      {/* Ambient glow behind button */}
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none" />

      <AnimPressable
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 120, easing: Easing.out(Easing.quad) });
          glow.value = withTiming(0.6, { duration: 160 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) });
          glow.value = withTiming(0.35, { duration: 240 });
        }}
        disabled={disabled}
        style={[styles.pressable, disabled && styles.disabled, animStyle]}
        {...props}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          {/* Top highlight for dimensional feel */}
          <View style={styles.topHighlight} />

          <View style={styles.labelGroup}>
            <Text style={styles.text}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <View style={styles.iconBubble}>
            <ChevronRight color="#1a0f00" size={18} strokeWidth={2.6} />
          </View>
        </LinearGradient>
      </AnimPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  pressable: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1,
  },
  labelGroup: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    color: '#1a0f00',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: 'rgba(26,15,0,0.6)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  iconBubble: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    width: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    top: 8,
    left: 24,
    right: 24,
    bottom: -4,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
});
