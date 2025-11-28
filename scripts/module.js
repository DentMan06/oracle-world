/**
 * Oracle World - AI-Powered Content Generation for Foundry VTT
 * Main module entry point
 */

import { MODULE_ID, MODULE_NAME } from './constants.js';
import Settings from './utils/settings.js';
import QueueManager from './services/queue-manager.js';
import HistoryManager from './services/history-manager.js';
import TemplateManager from './services/template-manager.js';
import ActorIntegration from './integrations/actor-integration.js';
import ItemIntegration from './integrations/item-integration.js';
import SceneIntegration from './integrations/scene-integration.js';
import JournalIntegration from './integrations/journal-integration.js';

/**
 * Main Oracle World Module Class
 */
class OracleWorld {
  static ID = MODULE_ID;
  static NAME = MODULE_NAME;
  static VERSION = '1.0.0';
  
  /**
   * Initialize the module
   */
  static initialize() {
    console.log(`${MODULE_NAME} | Initializing module v${this.VERSION}`);
    
    // Register settings
    Settings.register();
    
    // Initialize services
    this.initializeServices();
    
    // Register integrations
    this.registerIntegrations();
    
    // Register UI components (will be implemented in later tasks)
    // this.registerDialogs();
    // this.registerSidebarTools();
    
    console.log(`${MODULE_NAME} | Initialization complete`);
  }
  
  /**
   * Called when Foundry is ready
   */
  static onReady() {
    console.log(`${MODULE_NAME} | Module ready`);
    
    // Verify compatibility
    this.verifyCompatibility();
    
    // Make module globally accessible
    game.oracleWorld = this;
  }
  
  /**
   * Verify Foundry VTT compatibility
   */
  static verifyCompatibility() {
    const foundryVersion = game.version || game.data.version;
    const majorVersion = parseInt(foundryVersion.split('.')[0]);
    
    if (majorVersion !== 13) {
      console.warn(
        `${MODULE_NAME} | This module is designed for Foundry VTT v13. ` +
        `Current version: ${foundryVersion}. Some features may not work correctly.`
      );
    } else {
      console.log(`${MODULE_NAME} | Foundry VTT v${foundryVersion} compatibility verified`);
    }
  }
  

  
  /**
   * Initialize services
   */
  static initializeServices() {
    this.queueManager = new QueueManager();
    this.historyManager = new HistoryManager();
    this.templateManager = new TemplateManager();
    
    console.log(`${MODULE_NAME} | Services initialized`);
  }
  
  /**
   * Register integrations
   */
  static registerIntegrations() {
    ActorIntegration.register();
    ItemIntegration.register();
    SceneIntegration.register();
    JournalIntegration.register();
    
    console.log(`${MODULE_NAME} | Integrations registered`);
  }
  
  /**
   * Register dialogs (placeholder for later tasks)
   */
  static registerDialogs() {
    // Will be implemented in later tasks
  }
  
  /**
   * Register sidebar tools (placeholder for later tasks)
   */
  static registerSidebarTools() {
    // Will be implemented in later tasks
  }
}

/**
 * Hook: Initialize module
 */
Hooks.once('init', () => {
  OracleWorld.initialize();
});

/**
 * Hook: Module ready
 */
Hooks.once('ready', () => {
  OracleWorld.onReady();
});

/**
 * Export for testing
 */
export default OracleWorld;
