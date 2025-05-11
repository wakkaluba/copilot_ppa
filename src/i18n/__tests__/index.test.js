// filepath: d:\___coding\tools\copilot_ppa\src\i18n\__tests__\index.test.js
// @ts-nocheck
const vscode = require('vscode');
const sinon = require('sinon');
const {
    initializeLocalization,
    localize,
    detectLanguage,
    getCurrentLanguage
} = require('../index');
const { LocalizationService } = require('../localization');

describe('i18n/index module (JavaScript)', () => {
    let mockContext;
    let sandbox;
    let mockLocalizationService;
    let originalLocalizer;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock extension context
        mockContext = {
            extensionPath: '/test/extension/path',
            subscriptions: [],
        };

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

            // Verify it's not null
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

    // JavaScript-specific tests
    describe('JavaScript-specific behavior', () => {
        it('should handle dynamic property access', () => {
            mockLocalizationService.getString.callsFake((key, defaultValue) => {
                if (key === 'dynamic.key') return 'Dynamic Value';
                return defaultValue;
            });

            // Testing access with bracket notation common in JavaScript
            const dynamicKey = 'dynamic.key';
            const result = localize(dynamicKey, 'Default');
            expect(result).toBe('Dynamic Value');
        });

        it('should handle object destructuring in JavaScript', () => {
            // This tests the JavaScript pattern of destructuring the module
            const { localize: localizeFunc } = require('../index');

            mockLocalizationService.getString.withArgs('js.key', 'JS Default').returns('JS Value');

            const result = localizeFunc('js.key', 'JS Default');
            expect(result).toBe('JS Value');
        });

        it('should handle various parameter types', () => {
            // JavaScript is more permissive with parameter types
            mockLocalizationService.getString.callsFake((key, defaultValue, params) => {
                if (params && params.count) {
                    return `Count: ${params.count}`;
                }
                return defaultValue;
            });

            // Test with number (in JS this would work fine even if designed for string)
            const result1 = localize('count.key', 'default', { count: 5 }); // Number, not string
            expect(result1).toBe('Count: 5');

            // Test with boolean
            const result2 = localize('bool.key', 'default value', { active: true });
            expect(result2).toBe('default value'); // Default since our mock looks for 'count'
        });
    });
});
