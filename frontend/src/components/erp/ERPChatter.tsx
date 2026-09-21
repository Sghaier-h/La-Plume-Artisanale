/**
 * Composant Chatter ERP
 * Zone de conversation et notes
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';

interface Message {
  id: number;
  author: string;
  date: string;
  content: string;
  type?: 'message' | 'note' | 'activity';
}

interface ERPChatterProps {
  messages?: Message[];
  onSendMessage?: (content: string, type?: 'message' | 'note') => void;
  title?: string;
}

const ERPChatter: React.FC<ERPChatterProps> = ({ 
  messages = [], 
  onSendMessage,
  title = 'Historique'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState<'message' | 'note'>('message');

  const handleSend = () => {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage, messageType);
      setNewMessage('');
    }
  };

  return (
    <div className="erp-chatter">
      <div className="erp-chatter-header">
        <h3 className="erp-chatter-title">
          <MessageSquare size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {title}
        </h3>
      </div>

      <div className="erp-chatter-messages">
        {messages.length === 0 ? (
          <p style={{ color: 'var(--erp-text-muted)', textAlign: 'center', padding: '32px' }}>
            Aucun message pour le moment
          </p>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="erp-chatter-message">
              <div className="erp-chatter-message-header">
                <span className="erp-chatter-message-author">{message.author}</span>
                <span className="erp-chatter-message-date">
                  <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {message.date}
                </span>
              </div>
              <div className="erp-chatter-message-content">{message.content}</div>
            </div>
          ))
        )}
      </div>

      {onSendMessage && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`erp-btn ${messageType === 'message' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
              onClick={() => setMessageType('message')}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              Message
            </button>
            <button
              className={`erp-btn ${messageType === 'note' ? 'erp-btn-primary' : 'erp-btn-outline'}`}
              onClick={() => setMessageType('note')}
              style={{ fontSize: '12px', padding: '4px 12px' }}
            >
              Note interne
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={messageType === 'message' ? 'Écrire un message...' : 'Ajouter une note interne...'}
              className="erp-field-input"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleSend();
                }
              }}
            />
            <button
              className="erp-btn erp-btn-primary"
              onClick={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send size={16} />
              Envoyer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ERPChatter;
