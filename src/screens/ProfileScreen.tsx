import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { COLORS } from '../theme';
import { Waveform } from '../components/Waveform';
import { ShareProfileCard } from '../components/ShareProfileCard';
import { ChooseVibeModal } from '../components/ChooseVibeModal';
import { useAuth } from '../auth/AuthContext';
import { apiFetch } from '../auth/api';
import { getVibe, Vibe } from '../state/localStore';

// ─── Fallback data ───────────────────────────────────────────────────────────
const FALLBACK_COVER = 'https://i.scdn.co/image/ab67616d00001e028863bc11d2aa12b54f5aeb36';

const RECENT_ROOMS = [
  { id: 'r1', name: 'Night Drives', meta: '18 joined · 2h ago', emoji: '🌊', hue: '#8A2BE2' },
  { id: 'r2', name: 'Lo-Fi Study', meta: '34 joined · Yesterday', emoji: '🔮', hue: '#00E5FF' },
  { id: 'r3', name: 'Sunday Melancholy', meta: '12 joined · 3d ago', emoji: '💔', hue: '#64748b' },
];

const FRIENDS_PREVIEW = [
  'https://i.pravatar.cc/100?img=11',
  'https://i.pravatar.cc/100?img=5',
  'https://i.pravatar.cc/100?img=8',
  'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=9',
];

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  popularity?: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  image: string | null;
}

// ─── Components ───────────────────────────────────────────────────────────────
const StatPill: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.statPill}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabelText}>{label}</Text>
  </View>
);

