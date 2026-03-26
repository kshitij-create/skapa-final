import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Pressable,
  PanResponder,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sheet snap points (translateY from bottom of sheet's own container)
const NAVBAR_OFFSET = 110;           // space for navbar pill area
const SHEET_COLLAPSED_HEIGHT = 88;   // visible height when collapsed
const SHEET_FULL_HEIGHT = 520;        // total sheet height
const SNAP_COLLAPSED = SHEET_FULL_HEIGHT - SHEET_COLLAPSED_HEIGHT; // translate down
const SNAP_EXPANDED = 0;             // translate down = 0 → fully visible

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapUser {
  id: string;
  name: string;
  imageUrl: string;
  track: string;
  mood: string;
  moodEmoji: string;
  glowColor: string;
  borderColor: string;
  top: string;
  left: string;
  size: number;
  opacity: number;
}

interface Friend {
  name: string;
  imageUrl: string;
  track: string;
  emoji: string;
  active: boolean;
}

interface Room {
  name: string;
  participants: number;
  imageUrl: string;
  live: boolean;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MAP_USERS: MapUser[] = [
  {
    id: '1', name: 'Arnav', imageUrl: 'https://i.pravatar.cc/100?img=11',
    track: '505 – Arctic Monkeys', mood: 'Late Night', moodEmoji: '🌊',
    glowColor: '#8A2BE2', borderColor: '#8A2BE2', top: '32%', left: '45%', size: 52, opacity: 1,
  },
  {
    id: '2', name: 'Priya', imageUrl: 'https://i.pravatar.cc/100?img=5',
    track: 'Comptine – Yann Tiersen', mood: 'Focus', moodEmoji: '🔮',
    glowColor: '#00E5FF', borderColor: '#00E5FF', top: '18%', left: '72%', size: 44, opacity: 0.9,
  },
  {
    id: '3', name: 'Marcus', imageUrl: 'https://i.pravatar.cc/100?img=8',
    track: 'Highest In The Room', mood: 'Hype', moodEmoji: '🔥',
    glowColor: '#f97316', borderColor: '#f97316', top: '55%', left: '15%', size: 40, opacity: 0.85,
  },
  {
    id: '4', name: 'Sasha', imageUrl: 'https://i.pravatar.cc/100?img=3',
    track: 'Apocalypse – CIGS', mood: 'Melancholy', moodEmoji: '💔',
    glowColor: '#64748b', borderColor: '#475569', top: '42%', left: '75%', size: 36, opacity: 0.55,
  },
];

const FRIENDS: Friend[] = [
  { name: 'Arnav Singh', imageUrl: 'https://i.pravatar.cc/100?img=11', track: '505 – Arctic Monkeys', emoji: '🔮', active: true },
  { name: 'Elena R.', imageUrl: 'https://i.pravatar.cc/100?img=5', track: 'Starboy – The Weeknd', emoji: '⚡', active: false },
  { name: 'Marcus T.', imageUrl: 'https://i.pravatar.cc/100?img=8', track: 'FE!N – Travis Scott', emoji: '🔥', active: false },
  { name: 'Sasha K.', imageUrl: 'https://i.pravatar.cc/100?img=3', track: 'Apocalypse – CIGS', emoji: '💔', active: false },
];

const ROOMS: Room[] = [
  { name: 'Night Drives', participants: 18, imageUrl: 'https://i.pravatar.cc/100?img=20', live: true },
  { name: 'Indie Pop Vibes', participants: 5, imageUrl: 'https://i.pravatar.cc/100?img=21', live: true },
  { name: 'Lo-Fi Study', participants: 34, imageUrl: 'https://i.pravatar.cc/100?img=22', live: false },
];

// ─── Pulsing Avatar ───────────────────────────────────────────────────────────
const PulsingAvatar: React.FC<{
  user: MapUser; isSelected: boolean; onPress: () => void; delay?: number;
}> = ({ user, isSelected, onPress, delay = 0 }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.14, duration: 950, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 950, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 0.8, duration: 950, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.35, duration: 950, useNativeDriver: true }),
          ]),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const s = user.size;
  const glowS = s + 18;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.avatarWrapper, {
        top: user.top as any,
        left: user.left as any,
        marginLeft: -(s / 2),
        marginTop: -(s / 2),
      }]}
    >
      <Animated.View style={{
        position: 'absolute',
        width: glowS, height: glowS, borderRadius: glowS / 2,
        backgroundColor: user.glowColor,
        opacity: glowOpacity,
        top: -(glowS - s) / 2, left: -(glowS - s) / 2,
      }} />
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image
          source={{ uri: user.imageUrl }}
          style={[styles.avatarImage, { width: s, height: s, borderRadius: s / 2, borderColor: user.borderColor, opacity: user.opacity }]}
        />
      </Animated.View>
      <View style={styles.emojiBadge}>
        <Text style={{ fontSize: 10, lineHeight: 13 }}>{user.moodEmoji}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── Preview Bubble ───────────────────────────────────────────────────────────
