/**
 * ListeningRoomScreen — real-time listening room.
 * - WebSocket to /ws/rooms/{code}
 * - Orbiting member avatars around the album cover (which rotates like a vinyl)
 * - Floating reaction emojis
 * - Reaction quick-send bar
 * - Mood-gradient background
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { COLORS } from '../theme';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { getOrCreateIdentity, Identity } from '../state/identity';
import { RoomOrbit } from '../components/RoomOrbit';
import { FloatingReaction } from '../components/FloatingReaction';

const QUICK_REACTIONS = ['🔥', '❤️', '🎉', '🙌', '😭', '🤘', '💫', '🌙'];

export const ListeningRoomScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const code = route?.params?.code as string | undefined;
  const [me, setMe] = useState<Identity | null>(null);

  useEffect(() => {
    getOrCreateIdentity().then(setMe);
  }, []);

  const wsBase = useMemo(() => {
    const api = process.env.EXPO_PUBLIC_BACKEND_URL || '';
    if (api.startsWith('https://')) return api.replace('https://', 'wss://');
    if (api.startsWith('http://')) return api.replace('http://', 'ws://');
    return api;
  }, []);

  // No code passed → landing state
  if (!code) {
    return (
      <View style={styles.screen}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <SafeAreaView style={styles.centered}>
          <Text style={{ fontSize: 44, marginBottom: 14 }}>🎧</Text>
          <Text style={styles.landingTitle}>Open a room to start listening together</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('RoomsList')}
            activeOpacity={0.9}
            style={styles.landingBtn}
          >
            <LinearGradient colors={['#a855f7', '#ec4899', '#ff8a00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
            <Text style={styles.landingBtnText}>Browse live rooms</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <RoomBody
      code={code}
      me={me}
      wsBase={wsBase}
      onLeave={() => navigation.goBack()}
    />
  );
};

// ───────────────────────────────────────────────────────────────────────────
const RoomBody: React.FC<{
  code: string;
  me: Identity | null;
  wsBase: string;
  onLeave: () => void;
}> = ({ code, me, wsBase, onLeave }) => {
  const {
    state,
    room,
    track,
    members,
    reactions,
    sendReaction,
    dropReaction,
  } = useRoomSocket({ code, user: me, wsBase });

  // Vinyl rotation
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 14000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);
  const vinylStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rot.value}deg` }],
  }));

  // Pulse with track change
  const trackPulse = useSharedValue(1);
  useEffect(() => {
    if (track) {
      trackPulse.value = withSequence(
        withTiming(1.08, { duration: 200, easing: Easing.out(Easing.quad) }),
        withSpring(1, { damping: 6, stiffness: 140 }),
      );
    }
  }, [track?.title]);
  const trackPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: trackPulse.value }],
  }));

  const color = room?.color || '#8A2BE2';

  const onShare = async () => {
    try {
      await Share.share({
        message: `Join me in "${room?.name || 'a room'}" on SKAPA. Code: ${code}`,
      });
    } catch {}
  };

  const handleLeave = () => {
    Alert.alert('Leave room?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: onLeave },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: '#050505' }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Mood-gradient background */}
      <LinearGradient
        colors={[`${color}55`, '#0a0a12', '#050508']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      {track?.cover && (
        <Image
          source={{ uri: track.cover }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.25 }]}
          blurRadius={60}
        />
      )}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(5,5,8,0.45)' }]} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleLeave} style={styles.topIconBtn}>
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <View style={[styles.liveBadge, { borderColor: `${color}60`, backgroundColor: `${color}22` }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
            <Text style={styles.code}>ROOM · {code}</Text>
          </View>

          <TouchableOpacity onPress={onShare} style={styles.topIconBtn}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {state !== 'open' && !room && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={color} />
            <Text style={styles.loadingText}>
              {state === 'error' || state === 'closed'
                ? 'Connection lost — reconnecting…'
                : 'Joining the room…'}
            </Text>
          </View>
        )}

        {room && (
          <>
            {/* Room name */}
            <Animated.View entering={FadeInDown.duration(400)} style={styles.titleArea}>
              <Text style={styles.moodLine}>
                {room.mood.emoji}  {room.mood.label}
              </Text>
              <Text style={styles.roomName} numberOfLines={2}>{room.name}</Text>
              <Text style={styles.hostedBy}>
                hosted by <Text style={styles.hostName}>{room.host.name}</Text>
              </Text>
            </Animated.View>

            {/* Center vinyl + orbit */}
            <View style={styles.stage}>
              <RoomOrbit
                members={members}
                hostId={room.host.id}
                radius={120}
                color={color}
              />

              {/* Vinyl */}
              <Animated.View style={[styles.vinylShadow, trackPulseStyle]}>
                <Animated.View style={[styles.vinyl, vinylStyle]}>
                  <LinearGradient
                    colors={['#111', '#1a1a1a', '#0a0a0a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {/* Grooves */}
                  {[100, 80, 60, 40].map(size => (
                    <View
                      key={size}
                      style={[
                        styles.vinylGroove,
                        { width: size * 1.2, height: size * 1.2, borderRadius: size },
                      ]}
                    />
                  ))}
                  {/* Cover art in center */}
                  {track?.cover ? (
                    <Image source={{ uri: track.cover }} style={styles.vinylCover} />
                  ) : (
                    <View style={[styles.vinylCover, { backgroundColor: color, alignItems: 'center', justifyContent: 'center' }]}>
                      <Text style={{ fontSize: 28 }}>{room.mood.emoji || '🎵'}</Text>
                    </View>
                  )}
                  <View style={styles.vinylCenter} />
                </Animated.View>
              </Animated.View>

              {/* Floating reactions layer */}
              <View style={styles.reactionsLayer} pointerEvents="none">
                {reactions.map((r, i) => (
                  <FloatingReaction
                    key={r.id}
                    id={r.id}
                    emoji={r.emoji}
                    startX={0.2 + ((i * 0.15) % 0.6)}
                    onDone={dropReaction}
                  />
                ))}
              </View>
            </View>

            {/* Track info */}
            {track && (
              <Animated.View entering={FadeInUp.duration(500)} style={styles.trackBar}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackLabel}>NOW PLAYING</Text>
                  <Text style={styles.trackTitle} numberOfLines={1}>{track.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
                </View>
                <View style={styles.trackPulseBadge}>
                  <View style={styles.trackPulseDot} />
                  <Text style={styles.trackPulseText}>{members.length}</Text>
                </View>
              </Animated.View>
            )}

            {/* Reaction bar */}
            <Animated.View entering={FadeIn.delay(200)} style={styles.reactionBar}>
              {QUICK_REACTIONS.map((em, i) => (
                <TouchableOpacity
                  key={em}
                  onPress={() => sendReaction(em)}
                  activeOpacity={0.6}
                  style={styles.reactionBtn}
                >
                  <Text style={styles.reactionEmoji}>{em}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  landingTitle: {
    color: '#fff', fontSize: 20, fontWeight: '700',
    letterSpacing: -0.3, textAlign: 'center', marginBottom: 22,
  },
  landingBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 26, height: 52, borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#ec4899', shadowOpacity: 0.5, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  landingBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8,
  },
  topIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  topCenter: { alignItems: 'center' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: 99, borderWidth: 1,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444',
    shadowColor: '#ef4444', shadowOpacity: 1, shadowRadius: 4,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  code: {
    color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '700',
    letterSpacing: 1.8, marginTop: 3,
  },

  // Loading
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  // Title
  titleArea: { alignItems: 'center', paddingTop: 22, paddingHorizontal: 24 },
  moodLine: {
    color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '600',
    letterSpacing: 0.5, marginBottom: 6,
  },
  roomName: {
    color: '#fff', fontSize: 28, fontWeight: '700',
    letterSpacing: -0.6, textAlign: 'center',
  },
  hostedBy: {
    color: 'rgba(255,255,255,0.45)', fontSize: 12, marginTop: 6,
  },
  hostName: { color: '#fff', fontWeight: '600' },

  // Stage (vinyl + orbit)
  stage: {
    flex: 1,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  vinylShadow: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.7, shadowRadius: 30, elevation: 20,
  },
  vinyl: {
    width: 180, height: 180, borderRadius: 90,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  vinylGroove: {
    position: 'absolute',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  vinylCover: {
    width: 82, height: 82, borderRadius: 41,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)',
  },
  vinylCenter: {
    position: 'absolute',
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#050505',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  reactionsLayer: {
    position: 'absolute', inset: 0, left: 0, right: 0, top: 0, bottom: 0,
    width: '100%', height: '100%',
  },

  // Track bar
  trackBar: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 22, marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18, padding: 14,
  },
  trackLabel: {
    color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '700',
    letterSpacing: 1.4, marginBottom: 3,
  },
  trackTitle: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  trackArtist: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 1 },
  trackPulseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1, borderColor: 'rgba(34,197,94,0.35)',
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5,
  },
  trackPulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  trackPulseText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Reactions
  reactionBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 22, paddingBottom: 16,
  },
  reactionBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  reactionEmoji: { fontSize: 20 },
});

export default ListeningRoomScreen;
