# AI Voice Extension

A Chrome extension for voice interaction with AI (OpenAI for voice, Grok for text), featuring Desktop Commander capabilities for screen capture and automation.

## Important Note
**Voice features require OpenAI API key** - Grok API does not support WebRTC voice interaction.

## Setup Instructions

### 1. Get Your API Key

#### For Voice Features (OpenAI):
1. Go to [platform.openai.com](https://platform.openai.com) and sign in
2. Navigate to API keys section
3. Generate your API key (starts with `sk-`)
4. Keep this key secure

#### For Text-Only Features (Grok):
1. Go to [x.ai](https://x.ai) and sign in
2. Navigate to API settings
3. Generate your API key (starts with `xai-`)
4. Keep this key secure

### 2. Install the Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the extension folder

### 3. Configure the Extension
1. Click the extension icon in Chrome toolbar
2. Open Settings (hamburger menu ☰)
3. Enter your API key:
   - For voice features: OpenAI API key (sk-...)
   - For text-only: Grok API key (xai-...)
4. The API endpoint will be configured automatically
5. Click "Save Settings"
6. Click "Connect" to start

## Features
- 🎤 Voice interaction with AI (requires OpenAI API)
- 🖥️ Desktop Commander mode for screen automation
- 👂 Wake word detection ("Hey Grok")
- 🔄 Continuous conversation mode
- 📸 Screen capture capabilities
- 🤖 Browser automation

## Voice Commands
- Say "Hey Grok" to activate (when wake word mode is on)
- Click microphone or press spacebar to talk
- Grok will respond with voice

## Settings
- **API Key**: Your OpenAI (sk-...) or Grok (xai-...) API key (required)
- **Auto-connect**: Connect automatically when extension opens
- **Continuous mode**: Keep listening after responses
- **Desktop Commander**: Enable screen automation features
- **Wake Word Detection**: Activate with "Hey Grok"

## Troubleshooting
- **"SDP exchange failed: 404"**: You're using Grok API key - switch to OpenAI API key for voice features
- **"Please enter your API key"**: Add your key in settings
- **Connection issues**: Check your API key is valid and correct type (OpenAI for voice)
- **Microphone issues**: Allow microphone permissions in Chrome

## Version
Current: 0.4.0

## Support
For issues or questions, please check the repository.