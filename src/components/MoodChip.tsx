import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface MoodChipProps extends TouchableOpacityProps {
  emoji: string;
  title: string;
  isActive?: boolean;
}

export const MoodChip: React.FC<MoodChipProps> = ({
  emoji,
  title,
  isActive = false,
  style,
  ...props
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[
        styles.container,
        isActive ? styles.containerActive : styles.containerInactive,
        style,
      ]}
      {...props}
    >
      {/* Background fill */}
      {isActive ? (
        <LinearGradient
          colors={['rgba(255, 138, 0, 0.18)', 'rgba(40, 20, 0, 0.95)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.inactiveBg]} />
      )}

      {/* Orange dot indicator for active */}
      {isActive && <View style={styles.activeIndicator} />}

      {/* Emoji */}
      <Text style={styles.emoji}>{emoji}</Text>

      {/* Title */}
      <Text style={[styles.title, isActive ? styles.titleActive : styles.titleInactive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 1,
    gap: 10,
  },
  inactiveBg: {
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
  },
  containerInactive: {
    borderWidth: 0,
  },
  containerActive: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 138, 0, 0.7)',
    shadowColor: '#ff8a00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  activeIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffae45',
    shadowColor: '#ffae45',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
  emoji: {
    fontSize: 48,
    includeFontPadding: false,
    lineHeight: 56,
    textAlign: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  titleInactive: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  titleActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
