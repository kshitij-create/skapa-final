/**
 * DropVibeModal — Compose a "drop": track + mood + caption → POST /api/drops.
 *
 * Three-step inline flow in a single modal:
 *   1. Pick a track (curated list for MVP — no Spotify search)
 *   2. Pick a mood
 *   3. Optional caption → Drop
 */
import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  SlideInDown,
} from 'react-native-reanimated';

import { COLORS } from '../theme';
import { publicFetch } from '../state/publicApi';
import { getVibe, VIBES } from '../state/localStore';

const CURATED_TRACKS = [
  { id: 't1', title: '505', artist: 'Arctic Monkeys',          cover: 'https://i.scdn.co/image/ab67616d00001e0264acfdc3f8b03565a1b3d0c1' },
  { id: 't2', title: 'After Hours', artist: 'The Weeknd',      cover: 'https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36' },
  { id: 't3', title: 'Apocalypse', artist: 'Cigarettes After Sex', cover: 'https://i.scdn.co/image/ab67616d00001e02a17c2bf68e2b3d9a63e67fcd' },
  { id: 't4', title: 'Pink + White', artist: 'Frank Ocean',    cover: 'https://i.scdn.co/image/ab67616d00001e02c5649add07ed3720be9d5526' },
  { id: 't5', title: 'Starboy', artist: 'The Weeknd',          cover: 'https://i.scdn.co/image/ab67616d00001e024718e2b124f79258be7bc452' },
  { id: 't6', title: 'Nights', artist: 'Frank Ocean',          cover: 'https://i.scdn.co/image/ab67616d00001e02c5649add07ed3720be9d5526' },
  { id: 't7', title: 'Comptine', artist: 'Yann Tiersen',       cover: 'https://i.scdn.co/image/ab67616d00001e02bf3ac3df9d4f98da0db5a8cb' },
  { id: 't8', title: 'Runaway', artist: 'Kanye West',          cover: 'https://i.scdn.co/image/ab67616d00001e02adc3f06c6965c2c4fe5aba0e' },
];

const MOOD_COLORS: Record<string, string> = {
  'latenight': '#8A2BE2',
  'highenergy': '#f97316',
  'focus': '#00E5FF',
  'chill': '#0ea5e9',
  'sadhours': '#64748b',
  'indie': '#ec4899',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onDropped?: () => void;
}

type Track = typeof CURATED_TRACKS[number];

