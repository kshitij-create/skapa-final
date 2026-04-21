/**
 * RoomsScreen — browse live listening rooms + create one.
 * Playful card-stack feed with mood-colored gradients and pulsing live dot.
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { COLORS } from '../theme';
import { CreateRoomModal } from '../components/CreateRoomModal';
import { publicFetch } from '../state/publicApi';

interface RoomCard {
  id: string;
  code: string;
  name: string;
  mood: { emoji?: string; label?: string };
  color: string;
  host: { id: string; name: string; avatar?: string | null };
  track: { title: string; artist: string; cover?: string | null } | null;
  live_count: number;
  members_preview: { id: string; name: string; avatar?: string | null }[];
  created_at: string;
}

export const RoomsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [rooms, setRooms] = useState<RoomCard[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await publicFetch<{ rooms: RoomCard[] }>('/api/rooms');
      setRooms(data.rooms || []);
    } catch {
      setRooms([]);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onCreated = (code: string) => {
    navigation.navigate('ListeningRoom', { code });
  };

  const onJoin = () => {
    const c = joinCode.trim().toUpperCase();
    if (!c) return;
    navigation.navigate('ListeningRoom', { code: c });
  };

  const featured = rooms[0];
  const rest = rooms.slice(1);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <CreateRoomModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={onCreated}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          refreshControl={
            <RefreshControl
              tintColor={COLORS.primary}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
            <View style={styles.eyebrowRow}>
              <View style={styles.livePulse} />
              <Text style={styles.eyebrow}>LIVE NOW · LISTENING ROOMS</Text>
            </View>
            <Text style={styles.title}>Tune in, together.</Text>
            <Text style={styles.subtitle}>
              {rooms.length > 0
                ? `${rooms.reduce((a, r) => a + r.live_count, 0)} listening across ${rooms.length} ${rooms.length === 1 ? 'room' : 'rooms'}`
                : 'Be the first to open one'}
            </Text>
          </Animated.View>

          {/* Join by code */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.joinRow}>
            <View style={styles.joinInputWrap}>
              <Ionicons name="link-outline" size={16} color="rgba(255,255,255,0.5)" />
              <TextInput
                value={joinCode}
                onChangeText={t => setJoinCode(t.toUpperCase())}
                placeholder="Enter room code"
                placeholderTextColor="rgba(255,255,255,0.3)"
                autoCapitalize="characters"
                maxLength={8}
                style={styles.joinInput}
              />
            </View>
            <TouchableOpacity
              onPress={onJoin}
              disabled={!joinCode.trim()}
              activeOpacity={0.85}
              style={[styles.joinBtn, !joinCode.trim() && { opacity: 0.4 }]}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Featured (big hero card) */}
          {featured && (
            <Animated.View entering={FadeInUp.delay(150).springify()}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('ListeningRoom', { code: featured.code })}
                style={styles.heroCard}
              >
                <LinearGradient
                  colors={[`${featured.color}99`, `${featured.color}33`, '#0a0a0a']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                {featured.track?.cover && (
                  <Image
                    source={{ uri: featured.track.cover }}
                    style={styles.heroCover}
                    blurRadius={40}
                  />
                )}
                <View style={StyleSheet.absoluteFillObject}>
                  <LinearGradient
                    colors={['transparent', 'rgba(10,10,15,0.7)', 'rgba(10,10,15,0.95)']}
                    style={StyleSheet.absoluteFillObject}
                  />
                </View>

                <View style={styles.heroContent}>
                  <View style={styles.heroBadges}>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeDot} />
                      <Text style={styles.liveBadgeText}>LIVE</Text>
                    </View>
                    <View style={styles.heroListeners}>
                      <Ionicons name="people" size={11} color="#fff" />
                      <Text style={styles.heroListenersText}>{featured.live_count}</Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }} />

                  <Text style={styles.heroMood}>
                    {featured.mood.emoji} {featured.mood.label}
                  </Text>
                  <Text style={styles.heroName} numberOfLines={2}>{featured.name}</Text>
                  {featured.track && (
                    <View style={styles.heroTrackRow}>
                      {featured.track.cover && (
                        <Image source={{ uri: featured.track.cover }} style={styles.heroTrackCover} />
                      )}
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.heroTrackTitle} numberOfLines={1}>{featured.track.title}</Text>
                        <Text style={styles.heroTrackArtist} numberOfLines={1}>{featured.track.artist}</Text>
                      </View>
                      <View style={styles.heroJoinChip}>
                        <Ionicons name="arrow-forward" size={14} color="#0a0a0a" />
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Others */}
          {rest.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>More rooms</Text>
              {rest.map((room, i) => (
                <Animated.View key={room.id} entering={FadeIn.delay(200 + i * 50)}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate('ListeningRoom', { code: room.code })}
                    style={styles.roomRow}
                  >
                    <LinearGradient
                      colors={[`${room.color}33`, 'transparent']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <View style={[styles.roomCover, { backgroundColor: `${room.color}44` }]}>
                      {room.track?.cover ? (
                        <Image source={{ uri: room.track.cover }} style={styles.roomCoverImg} />
                      ) : (
                        <Text style={{ fontSize: 22 }}>{room.mood.emoji}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.roomNameRow}>
                        <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                        <View style={[styles.liveDot, { backgroundColor: room.live_count > 0 ? '#22c55e' : '#64748b' }]} />
                      </View>
                      <Text style={styles.roomHost} numberOfLines={1}>
                        {room.mood.emoji} {room.mood.label} · hosted by {room.host.name}
                      </Text>
                      <View style={styles.roomFooter}>
                        <View style={styles.memberStack}>
                          {room.members_preview.slice(0, 3).map((m, j) => (
                            <Image
                              key={m.id}
                              source={{ uri: m.avatar || `https://i.pravatar.cc/100?u=${m.id}` }}
                              style={[styles.stackAvatar, { marginLeft: j === 0 ? 0 : -8, zIndex: 3 - j }]}
                            />
                          ))}
                        </View>
                        <Text style={styles.roomFooterText}>
                          {room.live_count} listening · code {room.code}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.roomChevron}>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* Empty state */}
          {rooms.length === 0 && (
            <Animated.View entering={FadeIn.delay(200)} style={styles.empty}>
              <Text style={{ fontSize: 44, marginBottom: 12 }}>🎧</Text>
              <Text style={styles.emptyTitle}>It's quiet in here</Text>
              <Text style={styles.emptySub}>Be the first to open a room and set the vibe.</Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Create FAB */}
        <TouchableOpacity
          onPress={() => setCreateOpen(true)}
          activeOpacity={0.9}
          style={styles.fab}
        >
          <LinearGradient
            colors={['#a855f7', '#ec4899', '#ff8a00']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={styles.fabText}>New Room</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050505' },
  header: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 18 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  livePulse: {
    width: 7, height: 7, borderRadius: 3.5,
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444', shadowOpacity: 1, shadowRadius: 6,
  },
  eyebrow: { color: '#ff8a00', fontSize: 10, fontWeight: '700', letterSpacing: 2.2 },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 },

  // Join
  joinRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 22, marginBottom: 20,
  },
  joinInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 12,
    height: 46,
  },
  joinInput: {
    flex: 1, color: '#fff', fontSize: 14, fontWeight: '600',
    letterSpacing: 2,
  },
  joinBtn: {
    paddingHorizontal: 20, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  joinBtnText: { color: '#0a0a0a', fontSize: 13, fontWeight: '700' },

  // Hero
  heroCard: {
    marginHorizontal: 22,
    height: 240,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroCover: { ...StyleSheet.absoluteFillObject, opacity: 0.4 },
  heroContent: { flex: 1, padding: 18 },
  heroBadges: { flexDirection: 'row', gap: 8 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ef4444' },
  liveBadgeText: { color: '#ffdada', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  heroListeners: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3,
  },
  heroListenersText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  heroMood: { color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '700', letterSpacing: -0.5, marginBottom: 14 },
  heroTrackRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14, padding: 8,
  },
  heroTrackCover: { width: 38, height: 38, borderRadius: 6 },
  heroTrackTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  heroTrackArtist: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 1 },
  heroJoinChip: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  // Section / list
  section: { marginTop: 24, paddingHorizontal: 22 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2, marginBottom: 12 },

  roomRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 12, marginBottom: 10,
    overflow: 'hidden',
  },
  roomCover: {
    width: 52, height: 52, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  roomCoverImg: { width: '100%', height: '100%' },
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomName: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: -0.2, flex: 1 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5 },
  roomHost: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  roomFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  memberStack: { flexDirection: 'row' },
  stackAvatar: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#0a0a0a' },
  roomFooterText: { color: 'rgba(255,255,255,0.42)', fontSize: 10, fontWeight: '500' },
  roomChevron: { marginLeft: 8 },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  emptySub: { color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', marginTop: 6 },

  fab: {
    position: 'absolute',
    bottom: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 20, height: 52, borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#ec4899', shadowOpacity: 0.6, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  fabText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
});

export default RoomsScreen;
