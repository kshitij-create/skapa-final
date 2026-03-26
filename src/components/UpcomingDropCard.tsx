import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Clock, Bell } from 'lucide-react-native';

interface UpcomingDropCardProps {
  timeLabel: string;
  title: string;
  subtitle: string;
  interestedCount: string;
  avatars: string[];
  onRemindPress?: () => void;
}

export const UpcomingDropCard = ({
  timeLabel, title, subtitle, interestedCount, avatars, onRemindPress
}: UpcomingDropCardProps) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={40} style={StyleSheet.absoluteFill} tint="dark" />
      
      <View style={styles.header}>
        <View style={styles.timeBadge}>
          <Clock color="rgba(255, 255, 255, 0.7)" size={14} />
          <Text style={styles.timeText}>{timeLabel}</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={onRemindPress}>
          <Bell color="rgba(255, 255, 255, 0.8)" size={16} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      
      <View style={styles.footer}>
        <View style={styles.avatarsRow}>
          {avatars.map((url, i) => (
            <Image key={i} source={{ uri: url }} style={[styles.avatar, { marginLeft: i > 0 ? -8 : 0 }]} />
          ))}
        </View>
        <Text style={styles.interestedText}>{interestedCount} interested</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '400',
  },
  bellButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1a0f0a',
  },
  interestedText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
  },
});
