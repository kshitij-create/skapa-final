import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { VibeButton } from '../components/VibeButton';

const { width } = Dimensions.get('window');

const VIBES = [
  { id: 'focus', emoji: '🔮', title: 'Deep Focus', subtitle: 'Ambient & Lofi', gradient: ['rgba(168,85,247,0.2)', 'transparent'], activeColor: '#a855f7' },
  { id: 'energy', emoji: '🔥', title: 'High Energy', subtitle: 'Gym & Run', gradient: ['rgba(239,68,68,0.2)', 'transparent'], activeColor: '#ef4444' },
  { id: 'night', emoji: '🌊', title: 'Late Night', subtitle: 'R&B & Soul', gradient: ['rgba(59,130,246,0.2)', 'transparent'], activeColor: '#3b82f6' },
  { id: 'chill', emoji: '☁️', title: 'Chill', subtitle: 'Indie & Pop', gradient: ['rgba(14,165,233,0.2)', 'transparent'], activeColor: '#0ea5e9' },
];

export const HomeScreen: React.FC = () => {
  const [activeVibe, setActiveVibe] = useState('focus');
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Ambience */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.ambientTopRight} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.eyebrowRow}>
            <View style={styles.livePulseDot} />
            <Text style={styles.eyebrowText}>HOME · LIVE</Text>
          </View>
          <Text style={styles.appTitle}>SKAPA</Text>
          <Text style={styles.appSubtitle}>Set your presence</Text>
        </View>
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => setShowNotifications(!showNotifications)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <LinearGradient
          colors={['#2b2b36', '#121216']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.notificationsMenu}
        >
          <Text style={styles.notificationsTitle}>Notifications</Text>

          <TouchableOpacity style={styles.notificationItem}>
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=5' }} style={styles.notificationAvatar} />
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}><Text style={styles.notificationName}>Sarah Jenkins</Text> joined your listening room</Text>
              <Text style={styles.notificationTime}>2m ago</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.notificationItem, { marginBottom: 0 }]}>
            <View style={styles.notificationIconWrap}>
              <Ionicons name="musical-notes" size={16} color={COLORS.text} />
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationText}>Your room <Text style={styles.notificationName}>Midnight Drives</Text> is trending</Text>
              <Text style={styles.notificationTime}>1h ago</Text>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Connection Status */}
        <View style={styles.statusContainer}>
          <LinearGradient
            colors={['rgba(34,197,94,0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.statusIconContainer}>
            <Ionicons name="musical-notes-outline" size={20} color={COLORS.success} />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>Spotify Connected</Text>
            <Text style={styles.statusSubtitle}>Broadcasting live status</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color={COLORS.textSubtle} />
        </View>

        {/* Select Vibe */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <View style={styles.vibesGrid}>
            {VIBES.map((vibe) => (
              <View key={vibe.id} style={styles.vibeCardWrapper}>
                <VibeButton
                  emoji={vibe.emoji}
                  title={vibe.title}
                  subtitle={vibe.subtitle}
                  isActive={activeVibe === vibe.id}
                  onPress={() => setActiveVibe(vibe.id)}
                  gradientColors={vibe.gradient as [string, string, ...string[]]}
                  activeColor={vibe.activeColor}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recent Rooms */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Rooms</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roomsScroll}>

            {/* Room Card */}
            <TouchableOpacity activeOpacity={0.8} style={styles.roomCard}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop' }} style={styles.roomImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>Live</Text>
              </View>
              <View style={styles.roomCardContent}>
                <Text style={styles.roomTitle}>Tokyo Drifting</Text>
                <Text style={styles.roomSubtitle}>12 friends listening</Text>
                <View style={styles.avatarsRow}>
                  <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} style={styles.roomAvatar} />
                  <Image source={{ uri: 'https://i.pravatar.cc/100?img=2' }} style={[styles.roomAvatar, styles.avatarOverlap]} />
                  <Image source={{ uri: 'https://i.pravatar.cc/100?img=3' }} style={[styles.roomAvatar, styles.avatarOverlap]} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Create Room */}
            <TouchableOpacity activeOpacity={0.8} style={styles.createRoomCard}>
              <View style={styles.createIconWrapper}>
                <Ionicons name="add" size={24} color={COLORS.textMuted} />
              </View>
              <Text style={styles.createRoomText}>Create Room</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientTopRight: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(168,85,247,0.1)',
    transform: [{ scale: 2 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  eyebrowText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#ff8a00',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusContainer: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(34,197,94,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionContainer: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    letterSpacing: -0.5,
  },
  vibesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg - 6,
  },
  vibeCardWrapper: {
    width: '50%',
    padding: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  viewAllText: {
    fontSize: 12,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.lg,
  },
  roomsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  roomCard: {
    width: 200,
    height: 240,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  roomImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.text,
  },
  roomCardContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  roomSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  avatarsRow: {
    flexDirection: 'row',
  },
  roomAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0a0a0c',
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  createRoomCard: {
    width: 200,
    height: 240,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  createRoomText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger || '#ef4444',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  notificationsMenu: {
    position: 'absolute',
    top: 117,
    right: SPACING.lg,
    width: 280,
    borderRadius: 30,
    padding: SPACING.md,
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 20,
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  notificationAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  notificationName: {
    color: COLORS.text,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 11,
    color: COLORS.textSubtle,
    marginTop: 2,
  },
});
