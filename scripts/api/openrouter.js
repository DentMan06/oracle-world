/**
 * OpenRouter API Client
 * Implements OpenRouter-specific API calls
 */

import BaseAPIClient from './api-client.js';
import { PROVIDERS } from '../constants.js';

/**
 * OpenRouter Client Class
 */
export default class OpenRouterClient extends BaseAPIClient {
  /**
   * @param {string} apiKey - OpenRouter API key
   */
  constructor(apiKey) {
    super({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      provider: PROVIDERS.OPENROUTER
    });
    
    // Model pricing (cost per image or per 1K tokens)
    this.pricing = {
      // Image models
      'dall-e-3': { perImage: 0.04, type: 'image' },
      'dall-e-2': { perImage: 0.02, type: 'image' },
      'stable-diffusion-xl': { perImage: 0.002, type: 'image' },
      'stable-diffusion-2': { perImage: 0.001, type: 'image' },
      
      // Text models
      'gpt-4': { perToken: 0.03, type: 'text' },
      'gpt-4-turbo': { perToken: 0.01, type: 'text' },
      'gpt-3.5-turbo': { perToken: 0.001, type: 'text' },
      'claude-3-opus': { perToken: 0.015, type: 'text' },
      'claude-3-sonnet': { perToken: 0.003, type: 'text' },
      'claude-3-haiku': { perToken: 0.00025, type: 'text' },
      
      // Speech models
      'tts-1': { perCharacter: 0.000015, type: 'speech' },
      'tts-1-hd': { perCharacter: 0.00003, type: 'speech' }
    };
  }
  
  /**
   * Generate an image using OpenRouter
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async generateImage(params) {
    throw new Error('Image generation is not supported by OpenRouter. Please use OpenAI, Midjourney, or Stable Diffusion providers for image generation.');
  }
  
  /**
   * Generate text using OpenRouter
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async generateText(params) {
    this._validateParams(params, ['prompt', 'model']);
    
    const requestData = {
      model: params.model,
      messages: [
        {
          role: 'user',
          content: params.prompt
        }
      ],
      max_tokens: params.maxTokens || 1000,
      temperature: params.temperature || 0.7
    };
    
    if (params.systemPrompt) {
      requestData.messages.unshift({
        role: 'system',
        content: params.systemPrompt
      });
    }
    
    const response = await this._makeRequest('/chat/completions', requestData);
    
    const text = response.choices[0].message.content;
    const tokensUsed = response.usage?.total_tokens || 0;
    
    return {
      success: true,
      type: 'text',
      provider: this.provider,
      model: params.model,
      text,
      cost: this._calculateTextCost(params.model, tokensUsed),
      metadata: {
        prompt: params.prompt,
        parameters: params,
        timestamp: Date.now(),
        tokensUsed,
        requestId: response.id
      }
    };
  }
  
  /**
   * Generate speech using OpenRouter
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Generation result
   */
  async generateSpeech(params) {
    this._validateParams(params, ['text', 'model']);
    
    const requestData = {
      model: params.model,
      input: params.text,
      voice: params.voice || 'alloy'
    };
    
    if (params.speed) {
      requestData.speed = params.speed;
    }
    
    const response = await this._makeRequest('/audio/speech', requestData);
    
    return {
      success: true,
      type: 'speech',
      provider: this.provider,
      model: params.model,
      audio: response.url || response.data,
      cost: this._calculateSpeechCost(params),
      metadata: {
        text: params.text,
        voice: params.voice,
        parameters: params,
        timestamp: Date.now()
      }
    };
  }
  
  /**
   * Remove background from image (not directly supported by OpenRouter)
   * @param {Object} params - Processing parameters
   * @returns {Promise<Object>} Processing result
   */
  async removeBackground(params) {
    throw new Error('Background removal not supported by OpenRouter. Use a specialized provider.');
  }
  
  /**
   * Transform an image using OpenRouter
   * @param {Object} params - Transformation parameters
   * @returns {Promise<Object>} Transformation result
   */
  async transformImage(params) {
    this._validateParams(params, ['imageData', 'prompt', 'mode']);
    
    const requestData = {
      model: params.model || 'dall-e-2',
      image: params.imageData,
      prompt: params.prompt,
      n: params.count || 1,
      size: `${params.width || 1024}x${params.height || 1024}`
    };
    
    // Different endpoints for different modes
    let endpoint = '/images/edits';
    
    if (params.mode === 'upscaling') {
      // Some models support upscaling through variations
      endpoint = '/images/variations';
      delete requestData.prompt;
    }
    
    const response = await this._makeRequest(endpoint, requestData);
    
    return {
      success: true,
      type: 'image-transform',
      provider: this.provider,
      model: params.model,
      images: response.data.map(img => img.url),
      cost: this._calculateImageCost(params),
      metadata: {
        mode: params.mode,
        prompt: params.prompt,
        parameters: params,
        timestamp: Date.now()
      }
    };
  }
  
