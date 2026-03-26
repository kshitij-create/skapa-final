import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS } from '../theme';

interface PlatformButtonProps extends TouchableOpacityProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  brandColor: string;
  isActive?: boolean;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({ 
  title, 
  subtitle, 
  icon, 
  brandColor,
  isActive = false,
  style, 
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Convert hex to rgba for backgrounds
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const showActiveState = isActive || isPressed;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={[styles.container, style]}
      {...props}
    >
      <View style={styles.blurWrapper}>
        <BlurView 
          intensity={20} 
          tint="dark" 
          style={StyleSheet.absoluteFill} 
        />
        
        {/* Base background */}
        <View style={[styles.overlay, showActiveState && styles.overlayActive]} />

        {/* Active Gradient Background */}
        {showActiveState && (
          <LinearGradient
            colors={[hexToRgba(brandColor, 0.1), 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}

        <View style={styles.content}>
          {/* Icon Container */}
          <View 
            style={[
              styles.iconWrapper, 
              { 
                backgroundColor: hexToRgba(brandColor, 0.1),
                borderColor: hexToRgba(brandColor, 0.2),
              }
            ]}
          >
            {icon}
          </View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 88, // ~ p-4 + content
    borderRadius: 24, // rounded-3xl
    overflow: 'hidden',
  },
  blurWrapper: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  overlayActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16, // p-4
    gap: 16, // gap-4
    zIndex: 10,
  },
  iconWrapper: {
    width: 56, // w-14
    height: 56, // h-14
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 17, // text-[1.05rem]
    fontWeight: '500',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  }
});
