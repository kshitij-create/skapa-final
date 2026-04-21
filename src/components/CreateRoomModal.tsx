/**
 * CreateRoomModal — name + mood picker + pick-a-track → POST /api/rooms.
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown, FadeInDown } from 'react-native-reanimated';
import { publicFetch } from '../state/publicApi';
import { getOrCreateIdentity } from '../state/identity';
import { VIBES } from '../state/localStore';

const CURATED_TRACKS = [
  { id: 't1', title: '505', artist: 'Arctic Monkeys',           cover: 'https://i.scdn.co/image/ab67616d00001e0264acfdc3f8b03565a1b3d0c1' },
  { id: 't2', title: 'After Hours', artist: 'The Weeknd',       cover: 'https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36' },
  { id: 't3', title: 'Apocalypse', artist: 'Cigarettes After Sex', cover: 'https://i.scdn.co/image/ab67616d00001e02a17c2bf68e2b3d9a63e67fcd' },
  { id: 't4', title: 'Pink + White', artist: 'Frank Ocean',     cover: 'https://i.scdn.co/image/ab67616d00001e02c5649add07ed3720be9d5526' },
  { id: 't5', title: 'Starboy', artist: 'The Weeknd',           cover: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452' },
  { id: 't6', title: 'Runaway', artist: 'Kanye West',           cover: 'https://i.scdn.co/image/ab67616d00001e02adc3f06c6965c2c4fe5aba0e' },
];

const MOOD_COLORS: Record<string, string> = {
  latenight: '#8A2BE2',
  highenergy: '#f97316',
  focus: '#00E5FF',
  chill: '#0ea5e9',
  sadhours: '#64748b',
  indie: '#ec4899',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (code: string) => void;
}

export const CreateRoomModal: React.FC<Props> = ({ visible, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [moodId, setMoodId] = useState('latenight');
  const [trackId, setTrackId] = useState('t1');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!visible) {
      setName(''); setMoodId('latenight'); setTrackId('t1'); setSubmitting(false);
    }
  }, [visible]);

  const mood = VIBES.find(v => v.id === moodId)!;
  const track = CURATED_TRACKS.find(t => t.id === trackId)!;
  const color = MOOD_COLORS[moodId] || '#8A2BE2';

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Name your room', 'Give it a vibe-y title first.');
      return;
    }
    setSubmitting(true);
    try {
      const me = await getOrCreateIdentity();
      const res = await publicFetch<{ room: { code: string } }>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          mood_emoji: mood.emoji,
          mood_label: mood.label,
          color,
          host_name: me.name,
          host_id: me.id,
          host_avatar: me.avatar,
          track: { title: track.title, artist: track.artist, cover: track.cover },
        }),
      });
      onClose();
      onCreated(res.room.code);
    } catch (e: any) {
      Alert.alert('Could not create room', e?.message || 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
          <View style={styles.bg} />
        </Animated.View>
        <Pressable onPress={e => e.stopPropagation()} style={{ width: '100%' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View entering={SlideInDown.springify().damping(16)} style={styles.sheet}>
              <LinearGradient
                colors={[`${color}22`, '#0a0a12', '#06060a']}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.handle} />

              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>OPEN A ROOM</Text>
                  <Text style={styles.title}>Host a listening party</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.close}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Name */}
              <Animated.View entering={FadeInDown.delay(80)}>
                <Text style={styles.label}>Room name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Night Drives"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.input}
                  maxLength={40}
                />
              </Animated.View>

              {/* Mood */}
              <Animated.View entering={FadeInDown.delay(140)}>
                <Text style={styles.label}>Mood</Text>
                <View style={styles.moodRow}>
                  {VIBES.map(m => {
                    const active = m.id === moodId;
                    const c = MOOD_COLORS[m.id];
                    return (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => setMoodId(m.id)}
                        activeOpacity={0.85}
                        style={[styles.moodPill, active && { borderColor: c, backgroundColor: `${c}22` }]}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        <Text style={[styles.moodLabel, active && { color: '#fff' }]}>{m.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Track */}
              <Animated.View entering={FadeInDown.delay(200)}>
                <Text style={styles.label}>Opening track</Text>
                <FlatList
                  data={CURATED_TRACKS}
                  keyExtractor={t => t.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 10, paddingVertical: 4, paddingHorizontal: 2 }}
                  renderItem={({ item }) => {
                    const active = item.id === trackId;
                    return (
                      <TouchableOpacity
                        onPress={() => setTrackId(item.id)}
                        activeOpacity={0.85}
                        style={[styles.trackTile, active && { borderColor: color, borderWidth: 2 }]}
                      >
                        <Image source={{ uri: item.cover }} style={styles.cover} />
                        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                        {active && <View style={[styles.check, { backgroundColor: color }]}>
                          <Ionicons name="checkmark" size={11} color="#0a0a0a" />
                        </View>}
                      </TouchableOpacity>
                    );
                  }}
                />
              </Animated.View>

              {/* CTA */}
              <TouchableOpacity
                onPress={handleCreate}
                disabled={submitting || !name.trim()}
                activeOpacity={0.9}
                style={[styles.cta, (!name.trim() || submitting) && { opacity: 0.4 }]}
              >
                <LinearGradient colors={[color, '#ff6a00']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
                {submitting ? <ActivityIndicator color="#0a0a0a" /> : (
                  <>
                    <Ionicons name="sparkles" size={17} color="#0a0a0a" />
                    <Text style={styles.ctaText}>Open the room</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  bg: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  sheet: {
    paddingHorizontal: 22, paddingTop: 10, paddingBottom: 34,
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 14,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyebrow: { color: 'rgba(255,174,69,0.8)', fontSize: 10, fontWeight: '700', letterSpacing: 2.2 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.4, marginTop: 4 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  label: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.6, marginTop: 12, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 15, letterSpacing: -0.1,
  },
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 9,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  moodEmoji: { fontSize: 14 },
  moodLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  trackTile: {
    width: 102,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 7,
  },
  cover: { width: 88, height: 88, borderRadius: 8, marginBottom: 6 },
  trackTitle: { color: '#fff', fontSize: 11, fontWeight: '700' },
  trackArtist: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1 },
  check: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 54, borderRadius: 16, overflow: 'hidden', marginTop: 20,
    shadowColor: '#ff6a00', shadowOpacity: 0.5, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  ctaText: { color: '#0a0a0a', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
});
