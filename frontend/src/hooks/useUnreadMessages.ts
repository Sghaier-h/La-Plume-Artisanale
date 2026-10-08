import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../services/api';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL ||
  (process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000');

/**
 * Renvoie le nombre de messages non-lus pour l'utilisateur courant.
 * Le badge se met à jour en temps réel via Socket.IO.
 */
export function useUnreadMessages(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let socket: Socket | null = null;
    let cancelled = false;

    const refresh = async () => {
      try {
        const r = await api.get('/messages/non-lus/count');
        if (!cancelled) setCount(r.data?.data?.count ?? 0);
      } catch {}
    };

    refresh();

    socket = io(SOCKET_URL, { transports: ['websocket'], auth: { token } });
    socket.on('message:new', () => refresh());
    socket.on('message:read', () => refresh());

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, []);

  return count;
}
