import { useState, useEffect } from 'react';
import porcupineService from '../services/porcupineWakeWordService';
import './WakeWordDetector.css';

function WakeWordDetector({ onWakeWordDetected, accessKey }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [wakeWordLabel, setWakeWordLabel] = useState('Porcupine');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Initialize Porcupine when component mounts
    const initializePorcupine = async () => {
      if (!accessKey) {
        setError('Porcupine access key not configured');
        console.error('WakeWordDetector: No access key provided');
        return;
      }

      try {
        console.log('WakeWordDetector: Initializing with access key...');
        console.log('WakeWordDetector: Access key length:', accessKey?.length);
        console.log('WakeWordDetector: Access key starts with:', accessKey?.substring(0, 10));

        // Simple initialization with just built-in "porcupine" keyword
        await porcupineService.initialize(accessKey, handleWakeWordDetected);

        setIsInitialized(true);
        setWakeWordLabel(porcupineService.getWakeWordLabel());
        setError(null);
        console.log('WakeWordDetector: Initialization successful');
      } catch (err) {
        console.error('WakeWordDetector: Failed to initialize:', err);

        // Provide more specific error message
        let errorMessage = 'Failed to initialize wake word detection';
        if (err.message.includes('Invalid access key')) {
          errorMessage = 'Invalid Porcupine access key';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error loading wake word models';
        } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
        }

        setError(errorMessage);
        setIsInitialized(false);
      }
    };

    initializePorcupine();

    // Cleanup on unmount
    return () => {
      porcupineService.release();
    };
  }, [accessKey]);

  const handleWakeWordDetected = (keywordIndex, detectedWord) => {
    console.log('Wake word detected:', detectedWord, 'at index:', keywordIndex);

    // Visual feedback
    setIsListening(true);

    // Trigger callback
    if (onWakeWordDetected) {
      onWakeWordDetected(keywordIndex, detectedWord);
    }

    // Reset listening state after a moment
    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  const toggleWakeWord = async () => {
    if (!isInitialized) {
      setError('Wake word detection not initialized');
      return;
    }

    try {
      if (isEnabled) {
        await porcupineService.stopListening();
        setIsEnabled(false);
        setIsFadingOut(false);
      } else {
        await porcupineService.startListening();
        setIsEnabled(true);
        setError(null);
        // Start fade out after a brief moment so the user sees it turned ON
        setTimeout(() => {
          setIsFadingOut(true);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to toggle wake word:', err);
      setError('Failed to toggle wake word detection');
    }
  };

  if (!accessKey) {
    return null; // Don't show if no access key
  }

  return (
    <div className={`wake-word-detector ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="wake-word-header">
        <div className="wake-word-info">
          <span className="wake-word-icon">🎤</span>
          <div className="wake-word-text">
            <h3>Voice Activation</h3>
            <p>Say "{wakeWordLabel}" to activate</p>
          </div>
        </div>

        <button
          className={`wake-word-toggle ${isEnabled ? 'active' : ''}`}
          onClick={toggleWakeWord}
          disabled={!isInitialized}
        >
          {isEnabled ? 'ON' : 'OFF'}
        </button>
      </div>

      {isListening && (
        <div className="wake-word-listening">
          <div className="pulse-animation"></div>
          <span>Wake word detected! Listening...</span>
        </div>
      )}

      {error && (
        <div className="wake-word-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {isEnabled && !error && (
        <div className="wake-word-status">
          <div className="status-indicator active"></div>
          <span>Listening for wake word...</span>
        </div>
      )}
    </div>
  );
}

export default WakeWordDetector;
