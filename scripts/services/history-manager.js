/**
 * History Manager Service
 * Manages generation history storage and retrieval
 */

import { MODULE_ID, SETTINGS } from '../constants.js';
import Settings from '../utils/settings.js';

export default class HistoryManager {
  constructor() {
    this.history = [];
    this.load();
  }
  
  async save(generation) {
    const entry = {
      id: foundry.utils.randomID(),
      type: generation.type,
      provider: generation.provider,
      model: generation.model,
      prompt: generation.prompt,
      result: generation.result,
      cost: generation.cost,
      timestamp: Date.now(),
      favorite: false,
      tags: generation.tags || []
    };
    
    this.history.unshift(entry);
    await this._persist();
    
    return entry;
  }
  
  async delete(id) {
    const index = this.history.findIndex(h => h.id === id);
    if (index !== -1) {
      this.history.splice(index, 1);
      await this._persist();
    }
  }
  
  async toggleFavorite(id) {
    const entry = this.history.find(h => h.id === id);
    if (entry) {
      entry.favorite = !entry.favorite;
      await this._persist();
    }
  }
  
  filter(criteria) {
    return this.history.filter(entry => {
      if (criteria.type && entry.type !== criteria.type) return false;
      if (criteria.favorite && !entry.favorite) return false;
      if (criteria.provider && entry.provider !== criteria.provider) return false;
      if (criteria.tags && !criteria.tags.some(t => entry.tags.includes(t))) return false;
      return true;
    });
  }
  
  get(id) {
    return this.history.find(h => h.id === id);
  }
  
  getAll() {
    return [...this.history];
  }
  
  async load() {
    try {
      const data = Settings.get(SETTINGS.GENERATION_HISTORY);
      this.history = data || [];
    } catch (error) {
      console.error(`${MODULE_ID} | Error loading history:`, error);
      this.history = [];
    }
  }
  
  async _persist() {
    try {
      await Settings.set(SETTINGS.GENERATION_HISTORY, this.history);
    } catch (error) {
      console.error(`${MODULE_ID} | Error persisting history:`, error);
    }
  }
  
  async clear() {
    this.history = [];
    await this._persist();
  }
}
