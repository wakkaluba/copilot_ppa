/**
 * Tests for the LLM index module (TypeScript)
 */

import { describe, expect, it, jest } from '@jest/globals';

// Mock the modules that are exported by src/llm/index.ts
jest.mock('../../../src/llm/llm-provider');
jest.mock('../../../src/llm/ollama-provider');
jest.mock('../../../src/llm/lmstudio-provider');

describe('LLM Index (TypeScript)', () => {
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

  it('should correctly expose provider classes', () => {
    // Create mock implementations for specific exports
    const mockOllamaProvider = class OllamaProvider {};
    const mockLMStudioProvider = class LMStudioProvider {};

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

    // Verify we can instantiate these classes
    expect(() => new llmIndex.OllamaProvider()).not.toThrow();
    expect(() => new llmIndex.LMStudioProvider()).not.toThrow();
  });
});
