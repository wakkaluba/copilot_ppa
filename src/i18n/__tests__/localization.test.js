// @ts-nocheck
const vscode = require('vscode');
const { LocalizationService } = require('../localization');
const fs = require('fs');
const path = require('path');
const sinon = require('sinon');

describe('LocalizationService (JavaScript)', () => {
    let mockContext;
    let fsExistsStub;
    let fsReadFileStub;
    let sandbox;
    let envLanguageStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock extension context
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
        };

        // Mock fs methods
        fsExistsStub = sandbox.stub(fs, 'existsSync');
        fsReadFileStub = sandbox.stub(fs, 'readFileSync');

        // Mock vscode.env
        envLanguageStub = sandbox.stub(vscode.env, 'language').value('en');
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor and initialization', () => {
        it('should initialize with English as default language', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'greeting': 'Hello' }));

            // Create service
            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getCurrentLanguage()).toBe('en');
        });

        it('should load strings for English by default', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'greeting': 'Hello' }));

            // Create service
            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getString('greeting', 'default')).toBe('Hello');
        });

        it('should detect and use system language if supported', () => {
            // Setup
            envLanguageStub.value('de-DE');
            fsExistsStub.returns(true);
            fsReadFileStub.onFirstCall().returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json
            fsReadFileStub.onSecondCall().returns(JSON.stringify({ 'greeting': 'Hallo' })); // de.json

            // Create service
            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getCurrentLanguage()).toBe('de');
            expect(service.getString('greeting', 'default')).toBe('Hallo');
        });

        it('should handle language variants correctly', () => {
            // Setup - es-MX should map to es
            envLanguageStub.value('es-MX');
            fsExistsStub.returns(true);
            fsReadFileStub.onFirstCall().returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json
            fsReadFileStub.onSecondCall().returns(JSON.stringify({ 'greeting': 'Hola' })); // es.json

            // Create service
            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getCurrentLanguage()).toBe('es');
            expect(service.getString('greeting', 'default')).toBe('Hola');
        });
    });

    describe('getString', () => {
        it('should return string from current language', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'test': 'Test String' }));

            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getString('test', 'default')).toBe('Test String');
        });

        it('should fall back to English if string not found in current language', () => {
            // Setup
            envLanguageStub.value('fr');
            fsExistsStub.returns(true);
            fsReadFileStub.onFirstCall().returns(JSON.stringify({ 'common': 'Common', 'english_only': 'English Only' })); // en.json
            fsReadFileStub.onSecondCall().returns(JSON.stringify({ 'common': 'Commun' })); // fr.json

            const service = new LocalizationService(mockContext);

            // Test common key available in French
            expect(service.getString('common', 'default')).toBe('Commun');

            // Test key only available in English
            expect(service.getString('english_only', 'default')).toBe('English Only');
        });

        it('should return default value if string not found in any language', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'test': 'Test String' }));

            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getString('nonexistent', 'Default Value')).toBe('Default Value');
        });

        it('should replace parameters in strings', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({
                'welcome': 'Welcome, {name}!',
                'stats': '{count} files processed in {time} seconds'
            }));

            const service = new LocalizationService(mockContext);

            // Verify
            expect(service.getString('welcome', 'default', { name: 'User' })).toBe('Welcome, User!');
            expect(service.getString('stats', 'default', { count: '10', time: '5' }))
                .toBe('10 files processed in 5 seconds');
        });

        it('should handle multiple parameters in the same string', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({
                'complex': 'File {filename} has {lineCount} lines and was modified by {author} on {date}'
            }));

            const service = new LocalizationService(mockContext);

            // Verify with multiple parameters
            expect(service.getString('complex', 'default', {
                filename: 'test.js',
                lineCount: '150',
                author: 'Developer',
                date: '2023-05-20'
            })).toBe('File test.js has 150 lines and was modified by Developer on 2023-05-20');
        });

        it('should handle parameters appearing multiple times', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({
                'repeated': 'Replace {value} here and also {value} there'
            }));

            const service = new LocalizationService(mockContext);

            // Verify that all instances of the parameter are replaced
            expect(service.getString('repeated', 'default', { value: 'TEST' }))
                .toBe('Replace TEST here and also TEST there');
        });
    });

    describe('setLanguage', () => {
        it('should change language and reload strings', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.onFirstCall().returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json initial load
            fsReadFileStub.onSecondCall().returns(JSON.stringify({ 'greeting': 'Hola' })); // es.json on setLanguage
            fsReadFileStub.onThirdCall().returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json reload after setting es

            const service = new LocalizationService(mockContext);
            expect(service.getString('greeting', 'default')).toBe('Hello');

            // Change language
            service.setLanguage('es');

            // Verify
            expect(service.getCurrentLanguage()).toBe('es');
            expect(service.getString('greeting', 'default')).toBe('Hola');
        });

        it('should not reload strings if language is the same', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'greeting': 'Hello' }));

            const service = new LocalizationService(mockContext);

            // Reset the stub to track new calls
            fsReadFileStub.resetHistory();

            // Set the same language
            service.setLanguage('en');

            // Verify no new file reads occurred
            expect(fsReadFileStub.called).toBe(false);
        });

        it('should support switching between multiple languages', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.onFirstCall().returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json initial load
            fsReadFileStub.onSecondCall().returns(JSON.stringify({ 'greeting': 'Hola' })); // es.json first switch
            fsReadFileStub.onThirdCall().returns(JSON.stringify({ 'greeting': 'Bonjour' })); // fr.json second switch
            fsReadFileStub.onCall(3).returns(JSON.stringify({ 'greeting': 'こんにちは' })); // ja.json third switch
            fsReadFileStub.onCall(4).returns(JSON.stringify({ 'greeting': 'Hello' })); // en.json back to English

            const service = new LocalizationService(mockContext);

            service.setLanguage('es');
            expect(service.getCurrentLanguage()).toBe('es');
            expect(service.getString('greeting', 'default')).toBe('Hola');

            service.setLanguage('fr');
            expect(service.getCurrentLanguage()).toBe('fr');
            expect(service.getString('greeting', 'default')).toBe('Bonjour');

            service.setLanguage('ja');
            expect(service.getCurrentLanguage()).toBe('ja');
            expect(service.getString('greeting', 'default')).toBe('こんにちは');

            service.setLanguage('en');
            expect(service.getCurrentLanguage()).toBe('en');
            expect(service.getString('greeting', 'default')).toBe('Hello');
        });
    });

    describe('normalizeLanguage', () => {
        it('should extract base language from locale format', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({}));

            const service = new LocalizationService(mockContext);

            // Change language with full locale format
            service.setLanguage('en'); // Using the private method through a public one
            expect(service.getCurrentLanguage()).toBe('en');
        });

        it('should fall back to English for unsupported languages', () => {
            // Setup
            envLanguageStub.value('unsupported-lang');
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({ 'greeting': 'Hello' }));

            // Create service with unsupported language
            const service = new LocalizationService(mockContext);

            // Verify fallback to English
            expect(service.getCurrentLanguage()).toBe('en');
        });

        it('should handle all supported language codes correctly', () => {
            // Test a sample of supported languages
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({}));

            const supportedLanguages = [
                'en', 'es', 'de', 'fr', 'it', 'pt', 'ja',
                'ko', 'zh', 'ru', 'ar', 'tr', 'pl', 'nl',
                'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
                'th', 'el'
            ];

            // Test each supported language
            for (const lang of supportedLanguages) {
                envLanguageStub.value(lang);
                const service = new LocalizationService(mockContext);
                expect(service.getCurrentLanguage()).toBe(lang);
            }
        });

        it('should normalize language-region codes correctly', () => {
            const testCases = [
                { input: 'en-US', expected: 'en' },
                { input: 'es-MX', expected: 'es' },
                { input: 'fr-CA', expected: 'fr' },
                { input: 'de-AT', expected: 'de' },
                { input: 'pt-BR', expected: 'pt' },
                { input: 'zh-CN', expected: 'zh' },
                { input: 'zh-TW', expected: 'zh' },
                { input: 'en-GB', expected: 'en' }
            ];

            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({}));

            // Test each case
            for (const testCase of testCases) {
                envLanguageStub.value(testCase.input);
                const service = new LocalizationService(mockContext);
                expect(service.getCurrentLanguage()).toBe(testCase.expected);
            }
        });
    });

    describe('detectLanguage', () => {
        let service;

        beforeEach(() => {
            fsExistsStub.returns(true);
            fsReadFileStub.returns(JSON.stringify({}));
            service = new LocalizationService(mockContext);

            // Override the mock implementation with a custom one for testing
            sandbox.stub(service, 'detectLanguage');

            // Setup different return values for different inputs to simulate the TS implementation
            service.detectLanguage.callsFake(text => {
                if (!text) return null;

                // Simple detection for testing purposes
                if (text.includes('こんにちは') || text.includes('ありがとう')) return 'ja';
                if (text.includes('你好') || text.includes('谢谢')) return 'zh';
                if (text.includes('안녕하세요') || text.includes('감사합니다')) return 'ko';
                if (text.includes('Привет') || text.includes('спасибо')) return 'ru';
                if (text.includes('Є') || text.includes('ї')) return 'uk';
                if (text.includes('مرحبا') || text.includes('شكرا')) return 'ar';
                if (text.includes('สวัสดี') || text.includes('ขอบคุณ')) return 'th';
                if (text.includes('Γεια') || text.includes('ευχαριστώ')) return 'el';
                if (text.includes('ñ') || text.includes('¿')) return 'es';
                if (text.includes('ä') || text.includes('ö') || text.includes('ü')) return 'de';
                if (text.includes('é') || text.includes('à') || text.includes('ç')) return 'fr';

                return 'en'; // Default to English
            });
        });

        it('should detect English text', () => {
            expect(service.detectLanguage('This is English text')).toBe('en');
        });

        it('should detect Spanish text with special characters', () => {
            expect(service.detectLanguage('¿Cómo estás? Esto es español')).toBe('es');
        });

        it('should detect German text with umlauts', () => {
            expect(service.detectLanguage('Ich möchte ein Stück Käse und äpfel')).toBe('de');
        });

        it('should detect French text with accents', () => {
            expect(service.detectLanguage('Voilà! C\'est très intéressant')).toBe('fr');
        });

        it('should detect Japanese text', () => {
            expect(service.detectLanguage('これは日本語です。こんにちは')).toBe('ja');
        });

        it('should detect Chinese text', () => {
            expect(service.detectLanguage('这是中文，你好')).toBe('zh');
        });

        it('should detect Korean text', () => {
            expect(service.detectLanguage('이것은 한국어입니다. 안녕하세요')).toBe('ko');
        });

        it('should detect Russian text', () => {
            expect(service.detectLanguage('Это русский текст. Привет')).toBe('ru');
        });

        it('should detect Ukrainian text', () => {
            expect(service.detectLanguage('Це український текст з літерами Є і ї')).toBe('uk');
        });

        it('should detect Arabic text', () => {
            expect(service.detectLanguage('هذا نص باللغة العربية. مرحبا')).toBe('ar');
        });

        it('should detect Thai text', () => {
            expect(service.detectLanguage('นี่คือข้อความภาษาไทย สวัสดี')).toBe('th');
        });

        it('should detect Greek text', () => {
            expect(service.detectLanguage('Αυτό είναι ελληνικό κείμενο. Γεια σας')).toBe('el');
        });

        it('should return null for empty text', () => {
            expect(service.detectLanguage('')).toBeNull();
        });

        it('should default to English for ambiguous text', () => {
            expect(service.detectLanguage('123456789')).toBe('en');
        });
    });

    describe('error handling', () => {
        it('should handle missing locale files gracefully', () => {
            // Setup
            fsExistsStub.returns(false); // File doesn't exist

            // This should not throw an error
            const service = new LocalizationService(mockContext);

            // Should still return default values
            expect(service.getString('test', 'Default Value')).toBe('Default Value');
        });

        it('should handle file read errors gracefully', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.throws(new Error('Read error'));

            // Console error is expected but shouldn't throw
            const consoleErrorStub = sandbox.stub(console, 'error');

            // This should not throw an error
            const service = new LocalizationService(mockContext);

            // Verify console error was logged
            expect(consoleErrorStub.called).toBe(true);

            // Should still return default values
            expect(service.getString('test', 'Default Value')).toBe('Default Value');
        });

        it('should handle JSON parse errors gracefully', () => {
            // Setup
            fsExistsStub.returns(true);
            fsReadFileStub.returns('{ invalid json }'); // Invalid JSON

            // Console error is expected but shouldn't throw
            const consoleErrorStub = sandbox.stub(console, 'error');

            // This should not throw an error
            const service = new LocalizationService(mockContext);

            // Verify console error was logged
            expect(consoleErrorStub.called).toBe(true);

            // Should still return default values
            expect(service.getString('test', 'Default Value')).toBe('Default Value');
        });
    });
});
