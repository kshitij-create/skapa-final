import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_FRIENDS, MOCK_FRIEND_REQUESTS, MOCK_SUGGESTED_FRIENDS, friendActions, type Friend, type FriendRequest } from '../state/friendsData';

type TabType = 'listening' | 'friends' | 'requests' | 'discover';

export const FriendsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('listening');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends] = useState(MOCK_FRIENDS);
  const [requests, setRequests] = useState(MOCK_FRIEND_REQUESTS);
  const [suggested] = useState(MOCK_SUGGESTED_FRIENDS);

  const onlineFriends = friends.filter(f => f.isOnline);
  const listeningFriends = onlineFriends.filter(f => f.currentTrack);

  const handleAcceptRequest = (req: FriendRequest) => {
    friendActions.acceptRequest(req.id);
    setRequests(requests.filter(r => r.id !== req.id));
  };

  const handleRejectRequest = (req: FriendRequest) => {
    friendActions.rejectRequest(req.id);
    setRequests(requests.filter(r => r.id !== req.id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <LinearGradient
          colors={['rgba(5,5,10,0.98)', 'rgba(5,5,10,0.0)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Friends</Text>
            <Text style={styles.headerSubtitle}>
              {listeningFriends.length} friends listening now
            </Text>
          </View>
          <TouchableOpacity style={styles.searchIconBtn}>
            <Ionicons name="search" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Live Activity Banner */}
        {listeningFriends.length > 0 && (
          <View style={styles.liveActivityBanner}>
            <LinearGradient
              colors={['rgba(255,174,69,0.15)', 'rgba(255,138,0,0.08)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.liveDot} />
            <Text style={styles.liveActivityText}>
              🎵 {listeningFriends[0].display_name} and {listeningFriends.length - 1} others are vibing right now
            </Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.6)" />
          </View>
        )}

        {/* Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsContainer}
          contentContainerStyle={styles.tabsContent}
        >
          <TabButton
            active={activeTab === 'listening'}
            onPress={() => setActiveTab('listening')}
            icon="musical-notes"
            label="Listening Now"
            badge={listeningFriends.length}
          />
          <TabButton
            active={activeTab === 'friends'}
            onPress={() => setActiveTab('friends')}
            icon="people"
            label="All Friends"
            badge={onlineFriends.length}
          />
          <TabButton
            active={activeTab === 'requests'}
            onPress={() => setActiveTab('requests')}
            icon="person-add"
            label="Requests"
            badge={requests.length > 0 ? requests.length : undefined}
            badgeColor="#ef4444"
          />
          <TabButton
            active={activeTab === 'discover'}
            onPress={() => setActiveTab('discover')}
            icon="sparkles"
            label="Discover"
          />
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {activeTab === 'listening' && (
          <ListeningNowTab friends={listeningFriends} />
        )}
        {activeTab === 'friends' && (
          <AllFriendsTab friends={friends} />
        )}
        {activeTab === 'requests' && (
          <RequestsTab
            requests={requests}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
          />
        )}
        {activeTab === 'discover' && (
          <DiscoverTab suggested={suggested} />
        )}
      </ScrollView>
    </View>
  );
};

// Tab Button Component
const TabButton: React.FC<{
  active: boolean;
  onPress: () => void;
  icon: any;
  label: string;
  badge?: number;
  badgeColor?: string;
}> = ({ active, onPress, icon, label, badge, badgeColor = '#ff8a00' }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
    activeOpacity={0.7}
  >
    {active && (
      <LinearGradient
        colors={['rgba(255,174,69,0.15)', 'rgba(255,138,0,0.08)']}
        style={StyleSheet.absoluteFillObject}
      />
    )}
    <View style={styles.tabIconWrapper}>
      <Ionicons
        name={icon}
        size={16}
        color={active ? '#ff8a00' : 'rgba(255,255,255,0.5)'}
      />
      {badge !== undefined && (
        <View style={[styles.tabBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.tabBadgeText}>{badge}</Text>
        </View>
      )}
    </View>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </TouchableOpacity>
);

// Listening Now Tab
const ListeningNowTab: React.FC<{ friends: Friend[] }> = ({ friends }) => (
  <View>
    {/* Quick Stats */}
    <View style={styles.quickStats}>
      <StatCard
        icon="headset"
        value={friends.length.toString()}
        label="Listening"
        color="#ff8a00"
      />
      <StatCard
        icon="flame"
        value="24h"
        label="Together"
        color="#ef4444"
      />
      <StatCard
        icon="musical-note"
        value="89%"
        label="Vibe Match"
        color="#8A2BE2"
      />
    </View>

    {/* Listening Activity Feed */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Live Activity</Text>
      <Text style={styles.sectionSubtitle}>What your friends are feeling right now</Text>
    </View>

    {friends.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyTitle}>No one's listening</Text>
        <Text style={styles.emptyText}>Your friends are taking a music break</Text>
      </View>
    ) : (
      friends.map((friend) => (
        <ListeningFriendCard key={friend.id} friend={friend} />
      ))
    )}
  </View>
);

// All Friends Tab
const AllFriendsTab: React.FC<{ friends: Friend[] }> = ({ friends }) => {
  const onlineFriends = friends.filter(f => f.isOnline);
  const offlineFriends = friends.filter(f => !f.isOnline);

  return (
    <View>
      {/* Friend Stats */}
      <View style={styles.friendsHeader}>
        <View>
          <Text style={styles.friendsCount}>{friends.length} Friends</Text>
          <Text style={styles.friendsOnline}>
            {onlineFriends.length} online • {offlineFriends.length} offline
          </Text>
        </View>
      </View>

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.onlineDot} />
              <Text style={styles.sectionTitle}>Online ({onlineFriends.length})</Text>
            </View>
          </View>
          {onlineFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Offline ({offlineFriends.length})</Text>
          </View>
          {offlineFriends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </>
      )}
    </View>
  );
};

// Requests Tab
const RequestsTab: React.FC<{
  requests: FriendRequest[];
  onAccept: (req: FriendRequest) => void;
  onReject: (req: FriendRequest) => void;
}> = ({ requests, onAccept, onReject }) => (
  <View>
    {requests.length === 0 ? (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>👋</Text>
        <Text style={styles.emptyTitle}>No pending requests</Text>
        <Text style={styles.emptyText}>You're all caught up!</Text>
      </View>
    ) : (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests ({requests.length})</Text>
          <Text style={styles.sectionSubtitle}>People want to vibe with you</Text>
        </View>
        {requests.map((req) => (
          <FriendRequestCard
            key={req.id}
            request={req}
            onAccept={() => onAccept(req)}
            onReject={() => onReject(req)}
          />
        ))}
      </>
    )}
  </View>
);

// Discover Tab
const DiscoverTab: React.FC<{ suggested: Friend[] }> = ({ suggested }) => (
  <View>
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Discover Friends</Text>
      <Text style={styles.sectionSubtitle}>People with similar music taste</Text>
    </View>

    {/* Sonic Match Banner */}
    <View style={styles.sonicMatchBanner}>
      <LinearGradient
        colors={['#8A2BE2', '#6019a8']}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={styles.sonicMatchTitle}>🧬 Sonic DNA Matching</Text>
      <Text style={styles.sonicMatchText}>
        Find your music soulmates based on listening patterns
      </Text>
    </View>

    {suggested.map((friend) => (
      <SuggestedFriendCard key={friend.id} friend={friend} />
    ))}
  </View>
);

// Component Cards
const ListeningFriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
  <TouchableOpacity style={styles.listeningCard} activeOpacity={0.9}>
    <View style={styles.listeningCardLeft}>
      <View style={styles.listeningAvatarWrapper}>
        <Image source={{ uri: friend.avatar_url }} style={styles.listeningAvatar} />
        <View style={[styles.statusDot, styles.statusOnline]} />
        {/* Animated pulse ring */}
        <View style={styles.pulseRing} />
      </View>
      
      <View style={styles.listeningInfo}>
        <Text style={styles.listeningName}>{friend.display_name}</Text>
        <Text style={styles.listeningHandle}>@{friend.handle}</Text>
        
        {friend.currentTrack && (
          <View style={styles.trackInfo}>
            <Ionicons name="musical-notes" size={12} color="#ff8a00" />
            <Text style={styles.trackName} numberOfLines={1}>
              {friend.currentTrack.title}
            </Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.listeningCardRight}>
      {friend.vibe && (
        <View style={styles.vibePill}>
          <Text style={styles.vibeEmoji}>{friend.vibe.emoji}</Text>
          <Text style={styles.vibeLabel}>{friend.vibe.label}</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.tuneInBtn}>
        <LinearGradient
          colors={['#ff8a00', '#ffae45']}
          style={StyleSheet.absoluteFillObject}
        />
        <Ionicons name="headset" size={14} color="#000" />
        <Text style={styles.tuneInText}>Tune In</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const FriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
  <TouchableOpacity style={styles.friendCard} activeOpacity={0.9}>
    <View style={styles.friendCardLeft}>
      <View style={styles.friendAvatarWrapper}>
        <Image source={{ uri: friend.avatar_url }} style={styles.friendAvatar} />
        <View style={[styles.statusDot, friend.isOnline ? styles.statusOnline : styles.statusOffline]} />
      </View>
      
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{friend.display_name}</Text>
        <Text style={styles.friendHandle}>@{friend.handle}</Text>
        
        {friend.sonicscore && (
          <View style={styles.sonicScore}>
            <Text style={styles.sonicScoreText}>{friend.sonicscore}% match</Text>
          </View>
        )}
      </View>
    </View>

    <View style={styles.friendActions}>
      <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name="chatbubble-outline" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name="ellipsis-horizontal" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const FriendRequestCard: React.FC<{
  request: FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}> = ({ request, onAccept, onReject }) => (
  <View style={styles.requestCard}>
    <View style={styles.requestTop}>
      <Image source={{ uri: request.from.avatar_url }} style={styles.requestAvatar} />
      
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{request.from.display_name}</Text>
        <Text style={styles.requestHandle}>@{request.from.handle}</Text>
        
        <View style={styles.requestMeta}>
          <Ionicons name="people" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.requestMetaText}>
            {request.mutualFriends} mutual friends
          </Text>
          {request.from.sonicscore && (
            <>
              <Text style={styles.requestMetaDot}>•</Text>
              <Text style={styles.requestMetaText}>{request.from.sonicscore}% match</Text>
            </>
          )}
        </View>
      </View>
    </View>

    <View style={styles.requestActions}>
      <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
        <LinearGradient
          colors={['#ff8a00', '#ffae45']}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.acceptText}>Accept</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.rejectBtn} onPress={onReject}>
        <Text style={styles.rejectText}>Decline</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const SuggestedFriendCard: React.FC<{ friend: Friend }> = ({ friend }) => (
  <View style={styles.suggestedCard}>
    <View style={styles.suggestedTop}>
      <Image source={{ uri: friend.avatar_url }} style={styles.suggestedAvatar} />
      
      <View style={styles.suggestedInfo}>
        <Text style={styles.suggestedName}>{friend.display_name}</Text>
        <Text style={styles.suggestedHandle}>@{friend.handle}</Text>
      </View>
      
      <TouchableOpacity style={styles.addBtn}>
        <Ionicons name="person-add" size={18} color="#ff8a00" />
      </TouchableOpacity>
    </View>

    {/* Match Score */}
    <View style={styles.matchScoreContainer}>
      <View style={styles.matchScoreBar}>
        <View style={[styles.matchScoreFill, { width: `${friend.sonicscore}%` }]}>
          <LinearGradient
            colors={['#8A2BE2', '#ff8a00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      </View>
      <Text style={styles.matchScoreText}>{friend.sonicscore}% Sonic Match</Text>
    </View>

    {friend.mutualFriends && friend.mutualFriends > 0 && (
      <Text style={styles.mutualText}>
        <Ionicons name="people" size={12} /> {friend.mutualFriends} mutual friends
      </Text>
    )}
  </View>
);

const StatCard: React.FC<{
  icon: any;
  value: string;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  
  // Header
  header: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#050505' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#fff', letterSpacing: -1 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  searchIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  
  // Live Activity Banner
  liveActivityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,174,69,0.2)',
    overflow: 'hidden',
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff8a00', marginRight: 8 },
  liveActivityText: { flex: 1, fontSize: 13, color: '#fff', fontWeight: '600' },
  
  // Tabs
  tabsContainer: { marginTop: 4 },
  tabsContent: { gap: 8, paddingRight: 20 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  tabActive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,138,0,0.3)',
  },
  tabIconWrapper: { position: 'relative' },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ff8a00',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: { fontSize: 10, fontWeight: '700', color: '#000' },
  tabText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#ff8a00' },
  
  // Content
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  
  // Section Headers
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  
  // Quick Stats
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Online Dot
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' },
  
  // Listening Friend Card
  listeningCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  listeningCardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  listeningAvatarWrapper: { position: 'relative' },
  listeningAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#ff8a00' },
  pulseRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255,138,0,0.3)',
    top: -2,
    left: -2,
  },
  listeningInfo: { flex: 1, justifyContent: 'center' },
  listeningName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  listeningHandle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  trackInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackName: { fontSize: 13, color: '#ff8a00', fontWeight: '600', flex: 1 },
  listeningCardRight: { alignItems: 'flex-end', gap: 8 },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  vibeEmoji: { fontSize: 12 },
  vibeLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  tuneInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tuneInText: { fontSize: 12, fontWeight: '700', color: '#000' },
  
  // Friend Card
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  friendCardLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  friendAvatarWrapper: { position: 'relative' },
  friendAvatar: { width: 48, height: 48, borderRadius: 24 },
  statusDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#050505' },
  statusOnline: { backgroundColor: '#22c55e' },
  statusOffline: { backgroundColor: '#6b7280' },
  friendInfo: { flex: 1, justifyContent: 'center' },
  friendName: { fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 },
  friendHandle: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  sonicScore: { marginTop: 4 },
  sonicScoreText: { fontSize: 11, color: '#8A2BE2', fontWeight: '600' },
  friendActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Request Card
  requestCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.2)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  requestTop: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  requestAvatar: { width: 56, height: 56, borderRadius: 28 },
  requestInfo: { flex: 1, justifyContent: 'center' },
  requestName: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 2 },
  requestHandle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  requestMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  requestMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  requestMetaDot: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  requestActions: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  acceptText: { fontSize: 15, fontWeight: '700', color: '#000' },
  rejectBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rejectText: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  
  // Suggested Card
  suggestedCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  suggestedTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  suggestedAvatar: { width: 48, height: 48, borderRadius: 24 },
  suggestedInfo: { flex: 1 },
  suggestedName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  suggestedHandle: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,138,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchScoreContainer: { marginBottom: 8 },
  matchScoreBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 6,
    overflow: 'hidden',
  },
  matchScoreFill: { height: '100%', overflow: 'hidden' },
  matchScoreText: { fontSize: 12, color: '#8A2BE2', fontWeight: '600' },
  mutualText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  
  // Sonic Match Banner
  sonicMatchBanner: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sonicMatchTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  sonicMatchText: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  
  // Friends Header
  friendsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  friendsCount: { fontSize: 24, fontWeight: '700', color: '#fff' },
  friendsOnline: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  
  // Empty State
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
});
