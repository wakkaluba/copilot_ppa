import { Logger } from '../../../utils/logger';
import { UISettingsWebviewService } from '../UISettingsWebviewService';

jest.mock('../../../utils/logger', () => {
    return {
        Logger: jest.fn().mockImplementation(() => {
            return {
                error: jest.fn(),
                info: jest.fn(),
                debug: jest.fn(),
                warn: jest.fn()
            };
        })
    };
});

describe('UISettingsWebviewService (JavaScript implementation)', () => {
    let service;
    let mockLogger;
    let testTabs;

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = new Logger();
        service = new UISettingsWebviewService();
        testTabs = [
            { id: 'general', label: 'General', content: '<div>General settings</div>' },
            { id: 'appearance', label: 'Appearance', content: '<div>Appearance settings</div>' },
            { id: 'advanced', label: 'Advanced', content: '<div>Advanced settings</div>' }
        ];
    });

    describe('generateWebviewContent', () => {
        it('should generate valid HTML structure', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check basic HTML structure
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<meta charset="UTF-8">');
            expect(html).toContain('<meta name="viewport"');
            expect(html).toContain('<title>Settings</title>');
            expect(html).toContain('<body>');
            expect(html).toContain('</body>');
            expect(html).toContain('</html>');
        });

        it('should render all tabs correctly', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check tab buttons
            testTabs.forEach(tab => {
                expect(html).toContain(`data-tab="${tab.id}"`);
                expect(html).toContain(`>${tab.label}<`);
            });

            // Check tab content containers
            testTabs.forEach(tab => {
                expect(html).toContain(`id="${tab.id}" class="tab-content`);
                expect(html).toContain(tab.content);
            });
        });

        it('should mark first tab as active by default', () => {
            const html = service.generateWebviewContent(testTabs);

            // First tab should have active class
            expect(html).toContain(`class="tab active" data-tab="${testTabs[0].id}"`);
            expect(html).toContain(`id="${testTabs[0].id}" class="tab-content active"`);

            // Other tabs should not be active
            for (let i = 1; i < testTabs.length; i++) {
                expect(html).not.toContain(`class="tab active" data-tab="${testTabs[i].id}"`);
                expect(html).not.toContain(`id="${testTabs[i].id}" class="tab-content active"`);
            }
        });

        it('should include VS Code webview messaging', () => {
            const html = service.generateWebviewContent(testTabs);

            // VS Code API acquisition
            expect(html).toContain('const vscode = acquireVsCodeApi()');

            // Message event listener
            expect(html).toContain('window.addEventListener(\'message\'');

            // Message sending back to extension
            expect(html).toContain('vscode.postMessage({');
        });

        it('should include tab-switching behavior', () => {
            const html = service.generateWebviewContent(testTabs);

            // Tab click handling
            expect(html).toContain('tab.addEventListener(\'click\'');

            // Tab switching logic
            expect(html).toContain('tabs.forEach(t => t.classList.remove(\'active\'))');
            expect(html).toContain('tabContents.forEach(c => c.classList.remove(\'active\'))');
            expect(html).toContain('tab.classList.add(\'active\')');
            expect(html).toContain('document.getElementById(tabName).classList.add(\'active\')');

            // Event notification to extension
            expect(html).toContain('command: \'tabChanged\'');
            expect(html).toContain('tab: tabName');
        });

        it('should handle tab selection from extension', () => {
            const html = service.generateWebviewContent(testTabs);

            // Should handle selectTab command
            expect(html).toContain('case \'selectTab\'');
            expect(html).toContain('const tabToSelect = message.tab');
            expect(html).toContain('const tabEl = document.querySelector');
            expect(html).toContain('tabEl.click()');
        });

        it('should handle error display', () => {
            const html = service.generateWebviewContent(testTabs);

            // Should have error message container
            expect(html).toContain('<div class="error-message" id="errorMessage"></div>');

            // Should handle showError command
            expect(html).toContain('case \'showError\'');
            expect(html).toContain('showError(message.message)');

            // Should have error display function
            expect(html).toContain('function showError(message)');
            expect(html).toContain('errorMessage.textContent = message');
            expect(html).toContain('errorMessage.classList.add(\'visible\')');
            expect(html).toContain('setTimeout(() => {');
            expect(html).toContain('errorMessage.classList.remove(\'visible\')');
        });

        it('should handle empty tabs array', () => {
            const html = service.generateWebviewContent([]);

            // Should generate valid HTML with empty tab container
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<div class="tab-container">');
            expect(html).not.toContain('class="tab active"');
            expect(html).not.toContain('class="tab-content active"');
        });

        it('should log error when generation fails', () => {
            // Spy on logger.error
            const errorSpy = jest.spyOn(service.logger, 'error');

            // Force an error
            const badTabs = null;
            try {
                service.generateWebviewContent(badTabs);
                fail('Should have thrown an error');
            } catch (error) {
                // Should log the error
                expect(errorSpy).toHaveBeenCalled();
                expect(errorSpy.mock.calls[0][0]).toContain('Error generating UI settings webview content');
            }
        });

        it('should include responsive styles', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for responsive meta tag
            expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');

            // Check for responsive styling
            expect(html).toContain('width: 100%');
        });

        it('should use VS Code theme variables', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for VS Code theme variable usage
            expect(html).toContain('var(--vscode-foreground)');
            expect(html).toContain('var(--vscode-editor-background)');
            expect(html).toContain('var(--vscode-input-background)');
            expect(html).toContain('var(--vscode-errorForeground)');
        });
    });
});
