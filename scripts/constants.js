/**
 * Oracle World Module Constants
 */

export const MODULE_ID = 'oracle-world';
export const MODULE_NAME = 'Oracle World';

/**
 * Supported AI Providers
 */
export const PROVIDERS = {
  OPENROUTER: 'openrouter',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  DEEPSEEK: 'deepseek',
  MIDJOURNEY: 'midjourney',
  STABLE_DIFFUSION: 'stable-diffusion',
  GEMINI: 'gemini'
};

/**
 * Generation Types
 */
export const GENERATION_TYPES = {
  IMAGE: 'image',
  TEXT: 'text',
  SPEECH: 'speech',
  BACKGROUND_REMOVAL: 'background-removal',
  IMAGE_TRANSFORM: 'image-transform'
};

/**
 * Image Transformation Modes
 */
export const TRANSFORM_MODES = {
  SKETCH: 'sketch',
  STYLE_TRANSFER: 'style-transfer',
  INPAINTING: 'inpainting',
  OUTPAINTING: 'outpainting',
  UPSCALING: 'upscaling'
};

/**
 * Document Types
 */
export const DOCUMENT_TYPES = {
  ACTOR: 'Actor',
  ITEM: 'Item',
  SCENE: 'Scene',
  JOURNAL: 'JournalEntry',
  TILE: 'Tile'
};

/**
 * Settings Keys
 */
export const SETTINGS = {
  // API Keys
  OPENROUTER_API_KEY: 'openrouterApiKey',
  OPENAI_API_KEY: 'openaiApiKey',
  ANTHROPIC_API_KEY: 'anthropicApiKey',
  DEEPSEEK_API_KEY: 'deepseekApiKey',
  MIDJOURNEY_API_KEY: 'midjourneyApiKey',
  STABLE_DIFFUSION_API_KEY: 'stableDiffusionApiKey',
  GEMINI_API_KEY: 'geminiApiKey',
  
  // Preferences
  DEFAULT_PROVIDER: 'defaultProvider',
  DEFAULT_IMAGE_MODEL: 'defaultImageModel',
  DEFAULT_TEXT_MODEL: 'defaultTextModel',
  DEFAULT_SPEECH_MODEL: 'defaultSpeechModel',
  
  // UI Preferences (client)
  DIALOG_WIDTH: 'dialogWidth',
  DIALOG_HEIGHT: 'dialogHeight',
  SHOW_COST_ESTIMATES: 'showCostEstimates',
  
  // Permissions
  GM_ONLY_MODE: 'gmOnlyMode',
  PLAYER_ACCESS: 'playerAccess',
  TRACK_USAGE: 'trackUsage',
  
  // Data
  GENERATION_HISTORY: 'generationHistory',
  CUSTOM_TEMPLATES: 'customTemplates',
  ERROR_LOG: 'errorLog'
};

/**
 * Style Presets
 */
export const STYLE_PRESETS = {
  FANTASY: {
    id: 'fantasy',
    name: 'Fantasy',
    keywords: 'fantasy art, detailed, high quality, dramatic lighting'
  },
  SCI_FI: {
    id: 'sci-fi',
    name: 'Sci-Fi',
    keywords: 'science fiction, futuristic, high tech, detailed'
  },
  REALISTIC: {
    id: 'realistic',
    name: 'Realistic',
    keywords: 'photorealistic, detailed, natural lighting, high quality'
  },
  ANIME: {
    id: 'anime',
    name: 'Anime',
    keywords: 'anime style, manga, detailed, vibrant colors'
  },
  DARK: {
    id: 'dark',
    name: 'Dark',
    keywords: 'dark fantasy, moody, atmospheric, dramatic shadows'
  },
  CARTOON: {
    id: 'cartoon',
    name: 'Cartoon',
    keywords: 'cartoon style, stylized, colorful, clean lines'
  }
};

/**
 * Default Image Dimensions
 */
export const IMAGE_DIMENSIONS = {
  PORTRAIT: { width: 512, height: 768 },
  LANDSCAPE: { width: 768, height: 512 },
  SQUARE: { width: 512, height: 512 },
  ICON: { width: 256, height: 256 },
  TOKEN: { width: 400, height: 400 },
  SCENE: { width: 1920, height: 1080 }
};

/**
 * Error Types
 */
export const ERROR_TYPES = {
  RATE_LIMIT: 'RATE_LIMIT',
  AUTH_ERROR: 'AUTH_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  GENERIC_ERROR: 'GENERIC_ERROR'
};

/**
 * Log Levels
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};
