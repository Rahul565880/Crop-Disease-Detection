import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const crops = ['Tomato', 'Rice', 'Wheat', 'Corn', 'Cotton', 'Mango', 'Groundnut', 'Soybean'];

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

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <h1 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>🧪 Fertilizer Calculator</h1>
      <p style={{ color: textMuted, marginBottom: '2rem' }}>Get NPK recommendations based on your crop and detected disease.</p>

      <div style={{ background: cardBg, borderRadius: '16px', padding: '1.5rem', border: `1px solid ${border}` }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', color: textColor, fontWeight: 600, marginBottom: '0.5rem' }}>Select Crop</label>
          <select value={selectedCrop} onChange={e => { setSelectedCrop(e.target.value); setResult(null); }} style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '1rem'
          }}>
            <option value="">-- Choose crop --</option>
            {crops.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', color: textColor, fontWeight: 600, marginBottom: '0.5rem' }}>Disease Code (optional)</label>
          <input value={diseaseCode} onChange={e => setDiseaseCode(e.target.value)} placeholder="e.g. early_blight, rice_blast" style={{
            width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${border}`, background: inputBg, color: textColor, fontSize: '1rem'
          }} />
        </div>

        <button onClick={fetchRecommendation} disabled={!selectedCrop || loading} style={{
          padding: '0.75rem 2rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px',
          fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1
        }}>{loading ? 'Loading...' : 'Get Recommendation'}</button>
      </div>

      {result && (
        <div style={{ background: cardBg, borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem', border: `1px solid ${border}` }}>
          <h3 style={{ color: '#16a34a', marginBottom: '1rem' }}>{result.crop}</h3>
          <div style={{ color: textColor, lineHeight: '1.8' }}>
            <h4 style={{ color: textColor, marginBottom: '0.5rem' }}>🌿 General Recommendation</h4>
            <p style={{ color: textMuted }}>{result.general}</p>

            {result.deficiency && (
              <>
                <h4 style={{ color: textColor, margin: '1rem 0 0.5rem' }}>⚠️ Deficiency Corrections</h4>
                {Object.entries(result.deficiency).map(([k, v]) => (
                  <div key={k} style={{ color: textMuted }}>• {k}: <strong style={{ color: textColor }}>{v}</strong></div>
                ))}
              </>
            )}

            {result.disease_recommendation && (
              <>
                <h4 style={{ color: textColor, margin: '1rem 0 0.5rem' }}>🦠 Disease-Specific</h4>
                <p style={{ color: textMuted }}>{result.disease_recommendation}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerCalculator;