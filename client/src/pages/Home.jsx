import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#1a1a2e';
    } else {
      document.body.style.backgroundColor = '#fff';
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <div style={theme.container}>
      <div style={theme.topBar}>
        <button onClick={() => setDarkMode(!darkMode)} style={theme.darkModeBtn}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      
      <section style={theme.hero}>
        <div style={theme.heroContent}>
          <h1 style={theme.heroTitle}>
            🌾 {t('home.title')}
          </h1>
          <p style={theme.heroSubtitle}>
            {t('home.subtitle')}
          </p>
          <div style={theme.heroBtns}>
            <Link to="/register" style={styles.primaryBtn}>
              🌾 Scan Your Crop Now
            </Link>
            {!user && (
              <Link to="/login" style={styles.secondaryBtn}>
                Sign In
              </Link>
            )}
            {user && (
              <Link to="/dashboard" style={styles.secondaryBtn}>
                📊 Dashboard
              </Link>
            )}
          </div>
        </div>
        <div style={theme.heroVisual}>
          <div style={theme.floatingCard}>
            <span style={theme.floatingIcon}>📷</span>
            <span>{t('home.uploadPhoto')}</span>
          </div>
          <div style={{...theme.floatingCard, top: '60%', right: '10%'}}>
            <span style={theme.floatingIcon}>🔍</span>
            <span>{t('home.aiAnalysis')}</span>
          </div>
          <div style={{...theme.floatingCard, top: '20%', right: '30%'}}>
            <span style={theme.floatingIcon}>💊</span>
            <span>{t('home.getTreatment')}</span>
          </div>
        </div>
      </section>

      <section style={theme.features}>
        <h2 style={theme.sectionTitle}>{t('home.howItWorks')}</h2>
        <div style={theme.stepsGrid}>
          <div style={theme.stepCard}>
            <div style={theme.stepNumber}>1</div>
            <div style={theme.stepIcon}>📱</div>
            <h3>{t('home.step1Title')}</h3>
            <p>{t('home.step1Desc')}</p>
          </div>
          <div style={theme.stepConnector}>→</div>
          <div style={theme.stepCard}>
            <div style={theme.stepNumber}>2</div>
            <div style={theme.stepIcon}>🤖</div>
            <h3>{t('home.step2Title')}</h3>
            <p>{t('home.step2Desc')}</p>
          </div>
          <div style={theme.stepConnector}>→</div>
          <div style={theme.stepCard}>
            <div style={theme.stepNumber}>3</div>
            <div style={theme.stepIcon}>💡</div>
            <h3>{t('home.step3Title')}</h3>
            <p>{t('home.step3Desc')}</p>
          </div>
        </div>
      </section>

      <section style={theme.features}>
        <h2 style={theme.sectionTitle}>{t('home.keyFeatures')}</h2>
        <div style={theme.featuresGrid}>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>⚡</div>
            <h3>{t('home.feature1Title')}</h3>
            <p>{t('home.feature1Desc')}</p>
          </div>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>🎯</div>
            <h3>{t('home.feature2Title')}</h3>
            <p>{t('home.feature2Desc')}</p>
          </div>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>💊</div>
            <h3>{t('home.feature3Title')}</h3>
            <p>{t('home.feature3Desc')}</p>
          </div>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>🌍</div>
            <h3>{t('home.feature4Title')}</h3>
            <p>{t('home.feature4Desc')}</p>
          </div>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>📊</div>
            <h3>{t('home.feature5Title')}</h3>
            <p>{t('home.feature5Desc')}</p>
          </div>
          <div style={theme.featureCard}>
            <div style={theme.featureIcon}>👩‍🌾</div>
            <h3>{t('home.feature6Title')}</h3>
            <p>{t('home.feature6Desc')}</p>
          </div>
        </div>
      </section>

      <section style={theme.cta}>
        <h2>{t('home.ctaTitle')}</h2>
        <p>{t('home.ctaDesc')}</p>
        <Link to="/register" style={theme.ctaBtn}>
          {t('home.ctaBtn')}
        </Link>
      </section>

      <footer style={theme.footer}>
        <p>{t('footer.copyright')}</p>
      </footer>
    </div>
  );
};

const lightStyles = {
  container: {
    minHeight: 'calc(100vh - 70px)'
  },
  topBar: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    zIndex: 999
  },
  darkModeBtn: {
    background: '#2e7d32',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4rem 2rem',
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
    borderRadius: '0 0 60px 60px',
    position: 'relative',
    overflow: 'hidden'
  },
  heroContent: {
    flex: 1,
    maxWidth: '600px',
    color: '#fff',
    zIndex: 1
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    lineHeight: '1.2'
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    opacity: 0.9,
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  heroBtns: {
    display: 'flex',
    gap: '1rem'
  },
  heroVisual: {
    position: 'relative',
    width: '400px',
    height: '300px'
  },
  floatingCard: {
    position: 'absolute',
    background: '#fff',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    fontWeight: '600',
    color: '#1a1a2e',
    animation: 'float 3s ease-in-out infinite'
  },
  floatingIcon: {
    fontSize: '1.5rem'
  },
  features: {
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '3rem',
    color: '#1a1a2e'
  },
  stepsGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  stepCard: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '20px',
    textAlign: 'center',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    width: '220px',
    position: 'relative'
  },
  stepNumber: {
    position: 'absolute',
    top: '-10px',
    left: '-10px',
    width: '30px',
    height: '30px',
    background: '#4CAF50',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700'
  },
  stepIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  stepConnector: {
    fontSize: '2rem',
    color: '#4CAF50',
    fontWeight: '700'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  featureCard: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    transition: 'transform 0.2s'
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem'
  },
  cta: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
    padding: '4rem 2rem',
    textAlign: 'center'
  },
  ctaBtn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    padding: '1rem 2.5rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    marginTop: '1.5rem'
  },
  footer: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666'
  }
};

const styles = {
  primaryBtn: {
    background: '#fff',
    color: '#2e7d32',
    padding: '1rem 2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'transform 0.2s'
  },
  secondaryBtn: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    border: '2px solid #fff',
    transition: 'transform 0.2s'
  }
};

const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    background: '#1a1a2e'
  },
  hero: {
    ...lightStyles.hero,
    background: 'linear-gradient(135deg, #1a4d1a 0%, #0d2d0d 100%)'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#fff'
  },
  stepCard: {
    ...lightStyles.stepCard,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  stepConnector: {
    ...lightStyles.stepConnector,
    color: '#4CAF50'
  },
  featureCard: {
    ...lightStyles.featureCard,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  cta: {
    ...lightStyles.cta,
    background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)'
  }
};

export default Home;
