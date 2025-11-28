/**
 * Cost Estimator Service
 * Calculates estimated costs for AI generation requests
 */

import { MODULE_ID, PROVIDERS } from '../constants.js';

/**
 * Cost Estimator Class
 */
export default class CostEstimator {
  /**
   * Pricing data for various models across providers
   * Costs are in USD
   */
  static PRICING = {
    [PROVIDERS.OPENROUTER]: {
      // Image models
      'dall-e-3': { perImage: 0.04, type: 'image' },
      'dall-e-2': { perImage: 0.02, type: 'image' },
      'stable-diffusion-xl': { perImage: 0.002, type: 'image' },
      
      // Text models
      'gpt-4': { perToken: 0.03, type: 'text' },
      'gpt-4-turbo': { perToken: 0.01, type: 'text' },
      'gpt-3.5-turbo': { perToken: 0.001, type: 'text' },
      'claude-3-opus': { perToken: 0.015, type: 'text' },
      'claude-3-sonnet': { perToken: 0.003, type: 'text' },
      
      // Speech models
      'tts-1': { perCharacter: 0.000015, type: 'speech' },
      'tts-1-hd': { perCharacter: 0.00003, type: 'speech' }
    },
    
    [PROVIDERS.OPENAI]: {
      'dall-e-3': { perImage: 0.04, type: 'image' },
      'dall-e-2': { perImage: 0.02, type: 'image' },
      'gpt-4': { perToken: 0.03, type: 'text' },
      'gpt-4-turbo': { perToken: 0.01, type: 'text' },
      'gpt-3.5-turbo': { perToken: 0.001, type: 'text' },
      'tts-1': { perCharacter: 0.000015, type: 'speech' },
      'tts-1-hd': { perCharacter: 0.00003, type: 'speech' }
    },
    
    [PROVIDERS.ANTHROPIC]: {
      'claude-3-opus': { perToken: 0.015, type: 'text' },
      'claude-3-sonnet': { perToken: 0.003, type: 'text' },
      'claude-3-haiku': { perToken: 0.00025, type: 'text' }
    }
  };
  
  /**
   * Estimate cost for a generation request
   * @param {string} provider - Provider ID
   * @param {string} model - Model ID
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Cost estimate
   */
  static async estimate(provider, model, params) {
    const providerPricing = this.PRICING[provider];
    
    if (!providerPricing) {
      return {
        estimated: false,
        message: `Pricing information not available for provider: ${provider}`,
        currency: 'USD'
      };
    }
    
    const modelPricing = providerPricing[model];
    
    if (!modelPricing) {
      return {
        estimated: false,
        message: `Pricing information not available for model: ${model}`,
        currency: 'USD'
      };
    }
    
    let cost = 0;
    let breakdown = {};
    
    try {
      if (params.type === 'image') {
        const result = this._estimateImageCost(modelPricing, params);
        cost = result.cost;
        breakdown = result.breakdown;
      } else if (params.type === 'text') {
        const result = this._estimateTextCost(modelPricing, params);
        cost = result.cost;
        breakdown = result.breakdown;
      } else if (params.type === 'speech') {
        const result = this._estimateSpeechCost(modelPricing, params);
        cost = result.cost;
        breakdown = result.breakdown;
      } else {
        return {
          estimated: false,
          message: `Unknown generation type: ${params.type}`,
          currency: 'USD'
        };
      }
      
      return {
        estimated: true,
        cost: cost.toFixed(4),
        currency: 'USD',
        breakdown
      };
    } catch (error) {
      console.error(`${MODULE_ID} | Error estimating cost:`, error);
      return {
        estimated: false,
        message: `Error calculating cost: ${error.message}`,
        currency: 'USD'
      };
    }
  }
  
  /**
   * Estimate image generation cost
   * @param {Object} pricing - Model pricing info
   * @param {Object} params - Generation parameters
   * @returns {Object} Cost and breakdown
   * @private
   */
  static _estimateImageCost(pricing, params) {
    const count = params.count || 1;
    const cost = pricing.perImage * count;
    
    return {
      cost,
      breakdown: {
        imagesCount: count,
        costPerImage: pricing.perImage
      }
    };
  }
  
  /**
   * Estimate text generation cost
   * @param {Object} pricing - Model pricing info
   * @param {Object} params - Generation parameters
   * @returns {Object} Cost and breakdown
   * @private
   */
  static _estimateTextCost(pricing, params) {
    const inputTokens = this._estimateTokens(params.prompt || '');
    const outputTokens = params.maxTokens || 1000;
    const totalTokens = inputTokens + outputTokens;
    const cost = (totalTokens / 1000) * pricing.perToken;
    
    return {
      cost,
      breakdown: {
        inputTokens,
        outputTokens,
        totalTokens,
        costPer1kTokens: pricing.perToken
      }
    };
  }
  
  /**
   * Estimate speech generation cost
   * @param {Object} pricing - Model pricing info
   * @param {Object} params - Generation parameters
   * @returns {Object} Cost and breakdown
   * @private
   */
  static _estimateSpeechCost(pricing, params) {
    const characters = (params.text || '').length;
    const cost = characters * pricing.perCharacter;
    
    return {
      cost,
      breakdown: {
        characters,
        costPerCharacter: pricing.perCharacter
      }
    };
  }
  
  /**
   * Estimate token count from text
   * Uses rough approximation of 4 characters per token
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   * @private
   */
  static _estimateTokens(text) {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }
}
