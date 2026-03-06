# Sarvam AI Voice Integration Setup

## Overview

The app now uses Sarvam AI for superior Indian language voice recognition and text-to-speech, replacing the Web Speech API.

## Features

- **Speech-to-Text**: Convert voice to text in 12 Indian languages + English
  - Hindi, Kannada, Tamil, Telugu, Marathi, Bengali
  - Gujarati, Punjabi, Malayalam, Odia, Assamese, English
- **Text-to-Speech**: Natural voice output in Indian languages
- **Better Accuracy**: Optimized for Indian accents and languages
- **Voice Commands**: Navigate app using voice
- **Language Detection**: Automatically detect spoken language

## Setup Instructions

### 1. Get Sarvam AI API Key

1. Visit [Sarvam AI](https://www.sarvam.ai/)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key

### 2. Add API Key to Project

Open `.env` file and add your Sarvam AI API key:

```env
VITE_SARVAM_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Restart
npm run dev
```

## How It Works

### Voice Assistant (Floating Button)

The green microphone button (bottom-right) uses Sarvam AI:

1. **Tap** the microphone button
2. **Speak** your command in any supported language
3. **Wait** for processing (Sarvam AI converts speech to text)
4. **Action** executes automatically

**Supported Commands:**
- "Analyze" / "विश्लेषण" / "ವಿಶ್ಲೇಷಣೆ" / "பகுப்பாய்வு" / "విశ్లేషణ" / "विश्लेषण" / "বিশ্লেষণ" / "વિશ્લેષણ" / "ਵਿਸ਼ਲੇਸ਼ਣ" / "വിശകലനം" / "ବିଶ୍ଳେଷଣ" / "বিশ্লেষণ" → Opens upload screen
- "History" / "इतिहास" / "ಇತಿಹಾಸ" / "வரலாறு" / "చరిత్ర" / "इतिहास" / "ইতিহাস" / "ઇતિહાસ" / "ਇਤਿਹਾਸ" / "ചരിത്രം" / "ଇତିହାସ" / "ইতিহাস" → Opens history
- "Settings" / "सेटिंग" / "ಸೆಟ್ಟಿಂಗ್" / "அமைப்புகள்" / "సెట్టింగ్స్" / "सेटिंग" / "সেটিংস" / "સેટિંગ્સ" / "ਸੈਟਿੰਗਾਂ" / "ക്രമീകരണങ്ങൾ" / "ସେଟିଂସ" / "ছেটিংছ" → Opens settings
- Language names in any supported language → Changes app language

### Voice Language Selection

In Settings → "🎙️ Voice Select":

1. **Tap** the large microphone
2. **Say** language name (e.g., "Hindi", "Tamil")
3. **Sarvam AI** detects and switches language

### Text-to-Speech

Results screen "🔊 Listen to Advice" button:
- Uses Sarvam AI for natural Indian language voice
- Speaks farming advice in selected language

## API Endpoints Used

### Speech-to-Text
```
POST https://api.sarvam.ai/speech-to-text
```
- Converts audio to text
- Supports: hi-IN, en-IN, kn-IN, ta-IN, te-IN, mr-IN, bn-IN, gu-IN, pa-IN, ml-IN, or-IN, as-IN

### Text-to-Speech
```
POST https://api.sarvam.ai/text-to-speech
```
- Converts text to natural speech
- Multiple voice options (meera, etc.)

## Code Structure

```
src/services/sarvamVoiceService.js
├── startRecording()      - Start audio capture
├── stopRecording()       - Stop and get audio blob
├── speechToText()        - Convert audio to text
├── textToSpeech()        - Convert text to audio
└── playAudio()           - Play audio blob

src/components/VoiceAssistant.jsx
└── Floating voice button with Sarvam AI integration

src/components/VoiceLanguageSelector.jsx
└── Voice-based language selection modal
```

## Troubleshooting

### "Unable to access microphone"
- Check browser permissions
- Allow microphone access when prompted
- Try HTTPS or localhost

### "Failed to convert speech to text"
- Verify API key is correct in `.env`
- Check internet connection
- Ensure Sarvam AI account is active

### No audio playback
- Check device volume
- Verify browser audio permissions
- Try different browser

## API Rate Limits

Check your Sarvam AI plan for:
- Requests per minute
- Monthly quota
- Concurrent requests

## Fallback Behavior

If Sarvam AI is unavailable:
- Voice features show error messages
- App remains functional
- Manual input still works

## Testing

1. **Test Speech-to-Text:**
   - Tap voice button
   - Say "analyze" in Hindi: "विश्लेषण"
   - Should navigate to upload screen

2. **Test Language Detection:**
   - Go to Settings
   - Tap "Voice Select"
   - Say "Hindi" or "हिंदी"
   - Language should change

3. **Test Text-to-Speech:**
   - Complete soil analysis
   - Tap "Listen to Advice"
   - Should hear advice in selected language

## Production Deployment

For production:

1. Add API key to environment variables
2. Use HTTPS (required for microphone access)
3. Monitor API usage
4. Implement error handling
5. Add retry logic for failed requests

## Support

- Sarvam AI Docs: https://docs.sarvam.ai/
- API Status: Check Sarvam AI dashboard
- Issues: Contact Sarvam AI support
