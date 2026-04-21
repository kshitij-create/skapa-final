/**
 * useRoomSocket — connect to /ws/rooms/{code}, handshake, receive events.
 */
import { useEffect, useRef, useState, useCallback } from 'react';

export interface RoomMember {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface RoomTrack {
  title: string;
  artist: string;
  cover?: string | null;
}

export interface RoomHost {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface RoomMood {
  emoji?: string;
  label?: string;
}

export interface RoomData {
  code: string;
  name: string;
  mood: RoomMood;
  color: string;
  host: RoomHost;
}

export interface ReactionEvent {
  id: string;       // unique per emit (client-generated)
  emoji: string;
  by: RoomMember;
}

export type SocketState = 'connecting' | 'open' | 'closed' | 'error';

interface UseRoomSocketArgs {
  code: string;
  user: { id: string; name: string; avatar?: string | null } | null;
  wsBase: string; // wss://host
}

export function useRoomSocket({ code, user, wsBase }: UseRoomSocketArgs) {
  const wsRef = useRef<WebSocket | null>(null);
  const [state, setState] = useState<SocketState>('connecting');
  const [room, setRoom] = useState<RoomData | null>(null);
  const [track, setTrack] = useState<RoomTrack | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [reactions, setReactions] = useState<ReactionEvent[]>([]);

  const sendNowPlaying = useCallback((t: RoomTrack) => {
    wsRef.current?.send(JSON.stringify({ type: 'now_playing', track: t }));
  }, []);

  const sendReaction = useCallback((emoji: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'reaction', emoji }));
    // echo locally so sender also sees it float
    if (user) {
      const r: ReactionEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        emoji,
        by: user,
      };
      setReactions(prev => [...prev, r]);
    }
  }, [user]);

  const dropReaction = useCallback((id: string) => {
    setReactions(prev => prev.filter(r => r.id !== id));
  }, []);

  useEffect(() => {
    if (!code || !user) return;

    const url = `${wsBase}/ws/rooms/${code}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setState('connecting');

    ws.onopen = () => {
      setState('open');
      ws.send(JSON.stringify({ type: 'hello', user }));
    };

    ws.onmessage = evt => {
      try {
        const msg = JSON.parse(evt.data);
        switch (msg.type) {
          case 'room_state':
            setRoom(msg.room);
            setTrack(msg.track || null);
            setMembers(msg.members || []);
            break;
          case 'member_joined':
            setMembers(prev => {
              if (prev.find(m => m.id === msg.member.id)) return prev;
              return [...prev, msg.member];
            });
            break;
          case 'member_left':
            setMembers(prev => prev.filter(m => m.id !== msg.id));
            break;
          case 'now_playing':
            setTrack(msg.track);
            break;
          case 'reaction':
            setReactions(prev => [
              ...prev,
              {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                emoji: msg.emoji,
                by: msg.by,
              },
            ]);
            break;
        }
      } catch {
        /* ignore */
      }
    };

    ws.onclose = () => setState('closed');
    ws.onerror = () => setState('error');

    return () => {
      try {
        ws.close();
      } catch {}
    };
  }, [code, user?.id, wsBase]);

  return { state, room, track, members, reactions, sendNowPlaying, sendReaction, dropReaction };
}
