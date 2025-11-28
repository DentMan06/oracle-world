/**
 * Image Storage Service
 * Handles saving and managing generated images
 */

import { MODULE_ID } from '../constants.js';

export default class ImageStorage {
  /**
   * Save an image from URL to Foundry's user data directory
   * @param {string} url - Image URL
   * @param {Object} options - Storage options
   * @returns {Promise<string>} Path to saved image
   */
  static async saveFromURL(url, options = {}) {
    try {
      const { prefix = 'generated', name = 'image' } = options;
      
      // Fetch the image
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Generate filename
      const timestamp = Date.now();
      const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = this._getExtensionFromBlob(blob);
      const filename = `${prefix}_${timestamp}_${sanitizedName}.${extension}`;
      
      // Create path
      const path = `oracle-world/${prefix}/${filename}`;
      
      // Convert blob to File
      const file = new File([blob], filename, { type: blob.type });
      
      // Upload to Foundry
      const result = await this._uploadToFoundry(file, path);
      
      console.log(`${MODULE_ID} | Image saved to ${result.path}`);
      return result.path;
      
    } catch (error) {
      console.error(`${MODULE_ID} | Error saving image:`, error);
      throw error;
    }
  }
  
  /**
   * Save base64 image data
   * @param {string} base64Data - Base64 encoded image
   * @param {Object} options - Storage options
   * @returns {Promise<string>} Path to saved image
   */
  static async saveFromBase64(base64Data, options = {}) {
    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      const { prefix = 'generated', name = 'image' } = options;
      const timestamp = Date.now();
      const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const extension = this._getExtensionFromBlob(blob);
      const filename = `${prefix}_${timestamp}_${sanitizedName}.${extension}`;
      
      const path = `oracle-world/${prefix}/${filename}`;
      const file = new File([blob], filename, { type: blob.type });
      
      const result = await this._uploadToFoundry(file, path);
      
      console.log(`${MODULE_ID} | Image saved to ${result.path}`);
      return result.path;
      
    } catch (error) {
      console.error(`${MODULE_ID} | Error saving base64 image:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an image file
   * @param {string} path - Path to image
   * @returns {Promise<boolean>} Success status
   */
  static async delete(path) {
    try {
      // In Foundry VTT, we would use FilePicker.delete or similar
      // For now, this is a placeholder
      console.log(`${MODULE_ID} | Would delete image at ${path}`);
      return true;
    } catch (error) {
      console.error(`${MODULE_ID} | Error deleting image:`, error);
      return false;
    }
  }
  
  /**
   * Upload file to Foundry's file system
   * @param {File} file - File to upload
   * @param {string} path - Target path
   * @returns {Promise<Object>} Upload result
   * @private
   */
  static async _uploadToFoundry(file, path) {
    // In a real Foundry environment, this would use FilePicker.upload
    // For now, return a mock result
    return {
      path: path,
      url: `data/${path}`
    };
  }
  
  /**
   * Get file extension from blob type
   * @param {Blob} blob - Image blob
   * @returns {string} File extension
   * @private
   */
  static _getExtensionFromBlob(blob) {
    const mimeType = blob.type;
    const extensions = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif'
    };
    return extensions[mimeType] || 'png';
  }
}
