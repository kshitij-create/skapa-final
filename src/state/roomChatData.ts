/**
 * Mock Room Chat Data
 * Provides chat functionality for listening rooms in demo mode
 */

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isHost?: boolean;
}

export const MOCK_ROOM_CHAT: ChatMessage[] = [
  {
    id: 'msg1',
    userId: 'user1',
    userName: 'Arnav',
    userAvatar: 'https://i.pravatar.cc/100?img=11',
    message: 'This track is 🔥🔥🔥',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isHost: true,
  },
  {
    id: 'msg2',
    userId: 'user2',
    userName: 'Priya',
    userAvatar: 'https://i.pravatar.cc/100?img=5',
    message: 'Yesss! Love Arctic Monkeys',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: 'msg3',
    userId: 'user3',
    userName: 'Marcus',
    userAvatar: 'https://i.pravatar.cc/100?img=8',
    message: 'Who else is here from Mumbai?',
    timestamp: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: 'msg4',
    userId: 'user1',
    userName: 'Arnav',
    userAvatar: 'https://i.pravatar.cc/100?img=11',
    message: 'Next track coming up is gonna be insane',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    isHost: true,
  },
  {
    id: 'msg5',
    userId: 'user4',
    userName: 'Sasha',
    userAvatar: 'https://i.pravatar.cc/100?img=3',
    message: 'Can we get some Cigarettes After Sex next? 🙏',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'msg6',
    userId: 'user2',
    userName: 'Priya',
    userAvatar: 'https://i.pravatar.cc/100?img=5',
    message: 'This vibe is perfect for late night drives',
    timestamp: new Date(Date.now() - 30000).toISOString(),
  },
];

// Chat actions
export const chatActions = {
  sendMessage: (roomCode: string, message: string) => {
    console.log(`[Mock] Sent message to room ${roomCode}: ${message}`);
    return Promise.resolve({ 
      success: true,
      message: {
        id: `msg${Date.now()}`,
        userId: 'currentUser',
        userName: 'You',
        userAvatar: 'https://i.pravatar.cc/100?img=20',
        message,
        timestamp: new Date().toISOString(),
      }
    });
  },
};
