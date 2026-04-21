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
import { DropVibeModal } from '../components/DropVibeModal';
import { publicFetch } from '../state/publicApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Sheet snap points
const NAVBAR_OFFSET = 110;
const SHEET_COLLAPSED_HEIGHT = 96;
const SHEET_FULL_HEIGHT = 540;
const SNAP_COLLAPSED = SHEET_FULL_HEIGHT - SHEET_COLLAPSED_HEIGHT;
const SNAP_EXPANDED = 0;

// ─── Types ────────────────────────────────────────────────────────────────────
interface MapUser {
  id: string;
  name: string;
  imageUrl: string;
  track: string;
  artist?: string;
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
  artist: string;
  emoji: string;
  active: boolean;
  distance: string;
}

interface Room {
  name: string;
  participants: number;
  imageUrl: string;
  live: boolean;
  genre: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const MAP_USERS: MapUser[] = [
  {
    id: '1', name: 'Arnav', imageUrl: 'https://i.pravatar.cc/100?img=11',
    track: '505', artist: 'Arctic Monkeys', mood: 'Late Night', moodEmoji: '🌊',
    glowColor: '#8A2BE2', borderColor: '#8A2BE2', top: '32%', left: '45%', size: 54, opacity: 1,
  },
  {
    id: '2', name: 'Priya', imageUrl: 'https://i.pravatar.cc/100?img=5',
    track: 'Comptine', artist: 'Yann Tiersen', mood: 'Focus', moodEmoji: '🔮',
    glowColor: '#00E5FF', borderColor: '#00E5FF', top: '18%', left: '72%', size: 46, opacity: 0.95,
  },
  {
    id: '3', name: 'Marcus', imageUrl: 'https://i.pravatar.cc/100?img=8',
    track: 'Highest In The Room', artist: 'Travis Scott', mood: 'Hype', moodEmoji: '🔥',
    glowColor: '#f97316', borderColor: '#f97316', top: '55%', left: '15%', size: 42, opacity: 0.9,
  },
  {
    id: '4', name: 'Sasha', imageUrl: 'https://i.pravatar.cc/100?img=3',
    track: 'Apocalypse', artist: 'CIGS', mood: 'Melancholy', moodEmoji: '💔',
    glowColor: '#64748b', borderColor: '#475569', top: '42%', left: '75%', size: 38, opacity: 0.6,
  },
];

const FRIENDS: Friend[] = [
  { name: 'Arnav Singh', imageUrl: 'https://i.pravatar.cc/100?img=11', track: '505', artist: 'Arctic Monkeys', emoji: '🔮', active: true, distance: '0.3 km' },
  { name: 'Elena Rivera', imageUrl: 'https://i.pravatar.cc/100?img=5', track: 'Starboy', artist: 'The Weeknd', emoji: '⚡', active: false, distance: '1.2 km' },
  { name: 'Marcus Tan', imageUrl: 'https://i.pravatar.cc/100?img=8', track: 'FE!N', artist: 'Travis Scott', emoji: '🔥', active: false, distance: '2.4 km' },
  { name: 'Sasha K.', imageUrl: 'https://i.pravatar.cc/100?img=3', track: 'Apocalypse', artist: 'CIGS', emoji: '💔', active: false, distance: '3.8 km' },
];

const ROOMS: Room[] = [
  { name: 'Night Drives', participants: 18, imageUrl: 'https://i.pravatar.cc/100?img=20', live: true, genre: 'Indie · R&B' },
  { name: 'Indie Pop Vibes', participants: 5, imageUrl: 'https://i.pravatar.cc/100?img=21', live: true, genre: 'Indie Pop' },
  { name: 'Lo-Fi Study', participants: 34, imageUrl: 'https://i.pravatar.cc/100?img=22', live: false, genre: 'Lo-Fi' },
];

// ─── Pulsing Avatar ───────────────────────────────────────────────────────────
const PulsingAvatar: React.FC<{
  user: MapUser; isSelected: boolean; onPress: () => void; delay?: number;
}> = ({ user, isSelected, onPress, delay = 0 }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.12, duration: 1100, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glowOpacity, { toValue: 0.7, duration: 1100, useNativeDriver: true }),
            Animated.timing(glowOpacity, { toValue: 0.25, duration: 1100, useNativeDriver: true }),
          ]),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const s = user.size;
  const glowS = s + 22;
  const outerRingS = s + 10;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.avatarWrapper, {
        top: user.top as any,
        left: user.left as any,
        marginLeft: -(s / 2),
        marginTop: -(s / 2),
      }]}
    >
      {/* Soft ambient glow */}
      <Animated.View style={{
        position: 'absolute',
        width: glowS, height: glowS, borderRadius: glowS / 2,
        backgroundColor: user.glowColor,
        opacity: glowOpacity,
        top: -(glowS - s) / 2, left: -(glowS - s) / 2,
      }} />
      {/* Outer ring */}
      <View style={{
        position: 'absolute',
        width: outerRingS, height: outerRingS, borderRadius: outerRingS / 2,
        borderWidth: 1,
        borderColor: isSelected ? '#fff' : `${user.glowColor}55`,
        top: -(outerRingS - s) / 2, left: -(outerRingS - s) / 2,
      }} />
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image
          source={{ uri: user.imageUrl }}
          style={[styles.avatarImage, {
            width: s, height: s, borderRadius: s / 2,
            borderColor: user.borderColor, opacity: user.opacity
          }]}
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
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [user.id]);

  return (
    <Animated.View style={[styles.bubble, { opacity, transform: [{ translateY }] }]}>
      <View style={styles.bubbleHeader}>
        <Image source={{ uri: user.imageUrl }} style={styles.bubbleAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.bubbleName}>{user.name}</Text>
          <Text style={styles.bubbleLabel}>Listening now</Text>
        </View>
      </View>
      <Text style={styles.bubbleTrack} numberOfLines={1}>{user.track}</Text>
      {user.artist && (
        <Text style={styles.bubbleArtist} numberOfLines={1}>{user.artist}</Text>
      )}
      <View style={styles.bubbleMoodRow}>
        <View style={[styles.moodChip, { borderColor: user.glowColor + '40', backgroundColor: user.glowColor + '18' }]}>
          <Text style={[styles.moodChipText, { color: user.glowColor }]}>
            {user.moodEmoji} {user.mood}
          </Text>
        </View>
      </View>
      <LinearGradient
        colors={['#9333ea', '#6019a8']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.joinBtn}
      >
        <TouchableOpacity style={styles.joinBtnInner} activeOpacity={0.85} onPress={onClose}>
          <Ionicons name="headset-outline" size={14} color="#fff" />
          <Text style={styles.joinBtnText}>Tune In</Text>
        </TouchableOpacity>
      </LinearGradient>
      <View style={styles.bubblePointer} />
    </Animated.View>
  );
};

