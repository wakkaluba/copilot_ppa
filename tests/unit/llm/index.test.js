/**
 * Tests for the LLM index module (JavaScript)
 */

const { describe, expect, it, jest } = require('@jest/globals');

// Mock the modules that are exported by src/llm/index.js
jest.mock('../../../src/llm/llm-provider');
jest.mock('../../../src/llm/ollama-provider');
jest.mock('../../../src/llm/lmstudio-provider');

describe('LLM Index (JavaScript)', () => {
  it('should export all components from llm-provider', () => {
    // Import the index module after mocking
    const llmIndex = require('../../../src/llm/index');
    const llmProvider = require('../../../src/llm/llm-provider');

    // Check that all exported properties from llm-provider are re-exported by index
    Object.keys(llmProvider).forEach(key => {
      expect(llmIndex).toHaveProperty(key);
      expect(llmIndex[key]).toBe(llmProvider[key]);
    });
  });

  it('should export all components from ollama-provider', () => {
    // Import the index module after mocking
    const llmIndex = require('../../../src/llm/index');
    const ollamaProvider = require('../../../src/llm/ollama-provider');

    // Check that all exported properties from ollama-provider are re-exported by index
    Object.keys(ollamaProvider).forEach(key => {
      expect(llmIndex).toHaveProperty(key);
      expect(llmIndex[key]).toBe(ollamaProvider[key]);
    });
  });

  it('should export all components from lmstudio-provider', () => {
    // Import the index module after mocking
    const llmIndex = require('../../../src/llm/index');
    const lmstudioProvider = require('../../../src/llm/lmstudio-provider');

    // Check that all exported properties from lmstudio-provider are re-exported by index
    Object.keys(lmstudioProvider).forEach(key => {
      expect(llmIndex).toHaveProperty(key);
      expect(llmIndex[key]).toBe(lmstudioProvider[key]);
    });
  });

  it('should handle importing specific interfaces and types', () => {
    // Direct import of key interfaces and types from the index
    const {
      ILLMProvider,
      ILLMRequestOptions,
      ILLMResponse,
      ILLMMessage,
      ILLMStreamEvent,
      HardwareSpecs,
      ILLMModelInfo
    } = require('../../../src/llm/index');

    // These should all be defined (not undefined)
    expect(ILLMProvider).toBeDefined();
    expect(ILLMRequestOptions).toBeDefined();
    expect(ILLMResponse).toBeDefined();
    expect(ILLMMessage).toBeDefined();
    expect(ILLMStreamEvent).toBeDefined();
    expect(HardwareSpecs).toBeDefined();
    expect(ILLMModelInfo).toBeDefined();
  });

  it('should correctly forward named exports', () => {
    // Create mock implementations for specific exports
    const mockLLMProvider = { id: 'test-provider', name: 'Test Provider' };

    // Replace the mocked modules with our controlled mock implementations
    jest.resetModules();
    jest.mock('../../../src/llm/llm-provider', () => ({
      ILLMProvider: mockLLMProvider
    }));

    // Re-import the index module with our new mocks
    const llmIndex = require('../../../src/llm/index');

    // Verify that our mock implementation is correctly exported through the index
    expect(llmIndex.ILLMProvider).toBe(mockLLMProvider);
    expect(llmIndex.ILLMProvider.id).toBe('test-provider');
    expect(llmIndex.ILLMProvider.name).toBe('Test Provider');
  });

  it('should handle JavaScript-specific module loading behaviors', () => {
    // Test CommonJS require caching behavior
    jest.resetModules();

    // First import
    const llmIndex1 = require('../../../src/llm/index');

    // Second import should return the same cached object
    const llmIndex2 = require('../../../src/llm/index');

    // Verify they are the same object instance
    expect(llmIndex1).toBe(llmIndex2);

    // Verify modifying one affects the other due to caching
    const testProperty = Symbol('test');
    llmIndex1[testProperty] = 'test value';
    expect(llmIndex2[testProperty]).toBe('test value');
  });

  it('should correctly expose provider classes', () => {
    // Create mock implementations for specific exports
    const mockOllamaProvider = class OllamaProvider {
      constructor() {
        this.name = 'OllamaProvider';
      }
    };
    const mockLMStudioProvider = class LMStudioProvider {
      constructor() {
        this.name = 'LMStudioProvider';
      }
    };

    // Replace the mocked modules with our controlled mock implementations
    jest.resetModules();
    jest.mock('../../../src/llm/ollama-provider', () => ({
      OllamaProvider: mockOllamaProvider
    }));
    jest.mock('../../../src/llm/lmstudio-provider', () => ({
      LMStudioProvider: mockLMStudioProvider
    }));

    // Re-import the index module with our new mocks
    const llmIndex = require('../../../src/llm/index');

    // Verify that our mock implementation is correctly exported through the index
    expect(llmIndex.OllamaProvider).toBe(mockOllamaProvider);
    expect(llmIndex.LMStudioProvider).toBe(mockLMStudioProvider);

    // Verify we can instantiate these classes (JavaScript-specific constructor test)
    const ollamaInstance = new llmIndex.OllamaProvider();
    const lmStudioInstance = new llmIndex.LMStudioProvider();

    expect(ollamaInstance.name).toBe('OllamaProvider');
    expect(lmStudioInstance.name).toBe('LMStudioProvider');
  });

  it('should handle JavaScript property dynamics and prototypes', () => {
    jest.resetModules();

    // Create a mock provider with prototype inheritance
    function MockProvider() {
      this.instanceProp = 'instance';
    }
    MockProvider.prototype.protoProp = 'prototype';

    // Register our mock
    jest.mock('../../../src/llm/ollama-provider', () => ({
      OllamaProvider: MockProvider
    }));

    // Import the index
    const llmIndex = require('../../../src/llm/index');

    // Create an instance and verify inheritance works
    const instance = new llmIndex.OllamaProvider();
    expect(instance.instanceProp).toBe('instance');
    expect(instance.protoProp).toBe('prototype');

    // Test prototype modifications after export
    llmIndex.OllamaProvider.prototype.newMethod = function() {
      return 'new method';
    };

    // This should affect new instances
    const instance2 = new llmIndex.OllamaProvider();
    expect(instance2.newMethod()).toBe('new method');

    // And existing instances
    expect(instance.newMethod()).toBe('new method');
  });
});
