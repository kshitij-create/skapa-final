import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import ViewShot, { captureRef } from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '../theme';

interface ShareProfileCardProps {
  visible: boolean;
  onClose: () => void;
  user: {
    name: string;
    handle: string;
    avatarUrl: string;
    vibe: { emoji: string; label: string };
    currentTrack: { title: string; artist: string; cover: string };
    profileUrl: string; // encoded into QR
  };
}

const MOOD_GRADIENTS: Record<string, [string, string, string]> = {
  'Late Night':   ['#2a0f4d', '#3d1566', '#0a0418'],
  'Focus':        ['#003b4d', '#006073', '#00151c'],
  'High Energy':  ['#4d1800', '#802a00', '#1a0800'],
  'Chill':        ['#003d5c', '#005c80', '#001420'],
  'Sad Hours':    ['#1e2a3d', '#2a3b52', '#0a101a'],
  'Hype':         ['#4d2300', '#803500', '#1a0a00'],
  'Melancholy':   ['#1a1f2e', '#2a3040', '#0a0c14'],
  'Indie':        ['#3d1a4d', '#5c2966', '#140a1a'],
};

export const ShareProfileCard: React.FC<ShareProfileCardProps> = ({
  visible,
  onClose,
  user,
}) => {
  const posterRef = useRef<View>(null);
  const [busy, setBusy] = useState<'share' | 'save' | null>(null);

  const gradient = MOOD_GRADIENTS[user.vibe.label] || ['#2a1a10', '#1a0e08', '#0a0606'];

  const capture = async () => {
    if (!posterRef.current) throw new Error('Card not ready');
    // Slight delay lets reanimated finish any in-flight layout
    await new Promise(r => setTimeout(r, 80));
    const uri = await captureRef(posterRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    return uri;
  };

  const handleShare = async () => {
    try {
      setBusy('share');
      const uri = await capture();
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing unavailable', 'Your device does not support sharing.');
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your vibe',
        UTI: 'public.png',
      });
    } catch (e: any) {
      Alert.alert('Share failed', e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const handleSave = async () => {
    try {
      setBusy('save');
      const uri = await capture();
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to save your card.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Saved', 'Your vibe card is in Photos.');
    } catch (e: any) {
      Alert.alert('Save failed', e?.message ?? 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.backdropFill} />

        {/* Close */}
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.8}
          style={styles.closeBtn}
          data-testid="share-card-close-btn"
        >
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.topTitle}>Your vibe, ready to share</Text>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── POSTER (captured) ── */}
          <Animated.View entering={FadeInUp.springify().damping(14)}>
            <ViewShot
              ref={posterRef as any}
              options={{ format: 'png', quality: 1 }}
              style={styles.posterShadow}
            >
              <View style={styles.poster} collapsable={false}>
                {/* Gradient bg */}
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                {/* Decorative blobs */}
                <View style={[styles.blob, styles.blob1, { backgroundColor: gradient[1] }]} />
                <View style={[styles.blob, styles.blob2, { backgroundColor: gradient[0] }]} />
                {/* Grid lines */}
                {Array.from({ length: 10 }).map((_, i) => (
                  <View
                    key={`pg${i}`}
                    style={[styles.posterGrid, { top: `${(i + 1) * 9}%` as any }]}
                  />
                ))}

                {/* Top row */}
                <View style={styles.posterHeader}>
                  <View style={styles.wordmarkWrap}>
                    <Text style={styles.wordmark}>SKAPA</Text>
                    <View style={styles.wordmarkDot} />
                  </View>
                  <Text style={styles.posterEyebrow}>MY VIBE · NOW</Text>
                </View>

                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark, '#8A2BE2']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.avatarRing}
                  >
                    <View style={styles.avatarInner}>
                      <Image source={{ uri: user.avatarUrl }} style={styles.avatarImg} />
                    </View>
                  </LinearGradient>
                  <View style={styles.moodEmojiBadge}>
                    <Text style={styles.moodEmojiText}>{user.vibe.emoji}</Text>
                  </View>
                </View>

                {/* Identity */}
                <Text style={styles.posterName}>{user.name}</Text>
                <Text style={styles.posterHandle}>{user.handle}</Text>

                {/* Big vibe pill */}
                <View style={styles.vibePillBig}>
                  <Text style={styles.vibePillEmoji}>{user.vibe.emoji}</Text>
                  <View>
                    <Text style={styles.vibePillLabel}>CURRENT VIBE</Text>
                    <Text style={styles.vibePillText}>{user.vibe.label}</Text>
                  </View>
                </View>

                {/* Now-playing */}
                <View style={styles.nowPlayingWrap}>
                  <View style={styles.nowPlayingInner}>
                    <Image
                      source={{ uri: user.currentTrack.cover }}
                      style={styles.nowCover}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={styles.nowLiveRow}>
                        <View style={styles.nowLiveDot} />
                        <Text style={styles.nowLiveText}>LISTENING NOW</Text>
                      </View>
                      <Text style={styles.nowTitle} numberOfLines={1}>
                        {user.currentTrack.title}
                      </Text>
                      <Text style={styles.nowArtist} numberOfLines={1}>
                        {user.currentTrack.artist}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom QR + URL */}
                <View style={styles.posterFooter}>
                  <View style={styles.qrCardWrap}>
                    <View style={styles.qrCard}>
                      <QRCode
                        value={user.profileUrl}
                        size={80}
                        color="#0a0a0a"
                        backgroundColor="#fff"
                      />
                    </View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.footerEyebrow}>SCAN TO FOLLOW</Text>
                    <Text style={styles.footerUrl} numberOfLines={1}>
                      {user.profileUrl.replace(/^https?:\/\//, '')}
                    </Text>
                    <Text style={styles.footerTagline}>
                      Music feels better together.
                    </Text>
                  </View>
                </View>
              </View>
            </ViewShot>
          </Animated.View>
        </ScrollView>

        {/* Action bar */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.actionBar}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionBtn, styles.actionBtnGhost]}
            onPress={handleSave}
            disabled={busy !== null}
            data-testid="share-card-save-btn"
          >
            {busy === 'save' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={17} color="#fff" />
                <Text style={styles.actionBtnGhostText}>Save</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.actionBtnPrimary}
            onPress={handleShare}
            disabled={busy !== null}
            data-testid="share-card-share-btn"
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            {busy === 'share' ? (
              <ActivityIndicator size="small" color="#1a0f00" />
            ) : (
              <>
                <Ionicons name="share-social" size={17} color="#1a0f00" />
                <Text style={styles.actionBtnPrimaryText}>
                  Share to Stories
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.hint}>
          {Platform.OS === 'ios'
            ? 'Choose Instagram from the share sheet to post to Stories'
            : 'Pick Instagram from the share sheet to post'}
        </Text>
      </View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const POSTER_W = 320;
const POSTER_H = POSTER_W * (16 / 9); // 9:16 ratio for IG stories

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  backdropFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.88)',
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 30,
  },
  topTitle: {
    fontSize: 15, fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: -0.2,
    marginTop: 4, marginBottom: 18,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 12,
  },

  // Poster capture
  posterShadow: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.55,
    shadowRadius: 30,
    elevation: 24,
  },
  poster: {
    width: POSTER_W,
    height: POSTER_H,
    borderRadius: 28,
    overflow: 'hidden',
    padding: 22,
    backgroundColor: '#0a0606',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  blob1: { width: 280, height: 280, top: -100, right: -100, transform: [{ scale: 1.2 }] },
  blob2: { width: 240, height: 240, bottom: -80, left: -80, opacity: 0.3 },
  posterGrid: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  posterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordmarkWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  wordmark: {
    fontSize: 18, fontWeight: '800', color: '#fff',
    letterSpacing: 3,
  },
  wordmarkDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  posterEyebrow: {
    fontSize: 9, fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
  },

  avatarWrap: {
    alignSelf: 'center',
    marginTop: 40,
    width: 120, height: 120,
  },
  avatarRing: {
    width: 120, height: 120, borderRadius: 60,
    padding: 3,
  },
  avatarInner: {
    flex: 1, borderRadius: 58,
    backgroundColor: '#0a0606',
    padding: 3,
  },
  avatarImg: { flex: 1, borderRadius: 55 },
  moodEmojiBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#0a0606',
    borderWidth: 2, borderColor: '#0a0606',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.8, shadowRadius: 10,
  },
  moodEmojiText: { fontSize: 20, lineHeight: 24 },

  posterName: {
    fontSize: 24, fontWeight: '700', color: '#fff',
    textAlign: 'center', marginTop: 20, letterSpacing: -0.5,
  },
  posterHandle: {
    fontSize: 12, color: 'rgba(255,255,255,0.5)',
    textAlign: 'center', marginTop: 4,
  },

  vibePillBig: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 24,
    paddingHorizontal: 16, paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  vibePillEmoji: { fontSize: 34, lineHeight: 40 },
  vibePillLabel: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
  },
  vibePillText: {
    fontSize: 18, fontWeight: '700', color: '#fff',
    letterSpacing: -0.3, marginTop: 2,
  },

  // Now playing
  nowPlayingWrap: {
    marginTop: 14,
    borderRadius: 18,
    padding: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  nowPlayingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 17,
    backgroundColor: 'rgba(5,5,10,0.55)',
    padding: 10,
  },
  nowCover: {
    width: 48, height: 48, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  nowLiveRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  nowLiveDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#22c55e' },
  nowLiveText: { fontSize: 8, fontWeight: '700', letterSpacing: 1.2, color: 'rgba(255,255,255,0.7)' },
  nowTitle: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  nowArtist: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },

  // Footer / QR
  posterFooter: {
    position: 'absolute',
    left: 22, right: 22, bottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(5,5,10,0.5)',
    borderRadius: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    padding: 12,
  },
  qrCardWrap: {
    padding: 2, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  qrCard: {
    padding: 6, borderRadius: 10,
    backgroundColor: '#fff',
  },
  footerEyebrow: {
    fontSize: 9, fontWeight: '700', letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.55)',
  },
  footerUrl: {
    fontSize: 13, fontWeight: '700', color: '#fff',
    marginTop: 3, letterSpacing: -0.2,
  },
  footerTagline: {
    fontSize: 10, color: 'rgba(255,255,255,0.5)',
    marginTop: 6, fontStyle: 'italic',
  },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: 10,
    width: POSTER_W + 12,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 7,
    overflow: 'hidden',
  },
  actionBtnGhost: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  actionBtnGhostText: { fontSize: 14, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  actionBtnPrimary: {
    flex: 1.6,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: 7,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 10,
  },
  actionBtnPrimaryText: {
    fontSize: 14, fontWeight: '700', color: '#1a0f00', letterSpacing: -0.2,
  },
  hint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 30,
  },
});
