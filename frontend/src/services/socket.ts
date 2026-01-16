import { io, Socket } from 'socket.io-client';

// Utiliser l'API du VPS par défaut (déjà déployée)
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://fabrication.laplume-artisanale.tn'
    : 'http://localhost:5000');

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.IO');
    });

    socket.on('disconnect', () => {
      console.log('❌ Déconnecté du serveur Socket.IO');
    });

    socket.on('error', (error) => {
      console.error('Erreur Socket.IO:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Écouter les événements de production
export const onProductionUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('production:updated', callback);
  }
};

// Écouter les alertes
export const onAlert = (callback: (data: any) => void) => {
  if (socket) {
    socket.on('alert:new', callback);
  }
};

// Émettre un événement
export const emitEvent = (event: string, data: any) => {
  if (socket) {
    socket.emit(event, data);
  }
};

