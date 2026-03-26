import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { OnboardingBackground } from '../../components/OnboardingBackground';
import { Waveform } from '../../components/Waveform';
import { OnboardingCTA } from '../../components/OnboardingCTA';
import { Music } from 'lucide-react-native';

export const EmotionalHookScreen = ({ navigation }: any) => {
  return (
    <OnboardingBackground glowPosition="center">
      <SafeAreaView style={styles.safeArea}>
        
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>

        {/* Central Visuals */}
        <View style={styles.visualsContainer}>
          
          {/* Orbits */}
          <View style={[styles.orbit, styles.orbit1]} />
          <View style={[styles.orbit, styles.orbit2]} />
          <View style={[styles.orbit, styles.orbit3]} />

          {/* Floating Elements */}
          <View style={[styles.floatingElement, styles.avatar1]}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} style={styles.avatarImage} />
          </View>
          
          <View style={[styles.floatingElement, styles.avatar2]}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=5' }} style={styles.avatarImage} />
          </View>
          
          <View style={[styles.floatingElement, styles.musicIconContainer]}>
            <Music color="#ff8a00" size={16} strokeWidth={2} />
          </View>

          {/* Central Hub */}
          <View style={styles.centralHub}>
             <View style={styles.hubBackground} />
             <Waveform />
          </View>
          
        </View>

        {/* Bottom Content Area */}
        <View style={styles.bottomContent}>
          <Animated.Text entering={FadeInDown.delay(300).springify()} style={styles.title}>
            Music feels{'\n'}
            <View style={styles.pillContainer}>
              <Text style={styles.pillText}>better</Text>
            </View>{' '}
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
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    width: '100%',
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
  visualsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingBottom: 40,
  },
  orbit: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  orbit1: {
    width: 300,
    height: 120,
    borderRadius: 150,
    transform: [{ rotate: '-15deg' }],
  },
  orbit2: {
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  orbit3: {
    width: 350,
    height: 160,
    borderRadius: 175,
    transform: [{ rotate: '25deg' }],
  },
  floatingElement: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#0c0806',
    borderRadius: 999,
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  avatar1: {
    top: '25%',
    left: '10%',
    width: 48,
    height: 48,
  },
  avatar2: {
    bottom: '30%',
    right: '15%',
    width: 40,
    height: 40,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  musicIconContainer: {
    top: '20%',
    right: '20%',
    width: 32,
    height: 32,
    backgroundColor: '#1c120e',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralHub: {
    width: 128,
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  hubBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#150d0a',
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'rgba(255, 138, 0, 0.3)',
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  bottomContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  title: {
    fontSize: 28, // text-[1.75rem]
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
    lineHeight: 38,
  },
  pillContainer: {
    backgroundColor: '#2a1a10',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    top: -2,
    marginHorizontal: 4,
  },
  pillText: {
    color: '#ffd685',
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 24,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 8,
    lineHeight: 24,
  }
});
