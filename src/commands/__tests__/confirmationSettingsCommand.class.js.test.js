// filepath: d:\___coding\tools\copilot_ppa\src\commands\__tests__\confirmationSettingsCommand.class.js.test.js
const sinon = require('sinon');
const vscode = require('vscode');
const { ConfirmationSettingsCommand } = require('../confirmationSettingsCommand');
const { UserConfirmationService } = require('../../services/ui/UserConfirmationService');
const { WebviewPanelManager } = require('../../utils/webviewPanelManager');
const confirmationSettings = require('../../webview/confirmationSettings');

describe('ConfirmationSettingsCommand Class (JavaScript)', () => {
    let mockContext;
    let mockUserConfirmationService;
    let mockPanel;
    let sandbox;
    let command;
    let mockWebviewPanelManager;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        // Mock user confirmation service
        mockUserConfirmationService = {
            getInstance: sandbox.stub(),
            areContinuePromptsDisabled: sandbox.stub().returns(false),
            setDisableContinuePrompts: sandbox.stub().resolves(),
            setShowNotificationsForLongOperations: sandbox.stub().resolves(),
            setLongOperationThreshold: sandbox.stub().resolves(),
            savePreferences: sandbox.stub().resolves(),
            _preferences: {
                disabledPromptTypes: [],
                notificationPreferences: {
                    showNotificationsForLongOperations: true,
                    longOperationThresholdMs: 5000
                }
            }
        };

        mockUserConfirmationService.getInstance.returns(mockUserConfirmationService);
        sandbox.stub(UserConfirmationService, 'getInstance').value(mockUserConfirmationService.getInstance);

        // Mock VS Code window API
        sandbox.stub(vscode.window, 'showInformationMessage').resolves();

        // Mock webview panel
        mockPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: sandbox.stub().callsArg(0)
            }
        };

        // Mock webview panel manager
        mockWebviewPanelManager = {
            createOrShowPanel: sandbox.stub().returns(mockPanel)
        };
        sandbox.stub(WebviewPanelManager, 'createOrShowPanel').value(mockWebviewPanelManager.createOrShowPanel);

        // Mock confirmation settings webview functions
        sandbox.stub(confirmationSettings, 'getConfirmationSettingsPanel').returns('<div>Mock Panel</div>');
        sandbox.stub(confirmationSettings, 'getConfirmationSettingsScript').returns('function mockScript() {}');
        sandbox.stub(confirmationSettings, 'getConfirmationSettingsStyles').returns('.mock-style { color: red; }');

        // Mock extension context
        mockContext = {
            subscriptions: [],
            extensionUri: { path: '/extension/uri', scheme: 'file' },
            workspaceState: { get: sandbox.stub(), update: sandbox.stub() },
            globalState: { get: sandbox.stub(), update: sandbox.stub() }
        };

        // Create the command instance
        command = new ConfirmationSettingsCommand(mockContext);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should initialize with the user confirmation service', () => {
            expect(mockUserConfirmationService.getInstance).toHaveBeenCalledWith(mockContext);
        });
    });

    describe('execute', () => {
        it('should create and display the webview panel', async () => {
            await command.execute();

            expect(mockWebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
                'confirmationSettingsPanel',
                'Confirmation Settings',
                vscode.ViewColumn.One
            );
            expect(mockPanel.webview.html).not.toBe('');
        });

        it('should set up message handling for the webview', async () => {
            await command.execute();

            expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
        });
    });

    describe('getWebviewContent', () => {
        it('should fetch current settings from the confirmation service', async () => {
            await command.execute();

            expect(mockUserConfirmationService.areContinuePromptsDisabled).toHaveBeenCalled();
        });

        it('should include confirmation settings panel, styles, and script in the HTML', async () => {
            // Access private method for testing
            const content = command.getWebviewContent();

            expect(content).toContain('Mock Panel');
            expect(content).toContain('mockScript');
            expect(content).toContain('mock-style');
        });
    });

    describe('message handling', () => {
        it('should handle saveConfirmationSettings message', async () => {
            const settings = {
                disableContinuePrompts: true,
                showNotificationsForLongOperations: false,
                longOperationThresholdSeconds: 10
            };

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'saveConfirmationSettings',
                settings: settings
            });

            expect(mockUserConfirmationService.setDisableContinuePrompts)
                .toHaveBeenCalledWith(settings.disableContinuePrompts);
            expect(mockUserConfirmationService.setShowNotificationsForLongOperations)
                .toHaveBeenCalledWith(settings.showNotificationsForLongOperations);
            expect(mockUserConfirmationService.setLongOperationThreshold)
                .toHaveBeenCalledWith(settings.longOperationThresholdSeconds * 1000);
            expect(vscode.window.showInformationMessage)
                .toHaveBeenCalledWith('Confirmation settings updated');
        });

        it('should handle resetConfirmationSettings message', async () => {
            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'resetConfirmationSettings'
            });

            // Default settings should be applied
            expect(mockUserConfirmationService.setDisableContinuePrompts)
                .toHaveBeenCalledWith(false);
            expect(mockUserConfirmationService.setShowNotificationsForLongOperations)
                .toHaveBeenCalledWith(true);
            expect(mockUserConfirmationService.setLongOperationThreshold)
                .toHaveBeenCalledWith(5000);
            expect(vscode.window.showInformationMessage)
                .toHaveBeenCalledWith('Confirmation settings reset to defaults');
        });

        it('should handle resetPromptTypes message', async () => {
            // Set up some disabled prompt types to reset
            mockUserConfirmationService._preferences.disabledPromptTypes = ['type1', 'type2'];

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'resetPromptTypes'
            });

            // Check if disabled prompt types were reset to empty array
            expect(mockUserConfirmationService._preferences.disabledPromptTypes).toEqual([]);
            expect(mockUserConfirmationService.savePreferences).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage)
                .toHaveBeenCalledWith('All prompt type settings have been reset');
        });

        it('should not call savePreferences if disabledPromptTypes is undefined', async () => {
            // Set disabledPromptTypes to undefined
            mockUserConfirmationService._preferences.disabledPromptTypes = undefined;

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'resetPromptTypes'
            });

            // savePreferences should not be called
            expect(mockUserConfirmationService.savePreferences).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should handle errors when saving settings', async () => {
            // Mock service method to throw an error
            const error = new Error('Failed to save settings');
            mockUserConfirmationService.setDisableContinuePrompts.rejects(error);

            // Spy on console.error
            const consoleErrorSpy = sandbox.spy(console, 'error');

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'saveConfirmationSettings',
                settings: {
                    disableContinuePrompts: true,
                    showNotificationsForLongOperations: true,
                    longOperationThresholdSeconds: 5
                }
            });

            // Verify error was logged
            expect(consoleErrorSpy.calledWith(error)).toBe(true);
        });

        it('should handle errors when resetting settings', async () => {
            // Mock service method to throw an error
            const error = new Error('Failed to reset settings');
            mockUserConfirmationService.setDisableContinuePrompts.rejects(error);

            // Spy on console.error
            const consoleErrorSpy = sandbox.spy(console, 'error');

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'resetConfirmationSettings'
            });

            // Verify error was logged
            expect(consoleErrorSpy.calledWith(error)).toBe(true);
        });

        it('should handle errors when resetting prompt types', async () => {
            // Mock service method to throw an error
            const error = new Error('Failed to reset prompt types');
            mockUserConfirmationService.savePreferences.rejects(error);

            // Set up some disabled prompt types to reset
            mockUserConfirmationService._preferences.disabledPromptTypes = ['type1', 'type2'];

            // Spy on console.error
            const consoleErrorSpy = sandbox.spy(console, 'error');

            // Execute first to set up message handling
            await command.execute();

            // Simulate message receipt
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'resetPromptTypes'
            });

            // Verify error was logged
            expect(consoleErrorSpy.calledWith(error)).toBe(true);
        });
    });

    describe('integration with VS Code', () => {
        it('should integrate with VS Code WebviewPanel API', async () => {
            // Execute to create the panel
            await command.execute();

            // Verify panel was created with correct parameters
            expect(mockWebviewPanelManager.createOrShowPanel).toHaveBeenCalledWith(
                'confirmationSettingsPanel',
                'Confirmation Settings',
                vscode.ViewColumn.One
            );
        });

        it('should handle changes to settings immediately', async () => {
            // Execute to create the panel
            await command.execute();

            // Simulate saving settings
            await mockPanel.webview.onDidReceiveMessage.yield({
                command: 'saveConfirmationSettings',
                settings: {
                    disableContinuePrompts: true,
                    showNotificationsForLongOperations: true,
                    longOperationThresholdSeconds: 10
                }
            });

            // Verify settings were saved immediately
            expect(mockUserConfirmationService.setDisableContinuePrompts).toHaveBeenCalledWith(true);
            expect(mockUserConfirmationService.setLongOperationThreshold).toHaveBeenCalledWith(10000);

            // Verify user was notified of the change
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Confirmation settings updated');
        });
    });
});
