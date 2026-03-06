import { useState, useEffect } from 'react';
import HomeScreen from './components/HomeScreen';
import UploadScreen from './components/UploadScreen';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';
import SettingsScreen from './components/SettingsScreen';
import BottomNav from './components/BottomNav';
import VoiceAssistant from './components/VoiceAssistant';
import databaseService from './services/database';
import './App.css';

function App() {
  const [screen, setScreen] = useState('home');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voiceCapturedPhoto, setVoiceCapturedPhoto] = useState(null);

  useEffect(() => {
    // Load data from database
    loadHistory();
    
    // Load saved language
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const analyses = await databaseService.getAllAnalyses();
      setHistory(analyses);
      console.log('Loaded', analyses.length, 'analyses from database');
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (data) => {
    try {
      // Add language to the data
      const analysisData = {
        ...data,
        language: language,
        timestamp: Date.now()
      };

      // Save to database
      await databaseService.addAnalysis(analysisData);
      
      // Reload history
      await loadHistory();
      
      console.log('Analysis saved to database');
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const handleAnalysisComplete = (data) => {
    setResult(data);
    saveToHistory(data);
    setScreen('result');
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleVoiceCommand = (action, data) => {
    console.log('Voice command received:', action, data);
    
    switch (action) {
      case 'analyze':
        console.log('Navigating to upload screen');
        setScreen('upload');
        break;
      case 'history':
        console.log('Navigating to history screen');
        setScreen('history');
        break;
      case 'settings':
        console.log('Navigating to settings screen');
        setScreen('settings');
        break;
      case 'home':
        console.log('Navigating to home screen');
        setScreen('home');
        break;
      case 'transcript':
        console.log('Voice input:', data);
        break;
      default:
        console.log('Unknown command:', action);
        break;
    }
  };

  const handlePhotoCapture = (file) => {
    console.log('Photo captured from voice:', file.name);
    // Store the file in state and navigate to upload screen
    setVoiceCapturedPhoto(file);
    setScreen('upload');
  };

  return (
    <div className="app">
      <div className="app-content">
        {screen === 'home' && (
          <HomeScreen 
            onUpload={() => setScreen('upload')} 
            language={language}
          />
        )}

        {screen === 'upload' && (
          <UploadScreen 
            onComplete={handleAnalysisComplete}
            onBack={() => {
              setScreen('home');
              setVoiceCapturedPhoto(null);
            }}
            language={language}
            voiceCapturedPhoto={voiceCapturedPhoto}
            onPhotoProcessed={() => setVoiceCapturedPhoto(null)}
          />
        )}

        {screen === 'result' && (
          <ResultScreen 
            result={result}
            onBack={() => setScreen('home')}
            language={language}
          />
        )}

        {screen === 'history' && (
          <HistoryScreen 
            history={history}
            loading={loading}
            onViewResult={(item) => {
              setResult(item);
              setScreen('result');
            }}
            onRefresh={loadHistory}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen 
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        )}
      </div>

      {!['upload', 'result'].includes(screen) && (
        <>
          <VoiceAssistant 
            onLanguageDetected={handleLanguageChange}
            onCommand={handleVoiceCommand}
            onPhotoCapture={handlePhotoCapture}
            currentLanguage={language}
          />
          <BottomNav activeScreen={screen} onNavigate={setScreen} />
        </>
      )}
    </div>
  );
}

export default App;
