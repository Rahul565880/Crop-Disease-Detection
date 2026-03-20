import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

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
      const response = await fetch(`${API_BASE}/scans/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load result');
      }
      
      let scanData = data.scan;
      if (scanData && scanData.treatment && scanData.treatment.disease) {
        scanData = { ...scanData, disease: scanData.treatment.disease };
      }
      
      setResult(scanData);
    } catch (err) {
      setError(err.message || 'Failed to load result');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLevel = (severity) => {
    if (severity === 'low') return { label: 'Mild', color: '#22c55e', bg: '#dcfce7', icon: '🟢' };
    if (severity === 'medium') return { label: 'Moderate', color: '#f59e0b', bg: '#fef3c7', icon: '🟡' };
    if (severity === 'high') return { label: 'Severe', color: '#ef4444', bg: '#fee2e2', icon: '🔴' };
    return { label: 'Unknown', color: '#64748b', bg: '#f1f5f9', icon: '⚪' };
  };

  const generatePDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    const scan = result;
    const conf = parseFloat(scan.confidence_score) * 100;
    const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
    const severity = getSeverityLevel(scan.disease?.severity);
    const userName = localStorage.getItem('userName') || 'Farmer';
    const userEmail = localStorage.getItem('userEmail') || '';
    
    // Header with green background
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Crop Disease Detection Application', 15, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Professional Agricultural Analysis', 15, 21);
    
    let yPos = 35;
    
    // CUSTOMER INFORMATION
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(0.5);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CUSTOMER INFORMATION', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Name: ' + userName + '    Email: ' + userEmail, 20, yPos);
    yPos += 6;
    doc.text('Scan ID: ' + scan.scan_id + '    Report Date: ' + new Date(scan.created_at).toLocaleDateString(), 20, yPos);
    yPos += 10;
    
    // STATUS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('STATUS', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 8;
    
    if (isHealthy) {
      doc.setFont('helvetica', 'normal');
      doc.text('Status: HEALTHY CROP', 20, yPos);
      yPos += 6;
      doc.text('Disease: ' + (scan.disease_name || 'None'), 20, yPos);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.text('Status: DISEASE DETECTED', 20, yPos);
      yPos += 6;
      doc.text('Disease: ' + (scan.disease_name || 'Unknown'), 20, yPos);
    }
    yPos += 12;
    
    // DISEASE ANALYSIS
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DISEASE ANALYSIS', 20, yPos);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Disease Name: ' + (scan.disease_name || 'Unknown'), 20, yPos);
    yPos += 6;
    doc.text('Crop Type: ' + (scan.disease?.crop_type || 'General'), 20, yPos);
    yPos += 6;
    doc.text('Confidence Score: ' + conf.toFixed(1) + '%', 20, yPos);
    yPos += 6;
    doc.text('Severity Level: ' + severity.label, 20, yPos);
    yPos += 12;
    
    // TREATMENT RECOMMENDATIONS
    if (scan.treatment && !isHealthy) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('TREATMENT RECOMMENDATIONS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;
      
      doc.setFontSize(11);
      
      doc.setFont('helvetica', 'bold');
      doc.text('Chemical Solution:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const chem = doc.splitTextToSize(scan.treatment.chemical_solution || 'N/A', 170);
      doc.text(chem, 20, yPos);
      yPos += chem.length * 5 + 4;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Organic Solution:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const org = doc.splitTextToSize(scan.treatment.organic_solution || 'N/A', 170);
      doc.text(org, 20, yPos);
      yPos += org.length * 5 + 4;
      
      doc.setFont('helvetica', 'bold');
      doc.text('Prevention Methods:', 20, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      const prev = doc.splitTextToSize(scan.treatment.prevention_methods || 'N/A', 170);
      doc.text(prev, 20, yPos);
      yPos += prev.length * 5 + 10;
      
      // GENERAL RECOMMENDATIONS
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('GENERAL RECOMMENDATIONS', 20, yPos);
      doc.line(20, yPos + 2, 190, yPos + 2);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const recommendations = [
        '1. Apply treatment as soon as possible to prevent further spread.',
        '2. Monitor the affected area regularly for any changes.',
        '3. Consider consulting with a local agricultural expert for severe cases.',
        '4. Keep affected plants isolated from healthy ones.'
      ];
      recommendations.forEach(rec => {
        doc.text(rec, 20, yPos);
        yPos += 6;
      });
    }
    
    // Footer
    doc.setFillColor(34, 139, 34);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Crop Disease Detection Application', 20, 286);
    doc.text('For professional agricultural advice, please contact local experts.', 20, 291);
    
    doc.save('crop-disease-report-' + scan.scan_id + '.pdf');
  };

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
          <p style={{ color: textMuted }}>Analyzing your crop...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgColor, padding: '2rem' }}>
        <div style={{ textAlign: 'center', background: cardBg, padding: '2rem', borderRadius: '20px' }}>
          <span style={{ fontSize: '4rem' }}>⚠️</span>
          <h2 style={{ color: textColor, margin: '1rem 0 0.5rem 0' }}>Something went wrong</h2>
          <p style={{ color: textMuted }}>{error || 'Unable to load result'}</p>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: '1rem', background: '#22c55e', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: '600' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const scan = result;
  const confidence = parseFloat(scan.confidence_score) * 100;
  const isHealthy = scan.disease_name?.toLowerCase().includes('healthy');
  const severity = getSeverityLevel(scan.disease?.severity);

  return (
    <div style={{ minHeight: '100vh', background: bgColor, padding: '1.5rem' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', textDecoration: 'none', fontWeight: '600' }}>
            ← Back
          </Link>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: darkMode ? '#374151' : '#22c55e', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Result Card */}
        <div style={{ background: cardBg, borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: `1px solid ${borderColor}` }}>
          
          {/* Status Banner */}
          <div style={{ padding: '2rem', background: isHealthy ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '3rem' }}>{isHealthy ? '✅' : '🦠'}</span>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>{isHealthy ? 'Plant is Healthy!' : 'Disease Detected'}</h1>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '1rem', opacity: 0.9 }}>{scan.disease_name}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: textMuted, fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Confidence</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#22c55e', margin: '0.25rem 0 0 0' }}>{confidence.toFixed(0)}%</p>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: textMuted, fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Severity</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '700', color: severity.color, margin: '0.25rem 0 0 0' }}>{severity.icon} {severity.label}</p>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: textMuted, fontSize: '0.75rem', margin: 0, textTransform: 'uppercase' }}>Date</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: textColor, margin: '0.25rem 0 0 0' }}>{new Date(scan.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Disease Details */}
        {!isHealthy && scan.disease && (
          <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>📋 Disease Details</h3>
            {scan.disease.description && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: textColor, margin: '0 0 0.25rem 0' }}>Description</h4>
                <p style={{ color: textMuted, fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>{scan.disease.description}</p>
              </div>
            )}
            {scan.disease.symptoms && (
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: textColor, margin: '0 0 0.25rem 0' }}>Symptoms</h4>
                <p style={{ color: textMuted, fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>{scan.disease.symptoms}</p>
              </div>
            )}
          </div>
        )}

        {/* Treatment Section */}
        {!isHealthy && scan.treatment && (
          <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>💊 Treatment Recommendations</h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '12px', border: '1px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🧪</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#92400e', margin: 0 }}>Chemical Solution</h4>
                </div>
                <p style={{ color: '#a16207', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>{scan.treatment.chemical_solution || 'Consult a local agricultural expert.'}</p>
              </div>
              
              <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '12px', border: '1px solid #22c55e' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🌿</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#166534', margin: 0 }}>Organic Solution</h4>
                </div>
                <p style={{ color: '#15803d', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>{scan.treatment.organic_solution || 'Use natural remedies.'}</p>
              </div>
              
              <div style={{ background: '#e0e7ff', padding: '1rem', borderRadius: '12px', border: '1px solid #6366f1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🛡</span>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#4338ca', margin: 0 }}>Prevention Methods</h4>
                </div>
                <p style={{ color: '#4f46e5', fontSize: '0.875rem', margin: 0, lineHeight: '1.6' }}>{scan.treatment.prevention_methods || 'Follow good agricultural practices.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Medicine Shop */}
        {!isHealthy && (
          <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginTop: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>🛒 Buy Medicines</h3>
            
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              <a 
                href={`https://www.amazon.in/s?k=${encodeURIComponent(scan.treatment?.chemical_solution || scan.disease_name + ' fungicide')}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#fff8e1', borderRadius: '12px', textDecoration: 'none', color: '#795548', border: '1px solid #ffe0b2' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🛍️</span>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Amazon - Chemical Solutions</strong>
                  <span style={{ fontSize: '0.75rem', color: '#a1887f' }}>Buy recommended fungicides & pesticides</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>→</span>
              </a>
              
              <a 
                href={`https://www.amazon.in/s?k=${encodeURIComponent('organic ' + scan.disease_name + ' treatment')}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#e8f5e9', borderRadius: '12px', textDecoration: 'none', color: '#2e7d32', border: '1px solid #c8e6c9' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🌱</span>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Amazon - Organic Solutions</strong>
                  <span style={{ fontSize: '0.75rem', color: '#66bb6a' }}>Natural & eco-friendly treatments</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>→</span>
              </a>
              
              <a 
                href={`https://www.flipkart.com/search?q=${encodeURIComponent('agricultural spray equipment')}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#e3f2fd', borderRadius: '12px', textDecoration: 'none', color: '#1976d2', border: '1px solid #bbdefb' }}
              >
                <span style={{ fontSize: '1.25rem' }}>🚜</span>
                <div>
                  <strong style={{ fontSize: '0.875rem', display: 'block' }}>Flipkart - Farm Equipment</strong>
                  <span style={{ fontSize: '0.75rem', color: '#42a5f5' }}>Sprayers & application tools</span>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '1rem' }}>→</span>
              </a>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <button onClick={generatePDF} style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#22c55e', color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            📄 Download PDF
          </button>
          <button 
            onClick={() => {
              const text = `🌾 Crop Disease Detection\n\nDisease: ${scan.disease_name}\nConfidence: ${confidence.toFixed(0)}%\nSeverity: ${severity.label}\n\n${scan.treatment ? `Treatment: ${scan.treatment.chemical_solution?.substring(0, 100)}...` : ''}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
            }}
            style={{ padding: '1rem', borderRadius: '12px', border: 'none', background: '#25D366', color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            📱 Share WhatsApp
          </button>
          <Link to="/upload" style={{ padding: '1rem', borderRadius: '12px', border: `2px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
            📷 New Scan
          </Link>
          <Link to="/diseases" style={{ padding: '1rem', borderRadius: '12px', border: `2px solid ${borderColor}`, background: 'transparent', color: textColor, fontSize: '0.95rem', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
            📚 Disease Guide
          </Link>
        </div>

        {/* Expert Help */}
        <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '1.25rem', marginTop: '1.5rem', border: '1px solid #f59e0b', textAlign: 'center' }}>
          <p style={{ color: '#92400e', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>💡 Need Expert Help?</p>
          <p style={{ color: '#a16207', fontSize: '0.85rem', margin: 0 }}>For severe cases, consult your local agricultural extension officer.</p>
        </div>
      </div>
    </div>
  );
};

export default Result;
