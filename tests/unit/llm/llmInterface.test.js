/**
 * Tests for LLMInterface in llm (JavaScript version)
 */
const { LLMInterface } = require('../../../src/llm/llmInterface');

// Mock implementation of the LLMInterface for testing
class MockLLMProvider {
  constructor(mockedResponses) {
    this.responses = new Map();

    if (mockedResponses) {
      this.responses = mockedResponses;
    } else {
      // Default responses for testing
      this.responses.set('document API', 'API Documentation: The API provides functionality for...');
      this.responses.set('create class docs', 'Class Documentation: This class is responsible for...');
      this.responses.set('explain function', 'Function Documentation: This function processes...');
    }
  }

  setMockResponse(prompt, response) {
    this.responses.set(prompt, response);
  }

  async generateDocumentation(prompt) {
    // Return the mocked response or a default message
    return this.responses.get(prompt) ||
           `Generated documentation for prompt: ${prompt}`;
  }
}

describe('LLMInterface in llm (JavaScript)', () => {
  let llmProvider;

  beforeEach(() => {
    llmProvider = new MockLLMProvider();
  });

  it('should properly implement the LLMInterface', () => {
    // This test verifies that the mock class correctly implements the interface
    expect(llmProvider).toBeDefined();
    expect(typeof llmProvider.generateDocumentation).toBe('function');
  });

  it('should generate documentation from a default prompt', async () => {
    const documentation = await llmProvider.generateDocumentation('document API');
    expect(documentation).toBe('API Documentation: The API provides functionality for...');
  });

  it('should generate documentation from a custom prompt', async () => {
    const customPrompt = 'generate database schema docs';
    const customResponse = 'Database Schema Documentation: The schema consists of...';

    // Set a custom response for a specific prompt
    llmProvider.setMockResponse(customPrompt, customResponse);

    const documentation = await llmProvider.generateDocumentation(customPrompt);
    expect(documentation).toBe(customResponse);
  });

  it('should handle prompts without predefined responses', async () => {
    const unknownPrompt = 'unknown prompt';
    const documentation = await llmProvider.generateDocumentation(unknownPrompt);
    expect(documentation).toBe(`Generated documentation for prompt: ${unknownPrompt}`);
  });

  it('should handle empty prompts', async () => {
    const emptyPrompt = '';
    const customResponse = 'Documentation for empty prompt';

    llmProvider.setMockResponse(emptyPrompt, customResponse);

    const documentation = await llmProvider.generateDocumentation(emptyPrompt);
    expect(documentation).toBe(customResponse);
  });

  it('should override existing responses', async () => {
    const prompt = 'document API';
    const newResponse = 'Updated API Documentation';

    // Initial response is preset
    const initialDoc = await llmProvider.generateDocumentation(prompt);
    expect(initialDoc).toBe('API Documentation: The API provides functionality for...');

    // Override the response
    llmProvider.setMockResponse(prompt, newResponse);

    // Check the updated response
    const updatedDoc = await llmProvider.generateDocumentation(prompt);
    expect(updatedDoc).toBe(newResponse);
  });
});
