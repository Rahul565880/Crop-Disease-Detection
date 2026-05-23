import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const CommunityFeed = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', crop_type: '', disease_name: '' });
  const [error, setError] = useState('');

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);
  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const r = await fetch(`${API_BASE}/community/posts?limit=50`);
      const d = await r.json();
      setPosts(d.posts || []);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description) return;
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(`${API_BASE}/community/posts`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (r.ok) { setForm({ title: '', description: '', crop_type: '', disease_name: '' }); setShowForm(false); fetchPosts(); }
      else setError('Failed to create post');
    } catch { setError('Network error'); }
  };

  const handleLike = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const r = await fetch(`${API_BASE}/community/posts/${id}/like`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }
      });
      if (r.ok) fetchPosts();
    } catch {}
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f1f5f9';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>🌾 Community Feed</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Share crop experiences, photos, and solutions</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
          }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          <button onClick={() => setShowForm(!showForm)} style={{
            background: '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
          }}>{showForm ? '✕ Cancel' : '+ New Post'}</button>
        </div>
      </div>

      {error && <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '10px', marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${border}` }}>
          <h3 style={{ color: textColor, margin: '0 0 1rem 0', fontSize: '1rem' }}>✍️ Share Your Experience</h3>
          <div style={{ marginBottom: '0.75rem' }}>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title *" style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '0.95rem', outline: 'none'
            }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your experience *" rows={3} style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '0.95rem', outline: 'none', resize: 'vertical'
            }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <input value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} placeholder="Crop type (optional)" style={{
              padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '0.9rem', outline: 'none'
            }} />
            <input value={form.disease_name} onChange={e => setForm({ ...form, disease_name: e.target.value })} placeholder="Disease name (optional)" style={{
              padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '0.9rem', outline: 'none'
            }} />
          </div>
          <button onClick={handleSubmit} disabled={!form.title || !form.description} style={{
            width: '100%', padding: '0.75rem', borderRadius: '12px', border: 'none', background: !form.title || !form.description ? '#9ca3af' : '#16a34a',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: !form.title || !form.description ? 'not-allowed' : 'pointer'
          }}>📤 Share Post</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>Loading posts...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, background: cardBg, borderRadius: '16px', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '3rem' }}>🌾</span>
          <p style={{ margin: '1rem 0 0' }}>No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {posts.map(post => (
            <div key={post.post_id} style={{ background: cardBg, borderRadius: '16px', padding: '1.25rem', border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: textColor, fontSize: '1rem' }}>{post.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: textMuted }}>👤 {post.user_name} • {new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {post.crop_type && <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', background: '#f0fdf4', color: '#16a34a', fontWeight: 600 }}>{post.crop_type}</span>}
                  {post.disease_name && <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', background: '#fee2e2', color: '#dc2626', fontWeight: 600 }}>{post.disease_name}</span>}
                </div>
              </div>
              <p style={{ color: textMuted, fontSize: '0.9rem', lineHeight: '1.6', margin: '0.5rem 0' }}>{post.description}</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${border}`, fontSize: '0.85rem', color: textMuted }}>
                <button onClick={() => handleLike(post.post_id)} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  👍 {post.likes || 0}
                </button>
                <span>💬 {post.comments_count || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;
