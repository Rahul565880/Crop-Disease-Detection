import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const CROPS = [
  { id: 'Tomato', icon: '🍅' }, { id: 'Potato', icon: '🥔' }, { id: 'Rice', icon: '🍚' },
  { id: 'Wheat', icon: '🌾' }, { id: 'Corn', icon: '🌽' }, { id: 'Cotton', icon: '🏵️' },
  { id: 'Chilli', icon: '🌶️' }, { id: 'Mango', icon: '🥭' }, { id: 'Banana', icon: '🍌' },
  { id: 'Grape', icon: '🍇' }, { id: 'Apple', icon: '🍎' }, { id: 'Groundnut', icon: '🥜' },
  { id: 'Soybean', icon: '🫘' },
];

const MarketPrices = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setStateFilter('Karnataka'),
        () => {},
        { timeout: 3000 }
      );
    }
  }, [darkMode]);

  useEffect(() => { fetchPrices(); }, [selectedCrop]);

  const fetchPrices = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_BASE}/market/prices?crop=${selectedCrop}${stateFilter ? '&state=Karnataka' : ''}`);
      const d = await r.json();
      setPrices(d.prices || []);
    } catch { setError('Failed to fetch prices'); }
    setLoading(false);
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const minPrice = prices.length ? Math.min(...prices.map(p => p.price)) : 0;
  const maxPrice = prices.length ? Math.max(...prices.map(p => p.price)) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((s, p) => s + p.price, 0) / prices.length) : 0;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>📈 Market Prices</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Current mandi rates across Indian markets</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {CROPS.map(c => (
          <button key={c.id} onClick={() => setSelectedCrop(c.id)} style={{
            padding: '0.75rem 0.4rem', borderRadius: '12px', border: `2px solid ${selectedCrop === c.id ? '#16a34a' : border}`,
            background: selectedCrop === c.id ? '#f0fdf4' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center'
          }}>
            <span style={{ fontSize: '1.3rem', display: 'block' }}>{c.icon}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: '600', color: selectedCrop === c.id ? '#166534' : textColor, display: 'block', marginTop: '0.2rem' }}>
              {c.id}
            </span>
          </button>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => { setStateFilter(stateFilter === '' ? 'Karnataka' : ''); }} style={{
            padding: '0.5rem 1.25rem', borderRadius: '9999px', border: `2px solid ${stateFilter ? '#16a34a' : border}`,
            background: stateFilter ? '#f0fdf4' : 'transparent', color: stateFilter ? '#166534' : textColor,
            cursor: 'pointer', fontWeight: stateFilter ? '700' : '500', fontSize: '0.8rem', transition: 'all 0.2s'
          }}>📍 Karnataka Markets</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>Loading prices...</div>
      ) : error ? (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px' }}>{error}</div>
      ) : prices.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: cardBg, borderRadius: '14px', padding: '1rem', textAlign: 'center', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.8rem', color: textMuted }}>Avg Price</span>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16a34a', margin: '0.25rem 0' }}>₹{avgPrice}</p>
              <span style={{ fontSize: '0.75rem', color: textMuted }}>per {prices[0]?.unit || 'kg'}</span>
            </div>
            <div style={{ background: cardBg, borderRadius: '14px', padding: '1rem', textAlign: 'center', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.8rem', color: textMuted }}>Lowest</span>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e', margin: '0.25rem 0' }}>₹{minPrice}</p>
            </div>
            <div style={{ background: cardBg, borderRadius: '14px', padding: '1rem', textAlign: 'center', border: `1px solid ${border}` }}>
              <span style={{ fontSize: '0.8rem', color: textMuted }}>Highest</span>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444', margin: '0.25rem 0' }}>₹{maxPrice}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {prices.map((p, i) => {
              const delta = maxPrice - minPrice || 1;
              const percent = ((p.price - minPrice) / delta) * 100;
              return (
                <div key={i} style={{ background: cardBg, borderRadius: '14px', padding: '1rem', border: `1px solid ${border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ color: textColor }}>{p.market}</strong>
                      {p.state === 'Karnataka' && <span style={{ marginLeft: '0.4rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>📍 KA</span>}
                      <span style={{ color: textMuted, fontSize: '0.8rem', marginLeft: '0.5rem' }}>{p.date}</span>
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: p.price >= avgPrice ? '#ef4444' : '#22c55e' }}>
                      ₹{p.price}/{p.unit}
                    </span>
                  </div>
                  <div style={{ height: '6px', background: border, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percent}%`, background: p.price >= avgPrice ? '#ef4444' : '#22c55e', borderRadius: '3px', transition: 'width 0.5s' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, background: cardBg, borderRadius: '16px', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '3rem' }}>📈</span>
          <p style={{ margin: '1rem 0 0' }}>No price data available for this crop</p>
        </div>
      )}
    </div>
  );
};

export default MarketPrices;
