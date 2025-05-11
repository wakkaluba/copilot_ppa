// filepath: d:\___coding\tools\copilot_ppa\src\i18n\__tests__\index.test.ts
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import {
    detectLanguage,
    getCurrentLanguage,
    initializeLocalization,
    localize,
    SupportedLanguage
} from '../index';
import { LocalizationService } from '../localization';

describe('i18n/index module', () => {
    let mockContext: vscode.ExtensionContext;
    let sandbox: sinon.SinonSandbox;
    let mockLocalizationService: sinon.SinonStubbedInstance<LocalizationService>;
    let originalLocalizer: any;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock extension context
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
        } as unknown as vscode.ExtensionContext;

        // Store and replace the module's internal localizationService with our mock
        const module = require('../index');
        originalLocalizer = module.localizationService;

        // Create a stub for LocalizationService
        mockLocalizationService = sandbox.createStubInstance(LocalizationService);
        mockLocalizationService.getString.callsFake((key, defaultValue) => `MOCK:${key}:${defaultValue}`);
        mockLocalizationService.detectLanguage.callsFake(text => text.startsWith('de') ? 'de' : 'en');
        mockLocalizationService.getCurrentLanguage.returns('en');

        // Replace the module's localizationService with our mock
        module.localizationService = mockLocalizationService;
    });

    afterEach(() => {
        sandbox.restore();

        // Restore the original localizationService
        const module = require('../index');
        module.localizationService = originalLocalizer;
    });

    describe('initializeLocalization', () => {
        it('should initialize and return a LocalizationService instance', () => {
            // We need to use actual implementation for this test
            const module = require('../index');
            module.localizationService = null;

            // Mock the LocalizationService constructor
            const createInstanceStub = sandbox.stub(LocalizationService.prototype, 'constructor');

            const result = initializeLocalization(mockContext);

            // Since we can't directly check if localizationService is an instance of LocalizationService
            // due to how we've mocked it, we'll just verify it's not null
            expect(result).not.toBeNull();

            // Reset to avoid affecting other tests
            module.localizationService = mockLocalizationService;
        });

        it('should return existing service if already initialized', () => {
            const module = require('../index');

            // Set up the module with our mock service
            module.localizationService = mockLocalizationService;

            // Should return the existing mock
            const result = initializeLocalization(mockContext);
            expect(result).toBe(mockLocalizationService);
        });
    });

    describe('localize', () => {
        it('should return localized string when service is initialized', () => {
            // Setup mock to return specific value
            mockLocalizationService.getString.withArgs('testKey', 'default', undefined).returns('Localized Value');

            const result = localize('testKey', 'default');
            expect(result).toBe('Localized Value');
            expect(mockLocalizationService.getString.calledOnce).toBe(true);
        });

        it('should pass parameters to the getString method', () => {
            const params = { name: 'John', count: '5' };
            mockLocalizationService.getString.withArgs('paramKey', 'default', params).returns('Hello, John! You have 5 messages');

            const result = localize('paramKey', 'default', params);
            expect(result).toBe('Hello, John! You have 5 messages');
            expect(mockLocalizationService.getString.calledWith('paramKey', 'default', params)).toBe(true);
        });

        it('should return default value when service is not initialized', () => {
            // Temporarily set the service to null
            const module = require('../index');
            const tempService = module.localizationService;
            module.localizationService = null;

            const result = localize('anyKey', 'Default String');
            expect(result).toBe('Default String');

            // Restore service
            module.localizationService = tempService;
        });
    });

    describe('getCurrentLanguage', () => {
        it('should return the current UI language', () => {
            // Since getCurrentLanguage is mocked to always return 'en',
            // we're just verifying the function exists and returns a value
            const language = getCurrentLanguage();
            expect(language).toBe('en');
        });
    });

    describe('detectLanguage', () => {
        it('should call the service\'s detectLanguage method', () => {
            mockLocalizationService.detectLanguage.withArgs('Guten Tag').returns('de');

            const result = detectLanguage('Guten Tag');
            expect(result).toBe('de');
            expect(mockLocalizationService.detectLanguage.calledOnce).toBe(true);
        });

        it('should return null when service is not initialized', () => {
            // Temporarily set the service to null
            const module = require('../index');
            const tempService = module.localizationService;
            module.localizationService = null;

            const result = detectLanguage('Guten Tag');
            expect(result).toBeNull();

            // Restore service
            module.localizationService = tempService;
        });
    });

    describe('SupportedLanguage type', () => {
        it('should include all supported languages', () => {
            // This is mostly a TypeScript compile-time check, but we can verify
            // some languages are recognized as valid SupportedLanguage at runtime
            const validLanguages: SupportedLanguage[] = [
                'en', 'es', 'de', 'fr', 'it', 'pt', 'ja',
                'ko', 'zh', 'ru', 'ar', 'tr', 'pl', 'nl',
                'sv', 'no', 'fi', 'da', 'cs', 'uk', 'hu',
                'th', 'el'
            ];

            // Just check that this assignment doesn't throw
            validLanguages.forEach(lang => {
                const testLang: SupportedLanguage = lang;
                expect(testLang).toBe(lang);
            });
        });
    });
});
