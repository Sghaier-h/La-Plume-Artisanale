import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id_notification?: number;
  type_notification: string;
  titre: string;
  message?: string;
  priorite: number;
  lue?: boolean;
}

interface Tache {
  id_tache: number;
  id_of: number;
  numero_of?: string;
  type_tache: string;
  statut: string;
  priorite: number;
  quantite_demandee?: number;
  quantite_realisee?: number;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [taches, setTaches] = useState<Tache[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://fabrication.laplume-artisanale.tn'
        : 'http://localhost:5000');

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connecté');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket déconnecté');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur connexion WebSocket:', error);
      setConnected(false);
    });

    // Écouter les notifications
    newSocket.on('notification', (notif: Notification) => {
      console.log('📬 Nouvelle notification:', notif);
      setNotifications(prev => [notif, ...prev]);
      
      // Afficher toast/alerte
      if (notif.priorite <= 2) {
        // Vibration si supporté
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Notification navigateur si supporté
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(notif.titre, {
            body: notif.message || '',
            icon: '/favicon.ico',
            badge: '/favicon.ico'
          });
        }
      }
    });

    // Écouter les nouvelles tâches
    newSocket.on('nouvelle-tache', (tache: Tache) => {
      console.log('📋 Nouvelle tâche:', tache);
      setTaches(prev => {
        const exists = prev.find(t => t.id_tache === tache.id_tache);
        if (exists) return prev;
        return [tache, ...prev];
      });
      
      // Vibration
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    });

    // Écouter les mises à jour de tâches
    newSocket.on('tache-mise-a-jour', (tache: Tache) => {
      console.log('🔄 Tâche mise à jour:', tache);
      setTaches(prev => prev.map(t => 
        t.id_tache === tache.id_tache ? { ...t, ...tache } : t
      ));
    });

    // Écouter les tâches précédentes terminées
    newSocket.on('tache-precedente-terminee', (data: { tache: Tache; tache_precedente: Tache }) => {
      console.log('✅ Tâche précédente terminée:', data);
      setTaches(prev => prev.map(t => 
        t.id_tache === data.tache.id_tache 
          ? { ...t, statut: 'ASSIGNEE' } 
          : t
      ));
      
      // Notification
      setNotifications(prev => [{
        type_notification: 'TACHE_TERMINEE_PRECEDENT',
        titre: 'Tâche précédente terminée',
        message: `Vous pouvez commencer ${data.tache.type_tache}`,
        priorite: data.tache.priorite
      }, ...prev]);
    });

    // Écouter les messages
    newSocket.on('message', (message: any) => {
      console.log('💬 Nouveau message:', message);
      setNotifications(prev => [{
        type_notification: 'MESSAGE_RESPONSABLE',
        titre: message.sujet || 'Message',
        message: message.message,
        priorite: 2
      }, ...prev]);
    });

    // Écouter les alertes
    newSocket.on('alerte-urgente', (alerte: any) => {
      console.log('🚨 Alerte urgente:', alerte);
      setNotifications(prev => [{
        type_notification: 'ALERTE_RETARD',
        titre: alerte.titre,
        message: alerte.message,
        priorite: 1
      }, ...prev]);
      
      // Vibration forte
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    });

    setSocket(newSocket);

    // Demander permission notifications navigateur
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
      socketRef.current = null;
    };
  }, []);

  const envoyerAccuseReception = (notificationId: number) => {
    if (socket) {
      socket.emit('accuse-reception', notificationId);
    }
  };

  const envoyerStatutTache = (tacheId: number, statut: string) => {
    if (socket) {
      socket.emit('tache-statut-change', { id_tache: tacheId, statut });
    }
  };

  return {
    socket,
    connected,
    notifications,
    taches,
    envoyerAccuseReception,
    envoyerStatutTache
  };
}
