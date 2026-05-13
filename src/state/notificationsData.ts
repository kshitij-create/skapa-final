/**
 * Mock Notifications Data
 * Provides notification system for demo mode
 */

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_listening'
  | 'room_invite'
  | 'drop_nearby'
  | 'achievement'
  | 'weekly_wrapped';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  imageUrl?: string;
  actionData?: any;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    type: 'friend_request',
    title: 'New Friend Request',
    message: 'Kai Tanaka wants to connect with you',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=14',
  },
  {
    id: 'notif2',
    type: 'friend_listening',
    title: 'Priya is listening now',
    message: 'Blinding Lights - The Weeknd',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=5',
  },
  {
    id: 'notif3',
    type: 'room_invite',
    title: 'Room Invitation',
    message: 'Arnav invited you to "Night Drives" room',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=11',
  },
  {
    id: 'notif4',
    type: 'drop_nearby',
    title: 'New Drop Nearby',
    message: 'Marcus dropped "FE!N" 0.5 km away',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true,
    imageUrl: 'https://i.pravatar.cc/100?img=8',
  },
  {
    id: 'notif5',
    type: 'friend_accepted',
    title: 'Friend Request Accepted',
    message: 'Sasha accepted your friend request',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    imageUrl: 'https://i.pravatar.cc/100?img=3',
  },
  {
    id: 'notif6',
    type: 'achievement',
    title: 'Achievement Unlocked! 🏆',
    message: 'Night Owl - Listened after midnight for 7 days',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
  },
  {
    id: 'notif7',
    type: 'weekly_wrapped',
    title: 'Your Week in Music 📊',
    message: 'You listened to 47 hours of music this week!',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true,
  },
];

// Notification actions
export const notificationActions = {
  markAsRead: (notificationId: string) => {
    console.log(`[Mock] Marked notification ${notificationId} as read`);
    return Promise.resolve({ success: true });
  },
  
  markAllAsRead: () => {
    console.log(`[Mock] Marked all notifications as read`);
    return Promise.resolve({ success: true });
  },
  
  deleteNotification: (notificationId: string) => {
    console.log(`[Mock] Deleted notification ${notificationId}`);
    return Promise.resolve({ success: true });
  },
};
