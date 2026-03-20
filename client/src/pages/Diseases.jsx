import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Diseases = () => {
  const { t } = useTranslation();
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    fetchDiseases();
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

  const fetchDiseases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/diseases');
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
      case 'high': return '#FF5722';
      case 'medium': return '#FF9800';
      default: return '#4CAF50';
    }
  };

  const getCropEmoji = (crop) => {
    const crops = {
      'Tomato': '🍅',
      'Potato': '🥔',
      'Corn': '🌽',
      'Apple': '🍎',
      'General': '🌱'
    };
    return crops[crop] || '🌿';
  };

  if (loading) {
    return (
      <div style={theme.container}>
        <div style={theme.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div style={theme.container}>
      <div style={theme.header}>
        <div>
          <h1 style={theme.title}>🌿 {t('disease.diseaseGuide')}</h1>
          <p style={theme.subtitle}>{t('disease.guideSubtitle')}</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={theme.darkModeBtn}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <div style={theme.grid}>
        {diseases.map((disease) => (
          <div 
            key={disease.disease_id} 
            style={theme.card}
            onClick={() => setSelectedDisease(selectedDisease?.disease_id === disease.disease_id ? null : disease)}
          >
            <div style={theme.cardHeader}>
              <span style={theme.cropIcon}>{getCropEmoji(disease.crop_type)}</span>
              <span style={{
                ...theme.severityBadge,
                background: getSeverityColor(disease.severity)
              }}>
                {t(`disease.${disease.severity}`)}
              </span>
            </div>
            <h3 style={theme.diseaseName}>{disease.disease_name}</h3>
            <p style={theme.cropType}>{disease.crop_type}</p>
            
            {selectedDisease?.disease_id === disease.disease_id && (
              <div style={theme.details}>
                {disease.description && (
                  <div style={theme.detailSection}>
                    <h4>{t('disease.description')}</h4>
                    <p>{disease.description}</p>
                  </div>
                )}
                {disease.symptoms && (
                  <div style={theme.detailSection}>
                    <h4>{t('disease.symptoms')}</h4>
                    <p>{disease.symptoms}</p>
                  </div>
                )}
                {disease.treatment && (
                  <>
                    {disease.treatment.chemical_solution && (
                      <div style={theme.detailSection}>
                        <h4>💊 {t('result.chemicalSolution')}</h4>
                        <p>{disease.treatment.chemical_solution}</p>
                      </div>
                    )}
                    {disease.treatment.organic_solution && (
                      <div style={theme.detailSection}>
                        <h4>🌱 {t('result.organicSolution')}</h4>
                        <p>{disease.treatment.organic_solution}</p>
                      </div>
                    )}
                    {disease.treatment.prevention_methods && (
                      <div style={theme.detailSection}>
                        <h4>🛡️ {t('result.prevention')}</h4>
                        <p>{disease.treatment.prevention_methods}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div style={theme.cardFooter}>
              <span style={theme.clickHint}>
                {selectedDisease?.disease_id === disease.disease_id ? t('disease.collapse') : t('disease.viewDetails')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const lightStyles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  darkModeBtn: {
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#666'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem'
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #eee'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  cropIcon: {
    fontSize: '2rem'
  },
  severityBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  diseaseName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '0.25rem'
  },
  cropType: {
    color: '#666',
    fontSize: '0.875rem'
  },
  details: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  detailSection: {
    marginBottom: '1rem'
  },
  cardFooter: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #eee'
  },
  clickHint: {
    fontSize: '0.75rem',
    color: '#4CAF50'
  }
};

const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    background: '#1a1a2e',
    minHeight: 'calc(100vh - 70px)'
  },
  title: {
    ...lightStyles.title,
    color: '#fff'
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: '#aaa'
  },
  card: {
    ...lightStyles.card,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  diseaseName: {
    ...lightStyles.diseaseName,
    color: '#fff'
  },
  cropType: {
    ...lightStyles.cropType,
    color: '#aaa'
  },
  details: {
    ...lightStyles.details,
    borderTop: '1px solid #3d3d5c'
  },
  cardFooter: {
    ...lightStyles.cardFooter,
    borderTop: '1px solid #3d3d5c'
  }
};

export default Diseases;
