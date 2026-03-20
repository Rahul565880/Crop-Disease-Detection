import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    language: 'en'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (user) {
      setFormData({
        name: user.name || '',
        language: user.language || 'en'
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (darkMode) {
      document.body.style.backgroundColor = '#1a1a2e';
    } else {
      document.body.style.backgroundColor = '#f5f5f5';
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const theme = darkMode ? darkStyles : lightStyles;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(formData);
      if (formData.language !== i18n.language) {
        i18n.changeLanguage(formData.language);
      }
      setMessage({ type: 'success', text: t('common.success') });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div style={theme.container}>
      <div style={theme.card}>
        <div style={theme.headerRow}>
          <h1 style={theme.title}>{t('profile.title')}</h1>
          <button onClick={() => setDarkMode(!darkMode)} style={theme.darkModeBtn}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        <div style={theme.header}>
          <div style={theme.avatar}>
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 style={theme.userName}>{user.name}</h1>
          <p style={theme.email}>{user.email}</p>
          <span style={theme.roleBadge}>
            {user.role === 'admin' ? '👑 Admin' : '👨‍🌾 Farmer'}
          </span>
        </div>

        <div style={theme.stats}>
          <div style={theme.statItem}>
            <span style={theme.statValue}>{formData.language === 'en' ? 'English' : formData.language === 'hi' ? 'हिंदी' : 'ಕನ್ನಡ'}</span>
            <span style={theme.statLabel}>{t('nav.profile')}</span>
          </div>
          <div style={theme.statItem}>
            <span style={theme.statValue}>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
            <span style={theme.statLabel}>{t('profile.memberSince')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={theme.form}>
          <h2 style={theme.sectionTitle}>{t('profile.editProfile')}</h2>
          
          {message.text && (
            <div style={{
              ...theme.message,
              background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
              color: message.type === 'success' ? '#2e7d32' : '#c62828'
            }}>
              {message.text}
            </div>
          )}

          <div style={theme.inputGroup}>
            <label style={theme.label}>{t('auth.name')}</label>
            <input
              type="text"
              name="name"
              style={theme.input}
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div style={theme.inputGroup}>
            <label style={theme.label}>Language / भाषा / ಭಾಷೆ</label>
            <select
              name="language"
              style={theme.input}
              value={formData.language}
              onChange={handleChange}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
            </select>
          </div>

          <button 
            type="submit" 
            style={theme.submitBtn}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('common.save')}
          </button>
        </form>

        <div style={theme.infoSection}>
          <h3 style={theme.infoTitle}>{t('profile.accountInfo')}</h3>
          <div style={theme.infoRow}>
            <span>{t('profile.userId')}:</span>
            <span>{user?.user_id || user?.id || 'N/A'}</span>
          </div>
          <div style={theme.infoRow}>
            <span>{t('auth.email')}:</span>
            <span>{user?.email || 'N/A'}</span>
          </div>
          <div style={theme.infoRow}>
            <span>{t('common.login')}:</span>
            <span>{user?.role || 'user'}</span>
          </div>
          <div style={theme.infoRow}>
            <span>{t('profile.memberSince')}:</span>
            <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <div style={theme.links}>
          <Link to="/dashboard" style={theme.link}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const lightStyles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
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
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 8px 40px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5rem',
    fontWeight: '700',
    margin: '0 auto 1rem'
  },
  userName: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.25rem'
  },
  email: {
    color: '#666',
    marginBottom: '0.5rem'
  },
  roleBadge: {
    display: 'inline-block',
    background: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.375rem 1rem',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '2rem'
  },
  statItem: {
    textAlign: 'center'
  },
  statValue: {
    display: 'block',
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#666'
  },
  form: {
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '0.5rem',
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    border: '2px solid #e8e8e8',
    borderRadius: '12px',
    fontSize: '1rem',
    outline: 'none',
    background: '#fff'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  infoSection: {
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    marginBottom: '1.5rem'
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #eee',
    fontSize: '0.875rem'
  },
  links: {
    textAlign: 'center'
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '500'
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
  card: {
    ...lightStyles.card,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  userName: {
    ...lightStyles.userName,
    color: '#fff'
  },
  email: {
    ...lightStyles.email,
    color: '#aaa'
  },
  stats: {
    ...lightStyles.stats,
    background: '#3d3d5c'
  },
  statValue: {
    ...lightStyles.statValue,
    color: '#fff'
  },
  statLabel: {
    ...lightStyles.statLabel,
    color: '#aaa'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#fff'
  },
  label: {
    ...lightStyles.label,
    color: '#fff'
  },
  input: {
    ...lightStyles.input,
    background: '#3d3d5c',
    border: '2px solid #4d4d7c',
    color: '#fff'
  },
  infoSection: {
    ...lightStyles.infoSection,
    background: '#3d3d5c'
  },
  infoTitle: {
    ...lightStyles.infoTitle,
    color: '#fff'
  },
  infoRow: {
    ...lightStyles.infoRow,
    borderBottom: '1px solid #4d4d7c'
  }
};

export default Profile;
