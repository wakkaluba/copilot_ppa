import { describe, expect, it } from '@jest/globals';
import { SupportedLanguage } from '../../../src/i18n';
import { MultilingualPromptManager } from '../../../src/llm/multilingualPromptManager';

describe('MultilingualPromptManager', () => {
  let promptManager: MultilingualPromptManager;

  beforeEach(() => {
    promptManager = new MultilingualPromptManager();
  });

  describe('enhancePromptWithLanguage', () => {
    it('should return the original prompt for English language', () => {
      const originalPrompt = 'What is the capital of France?';
      const result = promptManager.enhancePromptWithLanguage(originalPrompt, 'en');
      expect(result).toBe(originalPrompt);
    });

    it('should enhance the prompt with language instructions for non-English languages', () => {
      const originalPrompt = 'What is the capital of France?';
      const result = promptManager.enhancePromptWithLanguage(originalPrompt, 'es');
      expect(result).toBe('What is the capital of France?\n\nRespond in Spanish.');
    });

    it('should handle empty prompts', () => {
      const result = promptManager.enhancePromptWithLanguage('', 'fr');
      expect(result).toBe('\n\nRespond in French.');
    });

    it('should handle multi-line prompts', () => {
      const multilinePrompt = 'First line.\nSecond line.\nThird line.';
      const result = promptManager.enhancePromptWithLanguage(multilinePrompt, 'de');
      expect(result).toBe('First line.\nSecond line.\nThird line.\n\nRespond in German.');
    });

    it('should handle all supported languages', () => {
      const supportedLanguages: SupportedLanguage[] = [
        'de', 'es', 'fr', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar',
        'tr', 'pl', 'nl', 'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
        'th', 'el'
      ];

      const originalPrompt = 'Test prompt';
      for (const lang of supportedLanguages) {
        const result = promptManager.enhancePromptWithLanguage(originalPrompt, lang);
        const langName = result.split('Respond in ')[1].replace('.', '');
        expect(result).toContain(`Respond in ${langName}`);
      }
    });
  });

  describe('isResponseInExpectedLanguage', () => {
    it('should return true for typical responses', () => {
      const response = 'This is a normal response that should pass the check.';
      expect(promptManager.isResponseInExpectedLanguage(response, 'es')).toBe(true);
    });

    it('should return false when response explicitly states it cannot respond in the requested language', () => {
      const responses = [
        'I can only respond in English, not in Spanish.',
        'I can\'t respond in French as requested.',
        'I cannot respond in German, I am configured to use English only.'
      ];

      for (const response of responses) {
        expect(promptManager.isResponseInExpectedLanguage(response, 'es')).toBe(false);
      }
    });

    it('should handle case insensitivity', () => {
      const response = 'I CAN ONLY RESPOND IN ENGLISH, not in any other language.';
      expect(promptManager.isResponseInExpectedLanguage(response, 'fr')).toBe(false);
    });

    it('should return true for English language responses', () => {
      const response = 'I can only respond in English.';
      expect(promptManager.isResponseInExpectedLanguage(response, 'en')).toBe(true);
    });

    it('should handle empty responses', () => {
      expect(promptManager.isResponseInExpectedLanguage('', 'de')).toBe(true);
    });
  });

  describe('buildLanguageCorrectionPrompt', () => {
    it('should build a correction prompt with the original prompt and response', () => {
      const originalPrompt = 'What is the capital of Germany?';
      const originalResponse = 'The capital of Germany is Berlin.';
      const targetLanguage: SupportedLanguage = 'es';

      const result = promptManager.buildLanguageCorrectionPrompt(
        originalPrompt,
        originalResponse,
        targetLanguage
      );

      expect(result).toContain('translated to Spanish');
      expect(result).toContain(`Original prompt: ${originalPrompt}`);
      expect(result).toContain(`Response to translate: ${originalResponse}`);
      expect(result).toContain('Provide only the translated response in Spanish');
    });

    it('should handle empty original prompt', () => {
      const result = promptManager.buildLanguageCorrectionPrompt(
        '',
        'Some response',
        'fr'
      );

      expect(result).toContain('Original prompt: ');
      expect(result).toContain('translated to French');
    });

    it('should handle empty original response', () => {
      const result = promptManager.buildLanguageCorrectionPrompt(
        'Some prompt',
        '',
        'de'
      );

      expect(result).toContain('Response to translate: ');
      expect(result).toContain('translated to German');
    });

    it('should handle multi-line prompts and responses', () => {
      const originalPrompt = 'Line 1\nLine 2';
      const originalResponse = 'Response 1\nResponse 2';

      const result = promptManager.buildLanguageCorrectionPrompt(
        originalPrompt,
        originalResponse,
        'it'
      );

      expect(result).toContain(`Original prompt: ${originalPrompt}`);
      expect(result).toContain(`Response to translate: ${originalResponse}`);
    });

    it('should build correction prompts for all supported languages', () => {
      const supportedLanguages: SupportedLanguage[] = [
        'de', 'es', 'fr', 'it', 'pt', 'ja', 'ko', 'zh', 'ru', 'ar',
        'tr', 'pl', 'nl', 'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
        'th', 'el'
      ];

      for (const lang of supportedLanguages) {
        const result = promptManager.buildLanguageCorrectionPrompt(
          'Test prompt',
          'Test response',
          lang
        );

        // Extract the language name
        const langNameMatch1 = result.match(/translated to (\w+):/);
        const langNameMatch2 = result.match(/translated response in (\w+)/);

        expect(langNameMatch1).not.toBeNull();
        expect(langNameMatch2).not.toBeNull();
        expect(langNameMatch1![1]).toBe(langNameMatch2![1]);
      }
    });
  });

  // Test for private method behavior
  describe('getLanguageName behavior', () => {
    it('should correctly map language codes to names through public methods', () => {
      // We can test the behavior of the private method through the public methods
      const languageCodeToExpectedName = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'ja': 'Japanese',
        'zh': 'Chinese',
        'ru': 'Russian'
      };

      for (const [code, expectedName] of Object.entries(languageCodeToExpectedName)) {
        const result = promptManager.enhancePromptWithLanguage('test', code as SupportedLanguage);
        expect(result).toContain(`Respond in ${expectedName}`);
      }
    });

    it('should default to English for unsupported language codes', () => {
      // @ts-expect-error - Testing with an invalid language code
      const result = promptManager.enhancePromptWithLanguage('test', 'xx');
      expect(result).toContain('Respond in English');
    });
  });

  // Edge cases and error handling
  describe('edge cases', () => {
    it('should handle special characters in prompts', () => {
      const promptWithSpecialChars = 'Test with special chars: äöü ñ 你好 こんにちは';
      const result = promptManager.enhancePromptWithLanguage(promptWithSpecialChars, 'fr');
      expect(result).toContain(promptWithSpecialChars);
    });

    it('should handle extremely long prompts', () => {
      const longPrompt = 'A'.repeat(10000);
      const result = promptManager.enhancePromptWithLanguage(longPrompt, 'es');
      expect(result.length).toBeGreaterThan(10000);
      expect(result).toContain('Respond in Spanish');
    });
  });
});
