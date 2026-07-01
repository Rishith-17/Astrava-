import { useState } from 'react';
import VoiceController from './VoiceController';
import './VoiceAssistant.css';

/**
 * VoiceAssistant — manual mic button only.
 * Wake word detection (Porcupine) removed: requires paid API key
 * and browser WASM loading which is unreliable on mobile/PWA.
 * The manual mic button provides all the same functionality.
 */
function VoiceAssistant({ onLanguageDetected, onCommand, currentLanguage, onPhotoCapture }) {
  const [showController, setShowController] = useState(false);

  return (
    <>
      <div className="voice-assistant">
        <button
          className="voice-btn"
          onClick={() => setShowController(true)}
          aria-label="Voice Assistant — tap to speak"
          title="Tap to use voice commands"
        >
          {/* Animated orbital rings */}
          <span className="voice-btn-ring ring-1"></span>
          <span className="voice-btn-ring ring-2"></span>
          <span className="voice-btn-ring ring-3"></span>
          {/* Mic icon */}
          <svg className="voice-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
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
