import { useState } from 'react';
import './ResultScreen.css';
import AdvisoryReport from './AdvisoryReport';

function ResultScreen({ result, onBack, language }) {
  const [speaking, setSpeaking] = useState(false);
  const [showReport, setShowReport] = useState(false);

  if (showReport && result.advisory_report) {
    return <AdvisoryReport report={result.advisory_report} onBack={() => setShowReport(false)} />;
  }

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
        <h1 className="result-title">Analysis Results</h1>
      </div>

      <div className="success-badge">
        <div className="success-icon">✅</div>
        <div className="success-text">Analysis Complete</div>
        {result.confidence && (
          <div className="confidence-badge">
            {Math.round(result.confidence * 100)}% Confidence
          </div>
        )}
      </div>

      <div className="result-item">
        <div className="result-icon">🌍</div>
        <div className="result-content">
          <strong>Soil Type</strong>
          <p>{result.soil_type}</p>
          {result.confidence && (
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${result.confidence * 100}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      <div className="result-item">
        <div className="result-icon">⚗️</div>
        <div className="result-content">
          <strong>pH Level</strong>
          <p>{result.ph || result.ml_ph_level || 'N/A'}</p>
          {result.ml_ph_level && result.ph && result.ml_ph_level !== result.ph && (
            <small className="ml-prediction">ML Predicted: {result.ml_ph_level}</small>
          )}
        </div>
      </div>

      {result.ml_nutrient_status && (
        <div className="result-item">
          <div className="result-icon">🧪</div>
          <div className="result-content">
            <strong>Nutrient Levels (ML Prediction)</strong>
            <div className="nutrient-grid">
              <div className={`nutrient-item ${result.ml_nutrient_status.nitrogen?.toLowerCase()}`}>
                <span className="nutrient-label">Nitrogen</span>
                <span className="nutrient-value">{result.ml_nutrient_status.nitrogen}</span>
              </div>
              <div className={`nutrient-item ${result.ml_nutrient_status.phosphorus?.toLowerCase()}`}>
                <span className="nutrient-label">Phosphorus</span>
                <span className="nutrient-value">{result.ml_nutrient_status.phosphorus}</span>
              </div>
              <div className={`nutrient-item ${result.ml_nutrient_status.potassium?.toLowerCase()}`}>
                <span className="nutrient-label">Potassium</span>
                <span className="nutrient-value">{result.ml_nutrient_status.potassium}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {result.nutrient_deficiency && (
        <div className="result-item">
          <div className="result-icon">⚠️</div>
          <div className="result-content">
            <strong>Nutrient Status</strong>
            <p>{result.nutrient_deficiency}</p>
          </div>
        </div>
      )}

      <div className="result-item highlight">
        <div className="result-icon">💊</div>
        <div className="result-content">
          <strong>Fertilizer Advice</strong>
          <p>{result.fertilizer}</p>
        </div>
      </div>

      {result.recommended_crops && result.recommended_crops.length > 0 && (
        <div className="result-item">
          <div className="result-icon">🌾</div>
          <div className="result-content">
            <strong>Recommended Crops</strong>
            <div className="crops-list">
              {result.recommended_crops.map((crop, idx) => (
                <span key={idx} className="crop-tag">{crop}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {result.location && (
        <div className="result-item">
          <div className="result-icon">📍</div>
          <div className="result-content">
            <strong>Location</strong>
            <p>{result.location.district}, {result.location.state}, {result.location.country}</p>
          </div>
        </div>
      )}

      {result.weather && (
        <div className="result-item">
          <div className="result-icon">🌤️</div>
          <div className="result-content">
            <strong>Current Weather</strong>
            <div className="weather-info">
              <span>🌡️ {result.weather.temperature}°C</span>
              <span>💧 {result.weather.humidity}% Humidity</span>
              <span>🌧️ {result.weather.rainfall_30d}mm (30 days)</span>
            </div>
          </div>
        </div>
      )}

      {result.satellite && (
        <div className="result-item">
          <div className="result-icon">🛰️</div>
          <div className="result-content">
            <strong>Satellite Data</strong>
            <div className="satellite-info">
              <span>🌿 NDVI: {result.satellite.ndvi?.toFixed(2)}</span>
              {result.satellite.source && (
                <span className="data-source">Source: {result.satellite.source}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {result.crop_health && (
        <div className="result-item">
          <div className="result-icon">🌱</div>
          <div className="result-content">
            <strong>Crop Health</strong>
            <div className="health-info">
              <span>Score: {result.crop_health.health_score}/100</span>
              <span>Stage: {result.crop_health.growth_stage?.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {result.soil_health_card && (
        <div className="result-item">
          <div className="result-icon">🇮🇳</div>
          <div className="result-content">
            <strong>Soil Health Card (Govt. of India)</strong>
            <div className="shc-info">
              <div className="shc-section">
                <span className="shc-label">State:</span>
                <span>{result.soil_health_card.state}</span>
              </div>
              <div className="shc-section">
                <span className="shc-label">Macro Nutrients (kg/ha):</span>
                <div className="nutrient-values">
                  <span>N: {result.soil_health_card.macro_nutrients.nitrogen}</span>
                  <span>P: {result.soil_health_card.macro_nutrients.phosphorus}</span>
                  <span>K: {result.soil_health_card.macro_nutrients.potassium}</span>
                </div>
              </div>
              {result.soil_health_card.recommendations && result.soil_health_card.recommendations.length > 0 && (
                <div className="shc-recommendations">
                  <span className="shc-label">Top Recommendations:</span>
                  <ul>
                    {result.soil_health_card.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {result.bhuvan_soil_moisture && (
        <div className="result-item">
          <div className="result-icon">💧</div>
          <div className="result-content">
            <strong>ISRO Bhuvan Soil Moisture</strong>
            <div className="bhuvan-info">
              <span>Moisture: {result.bhuvan_soil_moisture.percentage?.toFixed(1)}%</span>
              <span>Satellite: {result.bhuvan_soil_moisture.satellite}</span>
              <span>Resolution: {result.bhuvan_soil_moisture.resolution}m</span>
            </div>
          </div>
        </div>
      )}

      {result.advice && (
        <div className="advice-box">
          <strong>📝 Detailed Advice</strong>
          <p>{result.advice}</p>
        </div>
      )}

      {result.advisory_report && (
        <button 
          className="btn btn-primary"
          onClick={() => setShowReport(true)}
          style={{ marginBottom: '12px' }}
        >
          📋 View Detailed Advisory Report
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
