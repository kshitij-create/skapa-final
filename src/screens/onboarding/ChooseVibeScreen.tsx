import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { OnboardingBackground } from '../../components/OnboardingBackground';
import { MoodChip } from '../../components/MoodChip';
import { OnboardingCTA } from '../../components/OnboardingCTA';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { DisplayPill } from '../../components/DisplayPill';
import { VibeConfetti } from '../../components/VibeConfetti';
import { COLORS } from '../../theme';
import { setVibe, getVibe, VIBES } from '../../state/localStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 24;
const GRID_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

const MOOD_COLORS: Record<string, string> = {
  'latenight': '#8A2BE2',
  'highenergy': '#f97316',
  'focus': '#00E5FF',
  'chill': '#0ea5e9',
  'sadhours': '#64748b',
  'indie': '#ec4899',
};

export const ChooseVibeScreen = ({ navigation }: any) => {
  const [activeMood, setActiveMood] = useState('latenight');
  const [confettiSeed, setConfettiSeed] = useState(0);
  const pulse = useSharedValue(1);

  // Hydrate from AsyncStorage
  useEffect(() => {
    getVibe().then(v => {
      if (v?.id && VIBES.find(m => m.id === v.id)) {
        setActiveMood(v.id);
      }
    });
  }, []);

  const selected = VIBES.find(m => m.id === activeMood) ?? VIBES[0];
  const moodColor = MOOD_COLORS[activeMood] || '#ff8a00';

  const handlePickMood = (id: string) => {
    if (id === activeMood) return;
    setActiveMood(id);
    pulse.value = withSequence(
      withTiming(1.04, { duration: 140, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 6, stiffness: 160 }),
    );
    setConfettiSeed(s => s + 1);
  };

  const animPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const handleFinishOnboarding = async () => {
    await setVibe({ id: selected.id, emoji: selected.emoji, label: selected.label });
    navigation.replace('Main');
  };

  return (
    <OnboardingBackground glowPosition="bottom">
      <SafeAreaView style={styles.safeArea}>

        <OnboardingProgress step={3} />

        <View style={styles.contentContainer}>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.headerContainer}
          >
            <Text style={styles.eyebrow}>ONE LAST THING</Text>
            <Text style={styles.title}>
              What's your{' '}
              <DisplayPill label="vibe" size="sm" />
              {'\n'}right now?
            </Text>
            <Text style={styles.subtitle}>
              You can change this anytime from your profile.
            </Text>
          </Animated.View>

          {/* 2-column mood grid */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={[styles.gridWrap, animPulse]}
          >
            <View style={styles.grid}>
              {VIBES.map((mood) => (
                <MoodChip
                  key={mood.id}
                  emoji={mood.emoji}
                  title={mood.label}
                  isActive={activeMood === mood.id}
                  onPress={() => handlePickMood(mood.id)}
                  style={{ width: CARD_SIZE, height: CARD_SIZE }}
                />
              ))}
            </View>

            {/* Confetti burst over the grid */}
            <VibeConfetti trigger={confettiSeed} color={moodColor} color2="#ffae45" />
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={styles.bottomContent}
          >
            <OnboardingCTA
              title={`Enter with ${selected.label}`}
              onPress={handleFinishOnboarding}
            />
          </Animated.View>

        </View>
      </SafeAreaView>
    </OnboardingBackground>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingHorizontal: GRID_PADDING,
  },
  contentContainer: {
    flex: 1,
    marginTop: 32,
    paddingBottom: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  eyebrow: {
    color: 'rgba(255,174,69,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.42)',
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  gridWrap: {
    flex: 1,
    justifyContent: 'center',
    position: 'relative',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'center',
    alignContent: 'center',
  },
  bottomContent: {
    marginTop: 16,
  },
});
