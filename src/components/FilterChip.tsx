import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, View } from 'react-native';

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const FilterChip = ({ label, isActive = false, onPress, style }: FilterChipProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.chip,
        isActive ? styles.chipActive : styles.chipInactive,
        style,
      ]}
    >
      <Text style={[styles.text, isActive ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  chipInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    fontSize: 14,
    fontWeight: '400',
  },
  textActive: {
    color: '#ffffff',
  },
  textInactive: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
