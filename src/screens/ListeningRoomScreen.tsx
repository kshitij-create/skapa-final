import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS } from '../theme';

const { width } = Dimensions.get('window');

export const ListeningRoomScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Album Art Background Blur */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=800&auto=format&fit=crop' }} 
        style={styles.backgroundImage} 
        blurRadius={50}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', COLORS.background]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Room Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="chevron-down" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>LIVE ROOM</Text>
          <Text style={styles.headerTitle}>Midnight Drives</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Main Player Area */}
      <View style={styles.playerContainer}>
        {/* Album Art */}
        <View style={styles.albumArtContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=800&auto=format&fit=crop' }} 
            style={styles.albumArt} 
          />
        </View>

        {/* Song Info & Presence */}
        <View style={styles.songInfoContainer}>
          <View style={styles.songTextContainer}>
            <Text style={styles.songTitle} numberOfLines={1}>Nights</Text>
            <Text style={styles.songArtist} numberOfLines={1}>Frank Ocean</Text>
          </View>
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={28} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: '40%' }]} />
            <View style={styles.progressThumb} />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>2:14</Text>
            <Text style={styles.timeText}>5:07</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity>
            <Ionicons name="play-skip-back" size={36} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={32} color={COLORS.background} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="play-skip-forward" size={36} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Social/Reactions Dock */}
      <View style={styles.dockContainer}>
        <View style={styles.dockContent}>
          {/* Participants */}
          <View style={styles.participantsRow}>
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=1' }} style={styles.dockAvatar} />
            <Image source={{ uri: 'https://i.pravatar.cc/100?img=2' }} style={[styles.dockAvatar, styles.avatarOverlap]} />
            <View style={[styles.dockAvatar, styles.avatarOverlap, styles.moreAvatar]}>
              <Text style={styles.moreAvatarText}>+4</Text>
            </View>
          </View>

          {/* Reactions */}
          <View style={styles.reactionsRow}>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>🔥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>✨</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    zIndex: 10,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  playerContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 10,
  },
  albumArtContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  albumArt: {
    width: '100%',
    height: '100%',
  },
  songInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  songTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  heartButton: {
    paddingBottom: 4,
  },
  progressContainer: {
    marginBottom: SPACING.xl,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
  },
  progressThumb: {
    position: 'absolute',
    left: '40%',
    width: 12,
    height: 12,
    backgroundColor: COLORS.text,
    borderRadius: BORDER_RADIUS.full,
    transform: [{ translateX: -6 }],
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textSubtle,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    zIndex: 10,
  },
  dockContent: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SPACING.sm,
  },
  dockAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0a0a0c',
  },
  avatarOverlap: {
    marginLeft: -12,
  },
  moreAvatar: {
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatarText: {
    fontSize: 10,
    color: COLORS.text,
    fontWeight: '500',
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 18,
  },
});