export const DropVibeModal: React.FC<Props> = ({ visible, onClose, onDropped }) => {
  const [track, setTrack] = useState<Track | null>(null);
  const [moodId, setMoodId] = useState<string>('latenight');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Hydrate mood from AsyncStorage the first time modal opens
  React.useEffect(() => {
    if (visible) {
      getVibe().then(v => {
        if (v?.id) setMoodId(v.id);
      });
    } else {
      setTrack(null);
      setCaption('');
      setSubmitting(false);
    }
  }, [visible]);

  const mood = useMemo(() => VIBES.find(m => m.id === moodId) ?? VIBES[0], [moodId]);
  const color = MOOD_COLORS[moodId] || '#ff8a00';

  const handleSubmit = async () => {
    if (!track) return;
    setSubmitting(true);
    try {
      await publicFetch('/api/drops', {
        method: 'POST',
        body: JSON.stringify({
          track: {
            title: track.title,
            artist: track.artist,
            cover: track.cover,
            spotify_id: track.id,
          },
          mood_emoji: mood.emoji,
          mood_label: mood.label,
          caption: caption.trim() || null,
          color,
          user_name: 'You',
          user_avatar: 'https://i.pravatar.cc/300?u=user1',
          user_handle: 'you',
        }),
      });
      onDropped?.();
      onClose();
    } catch (e: any) {
      Alert.alert('Could not drop', e?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={FadeIn.duration(180)} style={StyleSheet.absoluteFill}>
          <View style={styles.backdropFill} />
        </Animated.View>

        <Pressable onPress={e => e.stopPropagation()} style={{ width: '100%' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Animated.View
              entering={SlideInDown.springify().damping(16)}
              style={styles.sheet}
            >
              <LinearGradient
                colors={[`${color}22`, '#0a0a10', '#06060a']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.eyebrow}>DROP A VIBE</Text>
                  <Text style={styles.title}>What are you feeling?</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Step 1: Track */}
              <Animated.View entering={FadeInDown.delay(80)} style={styles.section}>
                <Text style={styles.sectionLabel}>1 · Pick a track</Text>
                <FlatList
                  data={CURATED_TRACKS}
                  keyExtractor={t => t.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
                  renderItem={({ item }) => {
                    const active = track?.id === item.id;
                    return (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setTrack(item)}
                        style={[styles.trackTile, active && { borderColor: color, borderWidth: 2 }]}
                      >
                        <Image source={{ uri: item.cover }} style={styles.trackCover} />
                        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.trackArtist} numberOfLines={1}>{item.artist}</Text>
                        {active && (
                          <View style={[styles.checkDot, { backgroundColor: color }]}>
                            <Ionicons name="checkmark" size={12} color="#0a0a0a" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </Animated.View>

              {/* Step 2: Mood */}
              <Animated.View entering={FadeInDown.delay(140)} style={styles.section}>
                <Text style={styles.sectionLabel}>2 · Your mood</Text>
                <View style={styles.moodRow}>
                  {VIBES.map(m => {
                    const active = m.id === moodId;
                    const c = MOOD_COLORS[m.id];
                    return (
                      <TouchableOpacity
                        key={m.id}
                        activeOpacity={0.85}
                        onPress={() => setMoodId(m.id)}
                        style={[
                          styles.moodPill,
                          active && {
                            borderColor: c,
                            backgroundColor: `${c}22`,
                          },
                        ]}
                      >
                        <Text style={styles.moodEmoji}>{m.emoji}</Text>
                        <Text style={[styles.moodLabel, active && { color: '#fff' }]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>

              {/* Step 3: Caption */}
              <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
                <Text style={styles.sectionLabel}>3 · Caption (optional)</Text>
                <TextInput
                  value={caption}
                  onChangeText={setCaption}
                  placeholder="on repeat all night…"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  style={styles.input}
                  maxLength={180}
                />
                <Text style={styles.counter}>{caption.length}/180</Text>
              </Animated.View>

              {/* CTA */}
              <Animated.View entering={FadeInUp.delay(260)}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  activeOpacity={0.9}
                  disabled={!track || submitting}
                  style={[styles.cta, (!track || submitting) && { opacity: 0.4 }]}
                >
                  <LinearGradient
                    colors={[color, '#ff6a00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {submitting ? (
                    <ActivityIndicator color="#0a0a0a" />
                  ) : (
                    <>
                      <Ionicons name="radio-outline" size={18} color="#0a0a0a" />
                      <Text style={styles.ctaText}>
                        {track ? 'Drop it' : 'Pick a track first'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  sheet: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 34,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center', marginBottom: 14,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 18,
  },
  eyebrow: {
    color: 'rgba(255,174,69,0.8)',
    fontSize: 10, fontWeight: '700', letterSpacing: 2.2,
  },
  title: {
    color: '#fff', fontSize: 22, fontWeight: '700',
    letterSpacing: -0.4, marginTop: 4,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  section: { marginBottom: 20 },
  sectionLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11, fontWeight: '700', letterSpacing: 1.6,
    marginBottom: 10, textTransform: 'uppercase',
  },

  // Track tile
  trackTile: {
    width: 108,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    padding: 8,
  },
  trackCover: {
    width: 92, height: 92, borderRadius: 10, marginBottom: 8,
  },
  trackTitle: {
    color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: -0.2,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 1,
  },
  checkDot: {
    position: 'absolute', top: 12, right: 12,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  // Mood
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  moodEmoji: { fontSize: 15, lineHeight: 18 },
  moodLabel: {
    color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Input
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    color: '#fff', fontSize: 14, letterSpacing: -0.1,
  },
  counter: {
    color: 'rgba(255,255,255,0.3)', fontSize: 11,
    alignSelf: 'flex-end', marginTop: 6,
  },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 54, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#ff6a00', shadowOpacity: 0.6, shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }, elevation: 10,
  },
  ctaText: {
    color: '#0a0a0a', fontSize: 15, fontWeight: '700', letterSpacing: -0.2,
  },
});
