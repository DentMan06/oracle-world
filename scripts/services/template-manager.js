/**
 * Template Manager Service
 * Manages prompt templates
 */

import { MODULE_ID, SETTINGS } from '../constants.js';
import Settings from '../utils/settings.js';

export default class TemplateManager {
  constructor() {
    this.templates = new Map();
    this.loadDefaults();
    this.loadCustom();
  }
  
  loadDefaults() {
    const defaults = [
      {
        id: 'character-portrait',
        name: 'Character Portrait',
        prompt: 'A detailed portrait of {name}, {description}, fantasy art style, high quality',
        negativePrompt: 'blurry, low quality, distorted',
        category: 'actor',
        custom: false
      },
      {
        id: 'item-icon',
        name: 'Item Icon',
        prompt: '{name}, {description}, icon style, white background, centered',
        negativePrompt: 'character, person, landscape',
        category: 'item',
        custom: false
      },
      {
        id: 'scene-background',
        name: 'Scene Background',
        prompt: '{description}, detailed environment, atmospheric, high quality',
        negativePrompt: 'characters, people, text',
        category: 'scene',
        custom: false
      },
      {
        id: 'npc-description',
        name: 'NPC Description',
        prompt: 'Write a detailed description for an NPC named {name}. {description}',
        category: 'actor',
        custom: false
      },
      {
        id: 'item-flavor',
        name: 'Item Flavor Text',
        prompt: 'Write engaging flavor text for an item called {name}. {description}',
        category: 'item',
        custom: false
      }
    ];
    
    defaults.forEach(t => this.templates.set(t.id, t));
  }
  
  async loadCustom() {
    try {
      const custom = Settings.get(SETTINGS.CUSTOM_TEMPLATES);
      if (custom && Array.isArray(custom)) {
        custom.forEach(t => this.templates.set(t.id, t));
      }
    } catch (error) {
      console.error(`${MODULE_ID} | Error loading custom templates:`, error);
    }
  }
  
  get(id) {
    return this.templates.get(id);
  }
  
  getByCategory(category) {
    return Array.from(this.templates.values())
      .filter(t => t.category === category);
  }
  
  getAll() {
    return Array.from(this.templates.values());
  }
  
  async saveCustom(template) {
    const id = template.id || foundry.utils.randomID();
    template.id = id;
    template.custom = true;
    
    this.templates.set(id, template);
    await this._persistCustom();
    
    return id;
  }
  
  async deleteCustom(id) {
    const template = this.templates.get(id);
    if (template && template.custom) {
      this.templates.delete(id);
      await this._persistCustom();
    }
  }
  
  async _persistCustom() {
    try {
      const custom = Array.from(this.templates.values())
        .filter(t => t.custom);
      await Settings.set(SETTINGS.CUSTOM_TEMPLATES, custom);
    } catch (error) {
      console.error(`${MODULE_ID} | Error persisting custom templates:`, error);
    }
  }
  
  applyTemplate(templateId, context) {
    const template = this.get(templateId);
    if (!template) return null;
    
    let prompt = template.prompt;
    
    // Replace placeholders
    Object.keys(context).forEach(key => {
      const placeholder = `{${key}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), context[key] || '');
    });
    
    return {
      prompt,
      negativePrompt: template.negativePrompt
    };
  }
}
