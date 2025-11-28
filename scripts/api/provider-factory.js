/**
 * Provider Factory for Oracle World
 * Creates API client instances for different providers
 */

import { MODULE_ID, PROVIDERS } from '../constants.js';
import Settings from '../utils/settings.js';
import OpenRouterClient from './openrouter.js';
import OpenAIClient from './openai.js';
import AnthropicClient from './anthropic.js';
import MidjourneyClient from './midjourney.js';
import ReplicateClient from './replicate.js';

/**
 * Provider Factory Class
 */
export default class ProviderFactory {
  /**
   * Create an API client for the specified provider
   * @param {string} providerName - Provider identifier
   * @returns {BaseAPIClient} API client instance
   * @throws {Error} If provider is unknown or API key is not configured
   */
  static create(providerName) {
    const apiKey = this._getApiKey(providerName);
    
    if (!apiKey) {
      throw new Error(`No API key configured for ${providerName}`);
    }
    
    switch (providerName) {
      case PROVIDERS.OPENROUTER:
        return new OpenRouterClient(apiKey);
        
      case PROVIDERS.OPENAI:
        return new OpenAIClient(apiKey);
        
      case PROVIDERS.ANTHROPIC:
        return new AnthropicClient(apiKey);
        
      case PROVIDERS.DEEPSEEK:
        throw new Error('DeepSeek client not yet implemented');
        
      case PROVIDERS.MIDJOURNEY:
        return new MidjourneyClient(apiKey);
        
      case PROVIDERS.STABLE_DIFFUSION:
        throw new Error('Stable Diffusion client not yet implemented');
        
      case PROVIDERS.GEMINI:
        throw new Error('Gemini client not yet implemented');
        
      case PROVIDERS.REPLICATE:
        return new ReplicateClient(apiKey);
        
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }
  
  /**
   * Get available providers (those with configured API keys)
   * @returns {Array<Object>} Array of provider info objects
   */
  static getAvailableProviders() {
    const providers = [
      { id: PROVIDERS.OPENROUTER, name: 'OpenRouter' },
      { id: PROVIDERS.OPENAI, name: 'OpenAI' },
      { id: PROVIDERS.ANTHROPIC, name: 'Anthropic' },
      { id: PROVIDERS.DEEPSEEK, name: 'DeepSeek' },
      { id: PROVIDERS.MIDJOURNEY, name: 'Midjourney' },
      { id: PROVIDERS.STABLE_DIFFUSION, name: 'Stable Diffusion' },
      { id: PROVIDERS.GEMINI, name: 'Gemini' },
      { id: PROVIDERS.REPLICATE, name: 'Replicate' }
    ];
    
    return providers.filter(provider => {
      const apiKey = this._getApiKey(provider.id);
      return apiKey && apiKey.length > 0;
    });
  }
  
  /**
   * Check if a provider is available
   * @param {string} providerName - Provider identifier
   * @returns {boolean} True if provider has a configured API key
   */
  static isAvailable(providerName) {
    const apiKey = this._getApiKey(providerName);
    return apiKey && apiKey.length > 0;
  }
  
  /**
   * Get API key for a provider
   * @param {string} providerName - Provider identifier
   * @returns {string} API key or empty string
   * @private
   */
  static _getApiKey(providerName) {
    const keyMap = {
      [PROVIDERS.OPENROUTER]: 'openrouterApiKey',
      [PROVIDERS.OPENAI]: 'openaiApiKey',
      [PROVIDERS.ANTHROPIC]: 'anthropicApiKey',
      [PROVIDERS.DEEPSEEK]: 'deepseekApiKey',
      [PROVIDERS.MIDJOURNEY]: 'midjourneyApiKey',
      [PROVIDERS.STABLE_DIFFUSION]: 'stableDiffusionApiKey',
      [PROVIDERS.GEMINI]: 'geminiApiKey',
      [PROVIDERS.REPLICATE]: 'replicateApiKey'
    };
    
    const settingKey = keyMap[providerName];
    if (!settingKey) {
      return '';
    }
    
    return Settings.get(settingKey) || '';
  }
}
