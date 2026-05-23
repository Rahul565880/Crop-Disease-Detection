import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validate = (name, value) => {
    if (name === 'email') {
      if (!value) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
    }
    if (name === 'password') {
      if (!value) return 'Password is required';
      if (value.length < 6) return 'Password must be at least 6 characters';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>🌾</div>
          <h1 style={styles.title}>{t('auth.loginTitle')}</h1>
          <p style={styles.subtitle}>Sign in to continue to Crop Disease Detection</p>
        </div>
        
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('auth.email')}
              required
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              style={{ ...styles.input, borderColor: fieldErrors.email ? '#dc2626' : '#e8e8e8' }}
            />
            {fieldErrors.email && <span id="email-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '-0.25rem' }}>{fieldErrors.email}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>{t('auth.password')}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={t('auth.password')}
              required
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              style={{ ...styles.input, borderColor: fieldErrors.password ? '#dc2626' : '#e8e8e8' }}
            />
            {fieldErrors.password && <span id="password-error" style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '-0.25rem' }}>{fieldErrors.password}</span>}
          </div>

          <button 
            type="submit" 
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('common.login')}
          </button>
        </form>

        <p style={styles.footer}>
          {t('auth.dontHaveAccount')}{' '}
          <Link to="/register" style={styles.link}>{t('common.register')}</Link>
        </p>
        
        <div style={styles.demoCredentials}>
          <p>Demo Admin:</p>
          <code>admin@example.com / admin123</code>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)'
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '3rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem'
  },
  logo: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '0.9375rem'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    textAlign: 'center',
    fontSize: '0.875rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  label: {
    fontWeight: '600',
    color: '#1a1a2e',
    fontSize: '0.875rem'
  },
  input: {
    padding: '0.875rem 1rem',
    border: '2px solid #e8e8e8',
    borderRadius: '12px',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  submitBtn: {
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'transform 0.2s'
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666'
  },
  link: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '600'
  },
  demoCredentials: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: '#f5f5f5',
    borderRadius: '12px',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#666'
  }
};

export default Login;
