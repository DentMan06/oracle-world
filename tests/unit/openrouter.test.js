/**
 * Unit Tests for OpenRouter Client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import OpenRouterClient from '../../scripts/api/openrouter.js';

describe('OpenRouterClient', () => {
  let client;
  
  beforeEach(() => {
    client = new OpenRouterClient('test-api-key');
    global.fetch = vi.fn();
  });
  
  describe('Constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(client.apiKey).toBe('test-api-key');
      expect(client.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(client.provider).toBe('openrouter');
    });
    
    it('should have pricing information', () => {
      expect(client.pricing).toBeDefined();
      expect(client.pricing['dall-e-3']).toBeDefined();
      expect(client.pricing['gpt-4']).toBeDefined();
    });
  });
  
  describe('generateImage', () => {
    it('should construct correct request parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          data: [
            { url: 'https://example.com/image1.png' },
            { url: 'https://example.com/image2.png' }
          ]
        })
      });
      
      const result = await client.generateImage({
        prompt: 'A fantasy landscape',
        model: 'dall-e-3',
        width: 1024,
        height: 1024,
        count: 2,
        negativePrompt: 'blurry',
        quality: 'hd'
      });
      
      expect(global.fetch).toHaveBeenCalled();
      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.model).toBe('dall-e-3');
      expect(requestBody.prompt).toBe('A fantasy landscape');
      expect(requestBody.size).toBe('1024x1024');
      expect(requestBody.n).toBe(2);
      expect(requestBody.negative_prompt).toBe('blurry');
      expect(requestBody.quality).toBe('hd');
    });
    
    it('should return formatted result', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          data: [{ url: 'https://example.com/image.png' }]
        })
      });
      
      const result = await client.generateImage({
        prompt: 'Test',
        model: 'dall-e-3'
      });
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('image');
      expect(result.provider).toBe('openrouter');
      expect(result.model).toBe('dall-e-3');
      expect(result.images).toHaveLength(1);
      expect(result.images[0]).toBe('https://example.com/image.png');
      expect(result.cost).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });
  
  describe('generateText', () => {
    it('should construct correct request parameters', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          choices: [{
            message: { content: 'Generated text response' }
          }],
          usage: { total_tokens: 150 }
        })
      });
      
      const result = await client.generateText({
        prompt: 'Write a story',
        model: 'gpt-4',
        maxTokens: 500,
        temperature: 0.8,
        systemPrompt: 'You are a creative writer'
      });
      
      const callArgs = global.fetch.mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);
      
      expect(requestBody.model).toBe('gpt-4');
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].role).toBe('user');
      expect(requestBody.max_tokens).toBe(500);
      expect(requestBody.temperature).toBe(0.8);
    });
    
    it('should return formatted result', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-id',
          choices: [{
            message: { content: 'Generated text' }
          }],
          usage: { total_tokens: 100 }
        })
      });
      
      const result = await client.generateText({
        prompt: 'Test',
        model: 'gpt-4'
      });
      
      expect(result.success).toBe(true);
      expect(result.type).toBe('text');
      expect(result.text).toBe('Generated text');
      expect(result.metadata.tokensUsed).toBe(100);
    });
  });
  
  describe('estimateCost', () => {
    it('should estimate image generation cost', async () => {
      const estimate = await client.estimateCost({
        type: 'image',
        model: 'dall-e-3',
        count: 2
      });
      
      expect(estimate.estimated).toBe(true);
      expect(estimate.cost).toBe('0.0800'); // 0.04 * 2
      expect(estimate.currency).toBe('USD');
      expect(estimate.breakdown.imagesCount).toBe(2);
    });
    
    it('should estimate text generation cost', async () => {
      const estimate = await client.estimateCost({
        type: 'text',
        model: 'gpt-4',
        prompt: 'This is a test prompt',
        maxTokens: 1000
      });
      
      expect(estimate.estimated).toBe(true);
      expect(parseFloat(estimate.cost)).toBeGreaterThan(0);
      expect(estimate.breakdown.totalTokens).toBeGreaterThan(0);
    });
    
    it('should return unavailable for unknown models', async () => {
      const estimate = await client.estimateCost({
        type: 'image',
        model: 'unknown-model'
      });
      
      expect(estimate.estimated).toBe(false);
      expect(estimate.message).toContain('not available');
    });
  });
  
  describe('Error Handling', () => {
    it('should validate required parameters', async () => {
      await expect(client.generateImage({})).rejects.toThrow('Missing required parameters');
    });
    
    it('should throw error for unsupported background removal', async () => {
      await expect(client.removeBackground({})).rejects.toThrow('not supported');
    });
  });
});
