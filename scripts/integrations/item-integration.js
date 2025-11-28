/**
 * Item Sheet Integration
 */

import GenerationDialog from '../ui/generation-dialog.js';

export default class ItemIntegration {
  static register() {
    Hooks.on('getItemSheetHeaderButtons', this._addHeaderButton.bind(this));
    Hooks.on('getItemDirectoryEntryContext', this._addContextMenu.bind(this));
  }
  
  static _addHeaderButton(app, buttons) {
    if (!game.user.isGM) return;
    
    buttons.unshift({
      label: 'Generate',
      class: 'oracle-world-generate',
      icon: 'fas fa-wand-magic-sparkles',
      onclick: () => {
        new GenerationDialog(app.object, { type: 'image' }).render(true);
      }
    });
  }
  
  static _addContextMenu(html, options) {
    if (!game.user.isGM) return;
    
    options.push({
      name: 'Generate Icon',
      icon: '<i class="fas fa-image"></i>',
      callback: li => {
        const item = game.items.get(li.data('documentId'));
        new GenerationDialog(item, { type: 'image' }).render(true);
      }
    });
  }
}
