/**
 * Queue Manager Service
 * Handles request queuing and rate limiting
 */

import { MODULE_ID, ERROR_TYPES } from '../constants.js';

export default class QueueManager {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.rateLimits = new Map();
  }
  
  async enqueue(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        request,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this._processQueue();
    });
  }
  
  async _processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    const item = this.queue.shift();
    
    try {
      await this._checkRateLimit(item.request.provider);
      const result = await item.request.execute();
      this._updateRateLimit(item.request.provider);
      item.resolve(result);
    } catch (error) {
      if (this._isRateLimitError(error)) {
        this.queue.unshift(item);
        await this._waitForRateLimit(item.request.provider);
      } else {
        item.reject(error);
      }
    } finally {
      this.processing = false;
      this._processQueue();
    }
  }
  
  async _checkRateLimit(provider) {
    const limit = this.rateLimits.get(provider);
    if (limit && Date.now() < limit.resetTime) {
      const waitTime = limit.resetTime - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  _updateRateLimit(provider) {
    const now = Date.now();
    const limit = this.rateLimits.get(provider) || { count: 0, resetTime: now + 60000 };
    
    if (now >= limit.resetTime) {
      this.rateLimits.set(provider, { count: 1, resetTime: now + 60000 });
    } else {
      limit.count++;
      this.rateLimits.set(provider, limit);
    }
  }
  
  _isRateLimitError(error) {
    return error.type === ERROR_TYPES.RATE_LIMIT;
  }
  
  async _waitForRateLimit(provider) {
    const limit = this.rateLimits.get(provider);
    if (limit) {
      const waitTime = Math.max(0, limit.resetTime - Date.now());
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  getQueueLength() {
    return this.queue.length;
  }
}
