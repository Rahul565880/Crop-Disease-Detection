import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const AgriStores = () => {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5000);
  const [error, setError] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => { document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc'; }, [darkMode]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setError('Location access denied. Enable GPS to find nearby stores.'),
        { timeout: 8000 }
      );
    }
  }, []);

  const searchStores = async () => {
    if (!location) return;
    setLoading(true); setError('');
    try {
      const r = await fetch(`${API_BASE}/stores/nearby?lat=${location.lat}&lon=${location.lon}&radius=${searchRadius}`);
      const d = await r.json();
      setStores(d.stores || []);
      setRegion(d.region || '');
      if (d.stores?.length === 0) setError('No agricultural stores found nearby. Try increasing radius.');
    } catch { setError('Failed to find nearby stores'); }
    setLoading(false);
  };

  const bg = darkMode ? '#0f172a' : '#f8fafc'; const cardBg = darkMode ? '#1e293b' : 'white';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b'; const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const border = darkMode ? '#334155' : '#e2e8f0';

  const storeTypeIcon = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('fertilizer') || t.includes('agrarian')) return '🧪';
    if (t.includes('pesticide')) return '🧴';
    return '🏪';
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto', background: bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#16a34a', margin: 0 }}>🏪 Nearby Agri Stores</h1>
          <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Find pesticide, fertilizer & agricultural supply shops</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={{
          background: darkMode ? '#374151' : '#16a34a', color: '#fff', border: 'none', padding: '0.625rem 1.25rem',
          borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
        }}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
      </div>

      <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', color: textColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>📍 Location</label>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: darkMode ? '#0f172a' : '#f1f5f9', color: textColor }}>
              {location ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}` : 'Detecting location...'} {region && <span style={{ color: '#16a34a', fontWeight: 600 }}> • 📍 {region}</span>}
            </div>
          </div>
          <div style={{ minWidth: '120px' }}>
            <label style={{ display: 'block', color: textColor, fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>📏 Radius</label>
            <select value={searchRadius} onChange={e => setSearchRadius(Number(e.target.value))} style={{
              width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${border}`, background: darkMode ? '#0f172a' : '#f1f5f9', color: textColor, fontSize: '0.9rem'
            }}>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={25000}>25 km</option>
            </select>
          </div>
          <button onClick={searchStores} disabled={!location || loading} style={{
            padding: '0.75rem 2rem', background: !location ? '#9ca3af' : '#16a34a', color: '#fff', border: 'none',
            borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: !location ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}>{loading ? '🔍 Searching...' : '🔍 Search'}</button>
        </div>
      </div>

      {error && !loading && (
        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '1rem' }}>{error}</div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted }}>Searching nearby stores...</div>
      ) : stores.length > 0 ? (
        <>
          <p style={{ color: textMuted, marginBottom: '1rem', fontSize: '0.9rem' }}>Found {stores.length} stores within {searchRadius / 1000}km</p>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {stores.map(store => (
              <div key={store.id} style={{ background: cardBg, borderRadius: '14px', padding: '1.25rem', border: `1px solid ${border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2rem' }}>{storeTypeIcon(store.type)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ margin: 0, color: textColor, fontSize: '1rem' }}>{store.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: textMuted, display: 'block', marginTop: '0.25rem' }}>
                          {store.address || `${store.lat?.toFixed(4)}, ${store.lon?.toFixed(4)}`}
                        </span>
                      </div>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, background: '#dcfce7', color: '#16a34a' }}>
                        {store.type}
                      </span>
                    </div>
                    {store.phone && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: textMuted }}>📞 {store.phone}</p>}
                    {store.openingHours && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: textMuted }}>🕐 {store.openingHours}</p>}
                    <a href={`https://www.google.com/maps?q=${store.lat},${store.lon}`} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-block', marginTop: '0.5rem', color: '#16a34a', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none'
                    }}>📍 Open in Maps →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : !error && location ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: textMuted, background: cardBg, borderRadius: '16px', border: `1px solid ${border}` }}>
          <span style={{ fontSize: '3rem' }}>🏪</span>
          <p style={{ margin: '1rem 0 0' }}>Click "Search" to find nearby agricultural stores</p>
        </div>
      ) : null}
    </div>
  );
};

export default AgriStores;
