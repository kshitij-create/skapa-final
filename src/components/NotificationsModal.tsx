/**
 * Notifications Modal Component - Swiggy/Zomato Style
 * Playful, engaging, and highly interactive
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MOCK_NOTIFICATIONS, notificationActions, type Notification } from '../state/notificationsData';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    notificationActions.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    notificationActions.markAllAsRead();
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    notificationActions.deleteNotification(id);
  };

  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.headerSubtitle}>
                {unreadCount} new {unreadCount === 1 ? 'update' : 'updates'} 🔔
              </Text>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllBtn}>
                <Text style={styles.markAllText}>Mark all read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>All caught up!</Text>
              <Text style={styles.emptyText}>
                You're living in the moment. No notifications to show.
              </Text>
            </View>
          ) : (
            notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkAsRead={() => handleMarkAsRead(notif.id)}
                onDelete={() => handleDelete(notif.id)}
                getTimeAgo={getTimeAgo}
              />
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  onMarkAsRead: () => void;
  onDelete: () => void;
  getTimeAgo: (timestamp: string) => string;
}> = ({ notification, onMarkAsRead, onDelete, getTimeAgo }) => {
  const [showActions, setShowActions] = useState(false);

  const getGradientColors = (type: string): [string, string] => {
    switch (type) {
      case 'friend_request': return ['#ff8a00', '#ffae45'];
      case 'friend_accepted': return ['#22c55e', '#10b981'];
      case 'friend_listening': return ['#8A2BE2', '#6019a8'];
      case 'room_invite': return ['#ec4899', '#d946ef'];
      case 'achievement': return ['#f59e0b', '#f97316'];
      case 'weekly_wrapped': return ['#06b6d4', '#0ea5e9'];
      default: return ['#ff8a00', '#ffae45'];
    }
  };

  const getIcon = (type: string): any => {
    switch (type) {
      case 'friend_request': return 'person-add';
      case 'friend_accepted': return 'checkmark-circle';
      case 'friend_listening': return 'headset';
      case 'room_invite': return 'radio';
      case 'drop_nearby': return 'location';
      case 'achievement': return 'trophy';
      case 'weekly_wrapped': return 'stats-chart';
      case 'trending_track': return 'trending-up';
      case 'vibe_match': return 'flash';
      default: return 'notifications';
    }
  };

  const colors = getGradientColors(notification.type);

  return (
    <Pressable
      onPress={() => !notification.read && onMarkAsRead()}
      onLongPress={() => setShowActions(!showActions)}
      style={[
        styles.notificationCard,
        !notification.read && styles.notificationUnread,
      ]}
    >
      {/* Gradient Border for Unread */}
      {!notification.read && (
        <View style={styles.gradientBorder}>
          <LinearGradient
            colors={colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
      )}

      <View style={styles.notificationContent}>
        {/* Icon or Image */}
        <View style={styles.notificationLeft}>
          {notification.imageUrl ? (
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: notification.imageUrl }} style={styles.notificationAvatar} />
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
          ) : (
            <View style={[styles.iconWrapper, { backgroundColor: `${colors[0]}18` }]}>
              <Ionicons name={getIcon(notification.type)} size={24} color={colors[0]} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.notificationMiddle}>
          <Text style={styles.notificationTitle}>
            {notification.title}
          </Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          
          <View style={styles.notificationFooter}>
            <Text style={styles.notificationTime}>
              {getTimeAgo(notification.timestamp)}
            </Text>
            
            {notification.actionText && (
              <>
                <Text style={styles.footerDot}>•</Text>
                <TouchableOpacity onPress={() => notificationActions.performAction(notification.id, notification.type)}>
                  <Text style={[styles.actionText, { color: colors[0] }]}>
                    {notification.actionText}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Right Actions */}
        <View style={styles.notificationRight}>
          {!notification.read && (
            <View style={[styles.unreadIndicator, { backgroundColor: colors[0] }]} />
          )}
          
          {showActions && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ff8a00',
    marginTop: 4,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,138,0,0.15)',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ff8a00',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  
  // Notification Card
  notificationCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  notificationUnread: {
    backgroundColor: 'rgba(255,138,0,0.05)',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  notificationContent: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  
  // Left Side
  notificationLeft: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  notificationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ff8a00',
    borderWidth: 2,
    borderColor: '#050505',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Middle Content
  notificationMiddle: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  footerDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Right Side
  notificationRight: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239,68,68,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
});
