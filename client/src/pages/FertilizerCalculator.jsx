import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const CROPS = [
  { id: 'Tomato', name: 'Tomato', icon: '🍅' },
  { id: 'Rice', name: 'Rice', icon: '🍚' },
  { id: 'Wheat', name: 'Wheat', icon: '🌾' },
  { id: 'Corn', name: 'Corn', icon: '🌽' },
  { id: 'Cotton', name: 'Cotton', icon: '🏵️' },
  { id: 'Mango', name: 'Mango', icon: '🥭' },
  { id: 'Groundnut', name: 'Groundnut', icon: '🥜' },
  { id: 'Soybean', name: 'Soybean', icon: '🫘' },
  { id: 'Potato', name: 'Potato', icon: '🥔' },
  { id: 'Banana', name: 'Banana', icon: '🍌' },
  { id: 'Grape', name: 'Grape', icon: '🍇' },
  { id: 'Apple', name: 'Apple', icon: '🍎' },
];

const FertilizerCalculator = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [diseaseCode, setDiseaseCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const inputBg = darkMode ? '#0f172a' : '#f1f5f9'; const border = darkMode ? '#334155' : '#e2e8f0';

  const fetchRecommendation = async () => {
    if (!selectedCrop) return;
    setLoading(true);
    try {
      const url = `${API_BASE}/fertilizer?crop=${selectedCrop}${diseaseCode ? `&disease=${diseaseCode}` : ''}`;
      const r = await fetch(url); const d = await r.json();
      setResult(d);
    } catch { setResult(null); }
    setLoading(false);
  };

  const parseNPK = (text) => {
    if (!text) return null;
    const n = text.match(/N[:\s]*(\d+)/i);
    const p = text.match(/P[:\s]*(\d+)/i);
    const k = text.match(/K[:\s]*(\d+)/i);
    if (n || p || k) return { n: n?.[1], p: p?.[1], k: k?.[1] };
    const ratio = text.match(/(\d+)[-\s](\d+)[-\s](\d+)/);
    if (ratio) return { n: ratio[1], p: ratio[2], k: ratio[3] };
    return null;
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>🧪 Fertilizer Calculator</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Get NPK recommendations based on crop and disease</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${border}` }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>🌱 Select Crop</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {CROPS.map((crop) => (
            <button key={crop.id} onClick={() => { setSelectedCrop(crop.id); setResult(null); }} style={{
              padding: '0.875rem 0.5rem', borderRadius: '12px',
              border: `2px solid ${selectedCrop === crop.id ? '#16a34a' : border}`,
              background: selectedCrop === crop.id ? '#f0fdf4' : 'transparent',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', display: 'block' }}>{crop.icon}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: selectedCrop === crop.id ? '#166534' : textColor, display: 'block', marginTop: '0.25rem' }}>
                {crop.name}
              </span>
            </button>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: textColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>🦠 Disease Code (optional)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} placeholder="e.g. early_blight, rice_blast" style={{
              flex: 1, padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '0.95rem', outline: 'none'
            }} />
            <button onClick={() => {
              const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
              if (!SpeechRecognition) { alert('Voice input not supported in this browser'); return; }
              const recog = new SpeechRecognition(); recog.lang = 'en-US';
              recog.onresult = (e) => setDiseaseCode(e.results[0][0].transcript);
              recog.start();
            }} title="Voice input" style={{ padding: '0.75rem', borderRadius: '10px', border: `1px solid ${border}`, background: inputBg, color: textColor, cursor: 'pointer', fontSize: '1.1rem' }}>🎤</button>
          </div>
        </div>

        <button onClick={fetchRecommendation} disabled={!selectedCrop || loading} style={{
          width: '100%', padding: '0.85rem', background: !selectedCrop ? '#9ca3af' : '#16a34a', color: 'white', border: 'none',
          borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: !selectedCrop ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1, transition: 'all 0.2s'
        }}>{loading ? '⏳ Calculating...' : '🔬 Get Recommendation'}</button>
      </div>

      {result && (
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '2rem' }}>{CROPS.find(c => c.id === result.crop)?.icon || '🌱'}</span>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, margin: 0 }}>{result.crop}</h2>
              {result.disease_recommendation && (
                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 500 }}>🩺 Disease-specific guidance</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ color: textColor, margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>🌿 General Recommendation</h4>
            <p style={{ color: textMuted, lineHeight: '1.6', fontSize: '0.9rem', margin: 0 }}>{result.general}</p>
          </div>

          {(() => {
            const npk = parseNPK(result.general);
            if (!npk) return null;
            const maxVal = Math.max(Number(npk.n) || 0, Number(npk.p) || 0, Number(npk.k) || 0, 1);
            return (
              <div style={{ marginBottom: '1.25rem', padding: '1rem', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
                <h4 style={{ color: textColor, margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>📊 NPK Ratio</h4>
                {[
                  { label: 'Nitrogen (N)', value: Number(npk.n) || 0, color: '#22c55e' },
                  { label: 'Phosphorus (P)', value: Number(npk.p) || 0, color: '#f59e0b' },
                  { label: 'Potassium (K)', value: Number(npk.k) || 0, color: '#ef4444' },
                ].map(item => (
                  <div key={item.label} style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: textMuted, marginBottom: '0.25rem' }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
                    </div>
                    <div style={{ height: '8px', background: border, borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(item.value / maxVal) * 100}%`, background: item.color, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {result.deficiency && (
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ color: textColor, margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>⚠️ Deficiency Corrections</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {Object.entries(result.deficiency).map(([k, v]) => (
                  <div key={k} style={{ padding: '0.75rem', background: '#fef3c7', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.85rem' }}>{k}</span>
                    <span style={{ color: '#a16207', fontSize: '0.85rem', marginLeft: '0.5rem' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.disease_recommendation && (
            <div style={{ padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              <h4 style={{ color: '#166534', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>🦠 Disease-Specific Guidance</h4>
              <p style={{ color: '#15803d', lineHeight: '1.6', fontSize: '0.9rem', margin: 0 }}>{result.disease_recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FertilizerCalculator;
