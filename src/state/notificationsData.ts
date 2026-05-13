/**
 * Enhanced Notifications Data - Swiggy/Zomato Style
 * Playful, engaging, and action-oriented notifications
 */

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_listening'
  | 'room_invite'
  | 'drop_nearby'
  | 'achievement'
  | 'weekly_wrapped'
  | 'friend_milestone'
  | 'trending_track'
  | 'vibe_match';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  imageUrl?: string;
  actionData?: any;
  emoji?: string;
  actionText?: string;
}

// Swiggy/Zomato-style playful notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif1',
    type: 'friend_request',
    title: '👋 Someone wants to vibe with you!',
    message: 'Kai Tanaka thinks you two have great music taste. Accept to start vibing together!',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=14',
    emoji: '🎵',
    actionText: 'Check it out',
  },
  {
    id: 'notif2',
    type: 'friend_listening',
    title: '🔥 Priya is vibing HARD right now',
    message: 'Blinding Lights - The Weeknd. She\'s been on repeat for 20 mins! Join her?',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=5',
    emoji: '⚡',
    actionText: 'Tune In',
  },
  {
    id: 'notif3',
    type: 'room_invite',
    title: '📻 Your presence is requested!',
    message: 'Arnav is hosting "Night Drives" and wants you there. Don\'t leave them hanging! 😅',
    timestamp: new Date(Date.now() - 5400000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=11',
    emoji: '🎧',
    actionText: 'Join Room',
  },
  {
    id: 'notif4',
    type: 'drop_nearby',
    title: '📍 Fresh drop alert! 0.5 km away',
    message: 'Marcus just dropped FE!N by Travis Scott near you. Wave back? 👋',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    imageUrl: 'https://i.pravatar.cc/100?img=8',
    emoji: '🔥',
    actionText: 'See on Map',
  },
  {
    id: 'notif5',
    type: 'friend_accepted',
    title: '🎉 It\'s official!',
    message: 'Sasha accepted your request. Time to share your best playlists!',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    imageUrl: 'https://i.pravatar.cc/100?img=3',
    emoji: '✨',
    actionText: 'Say Hi',
  },
  {
    id: 'notif6',
    type: 'achievement',
    title: '🏆 Achievement Unlocked: Night Owl',
    message: 'You\'ve listened after midnight for 7 days straight. Sleep is for the weak! 🌙',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    emoji: '🦉',
    actionText: 'View Badge',
  },
  {
    id: 'notif7',
    type: 'weekly_wrapped',
    title: '📊 Your week was INSANE',
    message: '47 hours of music! You basically lived in your earphones. Check your top tracks!',
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    read: true,
    emoji: '🎵',
    actionText: 'See Report',
  },
  {
    id: 'notif8',
    type: 'friend_milestone',
    title: '🎊 Priya hit 1000 hours!',
    message: 'Your friend just reached a major milestone. Send some love! 💕',
    timestamp: new Date(Date.now() - 345600000).toISOString(),
    read: true,
    imageUrl: 'https://i.pravatar.cc/100?img=5',
    emoji: '🎉',
    actionText: 'Celebrate',
  },
  {
    id: 'notif9',
    type: 'trending_track',
    title: '🔥 Your friends can\'t stop playing this',
    message: '5 friends are obsessed with "Anti-Hero" right now. FOMO? We thought so.',
    timestamp: new Date(Date.now() - 432000000).toISOString(),
    read: true,
    emoji: '📈',
    actionText: 'Listen Now',
  },
  {
    id: 'notif10',
    type: 'vibe_match',
    title: '💫 You & Arnav are in sync!',
    message: 'You both switched to Late Night vibe at the same time. Soulmates? 🌊',
    timestamp: new Date(Date.now() - 518400000).toISOString(),
    read: true,
    imageUrl: 'https://i.pravatar.cc/100?img=11',
    emoji: '🌙',
    actionText: 'See Match',
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
  
  performAction: (notificationId: string, actionType: string) => {
    console.log(`[Mock] Performed action ${actionType} for notification ${notificationId}`);
    return Promise.resolve({ success: true });
  },
};
