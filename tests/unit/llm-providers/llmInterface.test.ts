/**
 * Tests for LLMInterface in llm-providers
 */
import { LLMInterface } from '../../../src/llm/llmInterface';

describe('LLMInterface', () => {
  // Create a mock implementation of the LLMInterface
  class MockLLMProvider implements LLMInterface {
    async generateDocumentation(prompt: string): Promise<string> {
      // Simple mock implementation
      if (!prompt) {
        return 'No documentation generated for empty prompt';
      }
      return `Documentation for: ${prompt}`;
    }
  }

  let mockProvider: LLMInterface;

  beforeEach(() => {
    mockProvider = new MockLLMProvider();
  });

  test('should be properly implemented by a provider class', () => {
    // Verify that the implementation has the required method
    expect(mockProvider).toHaveProperty('generateDocumentation');
    expect(typeof mockProvider.generateDocumentation).toBe('function');
  });

  test('should return a Promise that resolves to a string', async () => {
    const result = mockProvider.generateDocumentation('Test prompt');
    expect(result).toBeInstanceOf(Promise);

    const docString = await result;
    expect(typeof docString).toBe('string');
  });

  test('should handle empty inputs', async () => {
    const result = await mockProvider.generateDocumentation('');
    expect(result).toBe('No documentation generated for empty prompt');
  });

  test('should handle long prompts', async () => {
    const longPrompt = 'A very long prompt '.repeat(100);
    const result = await mockProvider.generateDocumentation(longPrompt);
    expect(result).toContain('Documentation for:');
    expect(result.length).toBeGreaterThan(longPrompt.length / 2);
  });
});
