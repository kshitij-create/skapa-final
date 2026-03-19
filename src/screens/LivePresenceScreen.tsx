import React from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';
import { FriendCard } from '../components/FriendCard';

export const LivePresenceScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Background Ambience */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={styles.ambientTopLeft} />
      </View>

      <View style={styles.header}>
        <Text style={styles.appTitle}>Live Presence</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            placeholder="Find friends or rooms..."
            placeholderTextColor={COLORS.textSubtle}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <View style={[styles.filterPill, styles.filterPillActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>All Active</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>Listening</Text>
          </View>
          <View style={styles.filterPill}>
            <Text style={styles.filterText}>In Rooms</Text>
          </View>
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.friendsList}>
        <FriendCard
          name="Sarah Jenkins"
          status="Pink + White • Frank Ocean"
          imageUrl="https://i.pravatar.cc/150?u=sarah"
          emoji="🔮"
          isLive={true}
        />
        <FriendCard
          name="David Chen"
          status='Listening to "Gym Bangerz"'
          imageUrl="https://i.pravatar.cc/150?u=david"
          emoji="🔥"
          inRoom={true}
          liveColors={['#f97316', '#ec4899']}
        />
        <FriendCard
          name="Emma Watson"
          status="Offline 2h ago"
          imageUrl="https://i.pravatar.cc/150?u=emma"
          isIdle={true}
        />
        <FriendCard
          name="Marcus T."
          status="Apocalypse • Cigarettes After Sex"
          imageUrl="https://i.pravatar.cc/150?u=marcus"
          emoji="☁️"
          isLive={true}
          liveColors={['#3b82f6', '#06b6d4']}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientTopLeft: {
    position: 'absolute',
    top: 50,
    left: -50,
    width: 250,
    height: 250,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(59,130,246,0.1)',
    transform: [{ scale: 2 }],
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.md,
  },
  searchBar: {
    height: 40,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
  },
  filtersContainer: {
    marginBottom: SPACING.sm,
    zIndex: 10,
  },
  filtersScroll: {
    paddingHorizontal: SPACING.lg,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.background,
  },
  friendsList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 100,
    gap: 20,
  },
});
