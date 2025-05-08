const { UISettingsWebviewService } = require('../UISettingsWebviewService');
const { Logger } = require('../../../utils/logger');

// Mock the Logger class
jest.mock('../../../utils/logger', () => {
    return {
        Logger: jest.fn().mockImplementation(() => {
            return {
                error: jest.fn(),
                warn: jest.fn(),
                info: jest.fn(),
                debug: jest.fn()
            };
        })
    };
});

describe('UISettingsWebviewService', () => {
    let service;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
        service = new UISettingsWebviewService();
    });

    test('should create an instance with logger initialized', () => {
        expect(service).toBeDefined();
        expect(Logger).toHaveBeenCalled();
    });

    test('should generate HTML content with tabs', () => {
        const tabs = [
            {
                id: 'general',
                label: 'General',
                content: '<div>General settings content</div>'
            },
            {
                id: 'appearance',
                label: 'Appearance',
                content: '<div>Appearance settings content</div>'
            }
        ];

        const html = service.generateWebviewContent(tabs);

        // Verify the generated HTML contains key elements
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<html lang="en">');
        expect(html).toContain('<title>Settings</title>');

        // Check for tab buttons
        expect(html).toContain('class="tab active" data-tab="general"');
        expect(html).toContain('General');
        expect(html).toContain('class="tab" data-tab="appearance"');
        expect(html).toContain('Appearance');

        // Check for content divs
        expect(html).toContain('id="general" class="tab-content active"');
        expect(html).toContain('General settings content');
        expect(html).toContain('id="appearance" class="tab-content"');
        expect(html).toContain('Appearance settings content');

        // Check for JavaScript functionality
        expect(html).toContain('const vscode = acquireVsCodeApi()');
        expect(html).toContain('addEventListener');
        expect(html).toContain('tabChanged');
        expect(html).toContain('showError');
        expect(html).toContain('selectTab');
    });

    test('should set the first tab as active by default', () => {
        const tabs = [
            {
                id: 'tab1',
                label: 'Tab 1',
                content: 'Content 1'
            },
            {
                id: 'tab2',
                label: 'Tab 2',
                content: 'Content 2'
            },
            {
                id: 'tab3',
                label: 'Tab 3',
                content: 'Content 3'
            }
        ];

        const html = service.generateWebviewContent(tabs);

        // First tab should be active, others should not
        expect(html).toContain('class="tab active" data-tab="tab1"');
        expect(html).toContain('class="tab" data-tab="tab2"');
        expect(html).toContain('class="tab" data-tab="tab3"');

        expect(html).toContain('id="tab1" class="tab-content active"');
        expect(html).toContain('id="tab2" class="tab-content"');
        expect(html).toContain('id="tab3" class="tab-content"');
    });

    test('should handle empty tabs array', () => {
        const tabs = [];
        const html = service.generateWebviewContent(tabs);

        // Should still create a valid HTML document
        expect(html).toContain('<!DOCTYPE html>');
        expect(html).toContain('<html lang="en">');

        // But with no tab buttons or content sections
        expect(html).not.toContain('class="tab active"');
        expect(html).not.toContain('class="tab-content active"');
    });

    test('should handle tabs with special characters', () => {
        const tabs = [
            {
                id: 'special-chars',
                label: 'Special & <Characters>',
                content: '<div data-test="value">Content with "quotes" & stuff</div>'
            }
        ];

        const html = service.generateWebviewContent(tabs);

        // Should properly include the special characters
        expect(html).toContain('Special & <Characters>');
        expect(html).toContain('<div data-test="value">Content with "quotes" & stuff</div>');
    });

    test('should log error and rethrow when an exception occurs', () => {
        // Create a situation that would cause an error
        const mockError = new Error('Test error');

        // Mock implementation to throw an error
        jest.spyOn(Array.prototype, 'map').mockImplementationOnce(() => {
            throw mockError;
        });

        const tabs = [
            {
                id: 'test',
                label: 'Test',
                content: 'Content'
            }
        ];

        // Expect the function to throw the error
        expect(() => service.generateWebviewContent(tabs)).toThrow(mockError);

        // Expect the error to be logged
        const mockLogger = Logger.mock.results[0].value;
        expect(mockLogger.error).toHaveBeenCalledWith(
            'Error generating UI settings webview content',
            mockError
        );

        // Clean up
        jest.restoreAllMocks();
    });
});
