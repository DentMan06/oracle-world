/**
 * Journal Integration
 */

import GenerationDialog from '../ui/generation-dialog.js';

export default class JournalIntegration {
  static register() {
    Hooks.on('getJournalDirectoryEntryContext', this._addContextMenu.bind(this));
  }
  
  static _addContextMenu(html, options) {
    if (!game.user.isGM) return;
    
    options.push({
      name: 'Generate Text',
      icon: '<i class="fas fa-file-text"></i>',
      callback: li => {
        const journal = game.journal.get(li.data('documentId'));
        new GenerationDialog(journal, { type: 'text' }).render(true);
      }
    });
  }
}
