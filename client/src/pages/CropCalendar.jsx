import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const cropEmojis = { Tomato: '🍅', Potato: '🥔', Corn: '🌽', Cotton: '🌿', Chilli: '🌶️', Rice: '🌾', Wheat: '🌾', Sugarcane: '🎋', Turmeric: '🧡', Banana: '🍌', Grape: '🍇', Apple: '🍎', Mango: '🥭', Groundnut: '🥜', Soybean: '🫘' };

const CropCalendar = () => {
  const { t } = useTranslation();
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/calendar`).then(r => r.json()).then(d => { setCalendar(d.crops || {}); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  const bg = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const textMuted = darkMode ? '#94a3b8' : '#64748b';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: textColor }}>Loading calendar...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <h1 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>📅 Crop Calendar</h1>
      <p style={{ color: textMuted, marginBottom: '2rem' }}>Planting, fertilizing, and harvesting schedule for each crop.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {Object.entries(calendar).map(([crop, info]) => (
          <div key={crop} onClick={() => setSelectedCrop(selectedCrop === crop ? null : crop)} style={{
            background: cardBg, borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, transition: 'all 0.2s',
            boxShadow: selectedCrop === crop ? '0 0 0 2px #16a34a' : '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '2rem' }}>{cropEmojis[crop] || '🌱'}</span>
              <h3 style={{ margin: 0, color: textColor }}>{crop}</h3>
            </div>
            <div style={{ fontSize: '0.9rem', color: textMuted, lineHeight: '1.8' }}>
              <div>🌱 Sow: <strong style={{ color: textColor }}>{info.sow || 'N/A'}</strong></div>
              {info.transplant && <div>🌿 Transplant: <strong style={{ color: textColor }}>{info.transplant}</strong></div>}
              <div>🍂 Harvest: <strong style={{ color: textColor }}>{info.harvest || 'N/A'}</strong></div>
              {selectedCrop === crop && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}` }}>
                  <div>🧪 Fertilizer: <strong style={{ color: '#16a34a' }}>{info.fertilizer}</strong></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropCalendar;
