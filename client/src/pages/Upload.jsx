import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CROPS = [
  { id: 'auto', name: 'Auto Detect', icon: '🤖' },
  { id: 'tomato', name: 'Tomato', icon: '🍅' },
  { id: 'potato', name: 'Potato', icon: '🥔' },
  { id: 'corn', name: 'Corn', icon: '🌽' },
  { id: 'cotton', name: 'Cotton', icon: '🏵️' },
  { id: 'chilli', name: 'Chilli', icon: '🌶️' },
  { id: 'turmeric', name: 'Turmeric', icon: '🟡' },
  { id: 'rice', name: 'Rice', icon: '🍚' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋' },
  { id: 'banana', name: 'Banana', icon: '🍌' },
  { id: 'grape', name: 'Grape', icon: '🍇' },
  { id: 'apple', name: 'Apple', icon: '🍎' },
];

const Upload = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(-1);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('auto');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [userLat, setUserLat] = useState(null);
  const [userLon, setUserLon] = useState(null);
  const [scanResults, setScanResults] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://crop-disease-detection-98fp.onrender.com/api';

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => { setUserLat(pos.coords.latitude); setUserLon(pos.coords.longitude); },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    document.body.style.backgroundColor = darkMode ? '#0f172a' : '#f8fafc';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    const newPreviews = [];
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Please select only image files');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Each file must be less than 10MB');
        return;
      }
      validFiles.push(file);
      newPreviews.push({ file, url: URL.createObjectURL(file) });
    });
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setError('');
    }
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCamera(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraStream(stream);
      setShowCamera(true);
    } catch (err) {
      setError('Camera access denied or not available. Please use file upload.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const captureFromCamera = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFile(file);
        }
      }, 'image/jpeg', 0.95);
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);
    setError('');
    const results = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      setLoadingIndex(i);
      try {
        const formData = new FormData();
        formData.append('image', selectedFiles[i]);
        if (selectedCrop !== 'auto') {
          formData.append('crop_type', selectedCrop);
        }
        if (userLat !== null && userLon !== null) {
          formData.append('latitude', userLat);
          formData.append('longitude', userLon);
        }
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/scans/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        
        const data = await response.json();
        if (response.ok) {
          results.push({ ...data.scan, image: previews[i]?.url, disease: data.disease, treatment: data.treatment });
        } else {
          results.push({ error: data.details || data.error || `Server error (${response.status})`, image: previews[i]?.url });
        }
      } catch (err) {
        results.push({ error: err.message || 'Failed to analyze image', image: previews[i]?.url });
      }
    }
    
    setLoading(false);
    setLoadingIndex(-1);
    setScanResults(results);
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setError('');
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

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
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: textColor, margin: 0 }}>📷 Scan Your Crop</h1>
            <p style={{ color: textMuted, margin: '0.25rem 0 0 0', fontSize: '0.95rem' }}>Upload a photo of your crop leaf for disease detection</p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ background: darkMode ? '#374151' : '#22c55e', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>

        {/* Crop Selection */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: textColor, margin: '0 0 1rem 0' }}>🌱 Select Crop Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
            {CROPS.map((crop) => (
              <button
                key={crop.id}
                onClick={() => setSelectedCrop(crop.id)}
                style={{
                  padding: '0.875rem 0.5rem',
                  borderRadius: '12px',
                  border: `2px solid ${selectedCrop === crop.id ? '#22c55e' : borderColor}`,
                  background: selectedCrop === crop.id ? '#f0fdf4' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'center'
                }}
              >
                <span style={{ fontSize: '1.5rem', display: 'block' }}>{crop.icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: selectedCrop === crop.id ? '#166534' : textColor, display: 'block', marginTop: '0.25rem' }}>
                  {crop.name}
                </span>
              </button>
            ))}
          </div>
          {selectedCrop !== 'auto' && (
            <p style={{ marginTop: '1rem', color: '#22c55e', fontSize: '0.875rem', fontWeight: '500' }}>
              📌 Scanning for {CROPS.find(c => c.id === selectedCrop)?.name} diseases only
            </p>
          )}
        </div>

        {/* Camera Section */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
          {!showCamera ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={startCamera}
                style={{
                  flex: '1 1 200px',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: `2px dashed ${borderColor}`,
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span style={{ fontSize: '3rem' }}>📸</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: textColor }}>Use Camera</span>
                <span style={{ fontSize: '0.8rem', color: textMuted }}>Take a photo</span>
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', marginBottom: '1rem' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {/* Camera Frame Guide */}
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '70%', height: '70%',
                  border: '3px dashed rgba(34, 197, 94, 0.8)',
                  borderRadius: '20px',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute', bottom: '10px', left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.6)',
                  padding: '0.5rem 1rem', borderRadius: '20px',
                  color: '#fff', fontSize: '0.8rem'
                }}>
                  📷 Keep leaf in the frame
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={captureFromCamera}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#22c55e',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📸 Capture
                </button>
                <button
                  onClick={stopCamera}
                  style={{
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    border: `2px solid ${borderColor}`,
                    background: 'transparent',
                    color: textColor,
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
          {previews.length === 0 ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? '#22c55e' : borderColor}`,
                borderRadius: '16px',
                padding: '3rem 2rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: dragActive ? '#f0fdf4' : 'transparent'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>📤</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: textColor, margin: '0 0 0.5rem 0' }}>
                Drag & Drop your images here
              </h3>
              <p style={{ color: textMuted, margin: '0 0 1rem 0' }}>or click to browse (multiple files supported)</p>
              <p style={{ color: textMuted, fontSize: '0.8rem' }}>Supports: JPG, PNG, WEBP (Max 10MB each)</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                {previews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `1px solid ${borderColor}` }}>
                    <img 
                      src={preview.url} 
                      alt={`Preview ${index + 1}`} 
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                    />
                    <button
                      onClick={() => removeFile(index)}
                      style={{
                        position: 'absolute', top: '5px', right: '5px',
                        background: 'rgba(0,0,0,0.6)', color: '#fff',
                        border: 'none', borderRadius: '50%',
                        width: '28px', height: '28px', cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      ✕
                    </button>
                    <div style={{ padding: '0.5rem', fontSize: '0.75rem', color: textMuted, background: cardBg }}>
                      {preview.file.name.length > 20 ? preview.file.name.substring(0, 20) + '...' : preview.file.name} ({(preview.file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.75rem 1.5rem', borderRadius: '10px',
                  border: `2px dashed ${borderColor}`, background: 'transparent',
                  color: textColor, cursor: 'pointer', fontSize: '0.875rem'
                }}
              >
                + Add More Images
              </button>
            </div>
          )}

          {error && (
            <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginTop: '1rem' }}>
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {scanResults.length > 0 && (
          <div style={{ background: cardBg, borderRadius: '20px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `1px solid ${borderColor}` }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: textColor, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ✅ Analysis Results
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {scanResults.map((r, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                  {r.error ? (
                    <p style={{ color: '#dc2626', margin: 0, fontWeight: '500' }}>❌ {r.error}</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {r.image && <img src={r.image} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                          <p style={{ margin: 0, fontWeight: '700', color: textColor, fontSize: '1.1rem' }}>
                            {r.disease_name || 'Unknown'}
                            {r.confidence_score && (
                              <span style={{
                                display: 'inline-block', marginLeft: '0.5rem', padding: '0.15rem 0.6rem', borderRadius: '20px',
                                fontSize: '0.8rem', fontWeight: '600',
                                color: r.confidence_score > 0.7 ? '#166534' : r.confidence_score > 0.4 ? '#92400e' : '#991b1b',
                                background: r.confidence_score > 0.7 ? '#dcfce7' : r.confidence_score > 0.4 ? '#fef3c7' : '#fee2e2'
                              }}>
                                {(r.confidence_score * 100).toFixed(1)}%
                              </span>
                            )}
                          </p>
                          {r.detected_crop && <p style={{ margin: '0.25rem 0', color: textMuted, fontSize: '0.85rem' }}>🌾 {r.detected_crop}</p>}
                          {r.disease?.severity && (
                            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>
                              Severity: <span style={{
                                fontWeight: '600',
                                color: r.disease.severity === 'high' ? '#dc2626' : r.disease.severity === 'medium' ? '#d97706' : '#16a34a'
                              }}>
                                {r.disease.severity === 'high' ? '🔴 High' : r.disease.severity === 'medium' ? '🟡 Medium' : '🟢 Low'}
                              </span>
                            </p>
                          )}
                        </div>
                        <Link to={`/result/${r.id}`} style={{ padding: '0.5rem 1rem', background: '#22c55e', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
                          Full Report →
                        </Link>
                      </div>

                      {r.disease?.description && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: textColor, fontSize: '0.9rem' }}>📋 Description</p>
                          <p style={{ margin: 0, color: textMuted, fontSize: '0.85rem', lineHeight: '1.5' }}>{r.disease.description}</p>
                        </div>
                      )}

                      {r.disease?.symptoms && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: textColor, fontSize: '0.9rem' }}>⚠️ Symptoms</p>
                          <p style={{ margin: 0, color: textMuted, fontSize: '0.85rem', lineHeight: '1.5' }}>{r.disease.symptoms}</p>
                        </div>
                      )}

                      {r.treatment && (
                        <div style={{ background: darkMode ? '#0f172a' : '#f0fdf4', borderRadius: '10px', padding: '0.75rem', marginTop: '0.25rem' }}>
                          {r.treatment.organic_solution && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#16a34a', fontSize: '0.85rem' }}>🌿 Organic Treatment</p>
                              <p style={{ margin: 0, color: textMuted, fontSize: '0.8rem', lineHeight: '1.5' }}>{r.treatment.organic_solution}</p>
                            </div>
                          )}
                          {r.treatment.chemical_solution && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#dc2626', fontSize: '0.85rem' }}>🧪 Chemical Treatment</p>
                              <p style={{ margin: 0, color: textMuted, fontSize: '0.8rem', lineHeight: '1.5' }}>{r.treatment.chemical_solution}</p>
                            </div>
                          )}
                          {r.treatment.prevention_methods && (
                            <div>
                              <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600', color: '#2563eb', fontSize: '0.85rem' }}>🛡️ Prevention</p>
                              <p style={{ margin: 0, color: textMuted, fontSize: '0.8rem', lineHeight: '1.5' }}>{r.treatment.prevention_methods}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div style={{ background: '#fef3c7', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #f59e0b' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#92400e', margin: '0 0 0.5rem 0' }}>💡 Tips for best results:</h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#a16207', fontSize: '0.85rem' }}>
            <li>Ensure good lighting (natural daylight works best)</li>
            <li>Focus on the affected area of the leaf</li>
            <li>Keep the leaf in the center of the frame</li>
            <li>Avoid blurry or dark images</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || loading}
          style={{
            width: '100%', padding: '1rem', borderRadius: '16px', border: 'none',
            background: selectedFiles.length === 0 ? '#9ca3af' : '#22c55e', color: '#fff',
            fontSize: '1.125rem', fontWeight: '700', cursor: selectedFiles.length === 0 ? 'not-allowed' : 'pointer',
            boxShadow: selectedFiles.length > 0 ? '0 4px 15px rgba(34, 197, 94, 0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> 
              Analyzing {loadingIndex + 1} of {selectedFiles.length}...
            </span>
          ) : (
            `🔬 Analyze ${selectedFiles.length} Image${selectedFiles.length > 1 ? 's' : ''}`
          )}
        </button>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          button:hover { transform: translateY(-2px); }
          button { transition: all 0.2s; }
        `}</style>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
