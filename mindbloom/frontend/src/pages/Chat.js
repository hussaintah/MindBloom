import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { API_URL } from '../lib/supabase';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

const STARTERS = [
  "I'm feeling stressed lately 😓",
  "I couldn't sleep well last night",
  "I want to feel more motivated",
  "Help me practice gratitude",
];

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi there! I'm Bloom, your personal wellness companion 🌸\n\nI'm here to listen, support, and help you build healthier habits. How are you feeling today?"
};

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  // Load chat history from Supabase on mount
  useEffect(() => {
    if (!user) return;
    fetchWithTimeout(`${API_URL}/api/chat/history/${user.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages && d.messages.length > 0) {
          setMessages(d.messages);
        }
      })
      .catch(() => {}) // silently fail — start fresh if history unavailable
      .finally(() => setLoadingHistory(false));
  }, [user]);

  // Save chat history to Supabase
  const saveHistory = useCallback(async (msgs) => {
    if (!user) return;
    try {
      await fetchWithTimeout(`${API_URL}/api/chat/history/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: msgs })
      });
    } catch {} // silently fail — don't interrupt the user experience
  }, [user]);

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
      const res = await fetchWithTimeout(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      }, 30000); // 30 second timeout for streaming

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

      // Save the full conversation after Bloom finishes responding
      const finalMessages = [
        ...newMessages,
        { role: 'assistant', content: assistantMsg }
      ];
      await saveHistory(finalMessages);

    } catch (err) {
      setIsTyping(false);
      const errMsg = err.message.includes('timed out')
        ? "Bloom is taking a moment to wake up — please try again in a few seconds 💙"
        : "Sorry, I'm having trouble connecting right now. Please try again in a moment 💙";
      const withError = [...newMessages, { role: 'assistant', content: errMsg }];
      setMessages(withError);
    }
  };

  const clearHistory = async () => {
    setMessages([INITIAL_MESSAGE]);
    await saveHistory([INITIAL_MESSAGE]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loadingHistory) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p className="text-muted">Loading your conversation...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Chat with Bloom 🌸</h1>
          <p>Your AI companion for mental wellness support</p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={clearHistory}
          style={{ marginTop: 8, fontSize: 12 }}
        >
          Clear chat
        </button>
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
