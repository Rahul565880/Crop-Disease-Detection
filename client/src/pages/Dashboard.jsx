import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalScans: 0,
    todayScans: 0,
    diseasesDetected: 0,
    healthyPlants: 0,
    weeklyScans: [],
    cropStats: {}
  });
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
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

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/scans', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.scans) {
        setRecentScans(data.scans);
        const total = data.pagination?.total || data.scans.length;
        const diseases = data.scans.filter(s => s.disease_name && !s.disease_name.toLowerCase().includes('healthy')).length;
        const healthy = data.scans.filter(s => s.disease_name && s.disease_name.toLowerCase().includes('healthy')).length;
        
        const weeklyData = getWeeklyStats(data.scans);
        const cropStats = getCropStats(data.scans);
        
        setStats({
          totalScans: total,
          todayScans: data.scans.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length,
          diseasesDetected: diseases,
          healthyPlants: healthy,
          weeklyScans: weeklyData,
          cropStats: cropStats
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
    const weeklyData = days.map(day => ({ day, count: 0 }));
    
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayName = days[date.getDay()];
      const count = scans.filter(s => new Date(s.created_at).toDateString() === dateStr).length;
      weeklyData[6 - i] = { day: dayName, count, date: date.toLocaleDateString() };
    }
    
    return weeklyData;
  };

  const getCropStats = (scans) => {
    const cropCounts = {};
    scans.forEach(scan => {
      const crop = scan.disease?.crop_type || 'Unknown';
      if (!cropCounts[crop]) {
        cropCounts[crop] = { total: 0, healthy: 0, diseased: 0 };
      }
      cropCounts[crop].total++;
      if (scan.disease_name?.toLowerCase().includes('healthy')) {
        cropCounts[crop].healthy++;
      } else {
        cropCounts[crop].diseased++;
      }
    });
    return cropCounts;
  };

  const theme = darkMode ? darkStyles : lightStyles;

  const lastScan = recentScans.length > 0 ? recentScans[0] : null;
  const maxWeeklyCount = Math.max(...stats.weeklyScans.map(d => d.count), 1);

  return (
    <div style={theme.container}>
      {/* Toast Notification */}
      {showToast && (
        <div style={theme.toast}>
          <span style={theme.toastIcon}>🔔</span>
          <span>{toastMessage}</span>
          <button onClick={() => setShowToast(false)} style={theme.toastClose}>✕</button>
        </div>
      )}

      <div style={theme.header}>
        <div>
          <h1 style={theme.title}>{t('dashboard.title')}</h1>
          <p style={theme.subtitle}>{t('dashboard.welcome')}</p>
        </div>
        <button onClick={() => setDarkMode(!darkMode)} style={theme.darkModeBtn}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      {/* AI Info Card */}
      {lastScan && (
        <div style={theme.aiCard}>
          <div style={theme.aiIcon}>🤖</div>
          <div style={theme.aiContent}>
            <span style={theme.aiLabel}>Last Scan Result</span>
            <span style={theme.aiResult}>
              {lastScan.disease_name} 
              <span style={theme.aiConfidence}>
                {lastScan.confidence_score ? (parseFloat(lastScan.confidence_score) * 100).toFixed(0) : 0}%
              </span>
            </span>
          </div>
          <div style={theme.aiBadge}>
            {lastScan.disease_name?.toLowerCase().includes('healthy') ? '✅ Healthy' : '🦠 Disease Found'}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div style={theme.statsGrid}>
        <div style={{...theme.statCard, borderLeft: '4px solid #4CAF50'}}>
          <div style={theme.statIcon}>🌱</div>
          <div style={theme.statContent}>
            <span style={theme.statValue}>{stats.totalScans}</span>
            <span style={theme.statLabel}>{t('dashboard.totalScansAllTime')}</span>
          </div>
        </div>
        <div style={{...theme.statCard, borderLeft: '4px solid #2196F3'}}>
          <div style={theme.statIcon}>📅</div>
          <div style={theme.statContent}>
            <span style={theme.statValue}>{stats.todayScans}</span>
            <span style={theme.statLabel}>{t('dashboard.todayScans')}</span>
          </div>
        </div>
        <div style={{...theme.statCard, borderLeft: '4px solid #FF5722'}}>
          <div style={theme.statIcon}>🦠</div>
          <div style={theme.statContent}>
            <span style={theme.statValue}>{stats.diseasesDetected}</span>
            <span style={theme.statLabel}>{t('dashboard.diseasedPlants')}</span>
          </div>
        </div>
        <div style={{...theme.statCard, borderLeft: '4px solid #9C27B0'}}>
          <div style={theme.statIcon}>✅</div>
          <div style={theme.statContent}>
            <span style={theme.statValue}>{stats.healthyPlants}</span>
            <span style={theme.statLabel}>{t('dashboard.healthyPlants')}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={theme.chartsGrid}>
        {/* Pie Chart */}
        <div style={theme.chartCard}>
          <h3 style={theme.chartTitle}>📊 Health Status</h3>
          <div style={theme.pieChart}>
            <svg viewBox="0 0 100 100" style={theme.pieSvg}>
              {stats.totalScans > 0 ? (
                <>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#4CAF50"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.healthyPlants / stats.totalScans) * 251.2} 251.2`}
                    transform="rotate(-90 50 50)"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#FF5722"
                    strokeWidth="20"
                    strokeDasharray={`${(stats.diseasesDetected / stats.totalScans) * 251.2} 251.2`}
                    strokeDashoffset={`-${(stats.healthyPlants / stats.totalScans) * 251.2}`}
                    transform="rotate(-90 50 50)"
                  />
                </>
              ) : (
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ddd" strokeWidth="20" />
              )}
            </svg>
            <div style={theme.pieCenter}>
              <span style={theme.pieTotal}>{stats.totalScans}</span>
              <span style={theme.pieLabel}>Total</span>
            </div>
          </div>
          <div style={theme.legend}>
            <div style={theme.legendItem}>
              <span style={{...theme.legendColor, background: '#4CAF50'}}></span>
              <span>Healthy ({stats.healthyPlants})</span>
            </div>
            <div style={theme.legendItem}>
              <span style={{...theme.legendColor, background: '#FF5722'}}></span>
              <span>Diseased ({stats.diseasesDetected})</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div style={theme.chartCard}>
          <h3 style={theme.chartTitle}>📈 Scan Distribution</h3>
          <div style={theme.barChart}>
            <div style={theme.barItem}>
              <span style={theme.barLabel}>Healthy</span>
              <div style={theme.barBg}>
                <div style={{...theme.barFill, width: stats.totalScans > 0 ? `${(stats.healthyPlants / stats.totalScans) * 100}%` : '0%', background: '#4CAF50'}}></div>
              </div>
              <span style={theme.barPercent}>{stats.totalScans > 0 ? ((stats.healthyPlants / stats.totalScans) * 100).toFixed(0) : 0}%</span>
            </div>
            <div style={theme.barItem}>
              <span style={theme.barLabel}>Diseased</span>
              <div style={theme.barBg}>
                <div style={{...theme.barFill, width: stats.totalScans > 0 ? `${(stats.diseasesDetected / stats.totalScans) * 100}%` : '0%', background: '#FF5722'}}></div>
              </div>
              <span style={theme.barPercent}>{stats.totalScans > 0 ? ((stats.diseasesDetected / stats.totalScans) * 100).toFixed(0) : 0}%</span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div style={theme.chartCard}>
          <h3 style={theme.chartTitle}>📅 Weekly Activity</h3>
          <div style={theme.weeklyChart}>
            {stats.weeklyScans.map((day, idx) => (
              <div key={idx} style={theme.weeklyBar}>
                <div style={theme.weeklyBarContainer}>
                  <div 
                    style={{
                      ...theme.weeklyBarFill,
                      height: `${(day.count / maxWeeklyCount) * 100}%`,
                      background: day.date === new Date().toLocaleDateString() ? '#4CAF50' : '#81C784'
                    }}
                  ></div>
                </div>
                <span style={theme.weeklyLabel}>{day.day}</span>
                <span style={theme.weeklyCount}>{day.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crop Statistics */}
      {Object.keys(stats.cropStats).length > 0 && (
        <div style={theme.section}>
          <div style={theme.sectionHeader}>
            <h2 style={theme.sectionTitle}>🌾 Crop Health Overview</h2>
          </div>
          <div style={theme.cropGrid}>
            {Object.entries(stats.cropStats).slice(0, 4).map(([crop, data]) => (
              <div key={crop} style={theme.cropCard}>
                <div style={theme.cropHeader}>
                  <span style={theme.cropName}>{crop}</span>
                  <span style={theme.cropCount}>{data.total} scans</span>
                </div>
                <div style={theme.cropProgress}>
                  <div style={theme.cropProgressBar}>
                    <div 
                      style={{
                        ...theme.cropProgressFill,
                        width: `${(data.healthy / data.total) * 100}%`,
                        background: '#4CAF50'
                      }}
                    ></div>
                  </div>
                  <div style={theme.cropStats}>
                    <span style={{ color: '#4CAF50' }}>✅ {data.healthy} Healthy</span>
                    <span style={{ color: '#FF5722' }}>🦠 {data.diseased} Diseased</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={theme.section}>
        <div style={theme.sectionHeader}>
          <h2 style={theme.sectionTitle}>{t('dashboard.quickActions')}</h2>
        </div>
        <div style={theme.actionsGrid}>
          <Link to="/upload" style={theme.actionCard}>
            <div style={theme.actionIcon}>📷</div>
            <div style={theme.actionContent}>
              <h3>{t('dashboard.scanNewCrop')}</h3>
              <p>{t('dashboard.scanNewCropDesc')}</p>
            </div>
            <span style={theme.actionArrow}>→</span>
          </Link>
          <Link to="/history" style={theme.actionCard}>
            <div style={theme.actionIcon}>📊</div>
            <div style={theme.actionContent}>
              <h3>{t('dashboard.viewHistory')}</h3>
              <p>{t('dashboard.viewHistoryDesc')}</p>
            </div>
            <span style={theme.actionArrow}>→</span>
          </Link>
          <Link to="/diseases" style={theme.actionCard}>
            <div style={theme.actionIcon}>🩺</div>
            <div style={theme.actionContent}>
              <h3>{t('dashboard.diseaseGuide')}</h3>
              <p>{t('dashboard.diseaseGuideDesc')}</p>
            </div>
            <span style={theme.actionArrow}>→</span>
          </Link>
        </div>
      </div>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div style={theme.section}>
          <div style={theme.sectionHeader}>
            <h2 style={theme.sectionTitle}>{t('dashboard.recentScans')}</h2>
            <Link to="/history" style={theme.viewAll}>{t('dashboard.viewAll')} →</Link>
          </div>
          <div style={theme.recentList}>
            {recentScans.slice(0, 5).map((scan) => (
              <Link key={scan.scan_id} to={`/result/${scan.scan_id}`} style={theme.recentItem}>
                <img 
                  src={`http://localhost:5000${scan.image_url}`}
                  alt="Scan" 
                  style={theme.recentImage}
                  onError={(e) => e.target.src = 'https://via.placeholder.com/60?text=Leaf'}
                />
                <div style={theme.recentContent}>
                  <span style={theme.recentDisease}>
                    🦠 {scan.disease_name || 'Unknown'}
                  </span>
                  <span style={theme.recentDate}>
                    📅 {new Date(scan.created_at).toLocaleDateString()} | 🌱 {scan.disease?.crop_type || 'General'}
                  </span>
                </div>
                <span style={{
                  ...theme.confidenceBadge,
                  background: scan.disease_name?.toLowerCase().includes('healthy') ? '#4CAF50' : '#FF9800'
                }}>
                  {scan.confidence_score ? (parseFloat(scan.confidence_score) * 100).toFixed(0) : 0}%
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Crop Health Timeline */}
      {recentScans.length >= 2 && (
        <div style={theme.section}>
          <div style={theme.sectionHeader}>
            <h2 style={theme.sectionTitle}>📅 Crop Health Timeline</h2>
          </div>
          <div style={theme.timelineCard}>
            <div style={theme.timeline}>
              {recentScans.slice(0, 6).map((scan, idx) => {
                const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
                const severity = isHealthy ? 'healthy' : 
                  (scan.disease?.severity === 'high' ? 'severe' : 
                   scan.disease?.severity === 'medium' ? 'moderate' : 'mild');
                const statusColors = {
                  healthy: { bg: '#4CAF50', icon: '✅', text: 'Healthy' },
                  mild: { bg: '#FFC107', icon: '🟡', text: 'Mild Issue' },
                  moderate: { bg: '#FF9800', icon: '🟠', text: 'Moderate' },
                  severe: { bg: '#FF5722', icon: '🔴', text: 'Severe' }
                };
                return (
                  <div key={scan.scan_id} style={theme.timelineItem}>
                    <div style={theme.timelineDot}>
                      <span style={theme.timelineIcon}>{statusColors[severity].icon}</span>
                    </div>
                    <div style={theme.timelineContent}>
                      <span style={theme.timelineDate}>
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                      <span style={{...theme.timelineStatus, color: statusColors[severity].bg}}>
                        {statusColors[severity].text}
                      </span>
                      <span style={theme.timelineDisease}>
                        {scan.disease_name || 'Unknown'}
                      </span>
                    </div>
                    {idx < recentScans.slice(0, 6).length - 1 && (
                      <div style={theme.timelineLine}></div>
                    )}
                  </div>
                );
              })}
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
    background: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
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
  aiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '1.25rem',
    marginBottom: '1.5rem',
    boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
  },
  aiIcon: {
    fontSize: '2.5rem'
  },
  aiContent: {
    flex: 1
  },
  aiLabel: {
    display: 'block',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '0.875rem'
  },
  aiResult: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  aiConfidence: {
    background: 'rgba(255,255,255,0.2)',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem'
  },
  aiBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.875rem'
  },
  statCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s'
  },
  statIcon: {
    fontSize: '2.5rem'
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column'
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  statLabel: {
    color: '#666',
    fontSize: '0.875rem'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem'
  },
  chartCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  pieChart: {
    position: 'relative',
    width: '200px',
    height: '200px',
    margin: '0 auto 1rem'
  },
  pieSvg: {
    width: '100%',
    height: '100%'
  },
  pieCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center'
  },
  pieTotal: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  pieLabel: {
    fontSize: '0.875rem',
    color: '#666'
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#666'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px'
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  barItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  barLabel: {
    width: '80px',
    fontSize: '0.875rem',
    color: '#666'
  },
  barBg: {
    flex: 1,
    height: '24px',
    background: '#f0f0f0',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: '12px',
    transition: 'width 0.5s ease'
  },
  barPercent: {
    width: '45px',
    textAlign: 'right',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  weeklyChart: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '150px',
    padding: '1rem 0'
  },
  weeklyBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1
  },
  weeklyBarContainer: {
    width: '30px',
    height: '100px',
    background: '#f0f0f0',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden'
  },
  weeklyBarFill: {
    width: '100%',
    borderRadius: '8px 8px 0 0',
    transition: 'height 0.3s ease'
  },
  weeklyLabel: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '500'
  },
  weeklyCount: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  cropCard: {
    background: '#fff',
    borderRadius: '12px',
    padding: '1rem',
    border: '1px solid #eee'
  },
  section: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a2e'
  },
  viewAll: {
    color: '#4CAF50',
    textDecoration: 'none',
    fontWeight: '500'
  },
  actionsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  actionCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #fff 100%)',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #eee'
  },
  actionIcon: {
    fontSize: '2rem',
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f7f0',
    borderRadius: '12px'
  },
  actionContent: {
    flex: 1
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '12px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'background 0.2s'
  },
  recentImage: {
    width: '60px',
    height: '60px',
    borderRadius: '10px',
    objectFit: 'cover'
  },
  recentContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  recentDisease: {
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '0.25rem'
  },
  recentDate: {
    fontSize: '0.75rem',
    color: '#888'
  },
  timelineCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflowX: 'auto'
  },
  timeline: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0',
    minWidth: 'min-content'
  },
  timelineItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    minWidth: '120px',
    flex: 1
  },
  timelineDot: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#f5f5f5',
    border: '3px solid #4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1
  },
  timelineIcon: {
    fontSize: '1.25rem'
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '0.75rem',
    textAlign: 'center'
  },
  timelineDate: {
    fontSize: '0.75rem',
    color: '#888',
    fontWeight: '500'
  },
  timelineStatus: {
    fontSize: '0.8rem',
    fontWeight: '700',
    marginTop: '0.25rem'
  },
  timelineDisease: {
    fontSize: '0.7rem',
    color: '#666',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  timelineLine: {
    position: 'absolute',
    top: '24px',
    left: '50%',
    width: '100%',
    height: '3px',
    background: 'linear-gradient(90deg, #4CAF50, #81C784)',
    zIndex: 0
  }
};

const darkStyles = {
  ...lightStyles,
  container: {
    ...lightStyles.container,
    background: '#1a1a2e',
    color: '#fff'
  },
  title: {
    ...lightStyles.title,
    color: '#fff'
  },
  subtitle: {
    ...lightStyles.subtitle,
    color: '#aaa'
  },
  statCard: {
    ...lightStyles.statCard,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  statValue: {
    ...lightStyles.statValue,
    color: '#fff'
  },
  statLabel: {
    ...lightStyles.statLabel,
    color: '#aaa'
  },
  chartCard: {
    ...lightStyles.chartCard,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  chartTitle: {
    ...lightStyles.chartTitle,
    color: '#fff'
  },
  pieTotal: {
    ...lightStyles.pieTotal,
    color: '#fff'
  },
  pieLabel: {
    ...lightStyles.pieLabel,
    color: '#aaa'
  },
  legendItem: {
    ...lightStyles.legendItem,
    color: '#aaa'
  },
  barLabel: {
    ...lightStyles.barLabel,
    color: '#aaa'
  },
  barPercent: {
    ...lightStyles.barPercent,
    color: '#fff'
  },
  section: {
    ...lightStyles.section,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  sectionTitle: {
    ...lightStyles.sectionTitle,
    color: '#fff'
  },
  viewAll: {
    ...lightStyles.viewAll,
    color: '#4CAF50'
  },
  actionCard: {
    ...lightStyles.actionCard,
    background: '#3d3d5c',
    border: '1px solid #4d4d7c'
  },
  recentItem: {
    ...lightStyles.recentItem,
    background: '#3d3d5c'
  },
  recentDisease: {
    ...lightStyles.recentDisease,
    color: '#fff'
  },
  recentDate: {
    ...lightStyles.recentDate,
    color: '#aaa'
  },
  weeklyBarContainer: {
    ...lightStyles.weeklyBarContainer,
    background: '#3d3d5c'
  },
  weeklyLabel: {
    ...lightStyles.weeklyLabel,
    color: '#aaa'
  },
  weeklyCount: {
    ...lightStyles.weeklyCount,
    color: '#fff'
  },
  cropCard: {
    ...lightStyles.cropCard,
    background: '#3d3d5c',
    border: '1px solid #4d4d7c'
  },
  timelineCard: {
    ...lightStyles.timelineCard,
    background: '#2d2d44',
    border: '1px solid #3d3d5c'
  },
  timelineDot: {
    ...lightStyles.timelineDot,
    background: '#3d3d5c'
  },
  timelineDate: {
    ...lightStyles.timelineDate,
    color: '#aaa'
  },
  timelineDisease: {
    ...lightStyles.timelineDisease,
    color: '#aaa'
  }
};

export default Dashboard;
