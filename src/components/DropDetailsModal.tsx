/**
 * Enhanced Drop Details Modal
 * Shows track info, reactions, and comments
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_DROP_COMMENTS, MOCK_DROP_REACTIONS, dropActions } from '../state/dropCommentsData';

const { width } = Dimensions.get('window');

interface DropDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  drop: {
    user: {
      name: string;
      avatar: string;
      handle?: string;
    };
    track: {
      title: string;
      artist: string;
      cover?: string;
    };
    vibe?: {
      emoji: string;
      label: string;
    };
    location?: {
      city: string;
    };
    timestamp: string;
  };
}

export const DropDetailsModal: React.FC<DropDetailsModalProps> = ({
  visible,
  onClose,
  drop,
}) => {
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState(MOCK_DROP_COMMENTS.default || []);
  const [reactions, setReactions] = useState(MOCK_DROP_REACTIONS.default || []);
  const [commentText, setCommentText] = useState('');

  const handleReaction = async (type: 'wave' | 'fire' | 'heart') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setReactions(reactions.map(r => {
      if (r.type === type) {
        const newReacted = !r.userReacted;
        return {
          ...r,
          userReacted: newReacted,
          count: newReacted ? r.count + 1 : r.count - 1,
        };
      }
      return r;
    }));

    if (!reactions.find(r => r.type === type)?.userReacted) {
      await dropActions.addReaction('drop1', type);
    } else {
      await dropActions.removeReaction('drop1', type);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    const result = await dropActions.addComment('drop1', commentText);
    if (result.success && result.comment) {
      setComments([...comments, result.comment]);
      setCommentText('');
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m`;
    return `${hours}h`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#0a0a0a', '#050505']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Drop</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {/* User Header */}
            <View style={styles.userHeader}>
              <Image source={{ uri: drop.user.avatar }} style={styles.userAvatar} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{drop.user.name}</Text>
                {drop.user.handle && (
                  <Text style={styles.userHandle}>@{drop.user.handle}</Text>
                )}
              </View>
              <View style={styles.metaInfo}>
                <Text style={styles.timeText}>{getTimeAgo(drop.timestamp)}</Text>
                {drop.location && (
                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color="rgba(255,255,255,0.5)" />
                    <Text style={styles.locationText}>{drop.location.city}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Track Card */}
            <View style={styles.trackCard}>
              {drop.track.cover && (
                <Image source={{ uri: drop.track.cover }} style={styles.trackCover} />
              )}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={2}>
                  {drop.track.title}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {drop.track.artist}
                </Text>
                {drop.vibe && (
                  <View style={styles.vibePill}>
                    <Text style={styles.vibeEmoji}>{drop.vibe.emoji}</Text>
                    <Text style={styles.vibeLabel}>{drop.vibe.label}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Reactions */}
            <View style={styles.reactionsSection}>
              <Text style={styles.sectionTitle}>Reactions</Text>
              <View style={styles.reactionsRow}>
                <ReactionButton
                  icon="👋"
                  label="Wave"
                  count={reactions.find(r => r.type === 'wave')?.count || 0}
                  isActive={reactions.find(r => r.type === 'wave')?.userReacted || false}
                  color="#3b82f6"
                  onPress={() => handleReaction('wave')}
                />
                <ReactionButton
                  icon="🔥"
                  label="Fire"
                  count={reactions.find(r => r.type === 'fire')?.count || 0}
                  isActive={reactions.find(r => r.type === 'fire')?.userReacted || false}
                  color="#ef4444"
                  onPress={() => handleReaction('fire')}
                />
                <ReactionButton
                  icon="❤️"
                  label="Heart"
                  count={reactions.find(r => r.type === 'heart')?.count || 0}
                  isActive={reactions.find(r => r.type === 'heart')?.userReacted || false}
                  color="#ec4899"
                  onPress={() => handleReaction('heart')}
                />
              </View>
            </View>

            {/* Comments */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionTitle}>
                Comments ({comments.length})
              </Text>

              {comments.length === 0 ? (
                <View style={styles.emptyComments}>
                  <Text style={styles.emptyText}>No comments yet</Text>
                  <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                </View>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    timeAgo={getTimeAgo(comment.timestamp)}
                  />
                ))
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Comment Input */}
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
                disabled={!commentText.trim()}
              >
                <LinearGradient
                  colors={commentText.trim() ? ['#ff8a00', '#ffae45'] : ['#333', '#333']}
                  style={StyleSheet.absoluteFillObject}
                />
                <Ionicons
                  name="send"
                  size={16}
                  color={commentText.trim() ? '#000' : '#666'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Reaction Button Component
const ReactionButton: React.FC<{
  icon: string;
  label: string;
  count: number;
  isActive: boolean;
  color: string;
  onPress: () => void;
}> = ({ icon, label, count, isActive, color, onPress }) => (
  <TouchableOpacity
    style={[
      styles.reactionBtn,
      isActive && { backgroundColor: `${color}18`, borderColor: `${color}40` },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.reactionIcon}>{icon}</Text>
    <View style={styles.reactionInfo}>
      <Text style={[styles.reactionLabel, isActive && { color }]}>{label}</Text>
      <Text style={[styles.reactionCount, isActive && { color }]}>{count}</Text>
    </View>
  </TouchableOpacity>
);

// Comment Item Component
const CommentItem: React.FC<{
  comment: {
    userName: string;
    userAvatar: string;
    comment: string;
  };
  timeAgo: string;
}> = ({ comment, timeAgo }) => (
  <View style={styles.commentItem}>
    <Image source={{ uri: comment.userAvatar }} style={styles.commentAvatar} />
    <View style={styles.commentContent}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUserName}>{comment.userName}</Text>
        <Text style={styles.commentTime}>{timeAgo}</Text>
      </View>
      <Text style={styles.commentText}>{comment.comment}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  
  // User Header
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Track Card
  trackCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  trackCover: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  vibePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,138,0,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.2)',
  },
  vibeEmoji: {
    fontSize: 12,
  },
  vibeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff8a00',
  },
  
  // Reactions Section
  reactionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reactionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  reactionIcon: {
    fontSize: 24,
  },
  reactionInfo: {
    alignItems: 'flex-start',
  },
  reactionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  reactionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  
  // Comments Section
  commentsSection: {
    marginBottom: 24,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  commentTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  commentText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  
  // Input
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    padding: 12,
    paddingTop: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    maxHeight: 80,
    paddingVertical: 2,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
