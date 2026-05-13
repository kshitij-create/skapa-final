/**
 * Simple Voice Control Button
 * Mic toggle with visual states for demo mode
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const VoiceControlButton: React.FC = () => {
  const [isMuted, setIsMuted] = useState(true);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  const toggleMic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsMuted(!isMuted);

    // Pulse animation when unmuted
    if (isMuted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  };

  return (
    <View style={styles.container}>
      {!isMuted && (
        <View style={styles.banner}>
          <LinearGradient
            colors={['rgba(34,197,94,0.15)', 'rgba(34,197,94,0.05)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.liveDot} />
          <Text style={styles.bannerText}>🎤 You're live</Text>
        </View>
      )}

      <Animated.View style={[styles.micButtonWrapper, { transform: [{ scale: !isMuted ? pulseAnim : 1 }] }]}>
        <TouchableOpacity
          style={[styles.micButton, !isMuted && styles.micButtonActive]}
          onPress={toggleMic}
          activeOpacity={0.8}
        >
          {!isMuted && (
            <LinearGradient
              colors={['#22c55e', '#16a34a']}
              style={StyleSheet.absoluteFillObject}
            />
          )}
          <Ionicons
            name={isMuted ? 'mic-off' : 'mic'}
            size={24}
            color={isMuted ? '#ef4444' : '#000'}
          />
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.label}>{isMuted ? 'Tap to unmute' : 'Tap to mute'}</Text>

      {/* Demo Mode Label */}
      <View style={styles.demoLabel}>
        <Text style={styles.demoText}>Demo Mode</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  bannerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#22c55e',
  },
  micButtonWrapper: {
    marginBottom: 8,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(239,68,68,0.4)',
    overflow: 'hidden',
  },
  micButtonActive: {
    borderColor: 'rgba(34,197,94,0.6)',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  demoLabel: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,138,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.2)',
  },
  demoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ff8a00',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
