/**
 * ScreenShare - Composant pour le partage d'écran pour la formation à distance
 */

import React, { useState, useRef, useEffect } from 'react';
import { Share2, Video, X, Maximize2, Minimize2, PhoneOff, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ScreenShareProps {
  onClose: () => void;
  roomId?: string;
  userName?: string;
}

const ScreenShare: React.FC<ScreenShareProps> = ({ onClose, roomId, userName }) => {
  const { user } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [participants, setParticipants] = useState<string[]>([userName || user?.prenom + ' ' + user?.nom || 'Utilisateur']);
  const [messages, setMessages] = useState<Array<{ user: string; message: string; time: Date }>>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialiser le partage d'écran si roomId existe
    if (roomId) {
      handleStartShare();
    }

    return () => {
      // Nettoyer les streams à la fermeture
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      remoteStreams.forEach(remoteStream => {
        remoteStream.getTracks().forEach(track => track.stop());
      });
    };
  }, []);

  const handleStartShare = async () => {
    try {
      // Demander le partage d'écran
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor'
        } as MediaTrackConstraints,
        audio: true
      });

      setStream(screenStream);
      setIsSharing(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Gérer l'arrêt du partage
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        handleStopShare();
      });

      // Ici, vous devriez envoyer le stream à votre serveur de WebRTC
      // Pour une implémentation complète, utilisez un service comme Socket.io + WebRTC
      console.log('Partage d\'écran démarré');
    } catch (error) {
      console.error('Erreur partage d\'écran:', error);
      alert('Impossible de partager l\'écran. Vérifiez vos permissions.');
    }
  };

  const handleStopShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [...prev, {
        user: userName || user?.prenom + ' ' + user?.nom || 'Moi',
        message: newMessage,
        time: new Date()
      }]);
      setNewMessage('');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 bg-gray-900 z-50 flex flex-col ${isFullscreen ? '' : 'p-4'}`}
    >
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Video className="w-6 h-6 text-green-500" />
          <div>
            <h2 className="font-semibold">Formation à Distance - Partage d'écran</h2>
            <p className="text-sm text-gray-400">
              {roomId || 'Session de formation'} • {participants.length} participant(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
          <button
            onClick={handleStopShare}
            className="p-2 hover:bg-red-600 rounded transition-colors"
            title="Arrêter le partage"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Zone de partage */}
        <div className="flex-1 bg-black rounded-lg overflow-hidden relative">
          {isSharing ? (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Share2 className="w-16 h-16 mx-auto mb-4" />
                <p className="text-lg">Aucun partage d'écran actif</p>
                <button
                  onClick={handleStartShare}
                  className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Share2 className="w-5 h-5" />
                  Démarrer le partage d'écran
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-800 rounded-lg flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Participants ({participants.length})</h3>
            </div>
            <div className="space-y-2">
              {participants.map((participant, idx) => (
                <div key={idx} className="text-sm text-gray-300 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  {participant}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold text-white">Chat</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className="bg-gray-700 rounded p-2">
                  <div className="text-xs text-gray-400 mb-1">{msg.user}</div>
                  <div className="text-sm text-white">{msg.message}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tapez un message..."
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenShare;
