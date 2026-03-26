import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { OnboardingBackground } from '../../components/OnboardingBackground';
import { PlatformButton } from '../../components/PlatformButton';
import { Radio, Music } from 'lucide-react-native';

const SpotifyIcon = () => (
  <View style={styles.spotifyIconPlaceholder}>
     <Music color="#1ed760" size={28} />
  </View>
);

export const ConnectMusicScreen = ({ navigation }: any) => {
  return (
    <OnboardingBackground glowPosition="middle">
      <SafeAreaView style={styles.safeArea}>
        
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDot} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={styles.progressDot} />
        </View>

        <View style={styles.contentContainer}>
          
          {/* Top Section: Platform Connections */}
          <View style={styles.platformsContainer}>
            
            {/* 3D Graphic Placeholder */}
            <View style={styles.graphicContainer}>
              <View style={styles.abstractShape1} />
              <View style={styles.abstractShape2}>
                <Radio color="#ffae45" size={48} strokeWidth={1.5} />
              </View>
            </View>

            <Animated.View entering={FadeInRight.delay(300).springify()} style={{ width: '100%', marginBottom: 16 }}>
              <PlatformButton 
                title="Connect Spotify"
                subtitle="Recommended"
                icon={<SpotifyIcon />}
                brandColor="#1ed760"
                isActive={true}
                onPress={() => {}}
              />
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(500).springify()} style={{ width: '100%' }}>
              <PlatformButton 
                title="Apple Music"
                subtitle="Connect account"
                icon={<Music color="#fa243c" size={28} strokeWidth={1.5} />}
                brandColor="#fa243c"
                onPress={() => {}}
              />
            </Animated.View>

          </View>

          {/* Bottom Section: Text and Actions */}
          <View style={styles.bottomContent}>
            <Animated.Text entering={FadeInDown.delay(700).springify()} style={styles.title}>
              Connect your{'\n'}
              <View style={styles.pillContainer}>
                <Text style={styles.pillText}>music</Text>
              </View>
            </Animated.Text>
            
            <Animated.Text entering={FadeInDown.delay(900).springify()} style={styles.subtitle}>
              We use your music to show your vibe and find connections.
            </Animated.Text>

            <Animated.View entering={FadeInUp.delay(1100).springify()}>
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={() => navigation.navigate('ChooseVibe')}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

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
  contentContainer: {
    flex: 1,
    marginTop: 48,
  },
  platformsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
    height: 160,
  },
  abstractShape1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: 'rgba(255, 138, 0, 0.3)',
    borderRadius: 24,
    transform: [{ rotate: '12deg' }],
  },
  abstractShape2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    backgroundColor: 'rgba(26, 16, 10, 0.5)',
    transform: [{ rotate: '-6deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 5,
  },
  spotifyIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 12,
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
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 24,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 16,
    fontWeight: '500',
  }
});
