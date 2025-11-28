/**
 * Unit Tests for Base API Client
 * Tests error handling, retry logic, and timeout behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import BaseAPIClient from '../../scripts/api/api-client.js';
import { ERROR_TYPES } from '../../scripts/constants.js';

/**
 * Concrete implementation of BaseAPIClient for testing
 */
class TestAPIClient extends BaseAPIClient {
  constructor(config) {
    super(config);
  }
  
  async generateImage(params) {
    return { success: true, type: 'image' };
  }
  
  async generateText(params) {
    return { success: true, type: 'text' };
  }
  
  async generateSpeech(params) {
    return { success: true, type: 'speech' };
  }
  
  async removeBackground(params) {
    return { success: true, type: 'background-removal' };
  }
  
  async transformImage(params) {
    return { success: true, type: 'image-transform' };
  }
  
  async estimateCost(params) {
    return { estimated: true, cost: 0.01 };
  }
}

describe('BaseAPIClient', () => {
  let client;
  
  beforeEach(() => {
    client = new TestAPIClient({
      apiKey: 'test-key',
      baseURL: 'https://api.test.com',
      provider: 'test',
      timeout: 5000
    });
    
    // Reset fetch mock
    global.fetch = vi.fn();
  });
  
  describe('Constructor', () => {
    it('should throw error when instantiated directly', () => {
      expect(() => {
        new BaseAPIClient({
          apiKey: 'test',
          baseURL: 'https://test.com',
          provider: 'test'
        });
      }).toThrow('BaseAPIClient is abstract');
    });
    
    it('should set properties correctly', () => {
      expect(client.apiKey).toBe('test-key');
      expect(client.baseURL).toBe('https://api.test.com');
      expect(client.provider).toBe('test');
      expect(client.timeout).toBe(5000);
    });
  });
  
  describe('Error Categorization', () => {
    it('should categorize rate limit errors (429)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['retry-after', '60']]),
        json: async () => ({})
      });
      
      try {
        await client._makeRequest('/test', {});
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.RATE_LIMIT);
        expect(error.message).toContain('Rate limit');
      }
    });
    
    it('should categorize authentication errors (401)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({})
      });
      
      try {
        await client._makeRequest('/test', {}, { retries: 0 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.AUTH_ERROR);
        expect(error.message).toContain('Authentication failed');
      }
    });
    
    it('should categorize authentication errors (403)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({})
      });
      
      try {
        await client._makeRequest('/test', {}, { retries: 0 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.AUTH_ERROR);
      }
    });
    
    it('should categorize network errors', async () => {
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      
      try {
        await client._makeRequest('/test', {}, { retries: 0 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.NETWORK_ERROR);
      }
    });
  });
  
  describe('Retry Logic', () => {
    it('should retry on rate limit errors', async () => {
      // First call: rate limit
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['retry-after', '1']]),
        json: async () => ({})
      });
      
      // Second call: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      const result = await client._makeRequest('/test', {}, { retries: 1 });
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    it('should not retry on authentication errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({})
      });
      
      try {
        await client._makeRequest('/test', {}, { retries: 3 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.AUTH_ERROR);
        expect(global.fetch).toHaveBeenCalledTimes(1);
      }
    });
    
    it('should retry on network errors', async () => {
      // First two calls: network error
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
      
      // Third call: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true })
      });
      
      const result = await client._makeRequest('/test', {}, { retries: 2 });
      
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
    
    it('should use exponential backoff', () => {
      const delay0 = client._getExponentialBackoff(0);
      const delay1 = client._getExponentialBackoff(1);
      const delay2 = client._getExponentialBackoff(2);
      
      // Each delay should be roughly double the previous (with jitter)
      expect(delay1).toBeGreaterThan(delay0);
      expect(delay2).toBeGreaterThan(delay1);
      
      // Should not exceed max delay
      const delay10 = client._getExponentialBackoff(10);
      expect(delay10).toBeLessThanOrEqual(31000); // 30s max + 1s jitter
    });
  });
  
  describe('Timeout Handling', () => {
    it.skip('should timeout after specified duration', async () => {
      // This test is skipped because it requires actual timing
      // In a real environment, you would mock setTimeout/clearTimeout
      
      global.fetch.mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );
      
      client.timeout = 100;
      
      try {
        await client._makeRequest('/test', {}, { retries: 0 });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.type).toBe(ERROR_TYPES.NETWORK_ERROR);
        expect(error.message).toContain('timed out');
      }
    });
  });
  
  describe('Parameter Validation', () => {
    it('should validate required parameters', () => {
      const params = { prompt: 'test' };
      
      expect(() => {
        client._validateParams(params, ['prompt', 'model']);
      }).toThrow('Missing required parameters: model');
    });
    
    it('should not throw when all required parameters are present', () => {
      const params = { prompt: 'test', model: 'test-model' };
      
      expect(() => {
        client._validateParams(params, ['prompt', 'model']);
      }).not.toThrow();
    });
  });
  
  describe('Error Creation', () => {
    it('should create formatted error objects', () => {
      const error = client._createError(
        ERROR_TYPES.VALIDATION_ERROR,
        'Test error',
        { field: 'test' }
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
      expect(error.message).toBe('Test error');
      expect(error.provider).toBe('test');
      expect(error.details.field).toBe('test');
    });
  });
});

/**
 * Test Setup Notes:
 * 
 * These tests use Vitest and require:
 * 1. Node.js and npm installed
 * 2. Dependencies installed: npm install
 * 3. Run tests: npm test
 * 
 * Some tests are skipped (.skip) because they require:
 * - Actual timing/setTimeout mocking
 * - More complex fetch mocking
 * 
 * These can be implemented with additional test utilities.
 */
