// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\displaySettingsCommand.test.ts
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { DisplaySettingsService } from '../../services/displaySettingsService';
import { WebviewPanelManager } from '../../webview/webviewPanelManager';
import { DisplaySettingsCommand } from '../displaySettingsCommand';

describe('Display Settings Command', () => {
    let sandbox: sinon.SinonSandbox;
    let displaySettingsCommand: DisplaySettingsCommand;
    let mockDisplaySettingsService: any;
    let mockWebviewPanel: any;
    let mockWebview: any;
    let mockCommandRegistry: any;
    let mockGetSettingsPanel: sinon.SinonStub;
    let mockGetSettingsStyles: sinon.SinonStub;
    let mockGetSettingsScript: sinon.SinonStub;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock the DisplaySettingsService
        mockDisplaySettingsService = {
            getSettings: sandbox.stub().returns({
                fontSize: 14,
                messageSpacing: 12,
                codeBlockTheme: 'default',
                userMessageColor: '#569cd6',
                agentMessageColor: '#4ec9b0',
                timestampDisplay: true,
                compactMode: false
            }),
            updateSetting: sandbox.stub().resolves()
        };

        sandbox.stub(DisplaySettingsService, 'getInstance').returns(mockDisplaySettingsService);

        // Mock webview panel
        mockWebview = {
            html: '',
            onDidReceiveMessage: sandbox.stub(),
            postMessage: sandbox.stub().resolves(true)
        };

        mockWebviewPanel = {
            webview: mockWebview,
            onDidDispose: sandbox.stub(),
            reveal: sandbox.stub(),
            dispose: sandbox.stub()
        };

        sandbox.stub(WebviewPanelManager, 'createOrShowPanel').returns(mockWebviewPanel);

        // Mock VS Code commands
        mockCommandRegistry = {
            registerCommand: sandbox.stub().returns({ dispose: sandbox.stub() })
        };

        sandbox.stub(vscode.commands, 'registerCommand').value(mockCommandRegistry.registerCommand);

        // Mock webview UI components
        mockGetSettingsPanel = sandbox.stub().returns('<div>Mock Settings Panel</div>');
        mockGetSettingsStyles = sandbox.stub().returns('body { color: #000; }');
        mockGetSettingsScript = sandbox.stub().returns('function setupListeners() {}');

        const displaySettingsModule = {
            getDisplaySettingsPanel: mockGetSettingsPanel,
            getDisplaySettingsStyles: mockGetSettingsStyles,
            getDisplaySettingsScript: mockGetSettingsScript
        };

        sandbox.stub(require, 'cache').value({
            '../webview/displaySettings': {
                exports: displaySettingsModule
            }
        });

        // Create the command instance
        displaySettingsCommand = new DisplaySettingsCommand();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('register', () => {
        it('should register the command with VS Code', () => {
            const disposable = displaySettingsCommand.register();

            expect(mockCommandRegistry.registerCommand).toHaveBeenCalledWith(
                'copilotPPA.openDisplaySettings',
                expect.any(Function)
            );
            expect(disposable).toBeDefined();
        });
    });

    describe('execute', () => {
        it('should create or show the display settings panel', async () => {
            // Get the command callback
            const commandCallback = mockCommandRegistry.registerCommand.args[0][1];
            displaySettingsCommand.register();

            // Call the command callback
            await commandCallback();

            // Verify the panel was created
            expect(WebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
                'displaySettingsPanel',
                'Display Settings',
                vscode.ViewColumn.One
            );

            // Verify webview HTML was set
            expect(mockWebview.html).toBeDefined();

            // Verify message handler was set up
            expect(mockWebview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should handle updateDisplaySettings message', async () => {
            displaySettingsCommand.register();

            // Setup message handler
            const onMessageCallback = mockWebview.onDidReceiveMessage.args[0][0];

            // Verify message handler by sending a message
            await onMessageCallback({
                command: 'updateDisplaySettings',
                settings: {
                    fontSize: 16,
                    messageSpacing: 14
                }
            });

            // Verify settings were updated
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('fontSize', 16);
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('messageSpacing', 14);
        });

        it('should handle resetDisplaySettings message', async () => {
            const mockWindow = {
                showInformationMessage: sandbox.stub()
            };
            sandbox.stub(vscode.window, 'showInformationMessage').value(mockWindow.showInformationMessage);

            displaySettingsCommand.register();

            // Setup message handler
            const onMessageCallback = mockWebview.onDidReceiveMessage.args[0][0];

            // Verify message handler by sending a reset message
            await onMessageCallback({
                command: 'resetDisplaySettings'
            });

            // Verify all default settings were updated
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('fontSize', 14);
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('messageSpacing', 12);
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('codeBlockTheme', 'default');
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('userMessageColor', '#569cd6');
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('agentMessageColor', '#4ec9b0');
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('timestampDisplay', true);
            expect(mockDisplaySettingsService.updateSetting).toHaveBeenCalledWith('compactMode', false);

            // Verify HTML was refreshed and message shown
            expect(mockWindow.showInformationMessage).toHaveBeenCalledWith('Display settings reset to defaults');
        });
    });

    describe('getWebviewContent', () => {
        it('should generate HTML content for the webview', () => {
            displaySettingsCommand.register();

            // Get the execute method
            const commandCallback = mockCommandRegistry.registerCommand.args[0][1];

            // Call the command callback to trigger getWebviewContent
            commandCallback();

            // Verify that html content was set and UI components were used
            expect(mockGetSettingsPanel).toHaveBeenCalledWith(mockDisplaySettingsService.getSettings());
            expect(mockGetSettingsStyles).toHaveBeenCalled();
            expect(mockGetSettingsScript).toHaveBeenCalled();
            expect(mockWebview.html).toBeDefined();
            expect(mockWebview.html.length).toBeGreaterThan(0);
        });
    });
});
