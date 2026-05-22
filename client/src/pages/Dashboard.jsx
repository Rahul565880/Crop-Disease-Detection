import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    diseasesDetected: 0,
    healthyPlants: 0,
    weeklyScans: []
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState({ city: 'Detecting...', temp: '--', humidity: '--', risk: 'low', riskLevel: '✅ Low Risk', riskMsg: 'Weather conditions are favorable for your crops.' });

  useEffect(() => {
    fetchDashboardData();
    fetchWeather();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchWeather = async () => {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      let url = `${API_BASE}/weather`;
      if (pos) {
        url += `?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.city) {
        const riskSymbol = data.risk === 'high' ? '🔴' : data.risk === 'medium' ? '🟡' : '✅';
        setLocation({
          city: data.city,
          temp: data.temp,
          humidity: data.humidity,
          risk: data.risk,
          riskLevel: `${riskSymbol} ${data.riskLevel}`,
          riskMsg: data.riskMsg
        });
      }
    } catch {
      setLocation({ 
        city: 'Unknown', 
        temp: '--', 
        humidity: '--', 
        risk: 'low', 
        riskLevel: '✅ Low Risk', 
        riskMsg: 'Unable to detect weather conditions.' 
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/scans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.scans) {
        setRecentScans(data.scans);
        const total = data.pagination?.total || data.scans.length;
        const diseases = data.scans.filter(s => s.disease_name && !s.disease_name.toLowerCase().includes('healthy')).length;
        const healthy = data.scans.filter(s => s.disease_name && s.disease_name.toLowerCase().includes('healthy')).length;
        const weeklyData = getWeeklyStats(data.scans);
        
        setStats({
          totalScans: total,
          todayScans: data.scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length,
          diseasesDetected: diseases,
          healthyPlants: healthy,
          weeklyScans: weeklyData
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyStats = (scans) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days.map((day, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const count = scans.filter(s => new Date(s.created_at).toDateString() === date.toDateString()).length;
      return { day, count, date: date.toLocaleDateString() };
    });
  };

  const lastScan = recentScans.length > 0 ? recentScans[0] : null;
  const maxWeeklyCount = Math.max(...stats.weeklyScans.map(d => d.count), 1);
  const healthyPercent = stats.totalScans > 0 ? Math.round((stats.healthyPlants / stats.totalScans) * 100) : 0;
  
  const getHealthStatus = (percent) => {
    if (percent >= 70) return { label: 'Good', color: '#22c55e', bg: '#dcfce7', icon: '🟢' };
    if (percent >= 40) return { label: 'Moderate', color: '#f59e0b', bg: '#fef3c7', icon: '🟡' };
    return { label: 'Poor', color: '#ef4444', bg: '#fee2e2', icon: '🔴' };
  };
  
  const healthStatus = getHealthStatus(healthyPercent);
  const userName = localStorage.getItem('userName') || 'Farmer';

  const getRiskAlert = () => {
    if (stats.diseasesDetected === 0) return null;
    const recentDiseases = recentScans.slice(0, 3).filter(s => !s.disease_name?.toLowerCase().includes('healthy'));
    if (recentDiseases.length > 0) {
      return {
        type: 'warning',
        message: `High disease activity detected in recent scans`,
        detail: 'Monitor your crops closely and consider preventive measures.'
      };
    }
    return null;
  };

  const riskAlert = getRiskAlert();

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
          <p style={{ color: textMuted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bgColor, padding: '1.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header with Location */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1rem' }}>📍</span>
              <span style={{ color: textMuted, fontSize: '0.875rem' }}>{location.city}</span>
              <span style={{ color: textMuted, fontSize: '0.875rem' }}>•</span>
              <span style={{ color: textMuted, fontSize: '0.875rem' }}>🌡️ {location.temp}°C</span>
              <span style={{ color: textMuted, fontSize: '0.875rem' }}>•</span>
              <span style={{ color: textMuted, fontSize: '0.875rem' }}>💧 {location.humidity}%</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>
              Hello, {userName}! 👋
            </h1>
            <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Here's your crop health overview.</p>
          </div>
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

        {/* Weather-Based Disease Alert */}
        <div style={{ 
          background: location.risk === 'high' ? '#fee2e2' : location.risk === 'medium' ? '#fef3c7' : '#f0fdf4', 
          borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', 
          border: `1px solid ${location.risk === 'high' ? '#fca5a5' : location.risk === 'medium' ? '#fcd34d' : '#86efac'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{location.risk === 'high' ? '🔴' : location.risk === 'medium' ? '🟡' : '🟢'}</span>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: location.risk === 'high' ? '#991b1b' : location.risk === 'medium' ? '#92400e' : '#166534' }}>
                {location.riskLevel}
              </h4>
              <p style={{ fontSize: '0.85rem', margin: 0, lineHeight: '1.5', color: location.risk === 'high' ? '#b91c1c' : location.risk === 'medium' ? '#a16207' : '#15803d' }}>
                {location.riskMsg}
              </p>
            </div>
          </div>
        </div>

        {/* Health Score Card */}
        <div style={{ 
          background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: `conic-gradient(${healthStatus.color} 0deg ${healthyPercent * 3.6}deg, ${borderColor} ${healthyPercent * 3.6}deg 360deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <div style={{ 
                  width: '75px', height: '75px', borderRadius: '50%', background: cardBg,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor }}>{healthyPercent}%</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>{healthStatus.icon}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: healthStatus.color }}>{healthStatus.label} Health</span>
                </div>
                <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                  {stats.healthyPlants} healthy out of {stats.totalScans} total scans
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/upload" style={{ 
                background: '#22c55e', color: '#fff', padding: '0.75rem 1.5rem', 
                borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '0.875rem'
              }}>
                📷 New Scan
              </Link>
            </div>
          </div>
        </div>

        {/* Risk Alert */}
        {riskAlert && (
          <div style={{ 
            background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '16px', padding: '1rem 1.25rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#92400e', fontWeight: '600', fontSize: '0.95rem' }}>{riskAlert.message}</p>
              <p style={{ margin: '0.25rem 0 0 0', color: '#a16207', fontSize: '0.8rem' }}>{riskAlert.detail}</p>
            </div>
          </div>
        )}

        {/* Stats Grid - 4 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>📊</span>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>{stats.totalScans}</p>
                <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Total Scans</p>
              </div>
            </div>
          </div>
          
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>📅</span>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>{stats.todayScans}</p>
                <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Today</p>
              </div>
            </div>
          </div>
          
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>🦠</span>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ef4444', margin: 0 }}>{stats.diseasesDetected}</p>
                <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Diseases</p>
              </div>
            </div>
          </div>
          
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div>
                <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#22c55e', margin: 0 }}>{stats.healthyPlants}</p>
                <p style={{ fontSize: '0.8rem', color: textMuted, margin: '0.25rem 0 0 0' }}>Healthy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Health Distribution */}
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1.25rem 0' }}>
              📊 Disease Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: textColor, fontSize: '0.875rem' }}>Healthy Plants</span>
                  <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.875rem' }}>{healthyPercent}%</span>
                </div>
                <div style={{ height: '10px', background: borderColor, borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${healthyPercent}%`, background: '#22c55e', borderRadius: '5px', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: textColor, fontSize: '0.875rem' }}>Diseased Plants</span>
                  <span style={{ color: '#ef4444', fontWeight: '600', fontSize: '0.875rem' }}>{100 - healthyPercent}%</span>
                </div>
                <div style={{ height: '10px', background: borderColor, borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${100 - healthyPercent}%`, background: '#ef4444', borderRadius: '5px', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Activity */}
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1.25rem 0' }}>
              📅 Weekly Activity
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px', gap: '0.5rem' }}>
              {stats.weeklyScans.map((day, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: textMuted }}>{day.count}</span>
                  <div style={{ 
                    width: '100%', height: `${Math.max((day.count / maxWeeklyCount) * 70, 4)}px`,
                    background: day.count > 0 ? '#22c55e' : borderColor,
                    borderRadius: '4px', transition: 'height 0.3s ease'
                  }}></div>
                  <span style={{ fontSize: '0.7rem', color: textMuted }}>{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Last Prediction Card */}
        {lastScan && (
          <div style={{ 
            background: cardBg, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>
              🤖 Latest Prediction
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ 
                width: '60px', height: '60px', borderRadius: '12px', 
                background: lastScan.disease_name?.toLowerCase().includes('healthy') ? '#dcfce7' : '#fee2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem'
              }}>
                {lastScan.disease_name?.toLowerCase().includes('healthy') ? '✅' : '🦠'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor }}>
                    {lastScan.disease_name}
                  </span>
                  <span style={{ 
                    background: lastScan.disease_name?.toLowerCase().includes('healthy') ? '#22c55e' : '#ef4444',
                    color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600'
                  }}>
                    {lastScan.confidence_score ? (parseFloat(lastScan.confidence_score) * 100).toFixed(0) : 0}%
                  </span>
                </div>
                <p style={{ color: textMuted, margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                  Scanned on {new Date(lastScan.created_at).toLocaleDateString()} at {new Date(lastScan.created_at).toLocaleTimeString()}
                </p>
                <Link 
                  to={`/result/${lastScan.scan_id}`}
                  style={{ 
                    display: 'inline-block', marginTop: '0.75rem',
                    color: '#22c55e', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '600'
                  }}
                >
                  View Full Report →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div style={{ 
          background: cardBg, borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>
            ⚡ Quick Actions
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <Link to="/upload" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1.25rem', background: '#f0fdf4', borderRadius: '12px', textAlign: 'center',
                border: '1px solid #bbf7d0', transition: 'transform 0.2s'
              }}>
                <span style={{ fontSize: '2rem' }}>📷</span>
                <p style={{ margin: '0.5rem 0 0 0', color: '#166534', fontWeight: '600' }}>Scan Crop</p>
              </div>
            </Link>
            <Link to="/history" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1.25rem', background: '#eff6ff', borderRadius: '12px', textAlign: 'center',
                border: '1px solid #bfdbfe', transition: 'transform 0.2s'
              }}>
                <span style={{ fontSize: '2rem' }}>📋</span>
                <p style={{ margin: '0.5rem 0 0 0', color: '#1e40af', fontWeight: '600' }}>History</p>
              </div>
            </Link>
            <Link to="/diseases" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1.25rem', background: '#fef3c7', borderRadius: '12px', textAlign: 'center',
                border: '1px solid #fde68a', transition: 'transform 0.2s'
              }}>
                <span style={{ fontSize: '2rem' }}>📚</span>
                <p style={{ margin: '0.5rem 0 0 0', color: '#92400e', fontWeight: '600' }}>Disease Guide</p>
              </div>
            </Link>
            <Link to="/profile" style={{ textDecoration: 'none' }}>
              <div style={{ 
                padding: '1.25rem', background: '#fdf4ff', borderRadius: '12px', textAlign: 'center',
                border: '1px solid #e9d5ff', transition: 'transform 0.2s'
              }}>
                <span style={{ fontSize: '2rem' }}>👤</span>
                <p style={{ margin: '0.5rem 0 0 0', color: '#7e22ce', fontWeight: '600' }}>Profile</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Scans */}
        <div style={{ 
          background: cardBg, borderRadius: '16px', padding: '1.5rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: 0 }}>
              🕐 Recent Scans
            </h3>
            <Link to="/history" style={{ color: '#22c55e', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}>
              View All →
            </Link>
          </div>
          
          {recentScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: textMuted }}>
              <span style={{ fontSize: '3rem' }}>🌱</span>
              <p style={{ margin: '0.5rem 0 0 0' }}>No scans yet. Start by scanning a crop!</p>
              <Link to="/upload" style={{ display: 'inline-block', marginTop: '1rem', background: '#22c55e', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
                📷 Scan Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {recentScans.slice(0, 6).map((scan) => (
                <Link key={scan.scan_id} to={`/result/${scan.scan_id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem', background: darkMode ? '#0f172a' : '#f8fafc',
                    borderRadius: '12px', transition: 'background 0.2s'
                  }}>
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '10px',
                      background: scan.disease_name?.toLowerCase().includes('healthy') ? '#dcfce7' : '#fee2e2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem'
                    }}>
                      {scan.disease_name?.toLowerCase().includes('healthy') ? '✅' : '🦠'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: textColor, fontWeight: '600', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {scan.disease_name}
                      </p>
                      <p style={{ margin: '0.125rem 0 0 0', color: textMuted, fontSize: '0.75rem' }}>
                        {new Date(scan.created_at).toLocaleDateString()} • {scan.confidence_score ? (parseFloat(scan.confidence_score) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Health Timeline */}
        {recentScans.length >= 2 && (
          <div style={{ background: cardBg, borderRadius: '16px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>
              📈 Health Timeline
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', padding: '0.5rem 0' }}>
              {recentScans.slice(0, 7).map((scan, idx) => {
                const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
                return (
                  <div key={scan.scan_id} style={{ display: 'flex', alignItems: 'center', flex: idx < recentScans.slice(0, 7).length - 1 ? '0 0 auto' : '0 1 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: isHealthy ? '#dcfce7' : '#fee2e2',
                        border: `3px solid ${isHealthy ? '#22c55e' : '#ef4444'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem'
                      }}>
                        {isHealthy ? '✅' : '🦠'}
                      </div>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', color: textMuted, textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {new Date(scan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p style={{ margin: '0.125rem 0 0 0', fontSize: '0.65rem', color: textMuted, textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {scan.disease_name}
                      </p>
                    </div>
                    {idx < recentScans.slice(0, 7).length - 1 && (
                      <div style={{ width: '30px', height: '3px', background: borderColor, margin: '0 4px' }}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
