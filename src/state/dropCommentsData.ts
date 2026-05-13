/**
 * Mock Drop Comments and Reactions Data
 * Provides comments and reactions for drops in demo mode
 */

export interface DropComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  comment: string;
  timestamp: string;
}

export interface DropReaction {
  type: 'wave' | 'fire' | 'heart';
  count: number;
  userReacted: boolean;
}

export const MOCK_DROP_COMMENTS: Record<string, DropComment[]> = {
  // Comments for different drops (dropId as key)
  default: [
    {
      id: 'comment1',
      userId: 'user1',
      userName: 'Arnav',
      userAvatar: 'https://i.pravatar.cc/100?img=11',
      comment: 'This track hits different at midnight 🌙',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'comment2',
      userId: 'user2',
      userName: 'Priya',
      userAvatar: 'https://i.pravatar.cc/100?img=5',
      comment: 'Add this to the playlist!',
      timestamp: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: 'comment3',
      userId: 'user3',
      userName: 'Marcus',
      userAvatar: 'https://i.pravatar.cc/100?img=8',
      comment: 'Arctic Monkeys never disappoint 🔥',
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
  ],
};

export const MOCK_DROP_REACTIONS: Record<string, DropReaction[]> = {
  // Reactions for different drops (dropId as key)
  default: [
    { type: 'wave', count: 24, userReacted: false },
    { type: 'fire', count: 18, userReacted: true },
    { type: 'heart', count: 12, userReacted: false },
  ],
};

// Drop actions
export const dropActions = {
  addComment: (dropId: string, comment: string) => {
    console.log(`[Mock] Added comment to drop ${dropId}: ${comment}`);
    return Promise.resolve({
      success: true,
      comment: {
        id: `comment${Date.now()}`,
        userId: 'currentUser',
        userName: 'You',
        userAvatar: 'https://i.pravatar.cc/100?img=20',
        comment,
        timestamp: new Date().toISOString(),
      }
    });
  },
  
  addReaction: (dropId: string, reactionType: 'wave' | 'fire' | 'heart') => {
    console.log(`[Mock] Added ${reactionType} reaction to drop ${dropId}`);
    return Promise.resolve({ success: true });
  },
  
  removeReaction: (dropId: string, reactionType: 'wave' | 'fire' | 'heart') => {
    console.log(`[Mock] Removed ${reactionType} reaction from drop ${dropId}`);
    return Promise.resolve({ success: true });
  },
};
