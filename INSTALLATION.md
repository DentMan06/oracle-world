# Oracle World - Installation & Setup Guide

## Installation

### Step 1: Copy Module to Foundry

Copy the `oracle-world` folder to your Foundry VTT modules directory:

```
<Foundry User Data>/Data/modules/oracle-world/
```

### Step 2: Enable the Module

1. Launch Foundry VTT
2. Open your world
3. Go to Settings → Manage Modules
4. Find "Oracle World" and check the box to enable it
5. Click "Save Module Settings"
6. Reload your world

### Step 3: Configure API Keys

1. Go to Settings → Configure Settings
2. Find the "Oracle World" section
3. Enter your API keys for the providers you want to use:
   - **OpenRouter**: Primary provider (recommended)
   - **OpenAI**: For DALL-E, GPT, and TTS
   - **Anthropic**: For Claude models
   - **Midjourney**: For Midjourney features
   - **Others**: DeepSeek, Stable Diffusion, Gemini

4. Click "Save Changes"

## Getting API Keys

### OpenRouter (Recommended)
1. Visit https://openrouter.ai/
2. Sign up for an account
3. Go to Keys section
4. Create a new API key
5. Copy and paste into Oracle World settings

### OpenAI
1. Visit https://platform.openai.com/
2. Sign up or log in
3. Go to API Keys
4. Create new secret key
5. Copy and paste into Oracle World settings

### Anthropic
1. Visit https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys
4. Create new key
5. Copy and paste into Oracle World settings

## Usage

### Generating Images for Actors

1. Open an Actor sheet
2. Click the "Generate" button (wand icon) in the header
3. Enter your prompt (e.g., "A fierce warrior with red hair")
4. Select a provider and model
5. Review the estimated cost
6. Click "Generate"
7. Click "Apply" to set as the actor's portrait

### Generating Images for Items

1. Open an Item sheet
2. Click the "Generate" button in the header
3. Enter your prompt (e.g., "A magical sword with glowing runes")
4. Generate and apply

### Using Context Menus

Right-click any Actor, Item, Scene, or Journal in the sidebar to access quick generation options.

### Using Templates

1. Open the generation dialog
2. Select a template from the dropdown
3. The prompt will be auto-filled with the template
4. Customize as needed
5. Generate

## Troubleshooting

### "No API key configured" Error
- Go to module settings and enter your API key for the selected provider

### "Generation failed" Error
- Check your API key is valid
- Verify you have credits/balance with the provider
- Check the browser console (F12) for detailed error messages

### Images Not Applying
- Ensure you have write permissions in Foundry
- Check the browser console for errors
- Try saving the image manually from the generation dialog

### Cost Estimates Not Showing
- Some models may not have pricing information available
- This is normal and doesn't prevent generation

## Advanced Configuration

### Permissions
- **GM Only Mode**: Only GMs can use generation features (default: enabled)
- **Player Access**: Allow players to generate content (default: disabled)
- **Track Usage**: Track generation usage per user (default: disabled)

### UI Preferences
- **Show Cost Estimates**: Display costs before generation (default: enabled)
- Dialog size preferences are saved per-client

## Support

For issues, questions, or feature requests, please refer to the project documentation or create an issue in the repository.

## Privacy & Security

- All API keys are stored in your Foundry world data
- Keys are never transmitted except to the configured AI providers
- Generated content is stored locally in your Foundry user data
- No telemetry or usage tracking is sent to third parties
