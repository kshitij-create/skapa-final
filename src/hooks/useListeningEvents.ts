/**
 * Hook to provide mock listening events (Demo Mode - No Backend Required).
 * Returns realistic mock data that updates periodically for demo purposes.
 */
import { useState, useEffect, useCallback } from 'react';

interface Track {
  spotify_id?: string;
  title: string;
  artist: string;
  cover?: string;
  duration_ms?: number;
  progress_ms?: number;
}

interface Vibe {
  emoji: string;
  label: string;
}

interface User {
  id: string;
  display_name: string;
  avatar_url?: string;
  handle?: string;
}

interface Location {
  lat: number;
  lng: number;
  city?: string;
}

export interface ListeningEvent {
  id: string;
  user: User;
  track: Track;
  vibe?: Vibe;
  location?: Location;
  timestamp: string;
}

interface UseListeningEventsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

// Mock listening events data
const MOCK_EVENTS: ListeningEvent[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      display_name: 'Arnav Singh',
      avatar_url: 'https://i.pravatar.cc/100?img=11',
      handle: 'arnav_music',
    },
    track: {
      spotify_id: '1',
      title: '505',
      artist: 'Arctic Monkeys',
      cover: 'https://i.scdn.co/image/ab67616d0000b273b1f8da74f225fa1225cdface',
    },
    vibe: { emoji: '🌊', label: 'Late Night' },
    location: { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    user: {
      id: 'user2',
      display_name: 'Priya Sharma',
      avatar_url: 'https://i.pravatar.cc/100?img=5',
      handle: 'priya_vibes',
    },
    track: {
      spotify_id: '2',
      title: 'Blinding Lights',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
    },
    vibe: { emoji: '⚡', label: 'High Energy' },
    location: { lat: 28.5355, lng: 77.3910, city: 'Noida' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    user: {
      id: 'user3',
      display_name: 'Marcus Chen',
      avatar_url: 'https://i.pravatar.cc/100?img=8',
      handle: 'marcus_beats',
    },
    track: {
      spotify_id: '3',
      title: 'FE!N',
      artist: 'Travis Scott',
      cover: 'https://i.scdn.co/image/ab67616d0000b273881d8d8378cd01099babcd44',
    },
    vibe: { emoji: '🔥', label: 'High Energy' },
    location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    user: {
      id: 'user4',
      display_name: 'Sasha Kapoor',
      avatar_url: 'https://i.pravatar.cc/100?img=3',
      handle: 'sasha_k',
    },
    track: {
      spotify_id: '4',
      title: 'Apocalypse',
      artist: 'Cigarettes After Sex',
      cover: 'https://i.scdn.co/image/ab67616d0000b273f0f5815be598e96b815e3b83',
    },
    vibe: { emoji: '💔', label: 'Melancholy' },
    location: { lat: 28.7041, lng: 77.1025, city: 'Delhi' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    user: {
      id: 'user5',
      display_name: 'Raj Patel',
      avatar_url: 'https://i.pravatar.cc/100?img=12',
      handle: 'raj_music',
    },
    track: {
      spotify_id: '5',
      title: 'Starboy',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
    },
    vibe: { emoji: '🔮', label: 'Deep Focus' },
    location: { lat: 18.9220, lng: 72.8347, city: 'Bandra' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '6',
    user: {
      id: 'user6',
      display_name: 'Nina Rodriguez',
      avatar_url: 'https://i.pravatar.cc/100?img=9',
      handle: 'nina_tunes',
    },
    track: {
      spotify_id: '6',
      title: 'As It Was',
      artist: 'Harry Styles',
      cover: 'https://i.scdn.co/image/ab67616d0000b2732e8ed79e177ff6011076f5f0',
    },
    vibe: { emoji: '🌊', label: 'Chill' },
    location: { lat: 40.7580, lng: -73.9855, city: 'New York' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '7',
    user: {
      id: 'user7',
      display_name: 'Kai Tanaka',
      avatar_url: 'https://i.pravatar.cc/100?img=14',
      handle: 'kai_tokyo',
    },
    track: {
      spotify_id: '7',
      title: 'Die For You',
      artist: 'The Weeknd',
      cover: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
    },
    vibe: { emoji: '❤️', label: 'Late Night' },
    location: { lat: 35.6762, lng: 139.6503, city: 'Shibuya' },
    timestamp: new Date().toISOString(),
  },
  {
    id: '8',
    user: {
      id: 'user8',
      display_name: 'Emma Wilson',
      avatar_url: 'https://i.pravatar.cc/100?img=1',
      handle: 'emma_music',
    },
    track: {
      spotify_id: '8',
      title: 'Anti-Hero',
      artist: 'Taylor Swift',
      cover: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
    },
    vibe: { emoji: '✨', label: 'High Energy' },
    location: { lat: 51.5074, lng: -0.1278, city: 'London' },
    timestamp: new Date().toISOString(),
  },
];

export function useListeningEvents(options: UseListeningEventsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [events, setEvents] = useState<ListeningEvent[]>(MOCK_EVENTS);
  const [loading, setLoading] = useState(false); // Always ready in demo mode
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    // In demo mode, just shuffle the events slightly to simulate updates
    setEvents(prevEvents => {
      const shuffled = [...prevEvents];
      // Randomly update 2-3 events to simulate real-time changes
      const numToUpdate = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numToUpdate; i++) {
        const randomIndex = Math.floor(Math.random() * shuffled.length);
        shuffled[randomIndex] = {
          ...shuffled[randomIndex],
          timestamp: new Date().toISOString(),
        };
      }
      return shuffled;
    });
  }, []);

  useEffect(() => {
    // Simulate initial load
    setLoading(true);
    setTimeout(() => setLoading(false), 500);

    if (!autoRefresh) return;

    // Simulate periodic updates
    const interval = setInterval(fetchEvents, refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchEvents, autoRefresh, refreshInterval]);

  return {
    events,
    loading,
    error,
    refresh: fetchEvents,
  };
}

/**
 * Hook to fetch listening stats (active listeners count, etc.)
 */
export function useListeningStats() {
  const [stats, setStats] = useState<{
    active_listeners: number;
    total_connected_users: number;
    recent_tracks: Array<{ user: string; track: string; timestamp: string }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await publicFetch('/api/listening/stats');
      setStats(data);
    } catch (err) {
      console.error('[useListeningStats] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
