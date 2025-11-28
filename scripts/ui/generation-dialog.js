/**
 * Generation Dialog
 * Main UI for AI content generation
 */

import { MODULE_ID, GENERATION_TYPES } from '../constants.js';
import ProviderFactory from '../api/provider-factory.js';
import CostEstimator from '../services/cost-estimator.js';

export default class GenerationDialog extends Application {
  constructor(context, options = {}) {
    super(options);
    this.context = context;
    this.generationType = options.type || GENERATION_TYPES.IMAGE;
    this.provider = null;
    this.model = null;
    this.result = null;
  }
  
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: 'oracle-world-generation',
      title: 'Oracle World - Generate Content',
      template: `modules/${MODULE_ID}/templates/generation-dialog.hbs`,
      width: 800,
      height: 600,
      classes: [MODULE_ID, 'generation-dialog'],
      resizable: true
    });
  }
  
  getData() {
    const providers = ProviderFactory.getAvailableProviders();
    const templates = game.oracleWorld.templateManager
      .getByCategory(this.context.documentName.toLowerCase());
    
    // Auto-select first provider if none selected
    if (!this.provider && providers.length > 0) {
      this.provider = providers[0].id;
    }
    
    let models = [];
    if (this.provider) {
      try {
        const client = ProviderFactory.create(this.provider);
        if (client.getAvailableModels) {
          models = client.getAvailableModels(this.generationType);
          // Auto-select first model if none selected
          if (!this.model && models.length > 0) {
            this.model = models[0].id;
          }
        }
      } catch (error) {
        console.warn(`${MODULE_ID} | Could not get models for ${this.provider}:`, error);
      }
    }
    
    return {
      context: this.context,
      type: this.generationType,
      providers,
      models,
      templates,
      currentProvider: this.provider,
      currentModel: this.model,
      result: this.result,
      hasResult: !!this.result,
      prompt: this._getDefaultPrompt()
    };
  }
  
  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('[name="provider"]').change(this._onProviderChange.bind(this));
    html.find('[name="model"]').change(this._onModelChange.bind(this));
    html.find('[name="template"]').change(this._onTemplateChange.bind(this));
    html.find('[name="prompt"]').on('input', this._onPromptChange.bind(this));
    html.find('.generate-btn').click(this._onGenerate.bind(this));
    html.find('.apply-btn').click(this._onApply.bind(this));
    html.find('.save-btn').click(this._onSave.bind(this));
    html.find('.close-btn').click(() => this.close());
  }
  
  async _onProviderChange(event) {
    this.provider = event.target.value;
    await this._updateModels();
    this.render();
  }
  
  async _onModelChange(event) {
    this.model = event.target.value;
    await this._updateCostEstimate();
  }
  
  async _onTemplateChange(event) {
    const templateId = event.target.value;
    if (!templateId) return;
    
    const applied = game.oracleWorld.templateManager.applyTemplate(templateId, {
      name: this.context.name,
      description: this.context.system?.description || ''
    });
    
    if (applied) {
      this.element.find('[name="prompt"]').val(applied.prompt);
      if (applied.negativePrompt) {
        this.element.find('[name="negativePrompt"]').val(applied.negativePrompt);
      }
      await this._updateCostEstimate();
    }
  }
  
  async _onPromptChange() {
    await this._updateCostEstimate();
  }
  
  async _onGenerate(event) {
    event.preventDefault();
    
    const formData = new FormData(this.element.find('form')[0]);
    const params = this._buildGenerationParams(formData);
    
    try {
      ui.notifications.info('Generating...');
      this.element.find('.generate-btn').prop('disabled', true);
      
      const client = ProviderFactory.create(this.provider);
      const result = await game.oracleWorld.queueManager.enqueue({
        provider: this.provider,
        execute: () => client.generateImage(params)
      });
      
      this.result = result;
      
      await game.oracleWorld.historyManager.save({
        type: this.generationType,
        provider: this.provider,
        model: this.model,
        prompt: params.prompt,
        result: result,
        cost: result.cost
      });
      
      ui.notifications.info('Generation complete!');
      this.render();
      
    } catch (error) {
      console.error(`${MODULE_ID} | Generation failed:`, error);
      ui.notifications.error(`Generation failed: ${error.message}`);
    } finally {
      this.element.find('.generate-btn').prop('disabled', false);
    }
  }
  
  async _onApply(event) {
    if (!this.result) return;
    
    try {
      await this._applyToDocument(this.result);
      ui.notifications.info('Applied successfully!');
      this.close();
    } catch (error) {
      console.error(`${MODULE_ID} | Apply failed:`, error);
      ui.notifications.error(`Failed to apply: ${error.message}`);
    }
  }
  
  async _onSave(event) {
    if (!this.result) return;
    ui.notifications.info('Saved to gallery!');
  }
  
  async _applyToDocument(result) {
    if (!result.images || result.images.length === 0) return;
    
    const ImageStorage = (await import('../services/image-storage.js')).default;
    const imagePath = await ImageStorage.saveFromURL(result.images[0], {
      prefix: this.context.documentName.toLowerCase(),
      name: this.context.name
    });
    
    if (this.context.documentName === 'Actor') {
      await this.context.update({ img: imagePath });
    } else if (this.context.documentName === 'Item') {
      await this.context.update({ img: imagePath });
    } else if (this.context.documentName === 'Scene') {
      await this.context.update({ background: { src: imagePath } });
    }
  }
  
  _buildGenerationParams(formData) {
    return {
      prompt: formData.get('prompt'),
      negativePrompt: formData.get('negativePrompt'),
      model: this.model,
      width: parseInt(formData.get('width')) || 1024,
      height: parseInt(formData.get('height')) || 1024,
      count: parseInt(formData.get('count')) || 1,
      type: this.generationType
    };
  }
  
  async _updateModels() {
    // Reset model selection when provider changes
    this.model = null;
    
    // Get models for the selected provider
    if (this.provider) {
      try {
        const client = ProviderFactory.create(this.provider);
        if (client.getAvailableModels) {
          const models = client.getAvailableModels(this.generationType);
          // Auto-select first model if available
          if (models.length > 0) {
            this.model = models[0].id;
          }
        }
      } catch (error) {
        console.warn(`${MODULE_ID} | Could not get models for ${this.provider}:`, error);
      }
    }
  }
  
  async _updateCostEstimate() {
    const formData = new FormData(this.element.find('form')[0]);
    const params = this._buildGenerationParams(formData);
    
    if (!this.provider || !this.model) return;
    
    const estimate = await CostEstimator.estimate(this.provider, this.model, params);
    
    if (estimate.estimated) {
      this.element.find('.cost-value').text(`$${estimate.cost}`);
    } else {
      this.element.find('.cost-value').text('N/A');
    }
  }
  
  _getDefaultPrompt() {
    return `A detailed image of ${this.context.name}`;
  }
}
