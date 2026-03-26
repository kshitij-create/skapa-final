import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingBackground } from '../../components/OnboardingBackground';
import { MoodChip } from '../../components/MoodChip';
import { OnboardingCTA } from '../../components/OnboardingCTA';

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

  return (
    <OnboardingBackground glowPosition="bottom">
      <SafeAreaView style={styles.safeArea}>

        {/* Progress indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>

        <View style={styles.contentContainer}>

          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              What's your{' '}
              <View style={styles.pillContainer}>
                <Text style={styles.pillText}>vibe</Text>
              </View>
              {'\n'}right now?
            </Text>
          </View>

          {/* 2-column mood grid */}
          <View style={styles.grid}>
            {MOODS.map((mood, index) => (
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

          {/* CTA */}
          <View style={styles.bottomContent}>
            <OnboardingCTA
              title="Continue"
              onPress={handleFinishOnboarding}
            />
          </View>

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
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  progressDot: {
    height: 3,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#ff8a00',
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  contentContainer: {
    flex: 1,
    marginTop: 40,
    paddingBottom: 32,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  pillContainer: {
    backgroundColor: '#2a1a10',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: -2,
    marginHorizontal: 2,
  },
  pillText: {
    color: '#ffd685',
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    justifyContent: 'center',
    flex: 1,
    alignContent: 'center',
  },
  bottomContent: {
    marginTop: 24,
  },
});