// ─── Bottom Sheet ─────────────────────────────────────────────────────────────
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
      duration: expanded ? 280 : 120,
      useNativeDriver: true,
    }).start();
    lastY.current = target;
    setIsExpanded(expanded);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => { translateY.stopAnimation(); },
      onPanResponderMove: (_, g) => {
        const next = Math.max(SNAP_EXPANDED, Math.min(SNAP_COLLAPSED, lastY.current + g.dy));
        translateY.setValue(next);
      },
      onPanResponderRelease: (_, g) => {
        const current = lastY.current + g.dy;
        const velocity = g.vy;
        if (velocity < -0.5 || current < SNAP_COLLAPSED / 2) {
          snapTo(SNAP_EXPANDED, true);
        } else {
          snapTo(SNAP_COLLAPSED, false);
        }
      },
    })
  ).current;

  const handleHeaderTap = () => {
    if (isExpanded) snapTo(SNAP_COLLAPSED, false);
    else snapTo(SNAP_EXPANDED, true);
  };

  const sheetHeight = SHEET_FULL_HEIGHT + insets.bottom;

  return (
    <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY }] }]}>
      {/* Gradient top edge */}
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'transparent']}
        style={styles.sheetTopGradient}
        pointerEvents="none"
      />

      {/* Collapsed header */}
      <View {...panResponder.panHandlers} style={styles.sheetHeader}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleHeaderTap} style={{ width: '100%' }}>
          <View style={styles.dragHandle} />
          <View style={styles.sheetHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.liveRow}>
                <View style={styles.livePulseWrap}>
                  <View style={styles.livePulseRing} />
                  <View style={styles.liveDot} />
                </View>
                <Text style={styles.sheetTitle}>Live around you</Text>
              </View>
              {!isExpanded && (
                <Text style={styles.sheetSub}>8 rooms · 45 listening now</Text>
              )}
            </View>
            {/* Avatar stack preview */}
            <View style={styles.stackRow}>
              {['img=11', 'img=5', 'img=8'].map((q, i) => (
                <Image
                  key={q}
                  source={{ uri: `https://i.pravatar.cc/100?${q}` }}
                  style={[styles.stackAvatar, { marginLeft: i === 0 ? 0 : -10, zIndex: 3 - i }]}
                />
              ))}
              <View style={[styles.stackAvatar, styles.stackMore, { marginLeft: -10 }]}>
                <Text style={styles.stackMoreText}>+5</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Expanded content */}
      <Animated.View
        style={[styles.sheetContent, { opacity: contentOpacity }]}
        pointerEvents={isExpanded ? 'auto' : 'none'}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statDot, { backgroundColor: '#22c55e' }]} />
                <Text style={styles.statLabel}>listening nearby</Text>
              </View>
              <Text style={styles.statNumber}>12</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.statDot, { backgroundColor: '#9333ea' }]} />
                <Text style={styles.statLabel}>active rooms</Text>
              </View>
              <Text style={styles.statNumber}>3</Text>
            </View>
          </View>

          {/* Friends Nearby */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends Nearby</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>

          {FRIENDS.map((f) => (
            <TouchableOpacity key={f.name} activeOpacity={0.7} style={styles.friendRow}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: f.imageUrl }} style={styles.friendAvatar} />
                <View style={styles.friendEmoji}>
                  <Text style={{ fontSize: 9, lineHeight: 12 }}>{f.emoji}</Text>
                </View>
                {f.active && <View style={styles.onlinePulse} />}
              </View>
              <View style={styles.friendInfo}>
                <View style={styles.friendNameRow}>
                  <Text style={styles.friendName} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.friendDistance}>{f.distance}</Text>
                </View>
                <Text style={styles.friendTrack} numberOfLines={1}>
                  <Text style={styles.friendTrackName}>{f.track}</Text>
                  <Text>  ·  </Text>
                  {f.artist}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.joinPill, f.active && styles.joinPillActive]}
              >
                <Text style={[styles.joinPillText, f.active && styles.joinPillTextActive]}>
                  {f.active ? 'Tune In' : 'Wave'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {/* Suggested Rooms */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <Text style={styles.sectionTitle}>Suggested Rooms</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Explore</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {ROOMS.map(room => (
              <TouchableOpacity key={room.name} activeOpacity={0.85} style={styles.roomCard}>
                <LinearGradient
                  colors={room.live ? ['#240a3f', '#3b0e6b'] : ['#0a0a14', '#14141e']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.roomTopRow}>
                  {room.live ? (
                    <View style={styles.roomLiveBadge}>
                      <View style={styles.roomLiveDot} />
                      <Text style={styles.roomLiveText}>LIVE</Text>
                    </View>
                  ) : (
                    <View style={styles.roomIdleBadge}>
                      <Text style={styles.roomIdleText}>SOON</Text>
                    </View>
                  )}
                  <Image source={{ uri: room.imageUrl }} style={styles.roomAvatar} />
                </View>
                <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                <Text style={styles.roomGenre} numberOfLines={1}>{room.genre}</Text>
                <View style={styles.roomFooter}>
                  <Ionicons name="people" size={10} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.roomParticipants}>{room.participants} joined</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
interface Drop {
  id: string;
  user: { name: string; avatar: string | null; handle: string | null };
  track: { title: string; artist: string; cover: string | null };
  mood: { emoji: string; label: string };
  caption: string | null;
  color: string;
  waves: number;
  tunes_in: number;
  created_at: string;
}

// Scattered positions for drops (stable per drop id)
const DROP_POSITIONS = [
  { top: '28%', left: '30%' },
  { top: '48%', left: '62%' },
  { top: '38%', left: '18%' },
  { top: '60%', left: '40%' },
  { top: '20%', left: '56%' },
  { top: '66%', left: '68%' },
  { top: '50%', left: '8%' },
  { top: '14%', left: '38%' },
];

const DropPin: React.FC<{
  drop: Drop;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}> = ({ drop, index, isSelected, onPress }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(index * 200),
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulse, { toValue: 1.15, duration: 900, useNativeDriver: true }),
            Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(glow, { toValue: 0.75, duration: 900, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0.3, duration: 900, useNativeDriver: true }),
          ]),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const pos = DROP_POSITIONS[index % DROP_POSITIONS.length];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.dropAnchor, { top: pos.top as any, left: pos.left as any }]}
    >
      <Animated.View
        style={[
          styles.dropGlow,
          {
            backgroundColor: drop.color,
            opacity: glow,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dropDiamond,
          {
            borderColor: drop.color,
            backgroundColor: `${drop.color}33`,
            transform: [{ rotate: '45deg' }, { scale: pulse }],
          },
          isSelected && { borderWidth: 2.5 },
        ]}
      >
        <View style={{ transform: [{ rotate: '-45deg' }] }}>
          <Text style={styles.dropEmoji}>{drop.mood.emoji}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const DropBubble: React.FC<{ drop: Drop; onTune: () => void; onWave: () => void }> = ({ drop, onTune, onWave }) => (
  <View style={styles.dropBubble}>
    <View style={styles.dropBubbleHeader}>
      {drop.user.avatar ? (
        <Image source={{ uri: drop.user.avatar }} style={styles.dropBubbleAvatar} />
      ) : (
        <View style={[styles.dropBubbleAvatar, { backgroundColor: drop.color }]} />
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.dropBubbleName}>{drop.user.name}</Text>
        <Text style={styles.dropBubbleLabel}>dropped a vibe</Text>
      </View>
      <View style={[styles.dropBubbleMood, { borderColor: `${drop.color}66`, backgroundColor: `${drop.color}22` }]}>
        <Text style={[styles.dropBubbleMoodText, { color: drop.color }]}>
          {drop.mood.emoji} {drop.mood.label}
        </Text>
      </View>
    </View>
    {drop.track.cover && (
      <View style={styles.dropBubbleTrack}>
        <Image source={{ uri: drop.track.cover }} style={styles.dropBubbleCover} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.dropBubbleTrackTitle} numberOfLines={1}>{drop.track.title}</Text>
          <Text style={styles.dropBubbleTrackArtist} numberOfLines={1}>{drop.track.artist}</Text>
        </View>
      </View>
    )}
    {drop.caption ? (
      <Text style={styles.dropBubbleCaption} numberOfLines={3}>"{drop.caption}"</Text>
    ) : null}
    <View style={styles.dropBubbleActions}>
      <TouchableOpacity onPress={onWave} style={styles.dropBubbleActionBtn}>
        <Ionicons name="hand-right-outline" size={13} color="#fff" />
        <Text style={styles.dropBubbleActionText}>Wave · {drop.waves}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onTune} activeOpacity={0.85} style={styles.dropBubbleTuneBtn}>
        <LinearGradient
          colors={[drop.color, '#ff6a00']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons name="headset-outline" size={13} color="#0a0a0a" />
        <Text style={styles.dropBubbleTuneText}>Tune In · {drop.tunes_in}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export const LivePresenceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedUser, setSelectedUser] = useState<MapUser | null>(null);
  const [activeToggle, setActiveToggle] = useState<'global' | 'nearby'>('nearby');
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [selectedDropId, setSelectedDropId] = useState<string | null>(null);

  const fetchDrops = React.useCallback(async () => {
    try {
      const data = await publicFetch<{ drops: Drop[] }>('/api/drops?limit=6');
      setDrops(data.drops || []);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchDrops();
    const t = setInterval(fetchDrops, 20000);
    return () => clearInterval(t);
  }, [fetchDrops]);

  const handleAvatarPress = (user: MapUser) => {
    setSelectedUser(prev => (prev?.id === user.id ? null : user));
    setSelectedDropId(null);
  };

  const handleDropPress = (id: string) => {
    setSelectedDropId(prev => (prev === id ? null : id));
    setSelectedUser(null);
  };

  const handleWave = async (dropId: string) => {
    try {
      const r = await publicFetch<{ waves: number }>(`/api/drops/${dropId}/wave`, { method: 'POST' });
      setDrops(d => d.map(x => (x.id === dropId ? { ...x, waves: r.waves } : x)));
    } catch {}
  };

  const handleTune = async (dropId: string) => {
    try {
      const r = await publicFetch<{ tunes_in: number }>(`/api/drops/${dropId}/tune-in`, { method: 'POST' });
      setDrops(d => d.map(x => (x.id === dropId ? { ...x, tunes_in: r.tunes_in } : x)));
      setSelectedDropId(null);
    } catch {}
  };

  const selectedDrop = drops.find(d => d.id === selectedDropId) || null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Dark map background */}
      <View style={StyleSheet.absoluteFillObject}>
        <LinearGradient colors={['#05050a', '#080b14', '#0a0d18']} style={StyleSheet.absoluteFillObject} />
        {Array.from({ length: 14 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLine, styles.hLine, { top: `${(i + 1) * 7}%` as any }]} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLine, styles.vLine, { left: `${(i + 1) * 11}%` as any }]} />
        ))}
        <View style={[styles.ambientGlow, { top: '18%', left: '28%', backgroundColor: '#8A2BE2', width: 200, height: 200 }]} />
        <View style={[styles.ambientGlow, { top: '8%', right: '8%', backgroundColor: '#00E5FF', width: 150, height: 150 }]} />
        <View style={[styles.ambientGlow, { top: '52%', left: '4%', backgroundColor: '#f97316', width: 110, height: 110 }]} />
        <LinearGradient
          colors={['rgba(5,5,10,0.65)', 'transparent', 'rgba(5,5,10,0.8)']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <LinearGradient colors={['rgba(5,5,10,0.94)', 'rgba(5,5,10,0.0)']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="location" size={14} color="#ff8a00" />
              <Text style={styles.headerEyebrow}>NEARBY · LIVE</Text>
            </View>
            <Text style={styles.headerTitle}>Music Map</Text>
            <Text style={styles.headerSubtitle}>Feel what the city is playing</Text>
          </View>

          {/* Refined segmented toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              onPress={() => setActiveToggle('nearby')}
              activeOpacity={0.85}
              style={[styles.toggleBtn, activeToggle === 'nearby' && styles.toggleBtnActive]}
            >
              <Ionicons
                name="location-outline"
                size={13}
                color={activeToggle === 'nearby' ? '#000' : 'rgba(255,255,255,0.55)'}
              />
              <Text style={[styles.toggleText, activeToggle === 'nearby' && styles.toggleTextActive]}>
                Nearby
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveToggle('global')}
              activeOpacity={0.85}
              style={[styles.toggleBtn, activeToggle === 'global' && styles.toggleBtnActive]}
            >
              <Ionicons
                name="globe-outline"
                size={13}
                color={activeToggle === 'global' ? '#000' : 'rgba(255,255,255,0.55)'}
              />
              <Text style={[styles.toggleText, activeToggle === 'global' && styles.toggleTextActive]}>
                Global
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search pill */}
        <TouchableOpacity activeOpacity={0.85} style={styles.searchPill}>
          <Ionicons name="search-outline" size={15} color="rgba(255,255,255,0.55)" />
          <Text style={styles.searchText}>Search a mood, song, or friend…</Text>
          <View style={styles.filterDot} />
        </TouchableOpacity>
      </View>

      {/* Map avatars */}
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
              marginLeft: -(210 / 2),
              marginTop: -(selectedUser.size / 2) - 210,
            }]}
            pointerEvents="box-none"
          >
            <PreviewBubble user={selectedUser} onClose={() => setSelectedUser(null)} />
          </View>
        )}

        {/* Drops on the map */}
        {drops.map((d, i) => (
          <DropPin
            key={d.id}
            drop={d}
            index={i}
            isSelected={selectedDropId === d.id}
            onPress={() => handleDropPress(d.id)}
          />
        ))}
        {selectedDrop && (
          <View
            style={[
              styles.dropBubbleAnchor,
              {
                top: DROP_POSITIONS[drops.findIndex(d => d.id === selectedDrop.id) % DROP_POSITIONS.length].top as any,
                left: DROP_POSITIONS[drops.findIndex(d => d.id === selectedDrop.id) % DROP_POSITIONS.length].left as any,
              },
            ]}
            pointerEvents="box-none"
          >
            <DropBubble
              drop={selectedDrop}
              onWave={() => handleWave(selectedDrop.id)}
              onTune={() => handleTune(selectedDrop.id)}
            />
          </View>
        )}
      </Pressable>

      {/* FAB */}
      <View
        style={[styles.fabContainer, { bottom: NAVBAR_OFFSET + SHEET_COLLAPSED_HEIGHT + 16 + insets.bottom }]}
      >
        <LinearGradient
          colors={['#a855f7', '#6366f1', '#00E5FF']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <TouchableOpacity
            style={styles.fabInner}
            activeOpacity={0.85}
            onPress={() => setDropModalOpen(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
        <Text style={styles.fabLabel}>Drop</Text>
      </View>

      {/* Drop modal */}
      <DropVibeModal
        visible={dropModalOpen}
        onClose={() => setDropModalOpen(false)}
        onDropped={fetchDrops}
      />

      {/* Bottom Sheet */}
      <BottomSheet insets={insets} />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#05050a' },

  // Map bg
  gridLine: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.022)' },
  hLine: { left: 0, right: 0, height: 1 },
  vLine: { top: 0, bottom: 0, width: 1 },
  ambientGlow: { position: 'absolute', borderRadius: 999, opacity: 0.18, transform: [{ scale: 1.9 }] },

  // Header
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
    paddingHorizontal: 20, paddingBottom: 18,
  },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  headerEyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#ff8a00' },
  headerTitle: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: -0.6 },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, letterSpacing: -0.1 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  toggleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 11, paddingVertical: 6, borderRadius: 99,
  },
  toggleBtnActive: { backgroundColor: '#fff' },
  toggleText: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  toggleTextActive: { color: '#000' },

  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  searchText: { flex: 1, color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  filterDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#ff8a00',
    shadowColor: '#ff8a00', shadowOpacity: 1, shadowRadius: 6, elevation: 3,
  },

  // Avatars
  avatarWrapper: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  avatarImage: { borderWidth: 2.5 },
  emojiBadge: {
    position: 'absolute', bottom: -4, right: -4, borderRadius: 99, padding: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#050508', zIndex: 10,
  },

  // Preview bubble
  bubbleAnchor: { position: 'absolute', width: 210, zIndex: 50 },
  bubble: {
    width: 210,
    backgroundColor: 'rgba(14,10,22,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 16,
  },
  bubbleHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  bubbleAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  bubbleName: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  bubbleLabel: {
    fontSize: 9, color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 2,
  },
  bubbleTrack: { fontSize: 14, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  bubbleArtist: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, marginBottom: 10 },
  bubbleMoodRow: { flexDirection: 'row', marginBottom: 12 },
  moodChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, borderWidth: 1 },
  moodChipText: { fontSize: 10, fontWeight: '600' },
  joinBtn: { borderRadius: 12, overflow: 'hidden' },
  joinBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  joinBtnText: { fontSize: 12, fontWeight: '700', color: '#fff', letterSpacing: 0.2 },
  bubblePointer: {
    position: 'absolute', bottom: -6, alignSelf: 'center',
    width: 12, height: 12, backgroundColor: 'rgba(14,10,22,0.96)',
    borderRightWidth: 1, borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', transform: [{ rotate: '45deg' }],
  },

  // FAB
  fabContainer: { position: 'absolute', right: 20, alignItems: 'center', zIndex: 30 },
  fab: {
    width: 52, height: 52, borderRadius: 26,
    shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  fabInner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fabLabel: {
    fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.5, marginTop: 6, textTransform: 'uppercase',
  },

  // Bottom Sheet
  sheet: {
    position: 'absolute', bottom: NAVBAR_OFFSET, left: 16, right: 16,
    backgroundColor: 'rgba(12,12,18,0.96)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 40,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.6, shadowRadius: 24, elevation: 30,
    overflow: 'hidden',
  },
  sheetTopGradient: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 1,
  },
  sheetHeader: {
    height: SHEET_COLLAPSED_HEIGHT,
    paddingHorizontal: 22,
    paddingTop: 12,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 99, alignSelf: 'center', marginBottom: 16,
  },
  sheetHeaderRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', width: '100%',
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  livePulseWrap: { width: 9, height: 9, alignItems: 'center', justifyContent: 'center' },
  livePulseRing: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ef4444' },
  sheetTitle: { fontSize: 15, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  sheetSub: { fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 4, marginLeft: 18 },
  stackRow: { flexDirection: 'row', alignItems: 'center' },
  stackAvatar: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'rgba(12,12,18,1)' },
  stackMore: { backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  stackMoreText: { fontSize: 9, color: '#fff', fontWeight: '700' },

  sheetContent: { flex: 1, paddingHorizontal: 22, paddingTop: 4 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20, paddingVertical: 14, paddingHorizontal: 14,
  },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  statDot: { width: 6, height: 6, borderRadius: 3 },
  statNumber: { fontSize: 26, fontWeight: '600', color: '#fff', letterSpacing: -0.8 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // Sections
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14, fontWeight: '700', color: '#fff',
    letterSpacing: -0.1,
  },
  sectionAction: {
    fontSize: 12, color: 'rgba(255,138,0,0.85)', fontWeight: '600',
  },

  // Friend rows
  friendRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginBottom: 10, paddingVertical: 6,
  },
  friendAvatar: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  friendEmoji: {
    position: 'absolute', bottom: -3, right: -3,
    backgroundColor: '#08080c', borderRadius: 99, padding: 3,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  onlinePulse: {
    position: 'absolute', top: -1, left: -1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2, borderColor: '#0c0c12',
  },
  friendInfo: { flex: 1 },
  friendNameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  friendName: { fontSize: 14, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  friendDistance: { fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.2 },
  friendTrack: { fontSize: 12, color: 'rgba(255,255,255,0.42)', marginTop: 2 },
  friendTrackName: { color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  joinPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  joinPillActive: {
    backgroundColor: '#fff', borderColor: '#fff',
  },
  joinPillText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', letterSpacing: 0.2 },
  joinPillTextActive: { color: '#000' },

  // Rooms
  roomCard: {
    width: 160, height: 118, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 12, justifyContent: 'space-between',
  },
  roomTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roomLiveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(239,68,68,0.15)', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
  },
  roomLiveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ef4444' },
  roomLiveText: { fontSize: 9, color: '#ffdada', fontWeight: '700', letterSpacing: 0.8 },
  roomIdleBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  roomIdleText: { fontSize: 9, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 0.8 },
  roomAvatar: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  roomName: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.2, marginTop: 6 },
  roomGenre: { fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  roomFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roomParticipants: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  // Drops
  dropAnchor: {
    position: 'absolute',
    width: 44, height: 44,
    marginLeft: -22, marginTop: -22,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 10,
  },
  dropGlow: {
    position: 'absolute',
    width: 60, height: 60, borderRadius: 30,
  },
  dropDiamond: {
    width: 32, height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  dropEmoji: { fontSize: 14, lineHeight: 17 },
  dropBubbleAnchor: {
    position: 'absolute',
    width: 260, marginLeft: -130, marginTop: -260,
    zIndex: 60,
  },
  dropBubble: {
    width: 260,
    backgroundColor: 'rgba(14,10,22,0.96)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 16,
  },
  dropBubbleHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dropBubbleAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  dropBubbleName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  dropBubbleLabel: {
    fontSize: 9, color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1, textTransform: 'uppercase', marginTop: 2,
  },
  dropBubbleMood: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99,
    borderWidth: 1,
  },
  dropBubbleMoodText: { fontSize: 10, fontWeight: '700' },
  dropBubbleTrack: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, padding: 8, marginBottom: 8,
  },
  dropBubbleCover: { width: 36, height: 36, borderRadius: 8 },
  dropBubbleTrackTitle: { color: '#fff', fontWeight: '700', fontSize: 12 },
  dropBubbleTrackArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 },
  dropBubbleCaption: {
    color: 'rgba(255,255,255,0.72)', fontSize: 12, fontStyle: 'italic',
    marginBottom: 10, lineHeight: 16,
  },
  dropBubbleActions: { flexDirection: 'row', gap: 8 },
  dropBubbleActionBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  dropBubbleActionText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  dropBubbleTuneBtn: {
    flex: 1.2,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: 10,
    overflow: 'hidden',
  },
  dropBubbleTuneText: { color: '#0a0a0a', fontSize: 11, fontWeight: '700' },
});
