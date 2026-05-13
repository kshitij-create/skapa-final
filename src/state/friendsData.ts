/**
 * Mock Friends Data and State Management
 * Provides friend system functionality for demo mode
 */

export interface Friend {
  id: string;
  display_name: string;
  handle: string;
  avatar_url: string;
  isOnline: boolean;
  currentTrack?: {
    title: string;
    artist: string;
    cover?: string;
  };
  vibe?: {
    emoji: string;
    label: string;
  };
  mutualFriends?: number;
  sonicscore?: number; // 0-100 compatibility score
}

export interface FriendRequest {
  id: string;
  from: Friend;
  timestamp: string;
  mutualFriends: number;
}

// Mock friends data
export const MOCK_FRIENDS: Friend[] = [
  {
    id: 'friend1',
    display_name: 'Arnav Singh',
    handle: 'arnav_music',
    avatar_url: 'https://i.pravatar.cc/100?img=11',
    isOnline: true,
    currentTrack: {
      title: '505',
      artist: 'Arctic Monkeys',
      cover: 'https://i.scdn.co/image/ab67616d0000b273b1f8da74f225fa1225cdface',
    },
    vibe: { emoji: '🌊', label: 'Late Night' },
    mutualFriends: 12,
    sonicscore: 87,
  },
  {
    id: 'friend2',
    display_name: 'Priya Sharma',
    handle: 'priya_vibes',
    avatar_url: 'https://i.pravatar.cc/100?img=5',
    isOnline: true,
    currentTrack: {
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    },
    vibe: { emoji: '⚡', label: 'High Energy' },
    mutualFriends: 8,
    sonicscore: 92,
  },
  {
    id: 'friend3',
    display_name: 'Marcus Chen',
    handle: 'marcus_beats',
    avatar_url: 'https://i.pravatar.cc/100?img=8',
    isOnline: false,
    mutualFriends: 5,
    sonicscore: 76,
  },
  {
    id: 'friend4',
    display_name: 'Sasha Kapoor',
    handle: 'sasha_k',
    avatar_url: 'https://i.pravatar.cc/100?img=3',
    isOnline: true,
    currentTrack: {
      title: 'Apocalypse',
      artist: 'Cigarettes After Sex',
      cover: 'https://i.scdn.co/image/ab67616d0000b273f0f5815be598e96b815e3b83',
    },
    vibe: { emoji: '💔', label: 'Melancholy' },
    mutualFriends: 15,
    sonicscore: 94,
  },
  {
    id: 'friend5',
    display_name: 'Raj Patel',
    handle: 'raj_music',
    avatar_url: 'https://i.pravatar.cc/100?img=12',
    isOnline: false,
    mutualFriends: 3,
    sonicscore: 68,
  },
  {
    id: 'friend6',
    display_name: 'Nina Rodriguez',
    handle: 'nina_tunes',
    avatar_url: 'https://i.pravatar.cc/100?img=9',
    isOnline: true,
    currentTrack: {
      title: 'As It Was',
      artist: 'Harry Styles',
      cover: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
    },
    vibe: { emoji: '🌊', label: 'Chill' },
    mutualFriends: 7,
    sonicscore: 81,
  },
];

// Mock friend requests
export const MOCK_FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 'req1',
    from: {
      id: 'user7',
      display_name: 'Kai Tanaka',
      handle: 'kai_tokyo',
      avatar_url: 'https://i.pravatar.cc/100?img=14',
      isOnline: true,
      vibe: { emoji: '❤️', label: 'Late Night' },
      mutualFriends: 4,
      sonicscore: 85,
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    mutualFriends: 4,
  },
  {
    id: 'req2',
    from: {
      id: 'user8',
      display_name: 'Emma Wilson',
      handle: 'emma_music',
      avatar_url: 'https://i.pravatar.cc/100?img=1',
      isOnline: false,
      mutualFriends: 2,
      sonicscore: 72,
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    mutualFriends: 2,
  },
];

// Mock suggested friends
export const MOCK_SUGGESTED_FRIENDS: Friend[] = [
  {
    id: 'sug1',
    display_name: 'Alex Kumar',
    handle: 'alex_beats',
    avatar_url: 'https://i.pravatar.cc/100?img=15',
    isOnline: true,
    vibe: { emoji: '🔥', label: 'High Energy' },
    mutualFriends: 6,
    sonicscore: 89,
  },
  {
    id: 'sug2',
    display_name: 'Sofia Lee',
    handle: 'sofia_music',
    avatar_url: 'https://i.pravatar.cc/100?img=2',
    isOnline: false,
    mutualFriends: 3,
    sonicscore: 78,
  },
  {
    id: 'sug3',
    display_name: 'David Park',
    handle: 'david_vibes',
    avatar_url: 'https://i.pravatar.cc/100?img=13',
    isOnline: true,
    mutualFriends: 8,
    sonicscore: 91,
  },
];

// Friend actions (mock - would call API in real app)
export const friendActions = {
  sendRequest: (userId: string) => {
    console.log(`[Mock] Sent friend request to ${userId}`);
    return Promise.resolve({ success: true });
  },
  
  acceptRequest: (requestId: string) => {
    console.log(`[Mock] Accepted friend request ${requestId}`);
    return Promise.resolve({ success: true });
  },
  
  rejectRequest: (requestId: string) => {
    console.log(`[Mock] Rejected friend request ${requestId}`);
    return Promise.resolve({ success: true });
  },
  
  removeFriend: (friendId: string) => {
    console.log(`[Mock] Removed friend ${friendId}`);
    return Promise.resolve({ success: true });
  },
  
  searchUsers: (query: string): Promise<Friend[]> => {
    console.log(`[Mock] Searching for: ${query}`);
    // Simple mock search
    const allUsers = [...MOCK_FRIENDS, ...MOCK_SUGGESTED_FRIENDS];
    const filtered = allUsers.filter(
      u => 
        u.display_name.toLowerCase().includes(query.toLowerCase()) ||
        u.handle.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(filtered);
  },
};
