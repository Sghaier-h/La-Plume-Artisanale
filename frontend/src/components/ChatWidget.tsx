/**
 * ChatWidget - Widget de messagerie style Facebook en bas à gauche
 */

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  recipient_id: number;
  content: string;
  created_at: string;
  read: boolean;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && selectedUser) {
      loadMessages();
      // Polling pour nouveaux messages
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedUser) return;
    try {
      const response = await api.get(`/messages/conversation/${selectedUser}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const loadOnlineUsers = async () => {
    try {
      const response = await api.get('/messages/online-users');
      setOnlineUsers(response.data || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOnlineUsers();
      const interval = setInterval(loadOnlineUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await api.post('/messages', {
        recipient_id: selectedUser,
        content: newMessage.trim()
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 w-14 h-14 flex items-center justify-center bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Ouvrir la messagerie"
      >
        <MessageCircle className="w-6 h-6" />
        {messages.filter(m => !m.read && m.recipient_id === parseInt(user?.id || '0')).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.filter(m => !m.read && m.recipient_id === parseInt(user?.id || '0')).length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl z-50 flex flex-col ${
      isMinimized ? 'w-80 h-12' : 'w-96 h-[600px]'
    } transition-all duration-300`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Messages</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Users List */}
          {!selectedUser ? (
            <div className="flex-1 overflow-y-auto p-2">
              <div className="text-sm font-semibold text-gray-600 mb-2 px-2">Utilisateurs en ligne</div>
                  {onlineUsers.map(u => (
                <button
                  key={u.id_utilisateur || u.id || u.email}
                  onClick={() => setSelectedUser(parseInt(u.id_utilisateur || u.id || '0'))}
                  className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg mb-1"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      {((u.nom || u.name || 'U') as string)?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{u.nom || u.name || 'Utilisateur'} {u.prenom || ''}</div>
                    <div className="text-xs text-gray-500">{u.role || ''}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map(msg => {
                  const isMe = msg.sender_id === parseInt(user?.id || '0');
                  return (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] ${isMe ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} rounded-lg p-2 shadow-sm`}>
                        {!isMe && (
                          <div className="text-xs font-semibold mb-1 opacity-75">{msg.sender_name}</div>
                        )}
                        <div className="text-sm">{msg.content}</div>
                        <div className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ←
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Tapez un message..."
                    className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatWidget;
