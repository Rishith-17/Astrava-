import { useState, useRef, useEffect } from 'react';
import { analyzeSoil } from '../services/soilService';
import './UploadScreen.css';

function UploadScreen({ onComplete, onBack, language, voiceCapturedPhoto, onPhotoProcessed }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    // Handle voice-captured photo from props
    if (voiceCapturedPhoto) {
      console.log('Processing voice-captured photo:', voiceCapturedPhoto.name);
      setImage(voiceCapturedPhoto);
      setPreview(URL.createObjectURL(voiceCapturedPhoto));
      setError(null);
      
      // Notify parent that photo has been processed
      if (onPhotoProcessed) {
        onPhotoProcessed();
      }
    }
  }, [voiceCapturedPhoto, onPhotoProcessed]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    console.log('🔍 Analyze button clicked!');
    console.log('Image:', image);
    console.log('Language:', language);
    
    if (!image) {
      console.error('❌ No image selected');
      setError('No image selected. Please select an image first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📤 Sending image to backend...');
      const result = await analyzeSoil(image, language);
      console.log('✅ Analysis complete:', result);
      onComplete(result);
    } catch (err) {
      console.error('❌ Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setImage(null);
    setPreview(null);
    setError(null);
  };

  return (
    <div className="screen upload-screen">
      <div className="upload-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1 className="upload-title">Capture Soil Photo</h1>
      </div>
      
      {/* Camera input - triggers native camera */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Gallery input - opens file picker */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!preview && (
        <>
          <div className="upload-options">
            <button className="option-card" onClick={() => cameraInputRef.current.click()}>
              <div className="option-icon">📷</div>
              <h3>Take Photo</h3>
              <p>Open camera to capture soil</p>
            </button>
            
            <button className="option-card" onClick={() => galleryInputRef.current.click()}>
              <div className="option-icon">🖼️</div>
              <h3>Upload from Gallery</h3>
              <p>Select existing photo</p>
            </button>
          </div>
          
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </>
      )}

      {preview && (
        <div className="preview-area">
          <img src={preview} alt="Soil preview" />
          
          {error && (
            <div className="error-message" style={{ 
              background: '#fee2e2', 
              color: '#dc2626', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div className="preview-actions">
            <button className="btn-retake" onClick={resetUpload}>
              🔄 Retake
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : '🔍 Analyze'}
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading">
            <div className="spinner"></div>
            <p>Analyzing your soil...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadScreen;
