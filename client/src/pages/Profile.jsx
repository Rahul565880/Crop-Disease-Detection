import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, logout } = useAuth();
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
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const bgColor = darkMode ? '#0f172a' : '#f8fafc';
  const cardBg = darkMode ? '#1e293b' : '#ffffff';
  const textColor = darkMode ? '#f1f5f9' : '#1e293b';
  const textMuted = darkMode ? '#94a3b8' : '#64748b';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';

  return (
    <div style={{ minHeight: '100vh', background: bgColor, padding: '1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>Profile</h1>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ 
              background: darkMode ? '#374151' : '#22c55e', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', 
              borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem'
            }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Profile Card */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`, marginBottom: '1.5rem' }}>
          
          {/* Profile Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: '700', flexShrink: 0
            }}>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: textColor, margin: 0 }}>{user.name}</h2>
              <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ 
                  background: user.role === 'admin' ? '#fef3c7' : '#f0fdf4',
                  color: user.role === 'admin' ? '#92400e' : '#166534',
                  padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600'
                }}>
                  {user.role === 'admin' ? '👑 Admin' : '👨‍🌾 Farmer'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', padding: '1rem', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, margin: 0 }}>{user.language?.toUpperCase() || 'EN'}</p>
              <p style={{ fontSize: '0.75rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Language</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, margin: 0 }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
              <p style={{ fontSize: '0.75rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Member Since</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`, marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: '0 0 1.25rem 0' }}>
            ✏️ Edit Profile
          </h3>
          
          {message.text && (
            <div style={{
              padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1rem',
              background: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#dc2626',
              fontWeight: '500', fontSize: '0.875rem'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: textColor, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '0.875rem 1rem', border: `2px solid ${borderColor}`,
                  borderRadius: '12px', fontSize: '1rem', outline: 'none',
                  background: darkMode ? '#0f172a' : '#fff', color: textColor
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: textColor, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Language / भाषा / ಭಾಷೆ
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
                style={{
                  width: '100%', padding: '0.875rem 1rem', border: `2px solid ${borderColor}`,
                  borderRadius: '12px', fontSize: '1rem', outline: 'none',
                  background: darkMode ? '#0f172a' : '#fff', color: textColor
                }}
              >
                <option value="en">🇬🇧 English</option>
                <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                <option value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: '12px', border: 'none',
                background: loading ? '#9ca3af' : '#22c55e', color: '#fff',
                fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`, marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>
            ℹ️ Account Information
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'User ID', value: user.user_id || user.id || 'N/A' },
              { label: 'Email', value: user.email || 'N/A' },
              { label: 'Role', value: user.role || 'user' },
              { label: 'Language', value: user.language || 'en' },
              { label: 'Member Since', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }
            ].map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', justifyContent: 'space-between', padding: '0.75rem',
                background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '10px'
              }}>
                <span style={{ color: textMuted, fontSize: '0.875rem' }}>{item.label}</span>
                <span style={{ color: textColor, fontWeight: '500', fontSize: '0.875rem' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '1rem', background: cardBg, borderRadius: '12px', textAlign: 'center',
              border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'transform 0.2s'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🏠</span>
              <p style={{ margin: '0.5rem 0 0 0', color: textColor, fontWeight: '600' }}>Dashboard</p>
            </div>
          </Link>
          <Link to="/history" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '1rem', background: cardBg, borderRadius: '12px', textAlign: 'center',
              border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'transform 0.2s'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📋</span>
              <p style={{ margin: '0.5rem 0 0 0', color: textColor, fontWeight: '600' }}>History</p>
            </div>
          </Link>
          <Link to="/diseases" style={{ textDecoration: 'none' }}>
            <div style={{ 
              padding: '1rem', background: cardBg, borderRadius: '12px', textAlign: 'center',
              border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'transform 0.2s'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📚</span>
              <p style={{ margin: '0.5rem 0 0 0', color: textColor, fontWeight: '600' }}>Diseases</p>
            </div>
          </Link>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          style={{
            width: '100%', padding: '1rem', borderRadius: '12px', border: `2px solid #ef4444`,
            background: 'transparent', color: '#ef4444',
            fontSize: '1rem', fontWeight: '600', cursor: 'pointer'
          }}
        >
          🚪 Logout
        </button>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/dashboard" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
            ← Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Profile;
