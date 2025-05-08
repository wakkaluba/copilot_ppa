import * as assert from 'assert';
import * as sinon from 'sinon';
import * as languageUtils from '../../../../src/i18n/languageUtils';
import { LocalizationService } from '../../../../src/i18n/localization';
import { MultilingualManager } from '../../../../src/llm/i18n/MultilingualManager';

describe('LLM MultilingualManager Tests', () => {
    let multilingualManager: MultilingualManager;
    let localizationServiceStub: any;
    let sandbox: sinon.SinonSandbox;
    let getLanguageNameStub: sinon.SinonStub;
    let mockContext: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the localization service
        localizationServiceStub = {
            detectLanguage: sandbox.stub()
        };

        // Mock the constructor for LocalizationService
        const LocalizationServiceMock = sandbox.stub().returns(localizationServiceStub);
        sandbox.replace(Object.getPrototypeOf(LocalizationService), 'constructor', LocalizationServiceMock);

        // Mock getLanguageName
        getLanguageNameStub = sandbox.stub(languageUtils, 'getLanguageName');

        // Mock context
        mockContext = { someContextProperty: 'value' };

        // Create the manager with stubs
        multilingualManager = new MultilingualManager(mockContext);

        // Directly replace localizationService to inject our stub
        (multilingualManager as any).localizationService = localizationServiceStub;
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('isResponseInExpectedLanguage', () => {
        test('should return true for English language regardless of content', () => {
            const responses = [
                'Hello, this is a test',
                'Hola, esta es una prueba',
                'Bonjour, c\'est un test',
                '你好，这是一个测试'
            ];

            responses.forEach(response => {
                const result = multilingualManager.isResponseInExpectedLanguage(response, 'en');
                assert.strictEqual(result, true, 'Should always return true for English');
            });

            // Verify detectLanguage was not called for English
            sinon.assert.notCalled(localizationServiceStub.detectLanguage);
        });

        test('should return false when response mentions language limitations', () => {
            const languageLimitationResponses = [
                'I can only respond in English, not in Spanish.',
                'I can\'t respond in French as requested.',
                'I cannot respond in German due to limitations.',
                'I am not able to respond in Japanese, I will use English.'
            ];

            languageLimitationResponses.forEach(response => {
                const result = multilingualManager.isResponseInExpectedLanguage(response, 'es');
                assert.strictEqual(result, false, 'Should detect language limitations');
            });
        });

        test('should use language detection service for non-English languages', () => {
            // Setup the stub to return different languages
            localizationServiceStub.detectLanguage.withArgs('Hola, esta es una prueba').returns('es');
            localizationServiceStub.detectLanguage.withArgs('Das ist ein Test').returns('de');
            localizationServiceStub.detectLanguage.withArgs('Bonjour, c\'est un test').returns('fr');

            // Test matching languages (should return true)
            assert.strictEqual(
                multilingualManager.isResponseInExpectedLanguage('Hola, esta es una prueba', 'es'),
                true,
                'Should return true when language matches'
            );

            // Test non-matching languages (should return false)
            assert.strictEqual(
                multilingualManager.isResponseInExpectedLanguage('Das ist ein Test', 'fr'),
                false,
                'Should return false when language doesn\'t match'
            );

            // Verify detectLanguage was called with the correct parameters
            sinon.assert.calledWith(localizationServiceStub.detectLanguage, 'Hola, esta es una prueba');
            sinon.assert.calledWith(localizationServiceStub.detectLanguage, 'Das ist ein Test');
        });
    });

    describe('buildLanguageCorrectionPrompt', () => {
        test('should use language name from getLanguageName utility', () => {
            // Setup getLanguageName stub
            getLanguageNameStub.withArgs('fr').returns('French');
            getLanguageNameStub.withArgs('de').returns('German');

            const originalPrompt = 'Tell me about programming';
            const response = 'Programming is a way to instruct computers to perform tasks';

            // Test with French
            const frenchCorrectionPrompt = multilingualManager.buildLanguageCorrectionPrompt(
                originalPrompt,
                response,
                'fr'
            );

            assert.strictEqual(
                frenchCorrectionPrompt,
                `Please provide the response to "Tell me about programming" in French. Previous response was: Programming is a way to instruct computers to perform tasks`
            );

            // Test with German
            const germanCorrectionPrompt = multilingualManager.buildLanguageCorrectionPrompt(
                originalPrompt,
                response,
                'de'
            );

            assert.strictEqual(
                germanCorrectionPrompt,
                `Please provide the response to "Tell me about programming" in German. Previous response was: Programming is a way to instruct computers to perform tasks`
            );

            // Verify getLanguageName was called with the correct parameters
            sinon.assert.calledWith(getLanguageNameStub, 'fr');
            sinon.assert.calledWith(getLanguageNameStub, 'de');
        });
    });

    describe('enhancePromptWithLanguage', () => {
        test('should return unmodified prompt for English language', () => {
            const prompt = 'Tell me about programming';
            const result = multilingualManager.enhancePromptWithLanguage(prompt, 'en');

            assert.strictEqual(result, prompt, 'Should return original prompt for English');

            // Verify getLanguageName was not called
            sinon.assert.notCalled(getLanguageNameStub);
        });

        test('should add language instruction for non-English languages', () => {
            // Setup getLanguageName stub
            getLanguageNameStub.withArgs('es').returns('Spanish');
            getLanguageNameStub.withArgs('zh').returns('Chinese');

            const prompt = 'Tell me about the weather';

            // Test with Spanish
            const spanishPrompt = multilingualManager.enhancePromptWithLanguage(prompt, 'es');
            assert.strictEqual(
                spanishPrompt,
                `Tell me about the weather\n\nPlease respond in Spanish.`
            );

            // Test with Chinese
            const chinesePrompt = multilingualManager.enhancePromptWithLanguage(prompt, 'zh');
            assert.strictEqual(
                chinesePrompt,
                `Tell me about the weather\n\nPlease respond in Chinese.`
            );

            // Verify getLanguageName was called
            sinon.assert.calledWith(getLanguageNameStub, 'es');
            sinon.assert.calledWith(getLanguageNameStub, 'zh');
        });

        test('should handle empty prompts correctly', () => {
            // Setup getLanguageName stub
            getLanguageNameStub.withArgs('de').returns('German');

            const emptyPrompt = '';
            const result = multilingualManager.enhancePromptWithLanguage(emptyPrompt, 'de');

            assert.strictEqual(
                result,
                `\n\nPlease respond in German.`
            );
        });
    });
});
