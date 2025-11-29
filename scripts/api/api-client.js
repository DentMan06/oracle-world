/**
 * Base API Client for Oracle World
 * Abstract class that all provider clients extend
 */

import { MODULE_ID, ERROR_TYPES } from '../constants.js';

/**
 * Base API Client Class
 * All provider-specific clients should extend this class
 */
export default class BaseAPIClient {
  /**
   * @param {Object} config - Client configuration
   * @param {string} config.apiKey - API key for the provider
   * @param {string} config.baseURL - Base URL for API requests
   * @param {string} config.provider - Provider identifier
   */
  constructor(config) {
    if (this.constructor === BaseAPIClient) {
      throw new Error('BaseAPIClient is abstract and cannot be instantiated directly');
    }
    
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.provider = config.provider;
    this.timeout = config.timeout || 60000; // 60 second default timeout
  }
  
  /**
   * Generate an image
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Text prompt for generation
   * @param {string} params.model - Model to use
   * @param {number} params.width - Image width
   * @param {number} params.height - Image height
   * @param {string} params.negativePrompt - Negative prompt (optional)
   * @param {number} params.count - Number of images to generate
   * @returns {Promise<Object>} Generation result
   */
  async generateImage(params) {
    throw new Error('generateImage must be implemented by provider');
  }
  
  /**
   * Generate text
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - Text prompt
   * @param {string} params.model - Model to use
   * @param {number} params.maxTokens - Maximum tokens to generate
   * @param {number} params.temperature - Temperature for generation
   * @returns {Promise<Object>} Generation result
   */
  async generateText(params) {
    throw new Error('generateText must be implemented by provider');
  }
  
  /**
   * Generate speech from text
   * @param {Object} params - Generation parameters
   * @param {string} params.text - Text to convert to speech
   * @param {string} params.voice - Voice to use
   * @param {string} params.model - Model to use
   * @returns {Promise<Object>} Generation result
   */
  async generateSpeech(params) {
    throw new Error('generateSpeech must be implemented by provider');
  }
  
  /**
   * Remove background from image
   * @param {Object} params - Processing parameters
   * @param {string} params.imageData - Base64 encoded image data
   * @returns {Promise<Object>} Processing result
   */
  async removeBackground(params) {
    throw new Error('removeBackground must be implemented by provider');
  }
  
  /**
   * Transform an image
   * @param {Object} params - Transformation parameters
   * @param {string} params.imageData - Base64 encoded source image
   * @param {string} params.prompt - Transformation prompt
   * @param {string} params.mode - Transformation mode (sketch, style-transfer, etc.)
   * @returns {Promise<Object>} Transformation result
   */
  async transformImage(params) {
    throw new Error('transformImage must be implemented by provider');
  }
  
  /**
   * Estimate cost for a generation
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} Cost estimate
   */
  async estimateCost(params) {
    throw new Error('estimateCost must be implemented by provider');
  }
  
  /**
   * Make an HTTP request to the API
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request data
   * @param {Object} options - Request options
   * @param {string} options.method - HTTP method (default: POST)
   * @param {Object} options.headers - Additional headers
   * @param {number} options.retries - Number of retries (default: 3)
   * @returns {Promise<Object>} Response data
   * @protected
   */
  async _makeRequest(endpoint, data, options = {}) {
    const {
      method = 'POST',
      headers = {},
      retries = 3
    } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    
    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      ...headers
    };
    
    let lastError;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        console.log(`${MODULE_ID} | Making ${method} request to ${url} (attempt ${attempt + 1}/${retries + 1})`);
        console.log(`${MODULE_ID} | Request data:`, data);
        console.log(`${MODULE_ID} | Request headers:`, { ...requestHeaders, Authorization: 'Bearer ***' });
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          method,
          headers: requestHeaders,
          body: method !== 'GET' ? JSON.stringify(data) : undefined,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get('retry-after');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this._getExponentialBackoff(attempt);
          
          console.warn(`${MODULE_ID} | Rate limited. Retrying after ${delay}ms`);
          
          if (attempt < retries) {
            await this._sleep(delay);
            continue;
          }
          
          throw this._createError(ERROR_TYPES.RATE_LIMIT, 'Rate limit exceeded', {
            status: response.status,
            retryAfter
          });
        }
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 403) {
          throw this._createError(ERROR_TYPES.AUTH_ERROR, 'Authentication failed', {
            status: response.status
          });
        }
        
        // Handle other errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error?.message || errorData.message || response.statusText;
          console.error(`${MODULE_ID} | API error:`, {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw this._createError(ERROR_TYPES.GENERIC_ERROR, `API error: ${errorMessage}`, {
            status: response.status,
            data: errorData
          });
        }
        
        const responseData = await response.json();
        console.log(`${MODULE_ID} | Request successful`);
        
        return responseData;
        
      } catch (error) {
        lastError = error;
        
        // Don't retry on authentication errors
        if (error.type === ERROR_TYPES.AUTH_ERROR) {
          throw error;
        }
        
        // Don't retry on validation errors
        if (error.type === ERROR_TYPES.VALIDATION_ERROR) {
          throw error;
        }
        
        // Handle timeout
        if (error.name === 'AbortError') {
          console.warn(`${MODULE_ID} | Request timed out (attempt ${attempt + 1}/${retries + 1})`);
          
          if (attempt < retries) {
            await this._sleep(this._getExponentialBackoff(attempt));
            continue;
          }
          
          throw this._createError(ERROR_TYPES.NETWORK_ERROR, 'Request timed out', {
            timeout: this.timeout
          });
        }
        
        // Handle network errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error(`${MODULE_ID} | Network error (attempt ${attempt + 1}/${retries + 1}):`, error);
          console.error(`${MODULE_ID} | URL was: ${url}`);
          console.error(`${MODULE_ID} | Error details:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          
          if (attempt < retries) {
            await this._sleep(this._getExponentialBackoff(attempt));
            continue;
          }
          
          throw this._createError(ERROR_TYPES.NETWORK_ERROR, `Network error: ${error.message}`, {
            originalError: error.message,
            url: url
          });
        }
        
        // If it's already a formatted error, rethrow
        if (error.type) {
          throw error;
        }
        
        // For other errors, retry if we have attempts left
        if (attempt < retries) {
          console.warn(`${MODULE_ID} | Request failed, retrying... (attempt ${attempt + 1}/${retries + 1})`);
          await this._sleep(this._getExponentialBackoff(attempt));
          continue;
        }
      }
    }
    
    // If we've exhausted all retries, throw the last error
    throw lastError;
  }
  
  /**
   * Create a formatted error object
   * @param {string} type - Error type
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {Error} Formatted error
   * @protected
   */
  _createError(type, message, details = {}) {
    const error = new Error(message);
    error.type = type;
    error.provider = this.provider;
    error.details = details;
    return error;
  }
  
  /**
   * Calculate exponential backoff delay
   * @param {number} attempt - Attempt number
   * @returns {number} Delay in milliseconds
   * @protected
   */
  _getExponentialBackoff(attempt) {
    const baseDelay = 1000; // 1 second
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    // Add jitter
    return delay + Math.random() * 1000;
  }
  
  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   * @protected
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Validate required parameters
   * @param {Object} params - Parameters to validate
   * @param {Array<string>} required - Required parameter names
   * @throws {Error} If required parameters are missing
   * @protected
   */
  _validateParams(params, required) {
    const missing = required.filter(key => !params[key]);
    
    if (missing.length > 0) {
      throw this._createError(
        ERROR_TYPES.VALIDATION_ERROR,
        `Missing required parameters: ${missing.join(', ')}`,
        { missing }
      );
    }
  }
}
