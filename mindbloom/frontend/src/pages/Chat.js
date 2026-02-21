import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';

const STARTERS = [
  "I'm feeling stressed lately 😓",
  "I couldn't sleep well last night",
  "I want to feel more motivated",
  "Help me practice gratitude",
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! I'm Bloom, your personal wellness companion 🌸\n\nI'm here to listen, support, and help you build healthier habits. How are you feeling today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantMsg = '';

      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                assistantMsg += data.content;
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: assistantMsg };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again in a moment 💙" }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Chat with Bloom 🌸</h1>
        <p>Your AI companion for mental wellness support</p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}>
              {msg.role === 'assistant' && (
                <div className="message-avatar">🌸</div>
              )}
              <div className="message-bubble" style={{ whiteSpace: 'pre-wrap' }}>
                {msg.content || <span style={{ opacity: 0.5 }}>...</span>}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🌸</div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Starter prompts */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {STARTERS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)} className="btn btn-outline btn-sm" style={{ borderRadius: 50 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-area">
          <input
            className="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share what's on your mind..."
            disabled={isTyping}
          />
          <button
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{ borderRadius: 50, padding: '12px 20px' }}
          >
            ↑
          </button>
        </div>
        <p className="text-muted" style={{ textAlign: 'center', marginTop: 8 }}>
          Bloom is an AI companion, not a substitute for professional mental health care.
        </p>
      </div>
    </div>
  );
}
