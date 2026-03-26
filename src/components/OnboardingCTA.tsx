import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface OnboardingCTAProps extends TouchableOpacityProps {
  title: string;
}

export const OnboardingCTA: React.FC<OnboardingCTAProps> = ({ title, style, ...props }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={['#ffae45', '#f05c00']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Text style={styles.text}>{title}</Text>
        <ChevronRight color="#1a0f00" size={20} strokeWidth={2} />
      </LinearGradient>
      {/* Outer Shadow/Glow */}
      <View style={styles.glow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 60, // py-4 (ish)
    borderRadius: 16, // rounded-2xl
    position: 'relative',
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 2,
  },
  text: {
    color: '#1a0f00',
    fontSize: 16,
    fontWeight: '500',
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    backgroundColor: '#f05c00',
    opacity: 0.3,
    shadowColor: '#f05c00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 1,
  }
});
