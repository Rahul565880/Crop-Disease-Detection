import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
];

const Upload = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('auto');

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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError(t('upload.imageError'));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError(t('upload.sizeError'));
      return;
    }

    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (selectedCrop !== 'auto') {
        formData.append('crop_type', selectedCrop);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/scans/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      navigate(`/result/${data.scan.id}`);
    } catch (err) {
      setError(err.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
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
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          handleFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>📷 {t('upload.title')}</h1>
          <p style={styles.subtitle}>{t('upload.subtitle')}</p>
        </div>

        <div style={styles.cropSelector}>
          <label style={styles.cropLabel}>🌱 Select Crop Type:</label>
          <div style={styles.cropGrid}>
            {CROPS.map((crop) => (
              <button
                key={crop.id}
                type="button"
                style={{
                  ...styles.cropBtn,
                  background: selectedCrop === crop.id ? '#4CAF50' : '#f5f5f5',
                  color: selectedCrop === crop.id ? '#fff' : '#333',
                  border: selectedCrop === crop.id ? '2px solid #2E7D32' : '2px solid #ddd'
                }}
                onClick={() => setSelectedCrop(crop.id)}
              >
                <span style={styles.cropIcon}>{crop.icon}</span>
                <span style={styles.cropName}>{crop.name}</span>
              </button>
            ))}
          </div>
          <p style={styles.cropHint}>
            {selectedCrop === 'auto' 
              ? '🤖 AI will automatically detect the crop type'
              : `📌 Scanning for ${CROPS.find(c => c.id === selectedCrop)?.name} diseases only`}
          </p>
        </div>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        {!previewUrl && !showCamera && (
          <div
            style={{
              ...styles.uploadArea,
              borderColor: dragActive ? '#4CAF50' : '#ddd',
              background: dragActive ? '#f0f7f0' : '#fafafa'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              style={{ display: 'none' }}
            />

            <div style={styles.uploadIcon}>🌾</div>
            <h3 style={styles.uploadTitle}>{t('upload.dragDrop')}</h3>
            <p style={styles.uploadText}>{t('upload.clickToBrowse')}</p>
            
            <div style={styles.formats}>
              <span style={styles.formatBadge}>JPG</span>
              <span style={styles.formatBadge}>PNG</span>
              <span style={styles.formatBadge}>GIF</span>
              <span style={styles.formatBadge}>WebP</span>
            </div>
            
            <p style={styles.sizeLimit}>{t('upload.maxSize')}: 10MB</p>
            
            <button 
              type="button"
              style={styles.cameraBtn}
              onClick={(e) => { e.stopPropagation(); startCamera(); }}
            >
              📷 {t('upload.useCamera')}
            </button>
          </div>
        )}

        {showCamera && (
          <div style={styles.cameraSection}>
            <div style={styles.cameraWrapper}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.videoPreview}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div style={styles.cameraControls}>
              <button 
                style={styles.cancelCameraBtn}
                onClick={stopCamera}
              >
                ✕ Cancel
              </button>
              <button 
                style={styles.captureBtn}
                onClick={captureFromCamera}
              >
                📸 Capture
              </button>
            </div>
          </div>
        )}

        {!previewUrl && !showCamera && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
          />
        )}

        {!previewUrl && !showCamera && (
          <div style={styles.orDivider}>
            <span style={styles.orLine}></span>
            <span style={styles.orText}>OR</span>
            <span style={styles.orLine}></span>
          </div>
        )}

        {!previewUrl && !showCamera && (
          <button
            style={styles.useCameraBtn}
            onClick={startCamera}
          >
            📷 {t('upload.useCamera')}
          </button>
        )}

        {previewUrl && (
          <div style={styles.previewSection}>
            <div style={styles.imageWrapper}>
              <img 
                src={previewUrl} 
                alt="Preview" 
                style={styles.previewImage}
              />
              <button 
                style={styles.removeBtn}
                onClick={clearSelection}
              >
                ✕
              </button>
            </div>
            
            <div style={styles.fileInfo}>
              <span style={styles.fileName}>{selectedFile?.name}</span>
              <span style={styles.fileSize}>
                {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            <div style={styles.actions}>
              <button 
                style={styles.changeBtn}
                onClick={handleClick}
              >
                {t('upload.changeImage')}
              </button>
              
              <button 
                style={styles.analyzeBtn}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    🔬 Analyze Crop
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div style={styles.tips}>
          <h4 style={styles.tipsTitle}>📸 Tips for Best Results:</h4>
          <ul style={styles.tipsList}>
            <li>Take photos in good natural lighting (avoid shadows)</li>
            <li>Focus on the affected area of the leaf</li>
            <li>Capture close-up images for better accuracy</li>
            <li>Keep the leaf steady while taking the photo</li>
            <li>Include both healthy and affected parts in frame</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem'
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
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#666',
    fontSize: '1rem'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    textAlign: 'center'
  },
  cropSelector: {
    background: '#f8f9fa',
    padding: '1.5rem',
    borderRadius: '16px',
    marginBottom: '1.5rem'
  },
  cropLabel: {
    display: 'block',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '1rem'
  },
  cropGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1rem'
  },
  cropBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.75rem 0.5rem',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.8rem'
  },
  cropIcon: {
    fontSize: '1.5rem'
  },
  cropName: {
    fontWeight: '500',
    fontSize: '0.75rem'
  },
  cropHint: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'center',
    margin: 0
  },
  uploadArea: {
    border: '2px dashed #ddd',
    borderRadius: '16px',
    padding: '3rem 2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  uploadIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  uploadTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '0.5rem'
  },
  uploadText: {
    color: '#666',
    marginBottom: '1.5rem'
  },
  formats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  formatBadge: {
    background: '#f0f0f0',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '500'
  },
  sizeLimit: {
    fontSize: '0.875rem',
    color: '#999'
  },
  previewSection: {
    textAlign: 'center'
  },
  imageWrapper: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '1rem'
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '12px',
    objectFit: 'contain'
  },
  removeBtn: {
    position: 'absolute',
    top: '-10px',
    right: '-10px',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: '#ff5722',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  fileName: {
    fontWeight: '500',
    color: '#1a1a2e'
  },
  fileSize: {
    color: '#666'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  changeBtn: {
    padding: '0.875rem 1.5rem',
    borderRadius: '12px',
    border: '2px solid #4CAF50',
    background: 'transparent',
    color: '#4CAF50',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  analyzeBtn: {
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    transition: 'all 0.2s'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spin 1s linear infinite'
  },
  cameraSection: {
    textAlign: 'center',
    marginBottom: '1.5rem'
  },
  cameraWrapper: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#000',
    marginBottom: '1rem'
  },
  videoPreview: {
    width: '100%',
    maxHeight: '400px',
    display: 'block'
  },
  cameraControls: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center'
  },
  cancelCameraBtn: {
    padding: '0.875rem 1.5rem',
    borderRadius: '12px',
    border: '2px solid #FF5722',
    background: 'transparent',
    color: '#FF5722',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  captureBtn: {
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cameraBtn: {
    background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '12px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s'
  },
  useCameraBtn: {
    display: 'block',
    width: '100%',
    padding: '1rem',
    borderRadius: '12px',
    border: '2px dashed #2196F3',
    background: 'transparent',
    color: '#2196F3',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '1rem'
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1.5rem 0'
  },
  orLine: {
    flex: 1,
    height: '1px',
    background: '#ddd'
  },
  orText: {
    color: '#999',
    fontSize: '0.875rem',
    fontWeight: '600'
  },
  tips: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '12px'
  },
  tipsTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: '0.75rem'
  },
  tipsList: {
    margin: 0,
    paddingLeft: '1.25rem',
    color: '#666',
    lineHeight: '1.8'
  }
};

export default Upload;
