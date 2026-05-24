import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com';
const WS_URL = import.meta.env.VITE_WS_URL || 'https://crop-disease-detection-98fp.onrender.com';

const ExpertChat = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  useEffect(() => {
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-chat', { userId: user.id || 'guest', userName: user.name || 'Farmer' });
    });

    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user-joined', (data) => {
      setOnlineCount(data.online);
      setTyping('');
    });

    socket.on('user-left', (data) => {
      setOnlineCount(data.online);
    });

    socket.on('user-typing', (data) => {
      setTyping(`${data.userName} is typing...`);
      setTimeout(() => setTyping(''), 2000);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => { socket.disconnect(); };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('send-message', {
      text: input.trim(),
      userId: user.id || 'guest',
      userName: user.name || 'Farmer',
    });
    setInput('');
  };

  const handleTyping = () => {
    if (socketRef.current) {
      socketRef.current.emit('typing', { userId: user.id || 'guest', userName: user.name || 'Farmer' });
    }
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const msgBg = darkMode ? '#334155' : '#f1f5f9';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>👨‍🌾 Expert Chat</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>
            {connected ? `🟢 ${onlineCount} farmer${onlineCount > 1 ? 's' : ''} online` : '🔴 Connecting...'}
          </p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ background: cardBg, borderRadius: '20px', overflow: 'hidden', border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', height: '70vh' }}>
        <div style={{ padding: '0.75rem 1rem', background: darkMode ? '#1e293b' : '#f8fafc', borderBottom: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>💬</span>
          <span style={{ color: textColor, fontWeight: 600, fontSize: '0.9rem' }}>Crop Disease Help — General Chat</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: textMuted }}>👤 You: {user.name || 'Farmer'}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: textMuted }}>
              <span style={{ fontSize: '3rem' }}>🌾</span>
              <p style={{ margin: '1rem 0 0' }}>No messages yet. Start a conversation!</p>
              <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0' }}>Ask about disease treatments, fertilizer advice, or share tips</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.userId === (user.id || 'guest');
            const isBot = msg.isBot;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '16px', maxWidth: isBot ? '90%' : '75%', wordWrap: 'break-word',
                  background: isBot ? (darkMode ? '#1e3a2f' : '#f0fdf4') : isMe ? '#16a34a' : msgBg,
                  color: isBot ? '#16a34a' : isMe ? '#fff' : textColor,
                  border: isBot ? `1px solid ${darkMode ? '#166534' : '#bbf7d0'}` : 'none',
                }}>
                  {!isMe && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', display: 'block', marginBottom: '0.25rem' }}>{isBot ? '🤖' : ''} {msg.userName}</span>}
                  <span style={{ fontSize: '0.9rem', whiteSpace: 'pre-line' }}>{msg.text}</span>
                </div>
                <span style={{ fontSize: '0.65rem', color: textMuted, marginTop: '0.25rem', padding: '0 0.5rem' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
          {typing && <span style={{ fontSize: '0.8rem', color: textMuted, fontStyle: 'italic', padding: '0 0.5rem' }}>{typing}</span>}
          <div ref={chatEndRef} />
        </div>

        <div style={{ padding: '0.75rem 1rem', borderTop: `1px solid ${border}`, display: 'flex', gap: '0.75rem' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendMessage(); else handleTyping(); }} placeholder="Type your message..." style={{
            flex: 1, padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, background: darkMode ? '#0f172a' : '#f1f5f9',
            color: textColor, fontSize: '0.95rem', outline: 'none'
          }} />
          <button onClick={sendMessage} disabled={!input.trim() || !connected} style={{
            padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none', background: !input.trim() || !connected ? '#9ca3af' : '#16a34a',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: !input.trim() || !connected ? 'not-allowed' : 'pointer'
          }}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ExpertChat;
