import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const History = () => {
  const { t } = useTranslation();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#1a1a2e';
    } else {
      document.body.style.backgroundColor = '#f5f5f5';
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const theme = darkMode ? darkStyles : lightStyles;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/scans?page=1&limit=50', {
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
      const response = await fetch(`http://localhost:5000/api/scans/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setScans(scans.filter(scan => scan.scan_id !== id));
      }
    } catch (err) {
      setError('Failed to delete scan');
    }
    setShowDeleteConfirm(false);
    setDeleteId(null);
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      for (const scan of scans) {
        await fetch(`http://localhost:5000/api/scans/${scan.scan_id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setScans([]);
    } catch (err) {
      setError('Failed to clear history');
    }
    setShowDeleteConfirm(false);
  };

  const getStatusColor = (diseaseName) => {
    if (!diseaseName) return '#999';
    return diseaseName.toLowerCase().includes('healthy') ? '#4CAF50' : '#FF5722';
  };

  if (loading) {
    return (
      <div style={theme.container}>
        <div style={theme.loading}>
          <div style={theme.spinner}></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={theme.container}>
      <div style={theme.header}>
        <div>
          <h1 style={theme.title}>📋 {t('history.title')}</h1>
          <p style={theme.subtitle}>{scans.length} {t('history.totalScans')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {scans.length > 0 && (
            <button 
              onClick={() => setShowDeleteConfirm({ type: 'all' })} 
              style={theme.deleteAllBtn}
            >
              🗑️ Clear All
            </button>
          )}
          <button onClick={() => setDarkMode(!darkMode)} style={theme.darkModeBtn}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link to="/upload" style={theme.newScanBtn}>
            + New Scan
          </Link>
        </div>
      </div>

      {error && (
        <div style={theme.error}>{error}</div>
      )}

      {scans.length === 0 ? (
        <div style={theme.empty}>
          <div style={theme.emptyIcon}>🌱</div>
          <h2 style={theme.emptyTitle}>{t('history.noScansYet')}</h2>
          <p style={theme.emptyText}>{t('history.scanFirst')}</p>
          <Link to="/upload" style={theme.scanBtn}>
            📷 Scan Your First Crop
          </Link>
        </div>
      ) : (
        <div style={theme.grid}>
          {scans.map((scan) => (
            <div key={scan.scan_id} style={theme.card}>
              <Link to={`/result/${scan.scan_id}`} style={theme.cardLink}>
                <div style={theme.imageWrapper}>
                  {scan.image_url ? (
                    <img 
                      src={scan.image_url.startsWith('http') ? scan.image_url : `http://localhost:5000${scan.image_url}`} 
                      alt="Scan" 
                      style={theme.image}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'}
                    />
                  ) : (
                    <div style={theme.noImage}>📷</div>
                  )}
                  <span style={{
                    ...theme.statusBadge,
                    background: getStatusColor(scan.disease_name)
                  }}>
                    {scan.disease_name || 'Unknown'}
                  </span>
                </div>
                
                <div style={theme.cardContent}>
                  <div style={theme.dateRow}>
                    <span style={theme.dateIcon}>📅</span>
                    <span style={theme.date}>
                      {new Date(scan.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div style={theme.statsRow}>
                    <div style={theme.stat}>
                      <span style={theme.statLabel}>{t('history.confidence')}</span>
                      <span style={{...theme.statValue, color: '#4CAF50'}}>
                        {scan.confidence_score ? (parseFloat(scan.confidence_score) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div style={theme.stat}>
                      <span style={theme.statLabel}>{t('history.crop')}</span>
                      <span style={theme.statValue}>
                        {scan.disease?.crop_type || 'General'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <button 
                onClick={() => { setDeleteId(scan.scan_id); setShowDeleteConfirm({ type: 'single' }); }}
                style={theme.deleteBtn}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {showDeleteConfirm && (
        <div style={theme.confirmOverlay}>
          <div style={theme.confirmBox}>
            <h3 style={theme.confirmTitle}>
              {showDeleteConfirm.type === 'all' ? '🗑️ Clear All History?' : '🗑️ Delete This Scan?'}
            </h3>
            <p style={theme.confirmText}>
              {showDeleteConfirm.type === 'all' 
                ? 'This will permanently delete all your scan history.' 
                : 'This will permanently delete this scan.'}
            </p>
            <div style={theme.confirmBtns}>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }} style={theme.cancelBtn}>
                Cancel
              </button>
              <button 
                onClick={() => showDeleteConfirm.type === 'all' ? handleClearAll() : handleDelete(deleteId)} 
                style={theme.confirmDeleteBtn}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const lightStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.25rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '0.875rem'
  },
  darkModeBtn: {
    background: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  },
  deleteAllBtn: {
    background: '#ffebee',
    color: '#c62828',
    border: '1px solid #ffcdd2',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem',
    transition: 'all 0.2s'
  },
  newScanBtn: {
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    padding: '0.625rem 1.25rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
  },
  loading: {
    textAlign: 'center',
    padding: '4rem',
    color: '#666'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #eee',
    borderTopColor: '#4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 1rem'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  },
  empty: {
    textAlign: 'center',
    padding: '4rem 2rem',
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  emptyTitle: {
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  emptyText: {
    color: '#666',
    marginBottom: '1.5rem'
  },
  scanBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem'
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative'
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit',
    display: 'block'
  },
  imageWrapper: {
    position: 'relative',
    height: '160px'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  noImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    background: '#f5f5f5',
    color: '#ccc'
  },
  statusBadge: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    padding: '0.375rem 0.875rem',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '600',
    maxWidth: '80%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  deleteBtn: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.2s'
  },
  cardContent: {
    padding: '1rem'
  },
  dateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem'
  },
  dateIcon: {
    fontSize: '0.875rem'
  },
  date: {
    color: '#666',
    fontSize: '0.875rem'
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  stat: {
    display: 'flex',
    flexDirection: 'column'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#999',
    marginBottom: '0.125rem'
  },
  statValue: {
    fontWeight: '600',
    color: '#1a1a2e'
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  confirmBox: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '16px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center'
  },
  confirmTitle: {
    color: '#1a1a2e',
    marginBottom: '0.75rem'
  },
  confirmText: {
    color: '#666',
    marginBottom: '1.5rem'
  },
  confirmBtns: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    background: '#fff',
    color: '#333',
    cursor: 'pointer',
    fontWeight: '500'
  },
  confirmDeleteBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    border: 'none',
    background: '#f44336',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '500'
  }
};

const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    background: '#1a1a2e'
  },
  title: {
    ...lightStyles.title,
    color: '#fff'
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: '#aaa'
  },
  darkModeBtn: {
    ...lightStyles.darkModeBtn,
    background: '#2d2d44',
    color: '#fff',
    border: '1px solid #3d3d5c'
  },
  deleteAllBtn: {
    ...lightStyles.deleteAllBtn,
    background: '#3d2828',
    color: '#ff6b6b',
    border: '1px solid #5d3a3a'
  },
  empty: {
    ...lightStyles.empty,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  emptyTitle: {
    ...lightStyles.emptyTitle,
    color: '#fff'
  },
  emptyText: {
    ...lightStyles.emptyText,
    color: '#aaa'
  },
  grid: {
    ...lightStyles.grid
  },
  card: {
    ...lightStyles.card,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  noImage: {
    ...lightStyles.noImage,
    background: '#3d3d5c',
    color: '#666'
  },
  deleteBtn: {
    ...lightStyles.deleteBtn,
    background: 'rgba(45,45,68,0.9)'
  },
  cardContent: {
    ...lightStyles.cardContent,
    background: '#2d2d44'
  },
  date: {
    ...lightStyles.date,
    color: '#aaa'
  },
  statLabel: {
    ...lightStyles.statLabel,
    color: '#888'
  },
  statValue: {
    ...lightStyles.statValue,
    color: '#fff'
  },
  confirmBox: {
    ...lightStyles.confirmBox,
    background: '#2d2d44'
  },
  confirmTitle: {
    ...lightStyles.confirmTitle,
    color: '#fff'
  },
  confirmText: {
    ...lightStyles.confirmText,
    color: '#aaa'
  },
  cancelBtn: {
    ...lightStyles.cancelBtn,
    background: '#3d3d5c',
    color: '#fff',
    border: '1px solid #4d4d7c'
  }
};

export default History;
