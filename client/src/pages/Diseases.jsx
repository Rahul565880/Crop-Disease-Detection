import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Diseases = () => {
  const { t } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

  useEffect(() => {
    fetchDiseases();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchDiseases = async () => {
    try {
      const response = await fetch(`${API_BASE}/diseases`);
      const data = await response.json();
      setDiseases(data.diseases || []);
    } catch (error) {
      console.error('Failed to fetch diseases:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return { bg: '#fee2e2', color: '#dc2626', label: 'High Risk' };
      case 'medium': return { bg: '#fef3c7', color: '#d97706', label: 'Medium Risk' };
      default: return { bg: '#dcfce7', color: '#16a34a', label: 'Low Risk' };
    }
  };

  const getCropEmoji = (crop) => {
    const crops = {
      'Tomato': '🍅', 'Potato': '🥔', 'Corn': '🌽', 'Cotton': '🏵️',
      'Chilli': '🌶️', 'Turmeric': '🟡', 'Rice': '🍚', 'Wheat': '🌾',
      'General': '🌿'
    };
    return crops[crop] || '🌱';
  };

  const filteredDiseases = diseases.filter(disease => 
    disease.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disease.crop_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p style={{ color: textMuted }}>Loading diseases...</p>
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>📚 Disease Guide</h1>
            <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{diseases.length} diseases in database</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ background: darkMode ? '#374151' : '#22c55e', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="🔍 Search diseases or crops..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '1rem 1.25rem', borderRadius: '12px',
              border: `2px solid ${borderColor}`, fontSize: '1rem', outline: 'none',
              background: cardBg, color: textColor
            }}
          />
        </div>

        {/* Disease Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {filteredDiseases.map((disease) => {
            const severity = getSeverityColor(disease.severity);
            return (
              <div 
                key={disease.disease_id} 
                onClick={() => setSelectedDisease(selectedDisease?.disease_id === disease.disease_id ? null : disease)}
                style={{ 
                  background: cardBg, borderRadius: '16px', padding: '1.25rem', 
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`,
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getCropEmoji(disease.crop_type)}</span>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: 0 }}>{disease.disease_name}</h3>
                      <p style={{ fontSize: '0.8rem', color: textMuted, margin: 0 }}>{disease.crop_type}</p>
                    </div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.625rem', borderRadius: '20px', 
                    fontSize: '0.7rem', fontWeight: '600',
                    background: severity.bg, color: severity.color
                  }}>
                    {severity.label}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: textMuted, margin: 0, lineHeight: '1.5' }}>
                  {disease.description}
                </p>

                {/* Expanded Details */}
                {selectedDisease?.disease_id === disease.disease_id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: `1px solid ${borderColor}` }}>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: textColor, margin: '0 0 0.25rem 0' }}>Symptoms:</h4>
                      <p style={{ fontSize: '0.8rem', color: textMuted, margin: 0 }}>{disease.symptoms}</p>
                    </div>
                    
                    {disease.treatment && disease.treatment.length > 0 && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: textColor, margin: '0 0 0.25rem 0' }}>💊 Chemical Solution:</h4>
                        <p style={{ fontSize: '0.8rem', color: textMuted, margin: 0 }}>{disease.treatment[0].chemical_solution}</p>
                      </div>
                    )}
                    
                    {disease.treatment && disease.treatment.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: '600', color: textColor, margin: '0 0 0.25rem 0' }}>🌿 Organic Solution:</h4>
                        <p style={{ fontSize: '0.8rem', color: textMuted, margin: 0 }}>{disease.treatment[0].organic_solution}</p>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: '500' }}>
                    {selectedDisease?.disease_id === disease.disease_id ? '▲ Less' : '▼ More'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDiseases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', background: cardBg, borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <span style={{ fontSize: '3rem' }}>🔍</span>
            <h3 style={{ color: textColor, margin: '1rem 0 0.5rem 0' }}>No diseases found</h3>
            <p style={{ color: textMuted }}>Try a different search term</p>
          </div>
        )}

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="/dashboard" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
};

export default Diseases;
