/**
 * Hook to fetch and manage listening events (real-time music activity).
 * Polls the backend API every 30 seconds to keep the map fresh.
 */
import { useState, useEffect, useCallback } from 'react';
import { publicFetch } from '../state/publicApi';

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

interface ListeningEventsResponse {
  events: ListeningEvent[];
  count: number;
}

interface UseListeningEventsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function useListeningEvents(options: UseListeningEventsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 30000 } = options;
  
  const [events, setEvents] = useState<ListeningEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const data = await publicFetch<ListeningEventsResponse>('/api/listening/events?limit=100');
      setEvents(data.events || []);
    } catch (err) {
      console.error('[useListeningEvents] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchEvents();

    if (!autoRefresh) return;

    // Poll every 30 seconds
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
