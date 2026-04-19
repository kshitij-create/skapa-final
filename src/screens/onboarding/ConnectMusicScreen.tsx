import React from 'react';
import { StyleSheet, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { OnboardingBackground } from '../../components/OnboardingBackground';
import { PlatformButton } from '../../components/PlatformButton';
import { OnboardingProgress } from '../../components/OnboardingProgress';
import { DisplayPill } from '../../components/DisplayPill';
import { OnboardingCTA } from '../../components/OnboardingCTA';
import { Radio, Music, ShieldCheck } from 'lucide-react-native';
import { COLORS } from '../../theme';
import { useAuth } from '../../auth/AuthContext';

const SpotifyIcon = () => (
  <View style={styles.spotifyIconPlaceholder}>
    <Music color="#1ed760" size={26} strokeWidth={2.2} />
  </View>
);

export const ConnectMusicScreen = ({ navigation }: any) => {
  const { signInWithSpotify, signingIn, error } = useAuth();

  const handleSpotify = async () => {
    const u = await signInWithSpotify();
    // Root router will automatically swap to Main navigator once user is set.
    // No explicit navigation needed.
  };

  React.useEffect(() => {
    if (error) Alert.alert('Sign-in failed', error);
  }, [error]);

  return (
    <OnboardingBackground glowPosition="middle">
      <SafeAreaView style={styles.safeArea}>

        <OnboardingProgress step={2} />

        <View style={styles.contentContainer}>

          {/* Top Section: Graphic + Platform buttons */}
          <View style={styles.platformsContainer}>

            {/* 3D Graphic — refined stacked cards */}
            <View style={styles.graphicContainer}>
              <View style={styles.abstractShapeBack} />
              <View style={styles.abstractShape1} />
              <View style={styles.abstractShape2}>
                <Radio color={COLORS.primary} size={42} strokeWidth={1.6} />
                <View style={styles.sparkle1} />
                <View style={styles.sparkle2} />
              </View>
            </View>

            <Animated.View
              entering={FadeInRight.delay(300).springify()}
              style={{ width: '100%', marginBottom: 12 }}
            >
              <PlatformButton
                title={signingIn ? 'Connecting…' : 'Continue with Spotify'}
                subtitle="Required · Sign up & sync your library"
                icon={signingIn
                  ? <ActivityIndicator color="#1ed760" />
                  : <SpotifyIcon />}
                brandColor="#1ed760"
                isActive={true}
                onPress={handleSpotify}
                disabled={signingIn}
              />
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(500).springify()} style={{ width: '100%', opacity: 0.5 }}>
              <PlatformButton
                title="Apple Music"
                subtitle="Coming soon"
                icon={<Music color="#fa243c" size={26} strokeWidth={2.2} />}
                brandColor="#fa243c"
                onPress={() => Alert.alert('Coming soon', 'Apple Music sign-in is not available yet. Use Spotify for now.')}
              />
            </Animated.View>

            {/* Trust row */}
            <Animated.View entering={FadeInUp.delay(800)} style={styles.trustRow}>
              <ShieldCheck color="rgba(255,255,255,0.45)" size={13} strokeWidth={2} />
              <Text style={styles.trustText}>
                Read-only access · Your listening stays private
              </Text>
            </Animated.View>
          </View>

          {/* Bottom Section: Copy + Actions */}
          <View style={styles.bottomContent}>
            <Animated.Text entering={FadeInDown.delay(700).springify()} style={styles.title}>
              Connect your{'\n'}
              <DisplayPill label="music" />
            </Animated.Text>

            <Animated.Text entering={FadeInDown.delay(900).springify()} style={styles.subtitle}>
              We use your music to show your vibe and find connections.
            </Animated.Text>

            <Animated.View entering={FadeInUp.delay(1100).springify()} style={{ width: '100%' }}>
              <OnboardingCTA
                title={signingIn ? 'Connecting…' : 'Continue with Spotify'}
                onPress={handleSpotify}
                disabled={signingIn}
              />
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(1300).springify()}>
              <Pressable
                style={styles.skipButton}
                onPress={() => navigation.goBack()}
                hitSlop={8}
              >
                <Text style={styles.skipText}>Back</Text>
              </Pressable>
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
  contentContainer: {
    flex: 1,
    marginTop: 32,
  },
  platformsContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 32,
  },
  graphicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    height: 170,
  },
  abstractShapeBack: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 28,
    transform: [{ rotate: '-18deg' }],
    backgroundColor: 'rgba(255,255,255,0.015)',
  },
  abstractShape1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 138, 0, 0.35)',
    borderRadius: 26,
    transform: [{ rotate: '12deg' }],
    backgroundColor: 'rgba(255,138,0,0.04)',
  },
  abstractShape2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 26,
    backgroundColor: 'rgba(26, 16, 10, 0.6)',
    transform: [{ rotate: '-6deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 6,
  },
  sparkle1: {
    position: 'absolute',
    top: 22,
    right: 26,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accentHighlight,
    shadowColor: COLORS.accentHighlight,
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 28,
    left: 30,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#fff',
    opacity: 0.7,
  },
  spotifyIconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  trustText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 0.2,
  },
  bottomContent: {
    alignItems: 'center',
    paddingBottom: 32,
    gap: 0,
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
    marginBottom: 28,
    paddingHorizontal: 16,
    lineHeight: 22,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
