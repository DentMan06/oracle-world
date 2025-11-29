/**
 * Replicate API Client
 * Supports multiple image generation models through Replicate
 */

import BaseAPIClient from './api-client.js';
import { PROVIDERS } from '../constants.js';

export default class ReplicateClient extends BaseAPIClient {
  constructor(apiKey) {
    super({
      apiKey,
      baseURL: 'https://api.replicate.com/v1',
      provider: PROVIDERS.REPLICATE
    });
  }
  
  async generateImage(params) {
    this._validateParams(params, ['prompt', 'model']);
    
    // Create prediction
    const prediction = await this._makeRequest('/predictions', {
      version: params.model,
      input: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt,
        width: params.width || 1024,
        height: params.height || 1024,
        num_outputs: params.count || 1
      }
    });
    
    // Poll for completion
    const result = await this._pollPrediction(prediction.id);
    
    return {
      success: true,
      type: 'image',
      provider: this.provider,
      model: params.model,
      images: Array.isArray(result.output) ? result.output : [result.output],
      cost: { amount: 0, currency: 'USD', estimated: true },
      metadata: {
        prompt: params.prompt,
        predictionId: prediction.id,
        timestamp: Date.now()
      }
    };
  }
  
  async _pollPrediction(predictionId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      const prediction = await this._makeRequest(`/predictions/${predictionId}`, null, { method: 'GET' });
      
      if (prediction.status === 'succeeded') {
        return prediction;
      }
      
      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
      }
      
      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Prediction timed out');
  }
  
  async generateText(params) {
    throw new Error('Text generation not supported by Replicate client. Use OpenRouter instead.');
  }
  
  async generateSpeech(params) {
    throw new Error('Speech generation not yet implemented for Replicate');
  }
  
  async removeBackground(params) {
    throw new Error('Background removal not yet implemented for Replicate');
  }
  
  async transformImage(params) {
    throw new Error('Image transformation not yet implemented for Replicate');
  }
  
  async estimateCost(params) {
    return { estimated: false, message: 'Cost estimation not implemented', currency: 'USD' };
  }
  
  getAvailableModels(type = 'image', category = 'all') {
    if (type !== 'image') {
      return [];
    }
    
    // Verified working models with real Replicate version IDs
    const allModels = [
      // Fast/Quick category
      {
        id: 'black-forest-labs/flux-schnell',
        name: 'FLUX Schnell',
        type: 'image',
        category: 'fast',
        costInfo: '~$0.003/image',
        description: 'Fast generation (2-4s) - Best for quick iterations and testing prompts'
      },
      {
        id: 'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
        name: 'Stable Diffusion 1.5',
        type: 'image',
        category: 'fast',
        costInfo: '~$0.001/image',
        description: 'Budget option - Good for tokens and simple icons'
      },
      
      // Quality/Premium category
      {
        id: 'black-forest-labs/flux-dev',
        name: 'FLUX Dev',
        type: 'image',
        category: 'quality',
        costInfo: '~$0.025/image',
        description: 'Highest quality - Best for final character portraits and detailed artwork'
      },
      { 
        id: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        name: 'Stable Diffusion XL',
        type: 'image',
        category: 'quality',
        costInfo: '~$0.003/image',
        description: 'Balanced quality/speed - Good for general fantasy art and scenes'
      },
      
      // Fantasy/Artistic category
      {
        id: 'prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
        name: 'OpenJourney',
        type: 'image',
        category: 'fantasy',
        costInfo: '~$0.001/image',
        description: 'Midjourney-style - Good for artistic fantasy illustrations'
      },
      
      // Anime/Stylized category
      {
        id: 'cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65',
        name: 'Anything V3',
        type: 'image',
        category: 'anime',
        costInfo: '~$0.001/image',
        description: 'Anime style - Great for anime-inspired characters'
      },
      
      // Custom option
      {
        id: 'custom',
        name: 'Custom Model ID',
        type: 'image',
        category: 'custom',
        costInfo: 'Varies',
        description: 'Enter any Replicate model ID (owner/model:version)'
      }
    ];
    
    // Filter by category if specified
    if (category === 'all') {
      return allModels;
    }
    
    return allModels.filter(model => model.category === category);
  }
  
  /**
   * Get available model categories
   * @returns {Array<Object>} Array of category info
   */
  getModelCategories() {
    return [
      { id: 'all', name: 'All Models', description: 'Show all available models' },
      { id: 'fast', name: 'Fast & Budget', description: 'Quick generation, lower cost' },
      { id: 'quality', name: 'High Quality', description: 'Best quality, slower generation' },
      { id: 'fantasy', name: 'Fantasy & Artistic', description: 'Fantasy art, D&D style' },
      { id: 'anime', name: 'Anime & Stylized', description: 'Anime and cartoon styles' },
      { id: 'custom', name: 'Custom', description: 'Use your own model ID' }
    ];
  }
}
