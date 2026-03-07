// Sarvam AI Voice Service for Indian Languages
const SARVAM_API_KEY = import.meta.env.VITE_SARVAM_API_KEY;
const SARVAM_API_BASE = 'https://api.sarvam.ai';

class SarvamVoiceService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    this.stream = null;
  }

  // Start recording audio
  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      });
      
      this.stream = stream;
      
      // Use audio/webm or audio/wav based on browser support
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }
      
      this.mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      
      console.log('Recording started with mimeType:', mimeType);
      
      // Return stream for visualization
      return stream;
    } catch (error) {
      console.error('Microphone access error:', error);
      throw new Error('Unable to access microphone. Please check permissions.');
    }
  }

  // Stop recording and return audio blob
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType;
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        this.isRecording = false;
        
        console.log('Recording stopped. Blob size:', audioBlob.size, 'Type:', mimeType);
        
        // Stop all tracks
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        resolve(audioBlob);
      };

      this.mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        reject(error);
      };

      this.mediaRecorder.stop();
    });
  }

  // Convert audio to text using Sarvam AI
  async speechToText(audioBlob, language = 'hi-IN') {
    try {
      if (!SARVAM_API_KEY) {
        throw new Error('Sarvam API key not configured');
      }

      console.log('Converting speech to text. Language:', language, 'Blob size:', audioBlob.size, 'Type:', audioBlob.type);
      
      // Clean up MIME type - remove codec specification
      let mimeType = audioBlob.type;
      if (mimeType.includes(';')) {
        mimeType = mimeType.split(';')[0];
      }
      
      console.log('Cleaned MIME type:', mimeType);
      
      // Create a new blob with clean MIME type (without codecs)
      const cleanBlob = new Blob([audioBlob], { type: mimeType });
      
      const formData = new FormData();
      
      // Create a file from blob with appropriate extension
      const extension = mimeType.includes('wav') ? 'wav' : 'webm';
      const audioFile = new File([cleanBlob], `audio.${extension}`, { 
        type: mimeType
      });
      
      formData.append('file', audioFile);
      formData.append('language_code', language);
      formData.append('model', 'saaras:v3');

      console.log('Sending request to Sarvam AI...', {
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type
      });

      const response = await fetch(`${SARVAM_API_BASE}/speech-to-text`, {
        method: 'POST',
        headers: {
          'API-Subscription-Key': SARVAM_API_KEY
        },
        body: formData
      });

      console.log('Sarvam API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sarvam API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(`Sarvam API error (${response.status}): ${errorData.error?.message || errorData.message || errorText}`);
      }

      const data = await response.json();
      console.log('Sarvam API response:', data);
      
      return data.transcript || '';
    } catch (error) {
      console.error('Speech to text error:', error);
      throw new Error(error.message || 'Failed to convert speech to text');
    }
  }

  // Convert text to speech using Sarvam AI
  async textToSpeech(text, language = 'hi-IN', speaker = 'ratan') {
    try {
      if (!SARVAM_API_KEY) {
        throw new Error('Sarvam API key not configured');
      }

      console.log('Converting text to speech. Text length:', text.length, 'Language:', language, 'Speaker:', speaker);

      const response = await fetch(`${SARVAM_API_BASE}/text-to-speech`, {
        method: 'POST',
        headers: {
          'api-subscription-key': SARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: [text],
          target_language_code: language,
          speaker: speaker,
          pitch: 0,
          pace: 1.0,
          loudness: 1.5,
          speech_sample_rate: 8000,
          enable_preprocessing: true,
          model: 'bulbul:v3'
        })
      });

      console.log('TTS API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sarvam TTS API error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        throw new Error(`Sarvam TTS API error (${response.status}): ${errorData.error?.message || errorData.message || errorText}`);
      }

      const data = await response.json();
      console.log('TTS response received, audios count:', data.audios?.length);
      
      // Sarvam returns base64 encoded audio
      if (data.audios && data.audios.length > 0) {
        const audioBase64 = data.audios[0];
        const audioBlob = this.base64ToBlob(audioBase64, 'audio/wav');
        console.log('Audio blob created, size:', audioBlob.size);
        return audioBlob;
      }
      
      throw new Error('No audio data received');
    } catch (error) {
      console.error('Text to speech error:', error);
      throw error;
    }
  }

  // Play audio blob
  playAudio(audioBlob) {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        resolve();
      };
      audio.onerror = reject;
      audio.play();
    });
  }

  // Helper: Convert base64 to blob
  base64ToBlob(base64, mimeType) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  // Get language code for Sarvam AI
  getLanguageCode(lang) {
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'kn': 'kn-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'pa': 'pa-IN',
      'ml': 'ml-IN',
      'or': 'or-IN',
      'as': 'as-IN'
    };
    return langMap[lang] || 'hi-IN';
  }

  // Get speaker for language
  getSpeaker(lang) {
    const speakerMap = {
      'en': 'ratan',      // Male voice with sharp articulation
      'hi': 'ratan',
      'kn': 'ratan',
      'ta': 'ratan',
      'te': 'ratan',
      'mr': 'ratan',
      'bn': 'ratan',
      'gu': 'ratan',
      'pa': 'ratan',
      'ml': 'ratan',
      'or': 'ratan',
      'as': 'ratan'
    };
    return speakerMap[lang] || 'ratan';
  }
}

export default new SarvamVoiceService();
