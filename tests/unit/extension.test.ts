import * as vscode from 'vscode';
import { activate, deactivate } from '../../src/extension';

describe('Extension Tests', () => {
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            storagePath: '/mock/storage/path',
            globalStoragePath: '/mock/global/storage/path',
            logPath: '/mock/log/path',
            extensionUri: vscode.Uri.file('/mock/extension/path'),
            storageUri: vscode.Uri.file('/mock/storage/path'),
            globalStorageUri: vscode.Uri.file('/mock/global/storage/path'),
            logUri: vscode.Uri.file('/mock/log/path'),
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([]),
                setKeysForSync: jest.fn(),
            } as any, // Use 'as any' for simplicity if strict type isn't needed for test
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([]),
            } as any,
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn(),
            } as any,
            environmentVariableCollection: {
                persistent: false,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                [Symbol.iterator]: jest.fn(),
                getScoped: jest.fn(),
                description: undefined
            } as any,
            extensionMode: vscode.ExtensionMode.Test,
            asAbsolutePath: jest.fn(relativePath => `/mock/extension/path/${relativePath}`),
            extension: {
                id: 'test.extension',
                extensionPath: '/mock/extension/path',
                isActive: false,
                packageJSON: {},
                extensionKind: vscode.ExtensionKind.Workspace,
                exports: {},
                activate: jest.fn().mockResolvedValue({}),
                extensionUri: vscode.Uri.file('/mock/extension/path'),
            },
            languageModelAccessInformation: {
                onDidChange: jest.fn(),
                canSendRequest: jest.fn().mockReturnValue(true)
            }
        } as unknown as vscode.ExtensionContext;
    });

    describe('Activation', () => {
        it('should register commands on activation', async () => {
            await activate(mockContext);

            expect(vscode.commands.registerCommand).toHaveBeenCalled();
            expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        });

        it('should register the welcome message command', async () => {
            await activate(mockContext);

            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.showWelcomeMessage',
                expect.any(Function)
            );
        });

        it('should initialize services', async () => {
            await activate(mockContext);

            // Verify service initialization through mocked commands
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.startAgent',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.stopAgent',
                expect.any(Function)
            );
        });
    });

    describe('Deactivation', () => {
        it('should clean up on deactivation', () => {
            const disposeStub = jest.fn();
            mockContext.subscriptions.push({ dispose: disposeStub });

            deactivate();

            expect(disposeStub).toHaveBeenCalled();
        });
    });

    describe('Command Execution', () => {
        it('should show welcome message when command is executed', async () => {
            await activate(mockContext);

            // Get the registered welcome message command handler
            const commandHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.showWelcomeMessage'
            )?.[1];

            // Execute the command handler
            if (commandHandler) {
                await commandHandler();
            }

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                'Copilot Productivity and Performance Analyzer is active!'
            );
        });

        it('should handle agent start/stop commands', async () => {
            await activate(mockContext);

            // Get the start agent command handler
            const startHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
                call => call[0] === 'copilot-ppa.startAgent'
            )?.[1];

            // Execute the command handler
            if (startHandler) {
                await startHandler();
            }

            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
                expect.stringContaining('Starting')
            );
        });
    });
});