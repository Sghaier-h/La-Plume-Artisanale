/**
 * AIERP - Intelligence Artificielle
 * Version complète avec design ERP moderne
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ERPHeader, ERPNotebook, ERPButtonBox } from '../../components/erp';
import { Sparkles, Send, Bot, Search } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIERP: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { message: input });
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response || 'Réponse de l\'IA',
        timestamp: new Date().toISOString()
      };
      setMessages([...messages, userMessage, assistantMessage]);
    } catch (error) {
      console.error('Erreur chat IA:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-layout">
      <ERPHeader
        title="Intelligence Artificielle"
        breadcrumb={[
          { label: 'IA' }
        ]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} />
            <span style={{ fontSize: '14px' }}>Assistant IA</span>
          </div>
        }
      />

      <div className="erp-content">
        <div className="erp-form-view" style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', marginBottom: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px', color: 'var(--erp-text-muted)' }}>
                <Bot size={64} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                <p>Commencez une conversation avec l'assistant IA</p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      borderRadius: 'var(--erp-border-radius-lg)',
                      background: message.role === 'user' 
                        ? 'var(--erp-primary-gradient)' 
                        : 'var(--erp-bg-secondary)',
                      color: message.role === 'user' ? 'white' : 'var(--erp-text-primary)',
                      boxShadow: 'var(--erp-shadow)'
                    }}
                  >
                    <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                      {message.content}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      marginTop: '8px', 
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--erp-border-radius-lg)',
                  background: 'var(--erp-bg-secondary)',
                  color: 'var(--erp-text-muted)'
                }}>
                  <Bot size={16} style={{ display: 'inline-block', marginRight: '8px', animation: 'pulse 1s infinite' }} />
                  En train de réfléchir...
                </div>
              </div>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            padding: '16px', 
            borderTop: '2px solid var(--erp-border-color)',
            background: 'var(--erp-bg-primary)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="erp-field-input"
              placeholder="Posez votre question..."
              style={{ flex: 1 }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="erp-btn erp-btn-primary"
            >
              <Send size={16} style={{ marginRight: '4px' }} />
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIERP;
