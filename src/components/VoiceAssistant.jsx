import { useState } from 'react';
import VoiceController from './VoiceController';
import './VoiceAssistant.css';

function VoiceAssistant({ onLanguageDetected, onCommand, currentLanguage, onPhotoCapture }) {
  const [showController, setShowController] = useState(false);

  return (
    <>
      <div className="voice-assistant">
        <button
          className="voice-btn"
          onClick={() => setShowController(true)}
        >
          <span className="voice-icon">🎙️</span>
        </button>
      </div>

      {showController && (
        <VoiceController
          onCommand={onCommand}
          onLanguageDetected={onLanguageDetected}
          currentLanguage={currentLanguage}
          onPhotoCapture={onPhotoCapture}
          onClose={() => setShowController(false)}
        />
      )}
    </>
  );
}

export default VoiceAssistant;
