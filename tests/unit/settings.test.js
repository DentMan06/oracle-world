/**
 * Settings Tests
 * Comprehensive tests to ensure all providers are properly registered
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SETTINGS, PROVIDERS } from '../../scripts/constants.js';

// Mock game.settings
global.game = {
  settings: {
    register: vi.fn(),
    get: vi.fn(),
    set: vi.fn()
  }
};

describe('Settings Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Consistency', () => {
    it('should have all providers defined in PROVIDERS constant', () => {
      const expectedProviders = [
        'openrouter',
        'openai',
        'anthropic',
        'deepseek',
        'midjourney',
        'stable-diffusion',
        'gemini',
        'replicate'
      ];

      const actualProviders = Object.values(PROVIDERS);
      
      expectedProviders.forEach(provider => {
        expect(actualProviders).toContain(provider);
      });
    });

    it('should have API key settings for all providers', () => {
      const expectedKeys = [
        'openrouterApiKey',
        'openaiApiKey',
        'anthropicApiKey',
        'deepseekApiKey',
        'midjourneyApiKey',
        'stableDiffusionApiKey',
        'geminiApiKey',
        'replicateApiKey'
      ];

      const actualKeys = Object.values(SETTINGS).filter(key => key.includes('ApiKey'));
      
      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });
  });

  describe('Settings Helper Methods', () => {
    it('hasAnyApiKey should check ALL provider API keys', async () => {
      // Import Settings dynamically to avoid module initialization issues
      const { default: Settings } = await import('../../scripts/utils/settings.js');
      
      // Get the source code of hasAnyApiKey
      const methodSource = Settings.hasAnyApiKey.toString();
      
      // Check that all API key constants are referenced
      const requiredKeys = [
        'OPENROUTER_API_KEY',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'DEEPSEEK_API_KEY',
        'MIDJOURNEY_API_KEY',
        'STABLE_DIFFUSION_API_KEY',
        'GEMINI_API_KEY',
        'REPLICATE_API_KEY'
      ];

      requiredKeys.forEach(key => {
        expect(methodSource).toContain(key);
      });
    });

    it('getConfiguredProviders should include ALL providers', async () => {
      const { default: Settings } = await import('../../scripts/utils/settings.js');
      
      const methodSource = Settings.getConfiguredProviders.toString();
      
      const requiredProviders = [
        'OPENROUTER',
        'OPENAI',
        'ANTHROPIC',
        'DEEPSEEK',
        'MIDJOURNEY',
        'STABLE_DIFFUSION',
        'GEMINI',
        'REPLICATE'
      ];

      requiredProviders.forEach(provider => {
        expect(methodSource).toContain(`PROVIDERS.${provider}`);
      });
    });

    it('_getDefaultValue should have defaults for ALL API keys', async () => {
      const { default: Settings } = await import('../../scripts/utils/settings.js');
      
      const methodSource = Settings._getDefaultValue.toString();
      
      const requiredKeys = [
        'OPENROUTER_API_KEY',
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'DEEPSEEK_API_KEY',
        'MIDJOURNEY_API_KEY',
        'STABLE_DIFFUSION_API_KEY',
        'GEMINI_API_KEY',
        'REPLICATE_API_KEY'
      ];

      requiredKeys.forEach(key => {
        expect(methodSource).toContain(key);
      });
    });

    it('default provider choices should include ALL providers', async () => {
      const { default: Settings } = await import('../../scripts/utils/settings.js');
      
      const methodSource = Settings._registerPreferences.toString();
      
      const requiredProviders = [
        'OPENROUTER',
        'OPENAI',
        'ANTHROPIC',
        'DEEPSEEK',
        'MIDJOURNEY',
        'STABLE_DIFFUSION',
        'GEMINI',
        'REPLICATE'
      ];

      requiredProviders.forEach(provider => {
        expect(methodSource).toContain(`PROVIDERS.${provider}`);
      });
    });
  });

  describe('Provider Parity Check', () => {
    it('should have the same number of providers in all relevant places', async () => {
      const { default: Settings } = await import('../../scripts/utils/settings.js');
      
      // Count providers in different methods
      const hasAnyApiKeySource = Settings.hasAnyApiKey.toString();
      const getConfiguredProvidersSource = Settings.getConfiguredProviders.toString();
      const getDefaultValueSource = Settings._getDefaultValue.toString();
      
      // Count API key references (should be 8 for each)
      const countApiKeys = (source) => {
        return (source.match(/API_KEY/g) || []).length;
      };

      const hasAnyCount = countApiKeys(hasAnyApiKeySource);
      const configuredCount = countApiKeys(getConfiguredProvidersSource);
      const defaultsCount = countApiKeys(getDefaultValueSource);

      // All should have the same count
      expect(hasAnyCount).toBe(configuredCount);
      expect(configuredCount).toBe(defaultsCount);
      expect(hasAnyCount).toBeGreaterThanOrEqual(8); // At least 8 providers
    });
  });
});
