import { useState, useRef, useEffect } from 'react';
import sarvamVoiceService from '../services/sarvamVoiceService';
import autonomousAgentService from '../services/autonomousAgentService';
import './VoiceController.css';

function VoiceController({ onCommand, onLanguageDetected, currentLanguage, onClose, onPhotoCapture }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopVisualization();
    };
  }, []);

  const startVisualization = (stream) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    microphone.connect(analyser);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    
    drawVisualization();
  };

  const drawVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!analyser || !dataArray) return;
    
    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw waveform
      const barCount = 40;
      const barWidth = canvas.width / barCount;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * dataArray.length / barCount);
        const value = dataArray[dataIndex];
        const barHeight = (value / 255) * (canvas.height / 2);
        
        // Gradient color based on intensity
        const intensity = value / 255;
        const hue = 140 - (intensity * 40); // Green to yellow-green
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        
        // Draw symmetric bars
        ctx.fillRect(
          i * barWidth,
          centerY - barHeight / 2,
          barWidth - 2,
          barHeight
        );
      }
    };
    
    draw();
  };

  const stopVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const handleVoiceCommand = (text) => {
    const lowerText = text.toLowerCase();
    
    // Language detection keywords
    const languageKeywords = {
      'en': ['english', 'अंग्रेजी', 'ಇಂಗ್ಲಿಷ್', 'ஆங்கிலம்', 'ఇంగ్లీష్', 'इंग्रजी', 'ইংরেজি', 'અંગ્રેજી', 'ਅੰਗਰੇਜ਼ੀ', 'ഇംഗ്ലീഷ്', 'ଇଂରାଜୀ', 'ইংৰাজী'],
      'hi': ['hindi', 'हिंदी', 'ಹಿಂದಿ', 'இந்தி', 'హిందీ', 'हिन्दी', 'হিন্দি', 'હિન્દી', 'ਹਿੰਦੀ', 'ഹിന്ദി', 'ହିନ୍ଦୀ', 'হিন্দী'],
      'kn': ['kannada', 'कन्नड़', 'ಕನ್ನಡ', 'கன்னடம்', 'కన్నడ', 'कन्नड', 'কন্নড', 'કન્નડ', 'ਕੰਨੜ', 'കന്നഡ', 'କନ୍ନଡ', 'কান্নাডা'],
      'ta': ['tamil', 'तमिल', 'ತಮಿಳು', 'தமிழ்', 'తమిళం', 'तामिळ', 'তামিল', 'તમિલ', 'ਤਮਿਲ', 'തമിഴ്', 'ତାମିଲ', 'তামিল'],
      'te': ['telugu', 'तेलुगु', 'ತೆಲುಗು', 'தெலுங்கு', 'తెలుగు', 'तेलगू', 'তেলুগু', 'તેલુગુ', 'ਤੇਲਗੂ', 'തെലുങ്ക്', 'ତେଲୁଗୁ', 'তেলেগু'],
      'mr': ['marathi', 'मराठी', 'ಮರಾಠಿ', 'மராத்தி', 'మరాఠీ', 'মারাঠি', 'મરાઠી', 'ਮਰਾਠੀ', 'മറാത്തി', 'ମରାଠୀ', 'মাৰাঠী'],
      'bn': ['bengali', 'bangla', 'बंगाली', 'ಬಂಗಾಳಿ', 'வங்காளம்', 'బెంగాలీ', 'बांग्ला', 'বাংলা', 'બંગાળી', 'ਬੰਗਾਲੀ', 'ബംഗാളി', 'ବଙ୍ଗାଳୀ', 'বাংলা'],
      'gu': ['gujarati', 'गुजराती', 'ಗುಜರಾತಿ', 'குஜராத்தி', 'గుజరాతీ', 'गुजराती', 'গুজরাটি', 'ગુજરાતી', 'ਗੁਜਰਾਤੀ', 'ഗുജറാത്തി', 'ଗୁଜରାଟୀ', 'গুজৰাটী'],
      'pa': ['punjabi', 'पंजाबी', 'ಪಂಜಾಬಿ', 'பஞ்சாபி', 'పంజాబీ', 'पंजाबी', 'পাঞ্জাবি', 'પંજાબી', 'ਪੰਜਾਬੀ', 'പഞ്ചാബി', 'ପଞ୍ଜାବୀ', 'পাঞ্জাবী'],
      'ml': ['malayalam', 'मलयालम', 'ಮಲಯಾಳಂ', 'மலையாளம்', 'మలయాళం', 'मल्याळम', 'মালায়ালাম', 'મલયાલમ', 'ਮਲਿਆਲਮ', 'മലയാളം', 'ମାଲାୟାଲମ', 'মালায়ালম'],
      'or': ['odia', 'oriya', 'ओड़िया', 'ಒಡಿಯಾ', 'ஒடியா', 'ఒడియా', 'ओडिया', 'ওড়িয়া', 'ઓડિયા', 'ਓੜੀਆ', 'ഒഡിയ', 'ଓଡ଼ିଆ', 'অসমীয়া'],
      'as': ['assamese', 'असमिया', 'ಅಸ್ಸಾಮೀಸ್', 'அஸ்ஸாமி', 'అస్సామీస్', 'आसामी', 'আসামি', 'આસામી', 'ਅਸਾਮੀ', 'അസ്സാമീസ്', 'ଆସାମୀ', 'অসমীয়া']
    };

    // Check for language change command
    for (const [langCode, keywords] of Object.entries(languageKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        onLanguageDetected(langCode);
        return;
      }
    }

    // Check for autonomous soil analysis command
    const analyzeKeywords = ['analyze', 'analyse', 'soil', 'check soil', 'test soil', 'scan soil', 
      'विश्लेषण', 'मिट्टी', 'ವಿಶ್ಲೇಷಣೆ', 'மண்', 'విశ్లేషణ', 'నేల', 'विश्लेषण', 'माती',
      'বিশ্লেষণ', 'মাটি', 'વિશ્લેષણ', 'માટી', 'ਵਿਸ਼ਲੇਸ਼ਣ', 'ਮਿੱਟੀ', 'വിശകലനം', 'മണ്ണ്',
      'ବିଶ୍ଳେଷଣ', 'ମାଟି', 'বিশ্লেষণ', 'মাটি'];
    
    const isAnalyzeCommand = analyzeKeywords.some(keyword => lowerText.includes(keyword));
    
    if (isAnalyzeCommand) {
      console.log('🤖 Autonomous soil analysis triggered!');
      setTranscript('Starting autonomous soil analysis...');
      setIsAgentProcessing(true);
      
      // Setup agent callbacks
      autonomousAgentService.setCallbacks(
        (status) => {
          setAgentStatus(status);
          setTranscript(status.message);
        },
        (result) => {
          // Pass result to parent with agentic flag
          if (onCommand) {
            onCommand('analysis_complete', {
              ...result.analysis,
              agenticExplanation: result.explanation,
              audioBlobs: result.audioBlobs,
              isAgenticWorkflow: result.isAgenticWorkflow
            });
          }
          setIsAgentProcessing(false);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      );
      
      // Execute autonomous workflow
      autonomousAgentService.executeAnalysisWorkflow(currentLanguage);
      return;
    }

    // Check for photo/camera commands
    const photoKeywords = ['photo', 'picture', 'camera', 'take', 'capture', 'upload', 'फोटो', 'ಫೋಟೋ', 'புகைப்படம்', 'ఫోటో', 'फोटो', 'ছবি', 'ફોટો', 'ਫੋਟੋ', 'ഫോട്ടോ', 'ଫଟୋ', 'ফটো'];
    if (photoKeywords.some(keyword => lowerText.includes(keyword))) {
      console.log('Photo command detected');
      setTranscript('Opening photo options...');
      setTimeout(() => {
        setShowPhotoOptions(true);
      }, 500);
      return;
    }

    // Check for action commands
    const commands = {
      history: ['history', 'previous', 'past', 'show', 'इतिहास', 'ಇತಿಹಾಸ', 'வரலாறு', 'చరిత్ర', 'इतिहास', 'ইতিহাস', 'ઇતિહાસ', 'ਇਤਿਹਾਸ', 'ചരിത്രം', 'ଇତିହାସ', 'ইতিহাস', 'record', 'results'],
      settings: ['settings', 'setting', 'सेटिंग', 'ಸೆಟ್ಟಿಂಗ್', 'அமைப்புகள்', 'సెట్టింగ్స్', 'सेटिंग', 'সেটিংস', 'સેટિંગ્સ', 'ਸੈਟਿੰਗਾਂ', 'ക്രമീകരണങ്ങൾ', 'ସେଟିଂସ', 'ছেটিংছ', 'change language', 'preferences']
    };

    for (const [action, keywords] of Object.entries(commands)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        console.log('Voice command detected:', action);
        onCommand(action);
        return;
      }
    }

    // If no command matched, just pass the transcript
    onCommand('transcript', text);
  };

  const startRecording = async () => {
    try {
      setError(null);
      setTranscript('');
      
      const stream = await sarvamVoiceService.startRecording();
      setIsRecording(true);
      
      // Start visualization
      startVisualization(stream);
    } catch (err) {
      setError(err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      stopVisualization();
      
      const audioBlob = await sarvamVoiceService.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);
      
      // Check if audio was actually recorded
      if (audioBlob.size < 1000) {
        setError('Recording too short. Please speak for at least 1 second.');
        return;
      }
      
      // Show processing state
      setTranscript('Processing...');
      
      try {
        // Convert speech to text using Sarvam AI
        const languageCode = sarvamVoiceService.getLanguageCode(currentLanguage);
        console.log('Processing audio with language:', languageCode);
        
        const text = await sarvamVoiceService.speechToText(audioBlob, languageCode);
        
        if (!text || text.trim() === '') {
          setTranscript('No speech detected. Please try again.');
          return;
        }
        
        setTranscript(text);
        
        // Check if command will show photo options
        const lowerText = text.toLowerCase();
        const photoKeywords = ['photo', 'picture', 'camera', 'take', 'capture', 'upload', 'फोटो', 'ಫೋಟೋ', 'புகைப்படம்', 'ఫోటో', 'फोटो', 'ছবি', 'ફોટો', 'ਫੋਟੋ', 'ഫോട്ടോ', 'ଫଟୋ', 'ফটো'];
        const isPhotoCommand = photoKeywords.some(keyword => lowerText.includes(keyword));
        
        handleVoiceCommand(text);
        
        // Only auto close if NOT a photo command
        if (!isPhotoCommand) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        setError(apiError.message || 'Failed to process speech. Please try again.');
        setTranscript('');
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      setError(err.message || 'Failed to stop recording');
      setIsRecording(false);
      setAudioLevel(0);
      stopVisualization();
    }
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Photo selected:', file.name);
      if (onPhotoCapture) {
        onPhotoCapture(file);
      }
      onClose();
    }
  };

  return (
    <div className="voice-controller-overlay">
      <div className="voice-controller-modal">
        <button className="voice-close-btn" onClick={onClose}>×</button>
        
        {!showPhotoOptions ? (
          <>
            <div className="voice-header">
              <h2>🎙️ Voice Command</h2>
              <p className="voice-subtitle">
                {isRecording ? 'Listening...' : 'Tap to start recording'}
              </p>
            </div>

            <div className="voice-visualizer-container">
              <canvas 
                ref={canvasRef} 
                className="voice-canvas"
                width="300"
                height="120"
              />
              
              {!isRecording && audioLevel === 0 && (
                <div className="voice-placeholder">
                  <div className="placeholder-bars">
                    {[...Array(40)].map((_, i) => (
                      <div key={i} className="placeholder-bar"></div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="voice-level-indicator">
              <div className="level-bar">
                <div 
                  className="level-fill"
                  style={{ width: `${(audioLevel / 255) * 100}%` }}
                ></div>
              </div>
              <span className="level-text">
                {isRecording ? `${Math.round((audioLevel / 255) * 100)}%` : 'Ready'}
              </span>
            </div>

            {transcript && (
              <div className="voice-transcript">
                <p>{transcript}</p>
              </div>
            )}

            {error && (
              <div className="voice-error">
                <p>⚠️ {error}</p>
              </div>
            )}

            <div className="voice-controls">
              {!isRecording ? (
                <button 
                  className="voice-record-btn"
                  onClick={startRecording}
                >
                  <span className="record-icon">🎙️</span>
                  <span>Start Recording</span>
                </button>
              ) : (
                <button 
                  className="voice-stop-btn"
                  onClick={stopRecording}
                >
                  <span className="stop-icon">⏹️</span>
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            <div className="voice-hints">
              <p className="hints-title">Try saying:</p>
              <div className="hints-list">
                <span className="hint-chip">"Analyze the soil"</span>
                <span className="hint-chip">"Take photo"</span>
                <span className="hint-chip">"Show history"</span>
              </div>
            </div>

            {isAgentProcessing && agentStatus && (
              <div className="agent-status">
                <div className="agent-step">
                  <span className="step-number">Step {agentStatus.step}</span>
                  <span className="step-message">{agentStatus.message}</span>
                </div>
                <div className="agent-progress">
                  <div 
                    className="progress-bar"
                    style={{ width: `${(agentStatus.step / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="voice-header">
              <h2>📷 Capture Photo</h2>
              <p className="voice-subtitle">Choose an option</p>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            <div className="photo-options">
              <button 
                className="photo-option-btn"
                onClick={() => cameraInputRef.current.click()}
              >
                <span className="option-icon">📷</span>
                <span className="option-text">Take Photo</span>
                <span className="option-desc">Open camera</span>
              </button>

              <button 
                className="photo-option-btn"
                onClick={() => galleryInputRef.current.click()}
              >
                <span className="option-icon">🖼️</span>
                <span className="option-text">Upload Photo</span>
                <span className="option-desc">From gallery</span>
              </button>
            </div>

            <button 
              className="btn-back-voice"
              onClick={() => setShowPhotoOptions(false)}
            >
              ← Back to Voice
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VoiceController;
