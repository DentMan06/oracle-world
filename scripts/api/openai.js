/**
 * OpenAI API Client
 * Direct OpenAI API integration
 */

import BaseAPIClient from './api-client.js';
import { PROVIDERS } from '../constants.js';

export default class OpenAIClient extends BaseAPIClient {
  constructor(apiKey) {
    super({
      apiKey,
      baseURL: 'https://api.openai.com/v1',
      provider: PROVIDERS.OPENAI
    });
  }
  
  async generateImage(params) {
    this._validateParams(params, ['prompt', 'model']);
    
    const response = await this._makeRequest('/images/generations', {
      model: params.model,
      prompt: params.prompt,
      n: params.count || 1,
      size: `${params.width || 1024}x${params.height || 1024}`,
      quality: params.quality || 'standard'
    });
    
    return {
      success: true,
      type: 'image',
      provider: this.provider,
      model: params.model,
      images: response.data.map(img => img.url),
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: { prompt: params.prompt, timestamp: Date.now() }
    };
  }
  
  async generateText(params) {
    this._validateParams(params, ['prompt', 'model']);
    
    const response = await this._makeRequest('/chat/completions', {
      model: params.model,
      messages: [{ role: 'user', content: params.prompt }],
      max_tokens: params.maxTokens || 1000
    });
    
    return {
      success: true,
      type: 'text',
      provider: this.provider,
      model: params.model,
      text: response.choices[0].message.content,
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: { prompt: params.prompt, timestamp: Date.now() }
    };
  }
  
  async generateSpeech(params) {
    this._validateParams(params, ['text', 'model']);
    
    const response = await this._makeRequest('/audio/speech', {
      model: params.model,
      input: params.text,
      voice: params.voice || 'alloy'
    });
    
    return {
      success: true,
      type: 'speech',
      provider: this.provider,
      model: params.model,
      audio: response.url,
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: { text: params.text, timestamp: Date.now() }
    };
  }
  
  async removeBackground(params) {
    throw new Error('Background removal not supported by OpenAI');
  }
  
  async transformImage(params) {
    this._validateParams(params, ['imageData', 'prompt']);
    
    const response = await this._makeRequest('/images/edits', {
      image: params.imageData,
      prompt: params.prompt,
      n: params.count || 1
    });
    
    return {
      success: true,
      type: 'image-transform',
      provider: this.provider,
      images: response.data.map(img => img.url),
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: { mode: params.mode, timestamp: Date.now() }
    };
  }
  
  async estimateCost(params) {
    return { estimated: false, message: 'Cost estimation not implemented', currency: 'USD' };
  }
  
  getAvailableModels(type = 'image') {
    const models = {
      image: [
        { id: 'dall-e-3', name: 'DALL-E 3', type: 'image', costInfo: '$0.04-0.12/image' },
        { id: 'dall-e-2', name: 'DALL-E 2', type: 'image', costInfo: '$0.02/image' }
      ],
      text: [
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', type: 'text', costInfo: '$0.01/1K tokens' },
        { id: 'gpt-4', name: 'GPT-4', type: 'text', costInfo: '$0.03/1K tokens' },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', type: 'text', costInfo: '$0.001/1K tokens' }
      ],
      speech: [
        { id: 'tts-1', name: 'TTS Standard', type: 'speech', costInfo: '$0.015/1M chars' },
        { id: 'tts-1-hd', name: 'TTS HD', type: 'speech', costInfo: '$0.030/1M chars' }
      ]
    };
    
    return models[type] || [];
  }
}
