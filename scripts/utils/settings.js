/**
 * Settings Management for Oracle World
 * Handles registration and access to module settings
 */

import { MODULE_ID, SETTINGS, PROVIDERS } from '../constants.js';

/**
 * Settings Manager Class
 */
export default class Settings {
  /**
   * Register all module settings
   */
  static register() {
    console.log(`${MODULE_ID} | Registering settings`);
    
    // Register API key settings (world scope)
    this._registerApiKeys();
    
    // Register preference settings (world scope)
    this._registerPreferences();
    
    // Register UI settings (client scope)
    this._registerUISettings();
    
    // Register permission settings (world scope)
    this._registerPermissions();
    
    // Register data storage settings (world scope)
    this._registerDataStorage();
  }
  
  /**
   * Register API key settings for all providers
   * @private
   */
  static _registerApiKeys() {
    const providers = [
      { key: SETTINGS.OPENROUTER_API_KEY, name: 'OpenRouter', hint: 'Your OpenRouter API key' },
      { key: SETTINGS.OPENAI_API_KEY, name: 'OpenAI', hint: 'Your OpenAI API key' },
      { key: SETTINGS.ANTHROPIC_API_KEY, name: 'Anthropic', hint: 'Your Anthropic API key' },
      { key: SETTINGS.DEEPSEEK_API_KEY, name: 'DeepSeek', hint: 'Your DeepSeek API key' },
      { key: SETTINGS.MIDJOURNEY_API_KEY, name: 'Midjourney', hint: 'Your Midjourney API key' },
      { key: SETTINGS.STABLE_DIFFUSION_API_KEY, name: 'Stable Diffusion', hint: 'Your Stable Diffusion API key' },
      { key: SETTINGS.GEMINI_API_KEY, name: 'Gemini', hint: 'Your Google Gemini API key' },
      { key: SETTINGS.REPLICATE_API_KEY, name: 'Replicate', hint: 'Your Replicate API key' }
    ];
    
    providers.forEach(provider => {
      game.settings.register(MODULE_ID, provider.key, {
        name: `${provider.name} API Key`,
        hint: provider.hint,
        scope: 'world',
        config: true,
        type: String,
        default: '',
        onChange: value => {
          console.log(`${MODULE_ID} | ${provider.name} API key updated`);
        }
      });
    });
  }
  