const PreviewBubble: React.FC<{ user: MapUser; onClose: () => void }> = ({ user, onClose }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [user.id]);

  return (
    <Animated.View style={[styles.bubble, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.bubbleLabel}>{user.name} is listening to</Text>
      <Text style={styles.bubbleTrack} numberOfLines={1}>{user.track}</Text>
      <View style={styles.bubbleMoodRow}>
        <View style={[styles.moodChip, { borderColor: user.glowColor + '40', backgroundColor: user.glowColor + '18' }]}>
          <Text style={[styles.moodChipText, { color: user.glowColor }]}>{user.mood} {user.moodEmoji}</Text>
        </View>
      </View>
      <LinearGradient colors={['#8A2BE2', '#6019a8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.joinBtn}>
        <TouchableOpacity style={styles.joinBtnInner} activeOpacity={0.85} onPress={onClose}>
          <Ionicons name="headset-outline" size={13} color="#fff" />
          <Text style={styles.joinBtnText}>Join Room</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.bubblePointer} />
    </Animated.View>
  );
};

// ─── Draggable Bottom Sheet ───────────────────────────────────────────────────
const BottomSheet: React.FC<{ insets: { bottom: number } }> = ({ insets }) => {
  const translateY = useRef(new Animated.Value(SNAP_COLLAPSED)).current;
  const [isExpanded, setIsExpanded] = useState(false);
  const lastY = useRef(SNAP_COLLAPSED);
  const contentOpacity = useRef(new Animated.Value(0)).current;

  const snapTo = (target: number, expanded: boolean) => {
    Animated.spring(translateY, {
      toValue: target,
      useNativeDriver: true,
      bounciness: 4,
      speed: 14,
    }).start();
    Animated.timing(contentOpacity, {
      toValue: expanded ? 1 : 0,
      duration: expanded ? 250 : 120,
      useNativeDriver: true,
    }).start();
    lastY.current = target;
    setIsExpanded(expanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        translateY.stopAnimation();
      },
      onPanResponderMove: (_, g) => {
        const next = Math.max(SNAP_EXPANDED, Math.min(SNAP_COLLAPSED, lastY.current + g.dy));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const current = lastY.current + g.dy;
        const velocity = g.vy;
        // Snap decision
        if (velocity < -0.5 || current < SNAP_COLLAPSED / 2) {
          snapTo(SNAP_EXPANDED, true);
        } else {
          snapTo(SNAP_COLLAPSED, false);
        }
      },
    })
  ).current;

  const handleHeaderTap = () => {
    if (isExpanded) {
      snapTo(SNAP_COLLAPSED, false);
    } else {
      snapTo(SNAP_EXPANDED, true);
    }
  };

  const sheetHeight = SHEET_FULL_HEIGHT + insets.bottom;

  return (
    <Animated.View
      style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}
    >
      {/* ── Collapsed header (always visible) ── */}
      <View {...panResponder.panHandlers} style={styles.sheetHeader}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleHeaderTap} style={{ width: '100%' }}>
          <View style={styles.dragHandle} />
          <View style={styles.sheetHeaderRow}>
            <View>
              <View style={styles.liveRow}>
                <Text style={styles.sheetTitle}>Live around you</Text>
                <View style={styles.liveDot} />
              </View>
              {!isExpanded && (
                <Text style={styles.sheetSub}>8 rooms • 45 listeners</Text>
              )}
            </View>
            {/* Avatar stack preview */}
            <View style={styles.stackRow}>
              {['img=11', 'img=5', 'img=8'].map((q, i) => (
                <Image
                  key={q}
                  source={{ uri: `https://i.pravatar.cc/100?${q}` }}
                  style={[styles.stackAvatar, { marginLeft: i === 0 ? 0 : -9, zIndex: 3 - i }]}
                />
              ))}
              <View style={[styles.stackAvatar, styles.stackMore, { marginLeft: -9 }]}>
                <Text style={styles.stackMoreText}>+5</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Expanded content ── */}
      <Animated.View style={[styles.sheetContent, { opacity: contentOpacity }]} pointerEvents={isExpanded ? 'auto' : 'none'}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>listening nearby</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>active rooms</Text>
            </View>
          </View>

          {/* Friends Nearby */}
          <Text style={styles.sectionTitle}>Friends Nearby</Text>
          {FRIENDS.map((f, i) => (
            <View key={f.name} style={styles.friendRow}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: f.imageUrl }} style={styles.friendAvatar} />
                <View style={styles.friendEmoji}>
                  <Text style={{ fontSize: 9, lineHeight: 12 }}>{f.emoji}</Text>
                </View>
              </View>
              <View style={styles.friendInfo}>
                <Text style={styles.friendName} numberOfLines={1}>{f.name}</Text>
                <Text style={styles.friendTrack} numberOfLines={1}>{f.track}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.joinPill, f.active && styles.joinPillActive]}
              >
                <Text style={[styles.joinPillText, f.active && styles.joinPillTextActive]}>Join</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Suggested Rooms */}
          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Suggested Rooms</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {ROOMS.map(room => (
              <TouchableOpacity key={room.name} activeOpacity={0.85} style={styles.roomCard}>
                {/* Gradient background representing the room vibe */}
                <LinearGradient
                  colors={room.live ? ['#1a0530', '#2e1065'] : ['#0a0a14', '#14141e']}
                  style={StyleSheet.absoluteFillObject}
                />
                {room.live && (
                  <View style={styles.roomLiveBadge}>
                    <View style={styles.roomLiveDot} />
                    <Text style={styles.roomLiveText}>LIVE</Text>
                  </View>
                )}
                <View style={styles.roomAvatarRow}>
                  <Image source={{ uri: room.imageUrl }} style={styles.roomAvatar} />
                </View>
                <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                <Text style={styles.roomParticipants}>{room.participants} joined</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const LivePresenceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [activeToggle, setActiveToggle] = useState<'global' | 'nearby'>('nearby');

  const handleAvatarPress = (user: MapUser) => {
    setSelectedUser(prev => (prev?.id === user.id ? null : user));
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Dark map background ── */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={['#050508', '#080b14', '#0a0d18']} style={StyleSheet.absoluteFillObject} />
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.hLine, { top: `${(i + 1) * 8}%` as any }]} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.vLine, { left: `${(i + 1) * 12}%` as any }]} />
        ))}
        <View style={[styles.ambientGlow, { top: '20%', left: '30%', backgroundColor: '#8A2BE2', width: 180, height: 180 }]} />
        <View style={[styles.ambientGlow, { top: '10%', right: '10%', backgroundColor: '#00E5FF', width: 130, height: 130 }]} />
        <View style={[styles.ambientGlow, { top: '50%', left: '5%', backgroundColor: '#f97316', width: 100, height: 100 }]} />
        <LinearGradient colors={['rgba(5,5,8,0.6)', 'transparent', 'rgba(5,5,8,0.7)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />
      </View>

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <LinearGradient colors={['rgba(5,5,8,0.92)', 'rgba(5,5,8,0.0)']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Music Map</Text>
            <Text style={styles.headerSubtitle}>See what people are feeling right now</Text>
          </View>
          <View style={styles.toggle}>
            <TouchableOpacity onPress={() => setActiveToggle('global')} style={[styles.toggleBtn, activeToggle === 'global' && styles.toggleBtnActive]}>
              <Text style={[styles.toggleText, activeToggle === 'global' && styles.toggleTextActive]}>🌍</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setActiveToggle('nearby')} style={[styles.toggleBtn, activeToggle === 'nearby' && styles.toggleBtnActive]}>
              <Text style={[styles.toggleText, activeToggle === 'nearby' && styles.toggleTextActive]}>📍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Map avatars ── */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={() => setSelectedUser(null)}>
        {MAP_USERS.map((user, i) => (
          <PulsingAvatar
            key={user.id}
            user={user}
            isSelected={selectedUser?.id === user.id}
            onPress={() => handleAvatarPress(user)}
            delay={i * 300}
          />
        ))}
        {selectedUser && (
          <View
            style={[styles.bubbleAnchor, {
              top: selectedUser.top as any,
              left: selectedUser.left as any,
              marginLeft: -(192 / 2),
              marginTop: -(selectedUser.size / 2) - 168,
            }]}
            pointerEvents="box-none"
          >
            <PreviewBubble user={selectedUser} onClose={() => setSelectedUser(null)} />
          </View>
        )}
      </Pressable>

      {/* ── FAB ── */}
      <LinearGradient
        colors={['#8A2BE2', '#00E5FF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.fab, { bottom: NAVBAR_OFFSET + SHEET_COLLAPSED_HEIGHT + 20 + insets.bottom }]}
      >
        <TouchableOpacity style={styles.fabInner} activeOpacity={0.85}>
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Bottom Sheet ── */}
      <BottomSheet insets={insets} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050508' },

  // Map
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.025)' },
  hLine: { left: 0, right: 0, height: 1 },
  vLine: { top: 0, bottom: 0, width: 1 },
  ambientGlow: { position: 'absolute', borderRadius: 999, opacity: 0.17, transform: [{ scale: 1.8 }] },

  // Header
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, paddingHorizontal: 20, paddingBottom: 36 },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#fff', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 },
  toggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 7 },
  toggleBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  toggleText: { fontSize: 14, opacity: 0.5 },
  toggleTextActive: { opacity: 1 },

  // Avatars
  avatarWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { borderWidth: 2.5 },
  emojiBadge: { position: 'absolute', bottom: -4, right: -4, borderRadius: 99, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: '#050508', zIndex: 10 },

  // Preview bubble
  bubbleAnchor: { position: 'absolute', width: 192, zIndex: 50 },
  bubble: { width: 192, backgroundColor: 'rgba(10,10,14,0.9)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 22, padding: 14, shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 16 },
  bubbleLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  bubbleTrack: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 8 },
  bubbleMoodRow: { flexDirection: 'row', marginBottom: 12 },
  moodChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, borderWidth: 1 },
  moodChipText: { fontSize: 10, fontWeight: '500' },
  joinBtn: { borderRadius: 12, overflow: 'hidden' },
  joinBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 9 },
  joinBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  bubblePointer: { position: 'absolute', bottom: -6, alignSelf: 'center', width: 12, height: 12, backgroundColor: 'rgba(10,10,14,0.9)', borderRightWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)', transform: [{ rotate: '45deg' }] },

  // FAB
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, zIndex: 30, shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Bottom Sheet ──
  sheet: {
    position: 'absolute', bottom: NAVBAR_OFFSET, left: 20, right: 20, // offset from bottom and side-padding for floating feel
    backgroundColor: 'rgba(12,12,18,0.94)',
    borderRadius: 28,
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.6, shadowRadius: 24, elevation: 30,
    overflow: 'hidden',
  },
  sheetHeader: {
    height: SHEET_COLLAPSED_HEIGHT,
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  },
  dragHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99, alignSelf: 'center', marginBottom: 14 },
  sheetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sheetTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  sheetSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  stackRow: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(8,8,12,1)' },
  stackMore: { backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stackMoreText: { fontSize: 9, color: '#fff', fontWeight: '600' },

  sheetContent: { flex: 1, paddingHorizontal: 20, paddingTop: 4 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 16, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: '300', color: '#fff', letterSpacing: -1 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // Friends
  sectionTitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.2, marginBottom: 14 },
  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  friendAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  friendEmoji: { position: 'absolute', bottom: -3, right: -3, backgroundColor: '#08080c', borderRadius: 99, padding: 3, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, fontWeight: '500', color: '#fff' },
  friendTrack: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  joinPill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  joinPillActive: { backgroundColor: '#fff' },
  joinPillText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  joinPillTextActive: { color: '#000' },

  // Rooms
  roomCard: { width: 140, height: 104, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 10 },
  roomLiveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 8 },
  roomLiveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444' },
  roomLiveText: { fontSize: 9, color: '#fff', fontWeight: '700', letterSpacing: 0.5 },
  roomAvatarRow: { marginBottom: 6 },
  roomAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  roomName: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 2 },
  roomParticipants: { fontSize: 11, color: 'rgba(255,255,255,0.45)' },
});
