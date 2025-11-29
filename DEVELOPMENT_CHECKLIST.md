# Development Checklist

## Before Adding a New Provider

When adding a new AI provider to Oracle World, you MUST update ALL of the following locations:

### 1. Constants (`scripts/constants.js`)
- [ ] Add provider to `PROVIDERS` object
- [ ] Add API key setting to `SETTINGS` object

### 2. API Client (`scripts/api/`)
- [ ] Create new provider client file (e.g., `replicate.js`)
- [ ] Implement required methods: `generateImage()`, `generateText()`, etc.
- [ ] Add error handling and validation

### 3. Provider Factory (`scripts/api/provider-factory.js`)
- [ ] Import the new provider client
- [ ] Add case to `create()` switch statement
- [ ] Add provider to `getAvailableProviders()` array

### 4. Settings (`scripts/utils/settings.js`)
- [ ] Add to `_registerApiKeys()` providers array (line ~40)
- [ ] Add to `_registerPreferences()` choices object (line ~75)
- [ ] Add to `hasAnyApiKey()` apiKeys array (line ~305)
- [ ] Add to `getConfiguredProviders()` providerKeys object (line ~320)
- [ ] Add to `_getDefaultValue()` defaults object (line ~280)

### 5. Testing
- [ ] Run `npm test tests/unit/settings.test.js` to verify consistency
- [ ] Test in Foundry VTT that API key field appears
- [ ] Test that provider appears in dropdown when API key is set
- [ ] Test actual generation with the provider

### 6. Documentation
- [ ] Update README.md with new provider
- [ ] Update SESSION_LOG.md with changes
- [ ] Add provider to module.json description if needed

## Pre-Release Checklist

Before creating a new release:

- [ ] Update version in `module.json`
- [ ] Update version in `scripts/module.js` (VERSION constant)
- [ ] Update download URL in `module.json`
- [ ] Run all tests
- [ ] Test in actual Foundry VTT instance
- [ ] Create clean zip file (no nested folders)
- [ ] Verify zip contents before uploading
- [ ] Create GitHub release with proper notes

## Common Mistakes to Avoid

1. **Forgetting helper methods**: Adding provider to registration but not to `hasAnyApiKey()`, `getConfiguredProviders()`, or `_getDefaultValue()`
2. **Version mismatch**: Updating `module.json` version but not `module.js` VERSION constant
3. **Nested zip folders**: Running zip from wrong directory creates nested structure
4. **Missing from choices**: Adding provider but not to default provider dropdown choices
5. **Cache issues**: Not incrementing version number causes Foundry to use cached code

## Debugging Steps

If a provider isn't showing up:

1. Check browser console for errors
2. Verify `Settings.register()` is called in `module.js`
3. Check that provider constant exists in `constants.js`
4. Verify API key setting is in `_registerApiKeys()`
5. Confirm provider is in ALL helper methods
6. Test with `game.settings.get('oracle-world', 'replicateApiKey')` in console
7. Check that provider factory can create the client
8. Verify version number was incremented

## Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test tests/unit/settings.test.js

# Run tests in watch mode
npm test -- --watch

# Check for provider consistency
grep -r "REPLICATE" scripts/
```
