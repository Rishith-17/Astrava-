import { useState } from 'react';
import VoiceController from './VoiceController';
import WakeWordDetector from './WakeWordDetector';
import './VoiceAssistant.css';

function VoiceAssistant({ onLanguageDetected, onCommand, currentLanguage, onPhotoCapture }) {
  const [showController, setShowController] = useState(false);
  
  // Get Porcupine access key from environment
  const porcupineAccessKey = import.meta.env.VITE_PORCUPINE_ACCESS_KEY;

  const handleWakeWordDetected = (keywordIndex) => {
    console.log('Wake word detected, opening voice controller');
    setShowController(true);
  };

  return (
    <>
      <div className="voice-assistant">
        {/* Wake Word Detector */}
        {porcupineAccessKey && (
          <WakeWordDetector
            accessKey={porcupineAccessKey}
            onWakeWordDetected={handleWakeWordDetected}
          />
        )}

        {/* Manual Voice Button */}
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
