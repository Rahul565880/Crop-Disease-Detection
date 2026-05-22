import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const cropEmojis = { Tomato: '🍅', Potato: '🥔', Corn: '🌽', Cotton: '🏵️', Chilli: '🌶️', Rice: '🍚', Wheat: '🌾', Mango: '🥭', Grape: '🍇', Apple: '🍎', Banana: '🍌' };

const DISEASE_ICONS = ['🦠', '🍄', '🧫', '🪰', '🐛', '🌿'];

const getDiseaseIcon = (name, idx) => {
  const low = (name || '').toLowerCase();
  if (low.includes('fungal') || low.includes('mildew') || low.includes('rust') || low.includes('smut') || low.includes('blight')) return '🍄';
  if (low.includes('bacterial') || low.includes('blight') || low.includes('spot') || low.includes('wilt')) return '🧫';
  if (low.includes('viral') || low.includes('curl') || low.includes('mosaic')) return '🪰';
  if (low.includes('healthy')) return '✅';
  return DISEASE_ICONS[idx % DISEASE_ICONS.length];
};

const DiseaseMap = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  useEffect(() => {
    const url = `${API_BASE}/map/outbreaks${cropFilter ? `?crop=${cropFilter}` : ''}`;
    fetch(url).then(r => r.json()).then(d => { setOutbreaks(d.outbreaks || []); setLoading(false); setSelectedKey(null); }).catch(() => setLoading(false));
  }, [cropFilter]);

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const grouped = {};
  outbreaks.forEach(o => {
    const key = `${o.disease_name} (${o.crop_type})`;
    if (!grouped[key]) grouped[key] = { disease: o.disease_name, crop: o.crop_type, count: 0, coords: [] };
    grouped[key].count++;
    if (o.latitude && o.longitude) grouped[key].coords.push({ lat: o.latitude, lng: o.longitude });
  });

  const getSeverity = (count) => count > 5 ? 'high' : count > 2 ? 'medium' : 'low';
  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'high': return { bg: '#fee2e2', color: '#dc2626', label: '⚠️ High Risk', border: '#fca5a5' };
      case 'medium': return { bg: '#fef3c7', color: '#d97706', label: '⚡ Medium Risk', border: '#fcd34d' };
      default: return { bg: '#dcfce7', color: '#16a34a', label: '✅ Low Risk', border: '#86efac' };
    }
  };

  const sorted = Object.entries(grouped).sort((a, b) => b[1].count - a[1].count);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>🗺️ Disease Outbreak Map</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{outbreaks.length} reports tracked across {Object.keys(grouped).length} disease types</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button onClick={() => setCropFilter('')} style={{
          padding: '0.6rem 1.25rem', borderRadius: '9999px', border: `2px solid ${!cropFilter ? '#16a34a' : border}`,
          background: !cropFilter ? '#f0fdf4' : 'transparent', color: !cropFilter ? '#166534' : textColor,
          cursor: 'pointer', fontWeight: !cropFilter ? '700' : '500', fontSize: '0.875rem', transition: 'all 0.2s'
        }}>🌾 All Crops</button>
        {Object.entries(cropEmojis).map(([crop, emoji]) => (
          <button key={crop} onClick={() => setCropFilter(crop)} style={{
            padding: '0.6rem 1.25rem', borderRadius: '9999px', border: `2px solid ${cropFilter === crop ? '#16a34a' : border}`,
            background: cropFilter === crop ? '#f0fdf4' : 'transparent', color: cropFilter === crop ? '#166534' : textColor,
            cursor: 'pointer', fontWeight: cropFilter === crop ? '700' : '500', fontSize: '0.875rem', transition: 'all 0.2s'
          }}>{emoji} {crop}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p>Loading outbreak data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, background: cardBg, borderRadius: '16px', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '3rem' }}>🗺️</span>
          <h3 style={{ color: textColor, margin: '1rem 0 0.5rem 0' }}>No Reports Yet</h3>
          <p>Upload scans with location enabled to contribute to the map</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {sorted.map(([key, info], idx) => {
            const isOpen = selectedKey === key;
            const severity = getSeverity(info.count);
            const sv = getSeverityStyle(severity);
            return (
              <div key={key} onClick={() => setSelectedKey(isOpen ? null : key)} style={{
                background: cardBg, borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
                border: `1px solid ${border}`, borderLeft: `4px solid ${sv.color}`,
                transition: 'all 0.2s', boxShadow: isOpen ? '0 4px 15px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getDiseaseIcon(info.disease, idx)}</span>
                    <div>
                      <strong style={{ color: textColor, fontSize: '1rem' }}>{info.disease}</strong>
                      <span style={{ color: textMuted, marginLeft: '0.5rem', fontSize: '0.85rem' }}>on {cropEmojis[info.crop] || '🌱'} {info.crop}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: sv.bg, color: sv.color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {sv.label}
                    </span>
                    <span style={{ background: sv.color, color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {info.count} reports
                    </span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${border}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                      <div style={{ padding: '0.75rem', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px' }}>
                        <span style={{ color: textMuted }}>📍 Locations mapped</span>
                        <p style={{ color: textColor, fontWeight: 700, margin: '0.25rem 0 0 0' }}>{info.coords.length}</p>
                      </div>
                      <div style={{ padding: '0.75rem', background: sv.bg, borderRadius: '10px' }}>
                        <span style={{ color: sv.color }}>⚠️ Severity Level</span>
                        <p style={{ color: sv.color, fontWeight: 700, margin: '0.25rem 0 0 0' }}>{sv.label}</p>
                      </div>
                    </div>
                    {info.coords.length > 0 && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: textMuted }}>
                        First detected: {new Date(outbreaks.find(o => o.disease_name === info.disease && o.crop_type === info.crop)?.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    )}
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
        </div>
      )}
    </div>
  );
};

export default DiseaseMap;