  /**
   * Register preference settings
   * @private
   */
  static _registerPreferences() {
    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_PROVIDER, {
      name: 'Default Provider',
      hint: 'The default AI provider to use for generation',
      scope: 'world',
      config: true,
      type: String,
      choices: {
        [PROVIDERS.OPENROUTER]: 'OpenRouter',
        [PROVIDERS.OPENAI]: 'OpenAI',
        [PROVIDERS.ANTHROPIC]: 'Anthropic',
        [PROVIDERS.DEEPSEEK]: 'DeepSeek',
        [PROVIDERS.MIDJOURNEY]: 'Midjourney',
        [PROVIDERS.STABLE_DIFFUSION]: 'Stable Diffusion',
        [PROVIDERS.GEMINI]: 'Gemini'
      },
      default: PROVIDERS.OPENROUTER
    });
    
    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_IMAGE_MODEL, {
      name: 'Default Image Model',
      hint: 'The default model to use for image generation',
      scope: 'world',
      config: true,
      type: String,
      default: ''
    });
    
    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_TEXT_MODEL, {
      name: 'Default Text Model',
      hint: 'The default model to use for text generation',
      scope: 'world',
      config: true,
      type: String,
      default: ''
    });
    
    game.settings.register(MODULE_ID, SETTINGS.DEFAULT_SPEECH_MODEL, {
      name: 'Default Speech Model',
      hint: 'The default model to use for speech generation',
      scope: 'world',
      config: true,
      type: String,
      default: ''
    });
  }
  
  /**
   * Register UI preference settings (client scope)
   * @private
   */
  static _registerUISettings() {
    game.settings.register(MODULE_ID, SETTINGS.DIALOG_WIDTH, {
      name: 'Dialog Width',
      hint: 'Width of the generation dialog',
      scope: 'client',
      config: false,
      type: Number,
      default: 800
    });
    
    game.settings.register(MODULE_ID, SETTINGS.DIALOG_HEIGHT, {
      name: 'Dialog Height',
      hint: 'Height of the generation dialog',
      scope: 'client',
      config: false,
      type: Number,
      default: 600
    });
    
    game.settings.register(MODULE_ID, SETTINGS.SHOW_COST_ESTIMATES, {
      name: 'Show Cost Estimates',
      hint: 'Display estimated costs before generation',
      scope: 'client',
      config: true,
      type: Boolean,
      default: true
    });
  }
  
  /**
   * Register permission settings
   * @private
   */
  static _registerPermissions() {
    game.settings.register(MODULE_ID, SETTINGS.GM_ONLY_MODE, {
      name: 'GM Only Mode',
      hint: 'Only allow GMs to use generation features',
      scope: 'world',
      config: true,
      type: Boolean,
      default: true
    });
    
    game.settings.register(MODULE_ID, SETTINGS.PLAYER_ACCESS, {
      name: 'Player Access',
      hint: 'Allow players to use generation features',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
    
    game.settings.register(MODULE_ID, SETTINGS.TRACK_USAGE, {
      name: 'Track Usage',
      hint: 'Track generation usage per user',
      scope: 'world',
      config: true,
      type: Boolean,
      default: false
    });
  }
  
  /**
   * Register data storage settings (not shown in config)
   * @private
   */
  static _registerDataStorage() {
    game.settings.register(MODULE_ID, SETTINGS.GENERATION_HISTORY, {
      name: 'Generation History',
      scope: 'world',
      config: false,
      type: Array,
      default: []
    });
    
    game.settings.register(MODULE_ID, SETTINGS.CUSTOM_TEMPLATES, {
      name: 'Custom Templates',
      scope: 'world',
      config: false,
      type: Array,
      default: []
    });
    
    game.settings.register(MODULE_ID, SETTINGS.ERROR_LOG, {
      name: 'Error Log',
      scope: 'world',
      config: false,
      type: Array,
      default: []
    });
  }
  
  /**
   * Get a setting value
   * @param {string} key - Setting key
   * @returns {*} Setting value
   */
  static get(key) {
    try {
      return game.settings.get(MODULE_ID, key);
    } catch (error) {
      console.error(`${MODULE_ID} | Error getting setting ${key}:`, error);
      return this._getDefaultValue(key);
    }
  }
  
  /**
   * Set a setting value
   * @param {string} key - Setting key
   * @param {*} value - Setting value
   * @returns {Promise<*>} Promise that resolves when setting is saved
   */
  static async set(key, value) {
    try {
      // Validate value before setting
      if (!this._validateValue(key, value)) {
        throw new Error(`Invalid value for setting ${key}`);
      }
      
      return await game.settings.set(MODULE_ID, key, value);
    } catch (error) {
      console.error(`${MODULE_ID} | Error setting ${key}:`, error);
      
      // If settings are corrupted, fall back to defaults and notify user
      if (error.message.includes('corrupt') || error.message.includes('parse')) {
        ui.notifications.warn(
          `Oracle World settings may be corrupted. Falling back to defaults.`
        );
        return this._getDefaultValue(key);
      }
      
      throw error;
    }
  }
  
  /**
   * Validate a setting value
   * @param {string} key - Setting key
   * @param {*} value - Value to validate
   * @returns {boolean} True if valid
   * @private
   */
  static _validateValue(key, value) {
    // API keys should be strings
    if (key.includes('ApiKey')) {
      return typeof value === 'string';
    }
    
    // Model settings should be strings
    if (key.includes('Model')) {
      return typeof value === 'string';
    }
    
    // Boolean settings
    if ([SETTINGS.GM_ONLY_MODE, SETTINGS.PLAYER_ACCESS, SETTINGS.TRACK_USAGE, SETTINGS.SHOW_COST_ESTIMATES].includes(key)) {
      return typeof value === 'boolean';
    }
    
    // Number settings
    if ([SETTINGS.DIALOG_WIDTH, SETTINGS.DIALOG_HEIGHT].includes(key)) {
      return typeof value === 'number' && value > 0;
    }
    
    // Array settings
    if ([SETTINGS.GENERATION_HISTORY, SETTINGS.CUSTOM_TEMPLATES, SETTINGS.ERROR_LOG].includes(key)) {
      return Array.isArray(value);
    }
    
    return true;
  }
  
  /**
   * Get default value for a setting
   * @param {string} key - Setting key
   * @returns {*} Default value
   * @private
   */
  static _getDefaultValue(key) {
    const defaults = {
      [SETTINGS.OPENROUTER_API_KEY]: '',
      [SETTINGS.OPENAI_API_KEY]: '',
      [SETTINGS.ANTHROPIC_API_KEY]: '',
      [SETTINGS.DEEPSEEK_API_KEY]: '',
      [SETTINGS.MIDJOURNEY_API_KEY]: '',
      [SETTINGS.STABLE_DIFFUSION_API_KEY]: '',
      [SETTINGS.GEMINI_API_KEY]: '',
      [SETTINGS.DEFAULT_PROVIDER]: PROVIDERS.OPENROUTER,
      [SETTINGS.DEFAULT_IMAGE_MODEL]: '',
      [SETTINGS.DEFAULT_TEXT_MODEL]: '',
      [SETTINGS.DEFAULT_SPEECH_MODEL]: '',
      [SETTINGS.DIALOG_WIDTH]: 800,
      [SETTINGS.DIALOG_HEIGHT]: 600,
      [SETTINGS.SHOW_COST_ESTIMATES]: true,
      [SETTINGS.GM_ONLY_MODE]: true,
      [SETTINGS.PLAYER_ACCESS]: false,
      [SETTINGS.TRACK_USAGE]: false,
      [SETTINGS.GENERATION_HISTORY]: [],
      [SETTINGS.CUSTOM_TEMPLATES]: [],
      [SETTINGS.ERROR_LOG]: []
    };
    
    return defaults[key];
  }
  
  /**
   * Check if any API key is configured
   * @returns {boolean} True if at least one API key is configured
   */
  static hasAnyApiKey() {
    const apiKeys = [
      SETTINGS.OPENROUTER_API_KEY,
      SETTINGS.OPENAI_API_KEY,
      SETTINGS.ANTHROPIC_API_KEY,
      SETTINGS.DEEPSEEK_API_KEY,
      SETTINGS.MIDJOURNEY_API_KEY,
      SETTINGS.STABLE_DIFFUSION_API_KEY,
      SETTINGS.GEMINI_API_KEY
    ];
    
    return apiKeys.some(key => {
      const value = this.get(key);
      return value && value.length > 0;
    });
  }
  
  /**
   * Get all configured providers
   * @returns {Array<string>} Array of provider IDs with configured API keys
   */
  static getConfiguredProviders() {
    const providerKeys = {
      [PROVIDERS.OPENROUTER]: SETTINGS.OPENROUTER_API_KEY,
      [PROVIDERS.OPENAI]: SETTINGS.OPENAI_API_KEY,
      [PROVIDERS.ANTHROPIC]: SETTINGS.ANTHROPIC_API_KEY,
      [PROVIDERS.DEEPSEEK]: SETTINGS.DEEPSEEK_API_KEY,
      [PROVIDERS.MIDJOURNEY]: SETTINGS.MIDJOURNEY_API_KEY,
      [PROVIDERS.STABLE_DIFFUSION]: SETTINGS.STABLE_DIFFUSION_API_KEY,
      [PROVIDERS.GEMINI]: SETTINGS.GEMINI_API_KEY
    };
    
    return Object.entries(providerKeys)
      .filter(([provider, key]) => {
        const value = this.get(key);
        return value && value.length > 0;
      })
      .map(([provider]) => provider);
  }
}
