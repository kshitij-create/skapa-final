import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

interface DisplayPillProps {
  label: string;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

/**
 * Inline serif-italic display pill used in onboarding headlines.
 * Gives the copy a premium editorial touch.
 */
export const DisplayPill: React.FC<DisplayPillProps> = ({ label, style, size = 'md' }) => {
  return (
    <View style={[styles.wrap, size === 'sm' && styles.wrapSm, style]}>
      <LinearGradient
        colors={['rgba(255,138,0,0.18)', 'rgba(40,20,0,0.85)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.innerHighlight} />
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,174,69,0.25)',
    top: -2,
    overflow: 'hidden',
  },
  wrapSm: {
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,214,133,0.25)',
  },
  text: {
    color: COLORS.accentHighlight,
    fontStyle: 'italic',
    fontWeight: '600',
    fontSize: 24,
    letterSpacing: -0.4,
  },
  textSm: {
    fontSize: 20,
  },
});
