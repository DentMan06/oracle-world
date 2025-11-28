/**
 * Anthropic API Client
 * Claude models integration
 */

import BaseAPIClient from './api-client.js';
import { PROVIDERS } from '../constants.js';

export default class AnthropicClient extends BaseAPIClient {
  constructor(apiKey) {
    super({
      apiKey,
      baseURL: 'https://api.anthropic.com/v1',
      provider: PROVIDERS.ANTHROPIC
    });
  }
  
  async generateImage(params) {
    throw new Error('Image generation not supported by Anthropic');
  }
  
  async generateText(params) {
    this._validateParams(params, ['prompt', 'model']);
    
    const response = await this._makeRequest('/messages', {
      model: params.model,
      messages: [{ role: 'user', content: params.prompt }],
      max_tokens: params.maxTokens || 1000
    }, {
      headers: {
        'anthropic-version': '2023-06-01'
      }
    });
    
    return {
      success: true,
      type: 'text',
      provider: this.provider,
      model: params.model,
      text: response.content[0].text,
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: { prompt: params.prompt, timestamp: Date.now() }
    };
  }
  
  async generateSpeech(params) {
    throw new Error('Speech generation not supported by Anthropic');
  }
  
  async removeBackground(params) {
    throw new Error('Background removal not supported by Anthropic');
  }
  
  async transformImage(params) {
    throw new Error('Image transformation not supported by Anthropic');
  }
  
  async estimateCost(params) {
    return { estimated: false, message: 'Cost estimation not implemented', currency: 'USD' };
  }
  
  getAvailableModels(type = 'text') {
    const models = {
      text: [
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', type: 'text', costInfo: '$0.015/1K tokens' },
        { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', type: 'text', costInfo: '$0.003/1K tokens' },
        { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', type: 'text', costInfo: '$0.00025/1K tokens' }
      ]
    };
    
    return models[type] || [];
  }
}
