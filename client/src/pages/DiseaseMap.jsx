import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const DiseaseMap = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cropFilter, setCropFilter] = useState('');

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  useEffect(() => {
    const url = `${API_BASE}/map/outbreaks${cropFilter ? `?crop=${cropFilter}` : ''}`;
    fetch(url).then(r => r.json()).then(d => { setOutbreaks(d.outbreaks || []); setLoading(false); }).catch(() => setLoading(false));
  }, [cropFilter]);

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  // Group by disease for aggregation
  const grouped = {};
  outbreaks.forEach(o => {
    const key = `${o.disease_name} (${o.crop_type})`;
    if (!grouped[key]) grouped[key] = { disease: o.disease_name, crop: o.crop_type, count: 0, coords: [] };
    grouped[key].count++;
    if (o.latitude && o.longitude) grouped[key].coords.push({ lat: o.latitude, lng: o.longitude });
  });

  const getSeverityColor = (count) => count > 5 ? '#ef4444' : count > 2 ? '#f59e0b' : '#22c55e';

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <h1 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>🗺️ Disease Outbreak Map</h1>
      <p style={{ color: textMuted, marginBottom: '1rem' }}>See where diseases are being reported in your area.</p>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <select value={cropFilter} onChange={e => { setCropFilter(e.target.value); setLoading(true); }} style={{
          padding: '0.6rem 1rem', borderRadius: '8px', border: `1px solid ${border}`, background: cardBg, color: textColor
        }}>
          <option value="">All Crops</option>
          {['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat', 'Cotton', 'Chilli', 'Mango'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ color: textMuted, alignSelf: 'center' }}>{outbreaks.length} reports found</span>
      </div>

      {loading ? <div style={{ textAlign: 'center', color: textMuted, padding: '4rem' }}>Loading...</div> : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {Object.entries(grouped).sort((a, b) => b[1].count - a[1].count).map(([key, info]) => (
            <div key={key} style={{
              background: cardBg, borderRadius: '12px', padding: '1.25rem', border: `1px solid ${border}`,
              borderLeft: `4px solid ${getSeverityColor(info.count)}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: textColor }}>{info.disease}</strong>
                  <span style={{ color: textMuted, marginLeft: '0.5rem' }}>on {info.crop}</span>
                </div>
                <span style={{
                  background: getSeverityColor(info.count), color: 'white', padding: '0.25rem 0.75rem',
                  borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600
                }}>{info.count} reports</span>
              </div>
              {info.coords.length > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: textMuted }}>
                  📍 {info.coords.length} location{info.coords.length > 1 ? 's' : ''} mapped
                </div>
              )}
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>No disease reports with location data yet. Upload scans with location enabled to contribute!</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiseaseMap;
