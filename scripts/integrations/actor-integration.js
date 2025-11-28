/**
 * Actor Sheet Integration
 */

import { MODULE_ID } from '../constants.js';
import GenerationDialog from '../ui/generation-dialog.js';

export default class ActorIntegration {
  static register() {
    Hooks.on('getActorSheetHeaderButtons', this._addHeaderButton.bind(this));
    Hooks.on('getActorDirectoryEntryContext', this._addContextMenu.bind(this));
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
      name: 'Generate Portrait',
      icon: '<i class="fas fa-image"></i>',
      callback: li => {
        const actor = game.actors.get(li.data('documentId'));
        new GenerationDialog(actor, { type: 'image' }).render(true);
      }
    });
  }
}
