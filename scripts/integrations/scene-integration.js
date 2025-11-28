/**
 * Scene Integration
 */

import GenerationDialog from '../ui/generation-dialog.js';

export default class SceneIntegration {
  static register() {
    Hooks.on('getSceneDirectoryEntryContext', this._addContextMenu.bind(this));
  }
  
  static _addContextMenu(html, options) {
    if (!game.user.isGM) return;
    
    options.push({
      name: 'Generate Background',
      icon: '<i class="fas fa-image"></i>',
      callback: li => {
        const scene = game.scenes.get(li.data('documentId'));
        new GenerationDialog(scene, { type: 'image' }).render(true);
      }
    });
  }
}
