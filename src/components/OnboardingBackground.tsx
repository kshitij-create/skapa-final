import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import { COLORS } from '../theme';

interface OnboardingBackgroundProps {
  children?: React.ReactNode;
  glowPosition?: 'center' | 'bottom' | 'middle';
}

export const OnboardingBackground: React.FC<OnboardingBackgroundProps> = ({ 
  children,
  glowPosition = 'center'
}) => {
  // Floating animation for generic elements
  const floatValue1 = useSharedValue(0);
  const floatValue2 = useSharedValue(0);

  useEffect(() => {
    floatValue1.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    floatValue2.value = withDelay(
      1500,
      withRepeat(
        withSequence(
          withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue1.value }]
  }));
  
  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue2.value }]
  }));

  const getGlowStyles = () => {
    switch (glowPosition) {
      case 'center':
        return styles.glowCenter;
      case 'bottom':
        return styles.glowBottom;
      case 'middle':
        return styles.glowMiddle;
      default:
        return styles.glowCenter;
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background Glows */}
      <View style={[styles.glowContainer, getGlowStyles()]}>
         <View style={styles.glowOuter} />
         <View style={styles.glowInner} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  glowCenter: {
    top: '30%',
  },
  glowBottom: {
    top: '60%',
  },
  glowMiddle: {
    top: '40%',
  },
  glowOuter: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 106, 0, 0.15)', // From CSS: from-[#ff6a00]/30
    transform: [{ scale: 1.5 }],
    // React Native doesn't support blur filters on standard views easily without rendering issues
    // So we use lower opacity and larger scale to simulate the radial gradient blur
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 106, 0, 0.25)', 
    transform: [{ scale: 1.5 }],
  },
  content: {
    flex: 1,
    zIndex: 10,
  }
});
