import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { OnboardingBackground } from '../../components/OnboardingBackground';
import { MoodChip } from '../../components/MoodChip';
import { OnboardingCTA } from '../../components/OnboardingCTA';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { DisplayPill } from '../../components/DisplayPill';
import { COLORS } from '../../theme';

const MOODS = [
  { id: 'latenight',  emoji: '🌊', title: 'Late Night' },
  { id: 'highenergy', emoji: '🔥', title: 'High Energy' },
  { id: 'focus',      emoji: '🔮', title: 'Focus' },
  { id: 'chill',      emoji: '☁️', title: 'Chill' },
  { id: 'sadhours',   emoji: '💔', title: 'Sad Hours' },
  { id: 'indie',      emoji: '🎧', title: 'Indie' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_PADDING = 24;
const GRID_GAP = 12;
const CARD_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

export const ChooseVibeScreen = ({ navigation }: any) => {
  const [activeMood, setActiveMood] = useState('latenight');

  const handleFinishOnboarding = () => {
    navigation.replace('Main');
  };

  const selected = MOODS.find(m => m.id === activeMood);

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
            style={styles.gridWrap}
          >
            <View style={styles.grid}>
              {MOODS.map((mood) => (
                <MoodChip
                  key={mood.id}
                  emoji={mood.emoji}
                  title={mood.title}
                  isActive={activeMood === mood.id}
                  onPress={() => setActiveMood(mood.id)}
                  style={{ width: CARD_SIZE, height: CARD_SIZE }}
                />
              ))}
            </View>
          </Animated.View>

          {/* CTA */}
          <Animated.View
            entering={FadeInUp.delay(500).springify()}
            style={styles.bottomContent}
          >
            <OnboardingCTA
              title={`Enter with ${selected?.title ?? 'your vibe'}`}
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
