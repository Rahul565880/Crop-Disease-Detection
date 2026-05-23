import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect, useRef } from 'react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Close menu when clicking outside
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    setShowLangMenu(false);
  };

  const getCurrentLang = () => {
    switch(i18n.language) {
      case 'hi': return 'हि';
      case 'kn': return 'ಕ';
      case 'te': return 'తె';
      default: return 'EN';
    }
  };

  const getCurrentLangFull = () => {
    switch(i18n.language) {
      case 'hi': return 'हिंदी';
      case 'kn': return 'ಕನ್ನಡ';
      case 'te': return 'తెలుగు';
      default: return 'English';
    }
  };

  return (
    <nav style={{
      ...styles.navbar,
      background: scrolled ? 'rgba(46, 125, 50, 0.98)' : '#2e7d32',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>
          <span style={styles.brandIcon}>🌾</span>
          <span style={styles.brandText}>{t('common.appName')}</span>
        </Link>
        
        <div style={styles.links}>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.link}>
                {t('nav.home')}
              </Link>
              <Link to="/profile" style={styles.link}>
                👤 {t('nav.profile')}
              </Link>
              <Link to="/upload" style={styles.link}>
                📷 {t('nav.upload')}
              </Link>
              <Link to="/history" style={styles.link}>
                📋 {t('nav.history')}
              </Link>
              <Link to="/diseases" style={styles.link}>
                🩺 {t('admin.diseases')}
              </Link>
              {isAdmin && (
                <Link to="/admin" style={styles.link}>
                  ⚙️ {t('nav.admin')}
                </Link>
              )}
              
              <div style={styles.userSection}>
                <span style={styles.welcome}>
                  {t('common.welcome')}, {user.name}
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>
                  {t('common.logout')}
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                {t('common.login')}
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                {t('common.register')}
              </Link>
            </>
          )}
          
          <div style={styles.langSection} ref={langMenuRef}>
            <button 
              style={styles.langSelector}
              onClick={() => setShowLangMenu(!showLangMenu)}
            >
              🌐 {getCurrentLang()} ▼
            </button>
            {showLangMenu && (
              <div style={styles.langMenu}>
                <button 
                  style={{
                    ...styles.langOption,
                    background: i18n.language === 'en' ? '#e8f5e9' : 'transparent'
                  }}
                  onClick={() => changeLanguage('en')}
                >
                  🇬🇧 English
                </button>
                <button 
                  style={{
                    ...styles.langOption,
                    background: i18n.language === 'hi' ? '#e8f5e9' : 'transparent'
                  }}
                  onClick={() => changeLanguage('hi')}
                >
                  🇮🇳 हिंदी
                </button>
                <button 
                  style={{
                    ...styles.langOption,
                    background: i18n.language === 'kn' ? '#e8f5e9' : 'transparent'
                  }}
                  onClick={() => changeLanguage('kn')}
                >
                  🇮🇳 ಕನ್ನಡ
                </button>
                <button 
                  style={{
                    ...styles.langOption,
                    background: i18n.language === 'te' ? '#e8f5e9' : 'transparent'
                  }}
                  onClick={() => changeLanguage('te')}
                >
                  🇮🇳 తెలుగు
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    padding: '0.75rem 0',
    transition: 'all 0.3s ease'
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
    color: '#fff'
  },
  brandIcon: {
    fontSize: '1.75rem'
  },
  brandText: {
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    paddingLeft: '1rem',
    borderLeft: '1px solid rgba(255,255,255,0.3)'
  },
  welcome: {
    color: '#fff',
    fontSize: '0.875rem',
    opacity: 0.9
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background 0.2s'
  },
  registerBtn: {
    background: '#fff',
    color: '#2e7d32',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'transform 0.2s'
  },
  langSection: {
    position: 'relative'
  },
  langSelector: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  langMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '0.5rem',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    overflow: 'hidden',
    zIndex: 1001,
    minWidth: '150px'
  },
  langOption: {
    display: 'block',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#1a1a2e',
    transition: 'background 0.2s'
  },
  langOptionHover: {
    background: '#f5f5f5'
  },
  langBtn: {
    border: 'none',
    padding: '0.375rem 0.625rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.75rem',
    transition: 'all 0.2s'
  }
};

export default Navbar;
