import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BORDER_RADIUS, SPACING } from '../theme';

interface VibeButtonProps {
  emoji: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
  onPress?: () => void;
  gradientColors?: [string, string, ...string[]];
  activeColor?: string;
}

export const VibeButton: React.FC<VibeButtonProps> = ({
  emoji,
  title,
  subtitle,
  isActive = false,
  onPress,
  gradientColors = ['rgba(168,85,247,0.2)', 'transparent'],
  activeColor = COLORS.primary,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.container,
        isActive ? { backgroundColor: 'rgba(168,85,247,0.1)', borderColor: 'rgba(168,85,247,0.3)' } : {},
      ]}
    >
      {isActive && (
        <LinearGradient
          colors={gradientColors}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      <Text style={styles.emoji}>{emoji}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, isActive ? { color: COLORS.text } : { color: COLORS.textMuted }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, isActive ? { color: 'rgba(216, 180, 254, 0.7)' } : { color: COLORS.textSubtle }]}>
          {subtitle}
        </Text>
      </View>
      {isActive && (
        <View style={[styles.activeDot, { backgroundColor: activeColor, shadowColor: activeColor }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 24,
    zIndex: 10,
  },
  textContainer: {
    zIndex: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
  activeDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});
