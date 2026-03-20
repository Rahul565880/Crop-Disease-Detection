import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const History = () => {
  const { t } = useTranslation();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchHistory();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/scans?page=1&limit=50`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setScans(data.scans || []);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/scans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setScans(scans.filter(scan => scan.scan_id !== id));
      }
    } catch (err) {
      setError('Failed to delete scan');
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      for (const scan of scans) {
        await fetch(`${API_BASE}/scans/${scan.scan_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setScans([]);
    } catch (err) {
      setError('Failed to clear history');
    }
  };

  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#1e293b';
  const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e2e8f0', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p style={{ color: textMuted }}>Loading history...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor, padding: '1.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>📋 Scan History</h1>
            <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{scans.length} total scans</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              style={{ background: darkMode ? '#374151' : '#22c55e', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            {scans.length > 0 && (
              <button 
                onClick={handleClearAll}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
              >
                🗑️ Clear All
              </button>
            )}
            <Link to="/upload" style={{ background: '#22c55e', color: '#fff', padding: '0.625rem 1.25rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem' }}>
              + New Scan
            </Link>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Empty State */}
        {scans.length === 0 ? (
          <div style={{ background: cardBg, borderRadius: '20px', padding: '3rem', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <span style={{ fontSize: '4rem' }}>🌱</span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: textColor, margin: '1rem 0 0.5rem 0' }}>No Scans Yet</h2>
            <p style={{ color: textMuted, margin: '0 0 1.5rem 0' }}>Start by scanning your first crop to detect diseases.</p>
            <Link to="/upload" style={{ display: 'inline-block', background: '#22c55e', color: '#fff', padding: '0.875rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>
              📷 Scan Your First Crop
            </Link>
          </div>
        ) : (
          /* Scans Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {scans.map((scan) => (
              <div key={scan.scan_id} style={{ background: cardBg, borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`, transition: 'transform 0.2s' }}>
                <Link to={`/result/${scan.scan_id}`} style={{ textDecoration: 'none' }}>
                  {/* Image */}
                  <div style={{ height: '160px', background: darkMode ? '#0f172a' : '#f1f5f9', position: 'relative' }}>
                    {scan.image_url ? (
                      <img 
                        src={scan.image_url.startsWith('http') ? scan.image_url : `${API_BASE.replace('/api', '')}${scan.image_url}`}
                        alt="Scan"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: textMuted }}>
                        📷
                      </div>
                    )}
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute', bottom: '10px', left: '10px',
                      padding: '0.375rem 0.875rem', borderRadius: '20px',
                      background: scan.disease_name?.toLowerCase().includes('healthy') ? '#22c55e' : '#ef4444',
                      color: '#fff', fontSize: '0.75rem', fontWeight: '600'
                    }}>
                      {scan.disease_name || 'Unknown'}
                    </div>
                  </div>
                </Link>
                
                {/* Content */}
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span style={{ color: textMuted, fontSize: '0.8rem' }}>📅</span>
                    <span style={{ color: textMuted, fontSize: '0.8rem' }}>{new Date(scan.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: textMuted }}>Confidence</p>
                      <p style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#22c55e' }}>
                        {scan.confidence_score ? (parseFloat(scan.confidence_score) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDelete(scan.scan_id)}
                      style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/dashboard" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default History;
