import * as vscode from 'vscode';
import { activate } from '../../src/extension';

jest.mock('vscode', () => ({
    commands: {
        registerCommand: jest.fn(),
        getCommands: jest.fn().mockResolvedValue([
            'copilot-ppa.startAgent',
            'copilot-ppa.stopAgent',
            'copilot-ppa.showWelcomeMessage'
        ])
    },
    window: {
        showInformationMessage: jest.fn()
    },
    ExtensionContext: jest.fn(),
    ExtensionMode: {
        Test: 2
    },
    ExtensionKind: {
        UI: 1,
        Workspace: 2
    },
    Uri: {
        file: jest.fn(path => ({ path, scheme: 'file', fsPath: path }))
    }
}), { virtual: true });

describe('Extension Activation Integration Test', () => {
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '',
            storagePath: '/test/storage',
            globalStoragePath: '/test/global/storage',
            logPath: '/test/log',
            extensionUri: vscode.Uri.file(''),
            globalStorageUri: vscode.Uri.file('/test/global/storage'),
            logUri: vscode.Uri.file('/test/log'),
            storageUri: vscode.Uri.file('/test/storage'),
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                setKeysForSync: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn().mockReturnValue([])
            },
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn()
            },
            environmentVariableCollection: {
                persistent: true,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn(),
                getScoped: jest.fn(),
                description: '',
                [Symbol.iterator]: jest.fn()
            },
            extensionMode: vscode.ExtensionMode.Test,
            asAbsolutePath: jest.fn(path => `/test/path/${path}`),
            extension: {
                id: 'test-extension',
                extensionUri: vscode.Uri.file(''),
                extensionPath: '',
                isActive: true,
                packageJSON: {},
                exports: {},
                activate: jest.fn(),
                extensionKind: 1 // ExtensionKind.UI
            },
            languageModelAccessInformation: {
                onDidChange: jest.fn(),
                canSendRequest: jest.fn((chat: vscode.LanguageModelChat) => true)
            }
        } as unknown as vscode.ExtensionContext;

        jest.clearAllMocks();
    });

    it('should activate and register commands', async () => {
        await activate(mockContext);
        const commands = await vscode.commands.getCommands();
        
        expect(commands).toContain('copilot-ppa.startAgent');
        expect(commands).toContain('copilot-ppa.stopAgent');
        expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it('should register the welcome message command', async () => {
        await activate(mockContext);
        const commands = await vscode.commands.getCommands();
        
        expect(commands).toContain('copilot-ppa.showWelcomeMessage');
        expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
            'copilot-ppa.showWelcomeMessage',
            expect.any(Function)
        );
    });

    it('should add command registrations to subscriptions', async () => {
        await activate(mockContext);
        
        expect(mockContext.subscriptions.length).toBeGreaterThan(0);
        expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(
            expect.any(Number)
        );
    });
});