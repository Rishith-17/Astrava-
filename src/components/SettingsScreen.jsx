import { useState } from 'react';
import VoiceLanguageSelector from './VoiceLanguageSelector';
import './SettingsScreen.css';

function SettingsScreen({ language, onLanguageChange }) {
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'bn', label: 'Bengali', native: 'বাংলা' },
    { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
    { code: 'as', label: 'Assamese', native: 'অসমীয়া' }
  ];

  return (
    <div className="screen settings-screen">
      <h1 className="screen-title">Settings</h1>

      <div className="settings-section">
        <div className="section-header">
          <h2 className="section-title">🌐 Language</h2>
          <button 
            className="voice-select-btn"
            onClick={() => setShowVoiceSelector(true)}
          >
            🎙️ Voice Select
          </button>
        </div>
        <div className="language-grid">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`language-card ${language === lang.code ? 'active' : ''}`}
              onClick={() => onLanguageChange(lang.code)}
            >
              <span className="language-native">{lang.native}</span>
              <span className="language-label">{lang.label}</span>
              {language === lang.code && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">ℹ️ About</h2>
        <div className="card info-card">
          <p className="info-text">
            Farmer Soil Analyzer helps you understand your soil and get personalized farming advice.
          </p>
          <p className="version">Version 1.0.0</p>
        </div>
      </div>

      {showVoiceSelector && (
        <VoiceLanguageSelector
          onLanguageSelect={onLanguageChange}
          onClose={() => setShowVoiceSelector(false)}
        />
      )}
    </div>
  );
}

export default SettingsScreen;
