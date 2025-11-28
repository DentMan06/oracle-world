# Oracle World

AI-powered content generation for Foundry VTT v13.

## Features

- **Image Generation**: Create character portraits, item icons, scene backgrounds, and tokens
- **Text Generation**: Generate NPC descriptions, item flavor text, and plot hooks
- **Voice Synthesis**: Convert text to speech for narration and character voices
- **Background Removal**: Clean up images for token creation
- **Multiple AI Providers**: Support for OpenRouter, OpenAI, Anthropic, Midjourney, and more
- **BYOK Model**: Bring your own API keys - no subscriptions or proprietary credits

## Installation

### For Development

1. Clone or copy this module to your Foundry VTT `Data/modules/` directory
2. Restart Foundry VTT or refresh the modules list
3. Enable "Oracle World" in your world's module settings

### Testing

This module uses Vitest for unit testing and fast-check for property-based testing.

```bash
# Install dependencies (requires Node.js)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Configuration

1. Open Foundry VTT module settings
2. Navigate to Oracle World settings
3. Enter your API keys for the providers you want to use:
   - OpenRouter
   - OpenAI
   - Anthropic
   - DeepSeek
   - Midjourney
   - Stable Diffusion
   - Gemini

## Usage

### Generating Images

1. Open an Actor, Item, or Scene sheet
2. Click the "Generate" button in the header
3. Enter your prompt and select a model
4. Review the cost estimate
5. Click "Generate"
6. Apply the result to your document

### Context Menu

Right-click any Actor, Item, Scene, or Journal entry in the sidebar to access quick generation options.

## Development Status

✅ **All 43 implementation tasks completed!**

The module is fully functional with:
- Complete backend infrastructure
- API clients for multiple providers
- Generation dialog UI
- Foundry VTT integration (actors, items, scenes, journals)
- Cost estimation and history management
- Template system
- Comprehensive test suite

See `INSTALLATION.md` for setup instructions.

## License

MIT

## Compatibility

- **Foundry VTT**: v13 (build 351+)
- **Game Systems**: System-agnostic
