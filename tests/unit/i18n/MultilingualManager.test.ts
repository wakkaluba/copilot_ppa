import * as assert from 'assert';
import { SupportedLanguage } from '../../../src/i18n';
import { MultilingualManager } from '../../../src/i18n/MultilingualManager';

describe('MultilingualManager Tests', () => {
    let multilingualManager: MultilingualManager;

    beforeEach(() => {
        multilingualManager = new MultilingualManager();
    });

    describe('isResponseInExpectedLanguage', () => {
        test('should return true for any input (current implementation behavior)', () => {
            const languages: SupportedLanguage[] = ['en', 'es', 'de', 'fr', 'zh'];
            const responses = [
                'Hello, this is a test response',
                'Hola, esta es una respuesta de prueba',
                'Hallo, dies ist eine Testantwort',
                'Bonjour, c\'est une réponse de test',
                '你好，这是一个测试回复'
            ];

            // Test various combinations
            languages.forEach((language, index) => {
                const result = multilingualManager.isResponseInExpectedLanguage(responses[index], language);
                assert.strictEqual(result, true, `Should return true for ${language} response`);
            });
        });
    });

    describe('buildLanguageCorrectionPrompt', () => {
        test('should create a correction prompt with the original prompt, response, and target language', () => {
            const originalPrompt = 'Tell me about programming';
            const response = 'Programming is a way to instruct computers to perform tasks';
            const language: SupportedLanguage = 'fr';

            const correctionPrompt = multilingualManager.buildLanguageCorrectionPrompt(
                originalPrompt,
                response,
                language
            );

            assert.strictEqual(
                correctionPrompt,
                `Please provide the response to "Tell me about programming" in fr. Previous response was: Programming is a way to instruct computers to perform tasks`
            );
        });

        test('should handle various languages correctly', () => {
            const originalPrompt = 'What is the weather like?';
            const response = 'It is sunny today';
            const languages: SupportedLanguage[] = ['en', 'es', 'de', 'ja', 'ru'];

            languages.forEach(language => {
                const correctionPrompt = multilingualManager.buildLanguageCorrectionPrompt(
                    originalPrompt,
                    response,
                    language
                );

                assert.strictEqual(
                    correctionPrompt,
                    `Please provide the response to "What is the weather like?" in ${language}. Previous response was: It is sunny today`
                );
            });
        });
    });

    describe('enhancePromptWithLanguage', () => {
        test('should add language instruction to the prompt', () => {
            const prompt = 'Tell me about programming';
            const language: SupportedLanguage = 'de';

            const enhancedPrompt = multilingualManager.enhancePromptWithLanguage(prompt, language);

            assert.strictEqual(
                enhancedPrompt,
                `Please respond in de to: Tell me about programming`
            );
        });

        test('should handle various languages correctly', () => {
            const prompt = 'What is the weather like?';
            const languages: SupportedLanguage[] = ['en', 'es', 'de', 'ja', 'ru'];

            languages.forEach(language => {
                const enhancedPrompt = multilingualManager.enhancePromptWithLanguage(prompt, language);

                assert.strictEqual(
                    enhancedPrompt,
                    `Please respond in ${language} to: What is the weather like?`
                );
            });
        });

        test('should handle empty prompts correctly', () => {
            const prompt = '';
            const language: SupportedLanguage = 'fr';

            const enhancedPrompt = multilingualManager.enhancePromptWithLanguage(prompt, language);

            assert.strictEqual(
                enhancedPrompt,
                `Please respond in fr to: `
            );
        });
    });
});