const SectionHeader: React.FC<{ title: string; action?: string }> = ({ title, action = 'See all' }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <TouchableOpacity>
      <Text style={styles.sectionAction}>{action}</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const [shareOpen, setShareOpen] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [localVibe, setLocalVibe] = useState<Vibe | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [nowPlaying, setNowPlaying] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    getVibe().then(v => v && setLocalVibe(v));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [t, a, np] = await Promise.all([
          apiFetch<{ tracks: SpotifyTrack[] }>('/api/me/top-tracks?limit=6').catch(() => ({ tracks: [] })),
          apiFetch<{ artists: SpotifyArtist[] }>('/api/me/top-artists?limit=8').catch(() => ({ artists: [] })),
          apiFetch<{ is_playing: boolean; track: SpotifyTrack | null }>('/api/me/now-playing').catch(() => ({ is_playing: false, track: null })),
        ]);
        setTopTracks(t.tracks || []);
        setTopArtists(a.artists || []);
        setNowPlaying(np.track || null);
      } catch { /* ignore */ }
    })();
  }, []);

  if (!user) return null;

  const displayName = user.display_name || 'Listener';
  const handle = user.handle ? `@${user.handle}` : '';
  const avatarUrl = user.avatar_url || `https://i.pravatar.cc/300?u=${user.id}`;
  const bio = user.profile?.bio || 'Tap Edit Profile to add a bio';
  // Prefer locally-stored vibe (set via ChooseVibe / modal) over server default
  const vibe = localVibe
    ? { emoji: localVibe.emoji, label: localVibe.label }
    : user.vibe || { emoji: '🌊', label: 'Late Night' };
  const stats = {
    following: user.stats?.following ?? 0,
    followers: user.stats?.followers ?? 0,
    streak: user.stats?.streak_days ?? 1,
  };
  const profileUrl = `https://skapa.app/u/${user.profile?.share_slug || user.handle || user.id}`;
  const currentTrack = nowPlaying
    ? { title: nowPlaying.title, artist: nowPlaying.artist, cover: nowPlaying.cover || FALLBACK_COVER }
    : { title: 'Nothing playing', artist: 'Open Spotify to vibe', cover: FALLBACK_COVER };

  const handleLogout = () => {
    Alert.alert('Log out?', 'You can sign back in with Spotify anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Share modal */}
      <ShareProfileCard
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        user={{
          name: displayName,
          handle,
          avatarUrl,
          vibe,
          currentTrack,
          profileUrl,
        }}
      />

      {/* Vibe picker modal */}
      <ChooseVibeModal
        visible={vibeOpen}
        onClose={() => setVibeOpen(false)}
        onSaved={v => setLocalVibe(v)}
      />

      {/* Header action bar */}
      <View style={[styles.topActions, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.actionIcon}
          onPress={() => setShareOpen(true)}
        >
          <Ionicons name="share-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.actionIcon}>
          <Ionicons name="settings-outline" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
        bounces
      >
        {/* ── Gradient cover header ── */}
        <View style={styles.coverWrap}>
          <LinearGradient
            colors={['#2a1a10', '#1a0e08', '#0a0606']}
            style={StyleSheet.absoluteFillObject}
          />
          {/* soft color wash from avatar mood */}
          <View style={styles.coverBlob1} />
          <View style={styles.coverBlob2} />
          {/* grid lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={`c${i}`}
              style={[styles.coverGridLine, { top: `${(i + 1) * 15}%` as any }]}
            />
          ))}
          <LinearGradient
            colors={['transparent', 'rgba(5,5,5,0.9)', '#050505']}
            style={styles.coverFade}
          />
        </View>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          {/* Avatar with ring */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.avatarOuter}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark, '#8A2BE2']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.avatarRing}
            >
              <View style={styles.avatarInner}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              </View>
            </LinearGradient>
            <View style={styles.avatarMoodBadge}>
              <Text style={styles.avatarMoodEmoji}>{vibe.emoji}</Text>
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInDown.delay(200).springify()} style={styles.name}>
            {displayName}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(260).springify()} style={styles.handle}>
            {handle}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(320).springify()} style={styles.bio}>
            {bio}
          </Animated.Text>

          {/* Action buttons */}
          <Animated.View entering={FadeInUp.delay(380).springify()} style={styles.actionRow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.primaryBtn}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="create-outline" size={15} color="#1a0f00" />
              <Text style={styles.primaryBtnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.secondaryBtn}
              onPress={() => setShareOpen(true)}
            >
              <Ionicons name="share-social-outline" size={15} color="#fff" />
              <Text style={styles.secondaryBtnText}>Share</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Stats row */}
          <Animated.View entering={FadeInUp.delay(440).springify()} style={styles.statsRow}>
            <StatPill value={stats.following.toLocaleString()} label="Following" />
            <View style={styles.statDivider} />
            <StatPill value={stats.followers.toLocaleString()} label="Followers" />
            <View style={styles.statDivider} />
            <StatPill value={`${stats.streak} 🔥`} label="Day streak" />
          </Animated.View>
        </View>

        {/* ── Now Playing Card ── */}
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.sectionGap}>
          <TouchableOpacity activeOpacity={0.9} style={styles.nowPlayingCard}>
            <LinearGradient
              colors={['rgba(138,43,226,0.22)', 'rgba(24,12,40,0.95)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.nowPlayingRow}>
              <View style={styles.nowPlayingCoverWrap}>
                <Image
                  source={{ uri: currentTrack.cover }}
                  style={styles.nowPlayingCover}
                />
                <View style={styles.nowPlayingWaveWrap}>
                  <Waveform colorStart="#fff" colorEnd="#fff" />
                </View>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <View style={styles.nowPlayingLabelRow}>
                  <View style={[styles.pulseDot, { backgroundColor: nowPlaying ? '#22c55e' : '#64748b' }]} />
                  <Text style={styles.nowPlayingLabel}>{nowPlaying ? 'VIBING NOW' : 'NOT PLAYING'}</Text>
                </View>
                <Text style={styles.nowPlayingTitle} numberOfLines={1}>{currentTrack.title}</Text>
                <Text style={styles.nowPlayingArtist} numberOfLines={1}>{currentTrack.artist}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setVibeOpen(true)}
                  style={styles.vibeChip}
                >
                  <Text style={styles.vibeChipText}>
                    {vibe.emoji}  {vibe.label}  <Text style={{ color: 'rgba(216,180,254,0.6)' }}>tap to change</Text>
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Your Week (analytics) ── */}
        <View style={styles.sectionGap}>
          <SectionHeader title="Your Week" action="Details" />
          <View style={styles.analyticsRow}>
            <View style={[styles.analyticsCard, styles.analyticsPrimary]}>
              <LinearGradient
                colors={['rgba(255,138,0,0.15)', 'rgba(255,138,0,0.02)']}
                style={StyleSheet.absoluteFillObject}
              />
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.analyticsValue}>—</Text>
              <Text style={styles.analyticsLabel}>Listened</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Ionicons name="musical-notes-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.analyticsValue}>
                {topArtists[0]?.name || '—'}
              </Text>
              <Text style={styles.analyticsLabel}>Top artist</Text>
            </View>
            <View style={styles.analyticsCard}>
              <Ionicons name="flash-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.analyticsValue}>{stats.streak}d</Text>
              <Text style={styles.analyticsLabel}>Streak</Text>
            </View>
          </View>
        </View>

        {/* ── Top Tracks ── */}
        {topTracks.length > 0 && (
          <View style={styles.sectionGap}>
            <SectionHeader title="Top Tracks · This Month" />
            {topTracks.map((t, i) => (
              <TouchableOpacity key={t.id} activeOpacity={0.7} style={styles.trackRow}>
                <Text style={styles.trackIndex}>{String(i + 1).padStart(2, '0')}</Text>
                <Image
                  source={{ uri: t.cover || FALLBACK_COVER }}
                  style={styles.trackCover}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackTitle} numberOfLines={1}>{t.title}</Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>{t.artist}</Text>
                </View>
                {typeof t.popularity === 'number' && (
                  <View style={styles.trackMeta}>
                    <Text style={styles.trackPlays}>{t.popularity}</Text>
                    <Text style={styles.trackPlaysLabel}>score</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.trackMoreBtn}>
                  <Ionicons name="ellipsis-horizontal" size={16} color="rgba(255,255,255,0.45)" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Top Artists (carousel) ── */}
        {topArtists.length > 0 && (
          <View style={styles.sectionGap}>
            <SectionHeader title="Top Artists" />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 0, gap: 14 }}
            >
              {topArtists.map(a => (
                <TouchableOpacity key={a.id} activeOpacity={0.85} style={styles.artistCard}>
                  <Image
                    source={{ uri: a.image || FALLBACK_COVER }}
                    style={styles.artistImg}
                  />
                  <Text style={styles.artistName} numberOfLines={1}>{a.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Friends preview ── */}
        <View style={styles.sectionGap}>
          <SectionHeader title="Friends" action={`${FRIENDS_PREVIEW.length}+ · See all`} />
          <View style={styles.friendsRow}>
            <View style={styles.friendsAvatarStack}>
              {FRIENDS_PREVIEW.map((url, i) => (
                <Image
                  key={url}
                  source={{ uri: url }}
                  style={[
                    styles.friendsAvatar,
                    { marginLeft: i === 0 ? 0 : -12, zIndex: FRIENDS_PREVIEW.length - i },
                  ]}
                />
              ))}
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.friendsText}>
                <Text style={styles.friendsTextStrong}>Arnav</Text>,{' '}
                <Text style={styles.friendsTextStrong}>Elena</Text> and 3 others
              </Text>
              <Text style={styles.friendsSubtext}>share your late-night vibe</Text>
            </View>
            <TouchableOpacity activeOpacity={0.85} style={styles.friendsInviteBtn}>
              <Ionicons name="person-add-outline" size={13} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recent Rooms ── */}
        <View style={styles.sectionGap}>
          <SectionHeader title="Recent Rooms" />
          {RECENT_ROOMS.map(r => (
            <TouchableOpacity key={r.id} activeOpacity={0.75} style={styles.roomRow}>
              <LinearGradient
                colors={[`${r.hue}30`, `${r.hue}08`]}
                style={styles.roomIcon}
              >
                <Text style={{ fontSize: 20 }}>{r.emoji}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomRowName}>{r.name}</Text>
                <Text style={styles.roomRowMeta}>{r.meta}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.35)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Settings shortcuts ── */}
        <View style={styles.sectionGap}>
          <SectionHeader title="Account" action="" />
          <View style={styles.settingsGroup}>
            {[
              { icon: 'person-outline', label: 'Personal info' },
              { icon: 'notifications-outline', label: 'Notifications' },
              { icon: 'lock-closed-outline', label: 'Privacy & Safety' },
              { icon: 'moon-outline', label: 'Appearance' },
              { icon: 'help-circle-outline', label: 'Help & Support' },
            ].map((row, i, arr) => (
              <TouchableOpacity
                key={row.label}
                activeOpacity={0.7}
                style={[styles.settingsRow, i !== arr.length - 1 && styles.settingsRowBorder]}
              >
                <View style={styles.settingsIcon}>
                  <Ionicons name={row.icon as any} size={17} color="rgba(255,255,255,0.75)" />
                </View>
                <Text style={styles.settingsLabel}>{row.label}</Text>
                <Ionicons name="chevron-forward" size={15} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color={COLORS.danger} />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>SKAPA · v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050505' },

  topActions: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30,
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: 20, gap: 10,
  },
  actionIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Cover
  coverWrap: {
    height: 280,
    overflow: 'hidden',
    position: 'relative',
  },
  coverBlob1: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: '#8A2BE2', opacity: 0.25,
    top: -60, left: -60, transform: [{ scale: 1.6 }],
  },
  coverBlob2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: COLORS.accent, opacity: 0.22,
    top: 60, right: -40, transform: [{ scale: 1.5 }],
  },
  coverGridLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  coverFade: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginTop: -90,
    paddingHorizontal: 24,
  },
  avatarOuter: {
    width: 124, height: 124,
    borderRadius: 62,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 20,
  },
  avatarRing: {
    width: 124, height: 124, borderRadius: 62,
    alignItems: 'center', justifyContent: 'center', padding: 3,
  },
  avatarInner: {
    width: '100%', height: '100%', borderRadius: 60,
    backgroundColor: '#050505',
    padding: 3,
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: 58 },
  avatarMoodBadge: {
    position: 'absolute', bottom: 4, right: 2,
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#110808',
    borderWidth: 2, borderColor: '#050505',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.accent, shadowOpacity: 0.5, shadowRadius: 10, elevation: 4,
  },
  avatarMoodEmoji: { fontSize: 16, lineHeight: 20 },
  name: {
    fontSize: 26, fontWeight: '700', color: '#fff',
    letterSpacing: -0.6, marginTop: 16,
  },
  handle: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    marginTop: 2, letterSpacing: -0.1,
  },
  bio: {
    fontSize: 13, color: 'rgba(255,255,255,0.7)',
    textAlign: 'center', marginTop: 12, lineHeight: 20,
    paddingHorizontal: 20, letterSpacing: -0.1,
  },

  // Action row
  actionRow: {
    flexDirection: 'row', gap: 10, marginTop: 20, width: '100%',
  },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12, borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primaryDark, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 8,
  },
  primaryBtnText: { fontSize: 13, fontWeight: '700', color: '#1a0f00', letterSpacing: -0.2 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryBtnText: { fontSize: 13, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 22, backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 14, width: '100%',
  },
  statPill: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.4 },
  statLabelText: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: '600' },
  statDivider: { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.08)' },

  // Sections
  sectionGap: { marginTop: 28, paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  sectionAction: { fontSize: 12, color: 'rgba(255,138,0,0.85)', fontWeight: '600' },

  // Now playing
  nowPlayingCard: {
    borderRadius: 24, padding: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(138,43,226,0.25)',
  },
  nowPlayingRow: { flexDirection: 'row', alignItems: 'center' },
  nowPlayingCoverWrap: { position: 'relative' },
  nowPlayingCover: {
    width: 68, height: 68, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  nowPlayingWaveWrap: {
    position: 'absolute', bottom: -2, right: -6,
    backgroundColor: '#0a0612', padding: 5, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  nowPlayingLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e' },
  nowPlayingLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, color: 'rgba(255,255,255,0.6)' },
  nowPlayingTitle: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.3 },
  nowPlayingArtist: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  vibeChip: {
    alignSelf: 'flex-start', marginTop: 10,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99,
    backgroundColor: 'rgba(138,43,226,0.18)',
    borderWidth: 1, borderColor: 'rgba(138,43,226,0.35)',
  },
  vibeChipText: { color: '#d8b4fe', fontSize: 11, fontWeight: '600' },

  // Analytics
  analyticsRow: { flexDirection: 'row', gap: 10 },
  analyticsCard: {
    flex: 1, paddingVertical: 14, paddingHorizontal: 12,
    borderRadius: 18, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  analyticsPrimary: { borderColor: 'rgba(255,138,0,0.25)' },
  analyticsValue: {
    fontSize: 20, fontWeight: '700', color: '#fff',
    marginTop: 8, letterSpacing: -0.5,
  },
  analyticsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

  // Tracks
  trackRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, gap: 12,
  },
  trackIndex: {
    fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.3)',
    width: 22, letterSpacing: 0.5,
  },
  trackCover: {
    width: 46, height: 46, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  trackTitle: { fontSize: 14, fontWeight: '600', color: '#fff', letterSpacing: -0.2 },
  trackArtist: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  trackMeta: { alignItems: 'flex-end', marginRight: 4 },
  trackPlays: { fontSize: 13, fontWeight: '700', color: COLORS.primary, letterSpacing: -0.2 },
  trackPlaysLabel: { fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, textTransform: 'uppercase' },
  trackMoreBtn: { padding: 4 },

  // Artists
  artistCard: {
    width: 92, alignItems: 'center',
  },
  artistImg: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 10,
  },
  artistName: {
    fontSize: 12, fontWeight: '600', color: '#fff',
    textAlign: 'center', letterSpacing: -0.2,
  },

  // Friends
  friendsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, padding: 14,
  },
  friendsAvatarStack: { flexDirection: 'row' },
  friendsAvatar: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, borderColor: '#0a0a0a',
  },
  friendsText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.1 },
  friendsTextStrong: { color: '#fff', fontWeight: '600' },
  friendsSubtext: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  friendsInviteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },

  // Rooms
  roomRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16, padding: 12, marginBottom: 10, gap: 12,
  },
  roomIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  roomRowName: { fontSize: 14, fontWeight: '600', color: '#fff' },
  roomRowMeta: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 },

  // Settings
  settingsGroup: {
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18, overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14, gap: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingsIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '500', letterSpacing: -0.2 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: 14,
    borderRadius: 14, backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.18)',
  },
  logoutText: { fontSize: 13, fontWeight: '600', color: COLORS.danger, letterSpacing: -0.2 },

  versionText: {
    textAlign: 'center', marginTop: 20,
    fontSize: 11, color: 'rgba(255,255,255,0.25)',
    letterSpacing: 2,
  },
});
