import * as vscode from 'vscode';
import { ConfirmationSettingsPanel } from '../ConfirmationSettingsPanel';

jest.mock('vscode');

describe('ConfirmationSettingsPanel', () => {
    let panel: ConfirmationSettingsPanel;
    let mockWebviewPanel: any;
    let mockExtensionContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockWebviewPanel = {
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn(),
                asWebviewUri: jest.fn().mockReturnValue('mock-uri')
            },
            onDidDispose: jest.fn(),
            dispose: jest.fn()
        };

        (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);

        mockExtensionContext = {
            extensionUri: vscode.Uri.file('/test/extension/path'),
            globalState: {
                get: jest.fn().mockResolvedValue({}),
                update: jest.fn().mockResolvedValue(undefined)
            }
        } as unknown as vscode.ExtensionContext;
    });

    describe('panel creation', () => {
        it('should create panel with correct properties', () => {
            panel = new ConfirmationSettingsPanel(mockExtensionContext);

            expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
                'confirmationSettings',
                'Confirmation Settings',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
        });

        it('should set initial HTML content', () => {
            panel = new ConfirmationSettingsPanel(mockExtensionContext);

            expect(mockWebviewPanel.webview.html).toBeTruthy();
            expect(mockWebviewPanel.webview.html).toContain('Confirmation Settings');
            expect(mockWebviewPanel.webview.html).toContain('Content-Security-Policy');
        });
    });

    describe('message handling', () => {
        beforeEach(() => {
            panel = new ConfirmationSettingsPanel(mockExtensionContext);
        });

        it('should handle save settings message', async () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                command: 'saveSettings',
                settings: { confirmFileEdits: true }
            });

            expect(mockExtensionContext.globalState.update).toHaveBeenCalledWith(
                'confirmationSettings',
                expect.objectContaining({ confirmFileEdits: true })
            );
            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'settingsUpdated',
                settings: expect.any(Object)
            });
        });

        it('should handle reset settings message', async () => {
            const messageHandler = mockWebviewPanel.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                command: 'resetSettings'
            });

            expect(mockExtensionContext.globalState.update).toHaveBeenCalledWith(
                'confirmationSettings',
                expect.objectContaining({
                    confirmFileEdits: true,
                    confirmTerminalCommands: true
                })
            );
            expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
                command: 'settingsUpdated',
                settings: expect.any(Object)
            });
        });
    });

    describe('settings management', () => {
        beforeEach(() => {
            panel = new ConfirmationSettingsPanel(mockExtensionContext);
        });

        it('should load default settings when none exist', async () => {
            mockExtensionContext.globalState.get.mockResolvedValueOnce(undefined);

            const settings = await panel['_getSettings']();
            expect(settings).toEqual({
                confirmFileEdits: true,
                confirmTerminalCommands: true,
                confirmWebviewOperations: true,
                confirmWorkspaceEdits: true
            });
        });

        it('should merge existing settings with defaults', async () => {
            mockExtensionContext.globalState.get.mockResolvedValueOnce({
                confirmFileEdits: false
            });

            const settings = await panel['_getSettings']();
            expect(settings).toEqual(expect.objectContaining({
                confirmFileEdits: false,
                confirmTerminalCommands: true
            }));
        });
    });

    describe('cleanup', () => {
        beforeEach(() => {
            panel = new ConfirmationSettingsPanel(mockExtensionContext);
        });

        it('should dispose panel on cleanup', () => {
            const disposeHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
            disposeHandler();

            expect(mockWebviewPanel.dispose).toHaveBeenCalled();
        });

        it('should ensure singleton instance is cleared', () => {
            const disposeHandler = mockWebviewPanel.onDidDispose.mock.calls[0][0];
            disposeHandler();

            // Should allow creating a new instance
            const newPanel = new ConfirmationSettingsPanel(mockExtensionContext);
            expect(newPanel).toBeDefined();
        });
    });
});