  /**
   * Estimate cost for a generation
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Cost estimate
   */
  async estimateCost(params) {
    const model = params.model;
    const pricing = this.pricing[model];
    
    if (!pricing) {
      return {
        estimated: false,
        message: 'Pricing information not available for this model',
        currency: 'USD'
      };
    }
    
    let cost = 0;
    let breakdown = {};
    
    if (params.type === 'image') {
      const count = params.count || 1;
      cost = pricing.perImage * count;
      breakdown = {
        imagesCount: count,
        costPerImage: pricing.perImage
      };
    } else if (params.type === 'text') {
      const estimatedTokens = this._estimateTokens(params.prompt);
      const maxTokens = params.maxTokens || 1000;
      const totalTokens = estimatedTokens + maxTokens;
      cost = (totalTokens / 1000) * pricing.perToken;
      breakdown = {
        inputTokens: estimatedTokens,
        outputTokens: maxTokens,
        totalTokens,
        costPer1kTokens: pricing.perToken
      };
    } else if (params.type === 'speech') {
      const characters = params.text.length;
      cost = characters * pricing.perCharacter;
      breakdown = {
        characters,
        costPerCharacter: pricing.perCharacter
      };
    }
    
    return {
      estimated: true,
      cost: cost.toFixed(4),
      currency: 'USD',
      breakdown
    };
  }
  
  /**
   * Calculate actual image generation cost
   * @param {Object} params - Generation parameters
   * @returns {Object} Cost information
   * @private
   */
  _calculateImageCost(params) {
    const pricing = this.pricing[params.model];
    if (!pricing || pricing.type !== 'image') {
      return { amount: 0, currency: 'USD', estimated: true };
    }
    
    const count = params.count || 1;
    const amount = pricing.perImage * count;
    
    return {
      amount: parseFloat(amount.toFixed(4)),
      currency: 'USD',
      breakdown: {
        imagesCount: count,
        costPerImage: pricing.perImage
      }
    };
  }
  
  /**
   * Calculate actual text generation cost
   * @param {string} model - Model used
   * @param {number} tokensUsed - Actual tokens used
   * @returns {Object} Cost information
   * @private
   */
  _calculateTextCost(model, tokensUsed) {
    const pricing = this.pricing[model];
    if (!pricing || pricing.type !== 'text') {
      return { amount: 0, currency: 'USD', estimated: true };
    }
    
    const amount = (tokensUsed / 1000) * pricing.perToken;
    
    return {
      amount: parseFloat(amount.toFixed(4)),
      currency: 'USD',
      breakdown: {
        tokensUsed,
        costPer1kTokens: pricing.perToken
      }
    };
  }
  
  /**
   * Calculate actual speech generation cost
   * @param {Object} params - Generation parameters
   * @returns {Object} Cost information
   * @private
   */
  _calculateSpeechCost(params) {
    const pricing = this.pricing[params.model];
    if (!pricing || pricing.type !== 'speech') {
      return { amount: 0, currency: 'USD', estimated: true };
    }
    
    const characters = params.text.length;
    const amount = characters * pricing.perCharacter;
    
    return {
      amount: parseFloat(amount.toFixed(4)),
      currency: 'USD',
      breakdown: {
        characters,
        costPerCharacter: pricing.perCharacter
      }
    };
  }
  
  /**
   * Estimate token count from text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   * @private
   */
  _estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Get available models for a specific generation type
   * @param {string} type - Generation type ('image', 'text', 'speech')
   * @returns {Array<Object>} Array of model info objects
   */
  getAvailableModels(type = 'image') {
    // OpenRouter doesn't support direct image generation
    // It only supports text and chat models
    if (type === 'image') {
      return [];
    }
    
    const models = Object.entries(this.pricing)
      .filter(([_, info]) => info.type === type)
      .map(([id, info]) => ({
        id,
        name: id,
        type: info.type,
        costInfo: type === 'text'
          ? `$${info.perToken}/1K tokens`
          : `$${info.perCharacter}/char`
      }));
    
    return models;
  }
}
