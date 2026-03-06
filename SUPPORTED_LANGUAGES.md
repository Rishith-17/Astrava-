# Supported Languages

The Farmer Soil Analyzer PWA now supports **13 languages** including 12 major Indian languages plus English.

## Complete Language List

| Code | Language | Native Script | Region |
|------|----------|---------------|--------|
| `en` | English | English | Pan-India |
| `hi` | Hindi | हिंदी | North India |
| `kn` | Kannada | ಕನ್ನಡ | Karnataka |
| `ta` | Tamil | தமிழ் | Tamil Nadu |
| `te` | Telugu | తెలుగు | Andhra Pradesh, Telangana |
| `mr` | Marathi | मराठी | Maharashtra |
| `bn` | Bengali | বাংলা | West Bengal, Bangladesh |
| `gu` | Gujarati | ગુજરાતી | Gujarat |
| `pa` | Punjabi | ਪੰਜਾਬੀ | Punjab |
| `ml` | Malayalam | മലയാളം | Kerala |
| `or` | Odia | ଓଡ଼ିଆ | Odisha |
| `as` | Assamese | অসমীয়া | Assam |

## Language Coverage

### By Population
These 13 languages cover approximately **95%** of India's population:
- Hindi: ~528 million speakers
- Bengali: ~265 million speakers
- Marathi: ~83 million speakers
- Telugu: ~82 million speakers
- Tamil: ~75 million speakers
- Gujarati: ~56 million speakers
- Kannada: ~44 million speakers
- Malayalam: ~38 million speakers
- Odia: ~35 million speakers
- Punjabi: ~33 million speakers
- Assamese: ~15 million speakers

### By Region
All major agricultural regions of India are covered:
- **North**: Hindi, Punjabi
- **South**: Tamil, Telugu, Kannada, Malayalam
- **West**: Marathi, Gujarati
- **East**: Bengali, Odia, Assamese
- **Pan-India**: English

## Features Available in All Languages

### 1. User Interface
- Home screen greetings and instructions
- Navigation labels
- Button text
- Settings screen

### 2. Voice Commands (Sarvam AI)
- Speech-to-text recognition
- Text-to-speech output
- Voice navigation commands
- Language switching via voice

### 3. Soil Analysis Results
- Soil type classification
- pH level information
- Nutrient deficiency details
- Fertilizer recommendations
- Crop suggestions
- Farming advice

### 4. Voice Command Keywords

Each language has localized keywords for:

#### Navigation Commands
- **Analyze**: "विश्लेषण" (Hindi), "ವಿಶ್ಲೇಷಣೆ" (Kannada), "பகுப்பாய்வு" (Tamil), etc.
- **History**: "इतिहास" (Hindi), "ಇತಿಹಾಸ" (Kannada), "வரலாறு" (Tamil), etc.
- **Settings**: "सेटिंग" (Hindi), "ಸೆಟ್ಟಿಂಗ್" (Kannada), "அமைப்புகள்" (Tamil), etc.
- **Photo**: "फोटो" (Hindi), "ಫೋಟೋ" (Kannada), "புகைப்படம்" (Tamil), etc.

#### Language Names
Each language can be spoken in multiple scripts for recognition:
- "Hindi" / "हिंदी" / "ಹಿಂದಿ" / "இந்தி" / "హిందీ" / etc.
- "Tamil" / "तमिल" / "ತಮಿಳು" / "தமிழ்" / "తమిళం" / etc.

## Technical Implementation

### Frontend (React)
- Language selector in Settings
- Voice-based language selection
- Localized UI text for all screens
- Language persistence in localStorage

### Voice Service (Sarvam AI)
- Speech-to-text API with language codes:
  - `hi-IN`, `en-IN`, `kn-IN`, `ta-IN`, `te-IN`
  - `mr-IN`, `bn-IN`, `gu-IN`, `pa-IN`
  - `ml-IN`, `or-IN`, `as-IN`
- Text-to-speech with natural Indian voices
- Multi-language keyword detection

### Backend (Node.js)
- Language parameter in API requests
- Localized advice generation
- Language code mapping for external APIs

## Usage Examples

### Changing Language via UI
1. Go to Settings (⚙️)
2. Select language from grid
3. UI updates immediately

### Changing Language via Voice
1. Tap microphone button (🎙️)
2. Say language name in any supported language
3. Example: "मराठी" or "Marathi" or "ਮਰਾਠੀ"
4. Language switches automatically

### Getting Soil Analysis
1. Select your preferred language
2. Upload soil photo
3. Receive results in your language
4. Listen to advice using text-to-speech

## Future Enhancements

### Potential Additional Languages
- Urdu (اردو) - 51 million speakers
- Bhojpuri - 51 million speakers
- Maithili - 13 million speakers
- Santali - 7 million speakers
- Kashmiri (कॉशुर) - 7 million speakers
- Nepali (नेपाली) - 3 million speakers
- Konkani (कोंकणी) - 2.5 million speakers
- Sindhi (سنڌي) - 2.5 million speakers

### Planned Features
- Dialect support within languages
- Regional farming terminology
- Crop-specific vocabulary
- Local fertilizer brand names
- Regional measurement units

## Testing

To test language support:

1. **UI Testing**: Change language in Settings and verify all screens
2. **Voice Testing**: Use voice commands in different languages
3. **Analysis Testing**: Complete soil analysis in each language
4. **TTS Testing**: Listen to advice in each language

## API Compatibility

### Sarvam AI Support
All 12 Indian languages are supported by Sarvam AI:
- ✅ Speech-to-Text
- ✅ Text-to-Speech
- ✅ Language Translation

### SoilGrids API
- Language-independent (returns numeric data)
- Works globally with GPS coordinates

## Accessibility

- Large, readable fonts for all scripts
- High contrast for outdoor visibility
- Voice input for low-literacy users
- Native script display for authenticity
- Phonetic fallbacks where needed

## Contributing

To add a new language:

1. Add language code to `sarvamVoiceService.js`
2. Add translations to all UI components
3. Add voice keywords to `VoiceController.jsx`
4. Update language selector components
5. Test speech recognition and TTS
6. Update documentation

## Support

For language-specific issues:
- Check Sarvam AI language support
- Verify language code format (xx-IN)
- Test with native speakers
- Report translation errors

---

**Last Updated**: March 6, 2026
**Total Languages**: 13 (12 Indian + English)
**Coverage**: ~95% of Indian population
