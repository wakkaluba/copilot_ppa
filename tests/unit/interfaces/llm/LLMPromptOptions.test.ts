/**
 * Tests for the LLMPromptOptions interface
 */
import { SupportedLanguage } from '../../../../src/i18n';

// Import the interface. Since it's declared in the multilingualPromptManager.ts file
// but not exported, we'll recreate the interface for testing purposes
// Assuming LLMPromptOptions is now exported from a types file, e.g., ../../src/llm/types
// If not, keep the recreated interface. Let's assume it's exported for now.
import { LLMPromptOptions } from '../../../../src/llm/types'; // Adjust path if needed

describe('LLMPromptOptions interface', () => {
  it('should create a valid empty options object', () => {
    const options: LLMPromptOptions = {};

    expect(options).toBeDefined();
  });

  it('should create a valid options object with temperature', () => {
    const options: LLMPromptOptions = {
      temperature: 0.8
    };

    expect(options).toBeDefined();
    expect(options.temperature).toBe(0.8);
  });

  it('should create a valid options object with maxTokens', () => {
    const options: LLMPromptOptions = {
      maxTokens: 1500
    };

    expect(options).toBeDefined();
    expect(options.maxTokens).toBe(1500);
  });

  it('should create a valid options object with all properties', () => {
    const options: LLMPromptOptions = {
      temperature: 0.6,
      maxTokens: 2500
    };

    expect(options).toBeDefined();
    expect(options.temperature).toBe(0.6);
    expect(options.maxTokens).toBe(2500);
  });

  it('should work with the enhanced prompt function', () => {
    // This is a simulation of how LLMPromptOptions would be used with the enhancePromptWithLanguage function
    const mockEnhancePrompt = (
      prompt: string,
      targetLanguage?: SupportedLanguage,
      options?: LLMPromptOptions
    ): string => {
      // Simulate enhancing the prompt based on options
      let enhancedPrompt = prompt;

      if (targetLanguage) {
          enhancedPrompt += ` (Lang: ${targetLanguage})`;
      }

      if (options?.temperature) {
        enhancedPrompt += ` (Temperature: ${options.temperature})`;
      }

      if (options?.maxTokens) {
        enhancedPrompt += ` (Max Tokens: ${options.maxTokens})`;
      }

      return enhancedPrompt;
    };

    const prompt = 'Translate this text';
    const options: LLMPromptOptions = {
      temperature: 0.7,
      maxTokens: 1000
    };

    const enhancedPrompt = mockEnhancePrompt(prompt, SupportedLanguage.German, options);

    expect(enhancedPrompt).toBe('Translate this text (Lang: de) (Temperature: 0.7) (Max Tokens: 1000)');
  });
});

// Helper function to create prompt options for testing
export function createTestPromptOptions(overrides?: Partial<LLMPromptOptions>): LLMPromptOptions {
  const defaultOptions: LLMPromptOptions = {
    temperature: 0.7,
    maxTokens: 2000
  };

  return { ...defaultOptions, ...overrides };
}