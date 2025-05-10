import { Logger } from '../../../utils/logger';
import { IUISettingsTab, UISettingsWebviewService } from '../UISettingsWebviewService';

// Mock the Logger
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

describe('UISettingsWebviewService', () => {
    let service: UISettingsWebviewService;
    let mockLogger: jest.Mocked<Logger>;
    let testTabs: IUISettingsTab[];

    beforeEach(() => {
        jest.clearAllMocks();
        mockLogger = new Logger() as jest.Mocked<Logger>;
        service = new UISettingsWebviewService();
        testTabs = [
            { id: 'general', label: 'General', content: '<div>General settings</div>' },
            { id: 'appearance', label: 'Appearance', content: '<div>Appearance settings</div>' },
            { id: 'advanced', label: 'Advanced', content: '<div>Advanced settings</div>' }
        ];
    });

    describe('generateWebviewContent', () => {
        it('should generate HTML for the webview with tabs', () => {
            const html = service.generateWebviewContent(testTabs);

            // Verify HTML structure
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<head>');
            expect(html).toContain('<body>');

            // Verify tab container
            expect(html).toContain('<div class="tab-container">');

            // Verify tabs
            testTabs.forEach(tab => {
                expect(html).toContain(`data-tab="${tab.id}"`);
                expect(html).toContain(`>${tab.label}<`);
                expect(html).toContain(`id="${tab.id}" class="tab-content`);
                expect(html).toContain(tab.content);
            });

            // Verify first tab is active
            expect(html).toContain('class="tab active" data-tab="general"');
            expect(html).toContain('id="general" class="tab-content active"');

            // Verify script
            expect(html).toContain('<script>');
            expect(html).toContain('const vscode = acquireVsCodeApi()');
            expect(html).toContain('addEventListener');
        });

        it('should handle empty tabs array', () => {
            const html = service.generateWebviewContent([]);

            // Should still generate a valid HTML structure
            expect(html).toContain('<!DOCTYPE html>');
            expect(html).toContain('<html lang="en">');
            expect(html).toContain('<head>');
            expect(html).toContain('<body>');
            expect(html).toContain('<div class="tab-container">');

            // No tabs
            expect(html).not.toContain('class="tab active"');
        });

        it('should include CSS for styling', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for CSS styles
            expect(html).toContain('<style>');
            expect(html).toContain('.tab-container');
            expect(html).toContain('.tab');
            expect(html).toContain('.tab.active');
            expect(html).toContain('.tab-content');
            expect(html).toContain('.tab-content.active');
            expect(html).toContain('.setting-group');
            expect(html).toContain('.error-message');
        });

        it('should include theming variables with VS Code theme integration', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for VS Code theming variables
            expect(html).toContain('var(--vscode-foreground)');
            expect(html).toContain('var(--vscode-focusBorder)');
            expect(html).toContain('var(--vscode-editor-background)');
            expect(html).toContain('var(--vscode-panel-border)');
            expect(html).toContain('var(--vscode-input-background)');
            expect(html).toContain('var(--vscode-input-foreground)');
            expect(html).toContain('var(--vscode-input-border)');
            expect(html).toContain('var(--vscode-errorForeground)');
        });

        it('should include client-side message handlers', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for message handling
            expect(html).toContain('window.addEventListener(\'message\'');
            expect(html).toContain('const message = event.data');
            expect(html).toContain('switch (message.command)');
            expect(html).toContain('case \'showError\'');
            expect(html).toContain('case \'selectTab\'');
        });

        it('should include click handlers for tabs', () => {
            const html = service.generateWebviewContent(testTabs);

            // Check for tab click handling
            expect(html).toContain('tabs.forEach(tab => {');
            expect(html).toContain('tab.addEventListener(\'click\'');
            expect(html).toContain('tabs.forEach(t => t.classList.remove(\'active\'))');
            expect(html).toContain('tabContents.forEach(c => c.classList.remove(\'active\'))');
            expect(html).toContain('tab.classList.add(\'active\')');
            expect(html).toContain('vscode.postMessage({');
            expect(html).toContain('command: \'tabChanged\'');
        });

        it('should escape HTML in tab content to prevent XSS', () => {
            const tabsWithXSS: IUISettingsTab[] = [
                {
                    id: 'xss',
                    label: 'XSS Test',
                    content: '<script>alert("XSS");</script><img src="x" onerror="alert(\'XSS\')">'
                }
            ];

            const html = service.generateWebviewContent(tabsWithXSS);

            // The script tag should be included as content, not executed
            expect(html).toContain('&lt;script&gt;alert("XSS");&lt;/script&gt;');
            expect(html).toContain('&lt;img src="x" onerror="alert(\'XSS\')"&gt;');

            // Or verify the content is encoded properly
            expect(html).not.toContain('<script>alert("XSS");</script>');
        });

        it('should handle error and log it', () => {
            // Mock the logger.error method
            jest.spyOn(service['logger'], 'error');

            // Force an error by passing invalid tabs
            const invalidTabs = null as unknown as IUISettingsTab[];
            expect(() => service.generateWebviewContent(invalidTabs)).toThrow();

            // Check that the error was logged
            expect(service['logger'].error).toHaveBeenCalled();
        });

        it('should support form inputs in tab content', () => {
            const tabsWithForm: IUISettingsTab[] = [
                {
                    id: 'form',
                    label: 'Form Test',
                    content: `
                        <div class="setting-group">
                            <label for="name">Name:</label>
                            <input type="text" id="name" />
                        </div>
                        <div class="setting-group">
                            <label for="email">Email:</label>
                            <input type="email" id="email" />
                        </div>
                        <div class="setting-group">
                            <label for="theme">Theme:</label>
                            <select id="theme">
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                    `
                }
            ];

            const html = service.generateWebviewContent(tabsWithForm);

            // Check for form elements
            expect(html).toContain('<label for="name">Name:</label>');
            expect(html).toContain('<input type="text" id="name" />');
            expect(html).toContain('<label for="email">Email:</label>');
            expect(html).toContain('<input type="email" id="email" />');
            expect(html).toContain('<select id="theme">');
            expect(html).toContain('<option value="light">Light</option>');
            expect(html).toContain('<option value="dark">Dark</option>');
        });
    });
});
