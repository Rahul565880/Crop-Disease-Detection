import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const SCHEME_TYPES = [
  { value: '', label: 'All Types', icon: '📋' },
  { value: 'direct_benefit', label: 'Direct Benefit', icon: '💰' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'credit', label: 'Credit/Loan', icon: '💳' },
  { value: 'subsidy', label: 'Subsidy', icon: '🧾' },
  { value: 'advisory', label: 'Advisory', icon: '🧪' },
  { value: 'employment', label: 'Employment', icon: '🔧' },
  { value: 'market', label: 'Market Support', icon: '📈' },
];

const Schemes = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedScheme, setSelectedScheme] = useState(null);

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);
  useEffect(() => { fetchSchemes(); }, [typeFilter]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/schemes${typeFilter ? `?type=${typeFilter}` : ''}`;
      const r = await fetch(url);
      const d = await r.json();
      setSchemes(d.schemes || []);
    } catch {}
    setLoading(false);
  };

  const filtered = schemes.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.benefit.toLowerCase().includes(search.toLowerCase())
  );

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';
  const inputBg = darkMode ? '#0f172a' : '#f1f5f9';

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>🏛️ Government Schemes</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Agricultural schemes, subsidies, and insurance programs</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search schemes..." style={{
            flex: 1, padding: '0.85rem 1.25rem', borderRadius: '12px', border: `2px solid ${border}`, fontSize: '0.95rem',
            outline: 'none', background: cardBg, color: textColor
          }} />
          <button onClick={() => {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) { alert('Voice input not supported in this browser'); return; }
            const recog = new SpeechRecognition(); recog.lang = 'en-US';
            recog.onresult = (e) => setSearch(e.results[0][0].transcript);
            recog.start();
          }} title="Voice input" style={{ padding: '0.75rem 1rem', borderRadius: '12px', border: `2px solid ${border}`, background: cardBg, color: textColor, cursor: 'pointer', fontSize: '1.1rem' }}>🎤</button>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {SCHEME_TYPES.map(t => (
            <button key={t.value} onClick={() => { setTypeFilter(t.value); setSelectedScheme(null); }} style={{
              padding: '0.5rem 1rem', borderRadius: '9999px', border: `2px solid ${typeFilter === t.value ? '#16a34a' : border}`,
              background: typeFilter === t.value ? '#f0fdf4' : 'transparent', color: typeFilter === t.value ? '#166534' : textColor,
              cursor: 'pointer', fontWeight: typeFilter === t.value ? '700' : '500', fontSize: '0.8rem', transition: 'all 0.2s'
            }}>{t.icon} {t.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>Loading schemes...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filtered.map(scheme => {
            const isOpen = selectedScheme?.id === scheme.id;
            return (
              <div key={scheme.id} onClick={() => setSelectedScheme(isOpen ? null : scheme)} style={{
                background: cardBg, borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
                border: `1px solid ${isOpen ? '#16a34a' : border}`, transition: 'all 0.2s',
                boxShadow: isOpen ? '0 0 0 2px rgba(22,163,74,0.2)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{scheme.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: textColor, fontSize: '1rem' }}>{scheme.name}</h3>
                        <span style={{ fontSize: '0.8rem', color: textMuted }}>{scheme.ministry}</span>
                      </div>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>
                        {scheme.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.9rem', margin: '0.5rem 0 0' }}>{scheme.benefit}</p>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${border}` }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: textColor, margin: '0 0 0.5rem 0' }}>✅ Eligibility</h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: textMuted, fontSize: '0.85rem' }}>
                        {scheme.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: textColor, margin: '0 0 0.5rem 0' }}>📝 How to Apply</h4>
                      <p style={{ color: textMuted, fontSize: '0.85rem', margin: 0 }}>{scheme.howToApply}</p>
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                  <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: 500 }}>
                    {isOpen ? '▲ Less' : '▼ More'}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, background: cardBg, borderRadius: '16px', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '3rem' }}>🏛️</span>
              <p style={{ margin: '1rem 0 0' }}>No schemes match your filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Schemes;
