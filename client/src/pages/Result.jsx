import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';

const Result = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/scans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load result: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      let scanData = data.scan;
      if (scanData && scanData.treatment && scanData.treatment.disease) {
        scanData = { ...scanData, disease: scanData.treatment.disease };
      }
      
      setResult(scanData);
      setError('');
    } catch (err) {
      console.error('Error fetching result:', err);
      setError(err.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceLevel = (conf) => {
    if (conf >= 85) return { text: 'Highly Confident', color: '#4CAF50', icon: '🎯' };
    if (conf >= 70) return { text: 'Moderately Confident', color: '#FF9800', icon: '⚡' };
    return { text: 'Low Confidence', color: '#f44336', icon: '⚠️' };
  };

  const getSeverityLevel = (diseaseName, severity) => {
    if (severity) {
      if (severity === 'low') return { label: 'Mild', color: '#4CAF50', bg: '#e8f5e9' };
      if (severity === 'medium') return { label: 'Moderate', color: '#FF9800', bg: '#fff3e0' };
      if (severity === 'high') return { label: 'Severe', color: '#f44336', bg: '#ffebee' };
    }
    
    if (!diseaseName || diseaseName.toLowerCase().includes('healthy')) {
      return { label: 'None', color: '#4CAF50', bg: '#e8f5e9' };
    }
    
    const highRisk = ['blight', 'rust', 'rot', 'virus', 'wilt', 'canker', 'blast'];
    const mediumRisk = ['spot', 'mold', 'mildew', 'anthracnose', 'scald'];
    const name = diseaseName.toLowerCase();
    
    if (highRisk.some(r => name.includes(r))) {
      return { label: 'Severe', color: '#f44336', bg: '#ffebee' };
    }
    if (mediumRisk.some(r => name.includes(r))) {
      return { label: 'Moderate', color: '#FF9800', bg: '#fff3e0' };
    }
    return { label: 'Mild', color: '#FFC107', bg: '#fffde7' };
  };

  const generatePDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const scan = result;
    const conf = parseFloat(scan.confidence_score) * 100;
    const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
    const severity = getSeverityLevel(scan.disease_name, scan.disease?.severity);
    const userName = localStorage.getItem('userName') || 'Farmer';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Header Background
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, 210, 25, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Crop Disease Detection Report', 15, 15);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Agricultural Analysis', 15, 22);
    
    // Generated Date (top right)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Generated: ' + new Date().toLocaleDateString(), 140, 22);
    
    // Customer Information Section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INFORMATION', 15, 35);
    
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    doc.line(15, 37, 195, 37);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Name: ' + userName, 15, 45);
    doc.text('Email: ' + userEmail, 80, 45);
    doc.text('Scan ID: ' + scan.scan_id, 15, 52);
    doc.text('Report Date: ' + new Date(scan.created_at).toLocaleDateString(), 80, 52);
    
    // Status Section
    let yPos = 62;
    
    if (isHealthy) {
      doc.setFillColor(200, 230, 200);
      doc.rect(15, yPos, 180, 15, 'F');
      doc.setTextColor(34, 139, 34);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS: HEALTHY CROP', 20, yPos + 10);
    } else {
      doc.setFillColor(255, 220, 220);
      doc.rect(15, yPos, 180, 15, 'F');
      doc.setTextColor(200, 50, 50);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STATUS: DISEASE DETECTED', 20, yPos + 10);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(11);
      doc.text('Disease: ' + (scan.disease_name || 'Unknown'), 20, yPos + 20);
    }
    
    yPos += 30;
    
    // Disease Analysis Section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DISEASE ANALYSIS', 15, yPos);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 2, 195, yPos + 2);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Disease Name: ' + (scan.disease_name || 'Unknown'), 15, yPos);
    yPos += 7;
    doc.text('Crop Type: ' + (scan.disease?.crop_type || 'General'), 15, yPos);
    yPos += 7;
    doc.text('Confidence Score: ' + conf.toFixed(1) + '%', 15, yPos);
    yPos += 7;
    doc.text('Severity Level: ' + severity.label, 15, yPos);
    
    // Treatment Recommendations
    if (scan.treatment && !isHealthy) {
      yPos += 12;
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TREATMENT RECOMMENDATIONS', 15, yPos);
      doc.setDrawColor(200, 200, 200);
      doc.line(15, yPos + 2, 195, yPos + 2);
      
      yPos += 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('Chemical Solution:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const chem = doc.splitTextToSize(scan.treatment.chemical_solution || 'N/A', 175);
      doc.text(chem, 15, yPos);
      yPos += chem.length * 5 + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Organic Solution:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const org = doc.splitTextToSize(scan.treatment.organic_solution || 'N/A', 175);
      doc.text(org, 15, yPos);
      yPos += org.length * 5 + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Prevention Methods:', 15, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const prev = doc.splitTextToSize(scan.treatment.prevention_methods || 'N/A', 175);
      doc.text(prev, 15, yPos);
      yPos += prev.length * 5 + 5;
    }
    
    // General Recommendations
    yPos += 8;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GENERAL RECOMMENDATIONS', 15, yPos);
    doc.setDrawColor(200, 200, 200);
    doc.line(15, yPos + 2, 195, yPos + 2);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const recommendations = [
      '1. Apply treatment as soon as possible to prevent further spread.',
      '2. Monitor the affected area regularly for any changes.',
      '3. Consider consulting with a local agricultural expert for severe cases.',
      '4. Keep affected plants isolated from healthy ones.'
    ];
    
    recommendations.forEach(rec => {
      doc.text(rec, 15, yPos);
      yPos += 7;
    });
    
    // Footer
    doc.setFillColor(240, 240, 240);
    doc.rect(0, 275, 210, 22, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('Crop Disease Detection Application', 15, 282);
    doc.text('For professional agricultural advice, please contact local experts.', 15, 287);
    
    doc.save('crop-disease-report-' + scan.scan_id + '.pdf');
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Analyzing your crop...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error || 'Unable to load result'}</p>
          <Link to="/dashboard" style={styles.errorBtn}>Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  const scan = result;
  const confidence = parseFloat(scan.confidence_score) * 100;
  const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
  const cropType = scan.disease?.crop_type || 'General';
  const severity = getSeverityLevel(scan.disease_name, scan.disease?.severity);
  const confidenceLevel = getConfidenceLevel(confidence);

  return (
    <div style={{ ...styles.pageWrapper, background: darkMode ? '#0f172a' : '#f8fafc' }}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Link to="/dashboard" style={styles.backLink}>
            <span style={styles.backIcon}>←</span> Back to Dashboard
          </Link>
          <button onClick={() => setDarkMode(!darkMode)} style={styles.themeBtn}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>

        {/* Main Result Card */}
        <div style={{ ...styles.resultCard, background: darkMode ? '#1e293b' : '#ffffff' }}>
          {/* Status Banner */}
          <div style={{ ...styles.statusBanner, background: isHealthy ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            <div style={styles.statusContent}>
              <span style={styles.statusIcon}>{isHealthy ? '✅' : '🦠'}</span>
              <div>
                <h1 style={styles.statusTitle}>{isHealthy ? 'Plant is Healthy!' : 'Disease Detected'}</h1>
                <p style={styles.statusSubtitle}>{scan.disease_name || 'Unknown Disease'}</p>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div style={styles.imageSection}>
            {scan.image_url && (
              <img 
                src={`http://localhost:5000${scan.image_url}`}
                alt="Scanned leaf"
                style={styles.image}
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          {/* Info Cards Grid */}
          <div style={styles.infoGrid}>
            {/* Crop Card */}
            <div style={{ ...styles.infoCard, background: darkMode ? '#334155' : '#f0fdf4', border: darkMode ? '1px solid #475569' : '1px solid #bbf7d0' }}>
              <div style={styles.infoIcon}>🍅</div>
              <div style={styles.infoContent}>
                <span style={{ ...styles.infoLabel, color: darkMode ? '#94a3b8' : '#6b7280' }}>Crop Type</span>
                <span style={{ ...styles.infoValue, color: darkMode ? '#f1f5f9' : '#1f2937' }}>{cropType}</span>
              </div>
            </div>

            {/* Confidence Card */}
            <div style={{ ...styles.infoCard, background: darkMode ? '#334155' : '#fef3c7', border: darkMode ? '1px solid #475569' : '1px solid #fde68a' }}>
              <div style={styles.infoIcon}>📊</div>
              <div style={styles.infoContent}>
                <span style={{ ...styles.infoLabel, color: darkMode ? '#94a3b8' : '#6b7280' }}>Confidence</span>
                <span style={{ ...styles.infoValue, color: confidenceLevel.color }}>{confidence.toFixed(1)}%</span>
              </div>
            </div>

            {/* Severity Card */}
            <div style={{ ...styles.infoCard, background: severity.bg, border: `1px solid ${severity.color}30` }}>
              <div style={styles.infoIcon}>
                {severity.label === 'Severe' ? '🔴' : severity.label === 'Moderate' ? '🟡' : severity.label === 'Mild' ? '🟢' : '✅'}
              </div>
              <div style={styles.infoContent}>
                <span style={{ ...styles.infoLabel, color: darkMode ? '#94a3b8' : '#6b7280' }}>Severity</span>
                <span style={{ ...styles.infoValue, color: severity.color }}>{severity.label}</span>
              </div>
            </div>
          </div>

          {/* Confidence Explanation */}
          <div style={{ ...styles.explanationCard, background: darkMode ? '#334155' : '#f1f5f9', border: darkMode ? '1px solid #475569' : '1px solid #e2e8f0' }}>
            <div style={styles.explanationHeader}>
              <span style={styles.explanationIcon}>{confidenceLevel.icon}</span>
              <span style={{ ...styles.explanationTitle, color: darkMode ? '#f1f5f9' : '#1f2937' }}>
                {confidenceLevel.text}
              </span>
            </div>
            <p style={{ ...styles.explanationText, color: darkMode ? '#94a3b8' : '#64748b' }}>
              {confidence >= 85 
                ? 'The AI model is highly confident about this prediction. You can trust this result and proceed with the recommended treatment.'
                : confidence >= 70
                ? 'The AI model has moderate confidence. We recommend verifying the symptoms and consulting an expert if needed.'
                : 'The AI model has low confidence. Please consult an agriculture expert for accurate diagnosis.'}
            </p>
          </div>

          {/* Image Guidelines */}
          <div style={{ ...styles.guidelinesCard, background: darkMode ? '#334155' : '#fefce8', border: darkMode ? '1px solid #475569' : '1px solid #fef08a' }}>
            <div style={styles.guidelinesHeader}>
              <span style={styles.guidelinesIcon}>📷</span>
              <span style={{ ...styles.guidelinesTitle, color: darkMode ? '#f1f5f9' : '#854d0e' }}>Tips for Better Results</span>
            </div>
            <ul style={styles.guidelinesList}>
              <li>Take photos in good natural lighting</li>
              <li>Focus on the affected area of the leaf</li>
              <li>Capture close-up images for better accuracy</li>
              <li>Avoid blurry or dark images</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionsGrid}>
            <Link to="/upload" style={styles.primaryBtn}>
              📷 Scan Another Crop
            </Link>
            <button onClick={generatePDF} style={styles.downloadBtn}>
              📥 Download Report
            </button>
            <a href="tel:+919876543210" style={styles.expertBtn}>
              📞 Consult Expert
            </a>
            <Link to="/history" style={styles.secondaryBtn}>
              📋 View History
            </Link>
          </div>

          {/* Scan Info */}
          <div style={{ ...styles.scanInfo, borderTop: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <span style={{ color: darkMode ? '#64748b' : '#9ca3af' }}>
              Scan ID: {scan.scan_id} • {new Date(scan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    padding: '1rem',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#22c55e',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  backIcon: {
    fontSize: '1.2rem',
  },
  themeBtn: {
    background: '#22c55e',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  resultCard: {
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  },
  statusBanner: {
    padding: '2rem',
    color: '#fff',
  },
  statusContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statusIcon: {
    fontSize: '3rem',
  },
  statusTitle: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: '700',
  },
  statusSubtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '1rem',
    opacity: 0.9,
  },
  imageSection: {
    width: '100%',
    height: '250px',
    background: '#f1f5f9',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    padding: '1.5rem',
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    borderRadius: '12px',
  },
  infoIcon: {
    fontSize: '1.5rem',
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  explanationCard: {
    margin: '0 1.5rem 1rem',
    padding: '1.25rem',
    borderRadius: '12px',
  },
  explanationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  explanationIcon: {
    fontSize: '1.25rem',
  },
  explanationTitle: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  explanationText: {
    margin: 0,
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  guidelinesCard: {
    margin: '0 1.5rem 1.5rem',
    padding: '1.25rem',
    borderRadius: '12px',
  },
  guidelinesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  guidelinesIcon: {
    fontSize: '1.25rem',
  },
  guidelinesTitle: {
    fontSize: '1rem',
    fontWeight: '600',
  },
  guidelinesList: {
    margin: 0,
    paddingLeft: '1.25rem',
    color: '#854d0e',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    padding: '0 1.5rem 1.5rem',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
  },
  expertBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    background: '#f1f5f9',
    color: '#1f2937',
    padding: '1rem',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    border: '2px solid #e2e8f0',
  },
  scanInfo: {
    padding: '1rem 1.5rem',
    textAlign: 'center',
    fontSize: '0.8rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e5e7eb',
    borderTopColor: '#22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '1.1rem',
    animation: 'pulse 2s infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '2rem',
  },
  errorIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  errorTitle: {
    color: '#ef4444',
    marginBottom: '0.5rem',
  },
  errorText: {
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  errorBtn: {
    background: '#22c55e',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default Result;
