import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated';

import { OnboardingBackground } from '../../components/OnboardingBackground';
import { Waveform } from '../../components/Waveform';
import { OnboardingCTA } from '../../components/OnboardingCTA';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { DisplayPill } from '../../components/DisplayPill';
import { Music, Headphones } from 'lucide-react-native';
import { COLORS } from '../../theme';

const FloatingWrap: React.FC<{
  delay?: number;
  amplitude?: number;
  style?: any;
  children: React.ReactNode;
}> = ({ delay = 0, amplitude = 8, style, children }) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-amplitude, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
          withTiming(amplitude, { duration: 2400, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
};

export const EmotionalHookScreen = ({ navigation }: any) => {
  return (
    <OnboardingBackground glowPosition="center">
      <SafeAreaView style={styles.safeArea}>

        <OnboardingProgress step={1} />

        {/* Central Visuals */}
        <View style={styles.visualsContainer}>

          {/* Orbits */}
          <View style={[styles.orbit, styles.orbit1]} />
          <View style={[styles.orbit, styles.orbit2]} />
          <View style={[styles.orbit, styles.orbit3]} />

          {/* Floating Elements */}
          <FloatingWrap delay={0} amplitude={6} style={[styles.floatingElement, styles.avatar1]}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} style={styles.avatarImage} />
            <View style={styles.avatarBadge}>
              <View style={styles.avatarDot} />
            </View>
          </FloatingWrap>

          <FloatingWrap delay={800} amplitude={10} style={[styles.floatingElement, styles.avatar2]}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={styles.avatarImage} />
          </FloatingWrap>

          <FloatingWrap
            delay={1400}
            amplitude={5}
            style={[styles.floatingElement, styles.musicIconContainer]}
          >
            <Music color={COLORS.accent} size={14} strokeWidth={2.2} />
          </FloatingWrap>

          <FloatingWrap
            delay={400}
            amplitude={7}
            style={[styles.floatingElement, styles.headphoneContainer]}
          >
            <Headphones color="rgba(255,255,255,0.7)" size={14} strokeWidth={2.2} />
          </FloatingWrap>

          {/* Central Hub */}
          <View style={styles.centralHub}>
            <View style={styles.hubOuterRing} />
            <View style={styles.hubBackground} />
            <Waveform />
            <View style={styles.hubBottomGlow} />
          </View>

        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          <Animated.View entering={FadeInDown.delay(200).duration(600)}>
            <Text style={styles.eyebrow}>WELCOME TO SKAPA</Text>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.title}>
            Music feels{'\n'}
            <DisplayPill label="better" />{' '}
            together.
          </Animated.Text>

          <Animated.Text entering={FadeInDown.delay(500).springify()} style={styles.subtitle}>
            See what your friends are listening to — in real time.
          </Animated.Text>

          <Animated.View entering={FadeInUp.delay(700).springify()} style={{ width: '100%' }}>
            <OnboardingCTA
              title="Continue"
              onPress={() => navigation.navigate('ConnectMusic')}
            />
          </Animated.View>

          <Pressable style={styles.signInRow} hitSlop={8}>
            <Text style={styles.signInMuted}>Already have an account? </Text>
            <Text style={styles.signInLink}>Sign in</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  visualsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 24,
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.045)',
  },
  orbit1: {
    width: 310,
    height: 130,
    borderRadius: 160,
    transform: [{ rotate: '-18deg' }],
  },
  orbit2: {
    width: 230,
    height: 230,
    borderRadius: 120,
    borderColor: 'rgba(255, 138, 0, 0.08)',
  },
  orbit3: {
    width: 360,
    height: 170,
    borderRadius: 180,
    transform: [{ rotate: '22deg' }],
  },
  floatingElement: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0c0806',
    borderRadius: 999,
  },
  avatar1: {
    top: '22%',
    left: '10%',
    width: 52,
    height: 52,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 6,
  },
  avatar2: {
    bottom: '24%',
    right: '12%',
    width: 44,
    height: 44,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  avatarBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#0c0806',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  musicIconContainer: {
    top: '18%',
    right: '22%',
    width: 32,
    height: 32,
    backgroundColor: '#1c120e',
    borderColor: 'rgba(255, 174, 69, 0.25)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headphoneContainer: {
    bottom: '30%',
    left: '20%',
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralHub: {
    width: 136,
    height: 136,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hubOuterRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.18)',
  },
  hubBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#140c09',
    borderRadius: 68,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.35)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  hubBottomGlow: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    right: 20,
    height: 14,
    borderRadius: 14,
    backgroundColor: COLORS.accentGlow,
    opacity: 0.25,
  },
  bottomContent: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  eyebrow: {
    color: 'rgba(255,174,69,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.8,
    marginBottom: 14,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 36,
    paddingHorizontal: 12,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  signInRow: {
    flexDirection: 'row',
    marginTop: 18,
    paddingVertical: 6,
  },
  signInMuted: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
  signInLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
