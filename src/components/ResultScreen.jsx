import { useState, useEffect, useRef } from 'react';
import './ResultScreen.css';
import AdvisoryReport from './AdvisoryReport';
import { t } from '../translations';
import sarvamVoiceService from '../services/sarvamVoiceService';

function ResultScreen({ result, onBack, language }) {
  const [speaking, setSpeaking] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const audioRef = useRef(null);

  // Auto-play audio for agentic workflow
  useEffect(() => {
    if (result.isAgenticWorkflow && result.audioBlobs && result.audioBlobs.length > 0) {
      console.log('[ResultScreen] Agentic workflow detected, auto-playing audio');
      playAgenticAudio();
    }

    // Cleanup: Stop audio when component unmounts
    return () => {
      console.log('[ResultScreen] Cleaning up - stopping all audio');
      stopAllAudio();
    };
  }, [result]);

  const stopAllAudio = () => {
    console.log('[ResultScreen] Stopping all audio');
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudioPlaying(false);
    setCurrentChunk(0);
    setCurrentAudio(null);
  };

  const playAgenticAudio = async () => {
    if (!result.audioBlobs || result.audioBlobs.length === 0) {
      console.log('[ResultScreen] No audio blobs to play');
      return;
    }

    setAudioPlaying(true);
    
    try {
      for (let i = 0; i < result.audioBlobs.length; i++) {
        // Check if we should stop (user clicked stop or navigated away)
        if (!audioPlaying && i > 0) {
          console.log('[ResultScreen] Audio playback stopped by user');
          break;
        }

        setCurrentChunk(i + 1);
        console.log(`[ResultScreen] Playing audio chunk ${i + 1}/${result.audioBlobs.length}`);
        
        const audioUrl = URL.createObjectURL(result.audioBlobs[i]);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        await new Promise((resolve, reject) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            resolve();
          };
          audio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            audioRef.current = null;
            reject(error);
          };
          audio.play().catch(reject);
        });
        
        // Small pause between chunks
        if (i < result.audioBlobs.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      console.log('[ResultScreen] All audio chunks played');
    } catch (error) {
      console.error('[ResultScreen] Audio playback error:', error);
    } finally {
      setAudioPlaying(false);
      setCurrentChunk(0);
      audioRef.current = null;
    }
  };

  if (showReport && result.advisory_report) {
    return <AdvisoryReport report={result.advisory_report} onBack={() => setShowReport(false)} language={language} />;
  }

  // Use regular card format for both manual and agentic workflows
  const analysis = result.analysis || result;

  // Regular workflow - show structured results
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      const text = result.advice || `Soil type: ${result.soil_type}. pH: ${result.ph}. ${result.fertilizer}`;
      const utterance = new SpeechSynthesisUtterance(text);
      
      const langMap = {
        'kn': 'kn-IN',
        'hi': 'hi-IN',
        'ta': 'ta-IN',
        'te': 'te-IN',
        'en': 'en-IN'
      };
      
      utterance.lang = langMap[language] || 'en-IN';
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="screen result-screen">
      <div className="result-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <h1 className="result-title">{t('analysis_results', language)}</h1>
      </div>

      <div className="success-badge">
        <div className="success-icon">{result.isAgenticWorkflow ? '🤖' : '✅'}</div>
        <div className="success-text">
          {result.isAgenticWorkflow ? t('autonomous_analysis', language) : t('analysis_complete', language)}
        </div>
        {analysis.confidence && (
          <div className="confidence-badge">
            {Math.round(analysis.confidence * 100)}% {t('confidence', language)}
          </div>
        )}
      </div>

      {/* Audio controls for agentic workflow */}
      {result.isAgenticWorkflow && result.audioBlobs && result.audioBlobs.length > 0 && (
        <div className="audio-controls">
          {audioPlaying ? (
            <div className="audio-progress">
              <div className="audio-wave">
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
                <span className="wave-bar"></span>
              </div>
              <p className="audio-text">
                🔊 {t('speaking', language)} ({currentChunk}/{result.audioBlobs.length})
              </p>
              <button 
                className="btn btn-secondary"
                onClick={stopAllAudio}
              >
                ⏹️ {t('stop_audio', language)}
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={playAgenticAudio}
            >
              🔊 {t('play_audio', language)}
            </button>
          )}
        </div>
      )}

      <div className="result-item">
        <div className="result-icon">🌍</div>
        <div className="result-content">
          <strong>{t('soil_type', language)}</strong>
          <p>{analysis.soil_type}</p>
          {analysis.confidence && (
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${analysis.confidence * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <div className="result-item">
        <div className="result-icon">⚗️</div>
        <div className="result-content">
          <strong>{t('ph_level', language)}</strong>
          <p>{analysis.ph || analysis.ml_ph_level || 'N/A'}</p>
          {analysis.ml_ph_level && analysis.ph && analysis.ml_ph_level !== analysis.ph && (
            <small className="ml-prediction">ML Predicted: {analysis.ml_ph_level}</small>
          )}
        </div>
      </div>

      {analysis.ml_nutrient_status && (
        <div className="result-item">
          <div className="result-icon">🧪</div>
          <div className="result-content">
            <strong>{t('nutrient_levels', language)}</strong>
            <div className="nutrient-grid">
              <div className={`nutrient-item ${analysis.ml_nutrient_status.nitrogen?.toLowerCase()}`}>
                <span className="nutrient-label">{t('nitrogen', language)}</span>
                <span className="nutrient-value">{analysis.ml_nutrient_status.nitrogen}</span>
              </div>
              <div className={`nutrient-item ${analysis.ml_nutrient_status.phosphorus?.toLowerCase()}`}>
                <span className="nutrient-label">{t('phosphorus', language)}</span>
                <span className="nutrient-value">{analysis.ml_nutrient_status.phosphorus}</span>
              </div>
              <div className={`nutrient-item ${analysis.ml_nutrient_status.potassium?.toLowerCase()}`}>
                <span className="nutrient-label">{t('potassium', language)}</span>
                <span className="nutrient-value">{analysis.ml_nutrient_status.potassium}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {analysis.nutrient_deficiency && (
        <div className="result-item">
          <div className="result-icon">⚠️</div>
          <div className="result-content">
            <strong>{t('nutrient_status', language)}</strong>
            <p>{analysis.nutrient_deficiency}</p>
          </div>
        </div>
      )}

      <div className="result-item highlight">
        <div className="result-icon">💊</div>
        <div className="result-content">
          <strong>{t('fertilizer_advice', language)}</strong>
          <p>{analysis.fertilizer}</p>
        </div>
      </div>

      {analysis.recommended_crops && analysis.recommended_crops.length > 0 && (
        <div className="result-item">
          <div className="result-icon">🌾</div>
          <div className="result-content">
            <strong>{t('recommended_crops', language)}</strong>
            <div className="crops-list">
              {analysis.recommended_crops.map((crop, idx) => (
                <span key={idx} className="crop-tag">{crop}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {analysis.location && (
        <div className="result-item">
          <div className="result-icon">📍</div>
          <div className="result-content">
            <strong>{t('location', language)}</strong>
            <p>{analysis.location.district}, {analysis.location.state}, {analysis.location.country}</p>
          </div>
        </div>
      )}

      {analysis.weather && (
        <div className="result-item">
          <div className="result-icon">🌤️</div>
          <div className="result-content">
            <strong>{t('current_weather', language)}</strong>
            <div className="weather-info">
              <span>🌡️ {analysis.weather.temperature}°C</span>
              <span>💧 {analysis.weather.humidity}% {t('humidity', language)}</span>
              <span>🌧️ {analysis.weather.rainfall_30d}mm (30 days)</span>
            </div>
          </div>
        </div>
      )}

      {analysis.satellite && (
        <div className="result-item">
          <div className="result-icon">🛰️</div>
          <div className="result-content">
            <strong>{t('satellite_data', language)}</strong>
            <div className="satellite-info">
              <span>🌿 NDVI: {analysis.satellite.ndvi?.toFixed(2)}</span>
              {analysis.satellite.source && (
                <span className="data-source">Source: {analysis.satellite.source}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {analysis.crop_health && (
        <div className="result-item">
          <div className="result-icon">🌱</div>
          <div className="result-content">
            <strong>{t('crop_health', language)}</strong>
            <div className="health-info">
              <span>{t('score', language)}: {analysis.crop_health.health_score}/100</span>
              <span>{t('stage', language)}: {analysis.crop_health.growth_stage?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {analysis.soil_health_card && (
        <div className="result-item">
          <div className="result-icon">🇮🇳</div>
          <div className="result-content">
            <strong>{t('soil_health_card', language)}</strong>
            <div className="shc-info">
              <div className="shc-section">
                <span className="shc-label">{t('state', language)}:</span>
                <span>{analysis.soil_health_card.state}</span>
              </div>
              <div className="shc-section">
                <span className="shc-label">{t('macro_nutrients', language)}:</span>
                <div className="nutrient-values">
                  <span>N: {analysis.soil_health_card.macro_nutrients.nitrogen}</span>
                  <span>P: {analysis.soil_health_card.macro_nutrients.phosphorus}</span>
                  <span>K: {analysis.soil_health_card.macro_nutrients.potassium}</span>
                </div>
              </div>
              {analysis.soil_health_card.recommendations && analysis.soil_health_card.recommendations.length > 0 && (
                <div className="shc-recommendations">
                  <span className="shc-label">{t('top_recommendations', language)}:</span>
                  <ul>
                    {analysis.soil_health_card.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {analysis.bhuvan_soil_moisture && (
        <div className="result-item">
          <div className="result-icon">💧</div>
          <div className="result-content">
            <strong>{t('soil_moisture', language)}</strong>
            <div className="bhuvan-info">
              <span>{t('moisture', language)}: {analysis.bhuvan_soil_moisture.percentage?.toFixed(1)}%</span>
              <span>{t('satellite', language)}: {analysis.bhuvan_soil_moisture.satellite}</span>
              <span>{t('resolution', language)}: {result.bhuvan_soil_moisture.resolution}m</span>
            </div>
          </div>
        </div>
      )}

      {result.advice && (
        <div className="advice-box">
          <strong>📝 {t('detailed_advice', language)}</strong>
          <p>{analysis.advice}</p>
        </div>
      )}

      {analysis.advisory_report && (
        <button 
          className="btn btn-primary"
          onClick={() => setShowReport(true)}
          style={{ marginBottom: '12px' }}
        >
          📋 {t('view_detailed_report', language)}
        </button>
      )}

      <button 
        className="btn btn-secondary"
        onClick={handleSpeak}
        disabled={speaking}
      >
        {speaking ? '🔊 Speaking...' : '🔊 Listen to Advice'}
      </button>
    </div>
  );
}

export default ResultScreen;
