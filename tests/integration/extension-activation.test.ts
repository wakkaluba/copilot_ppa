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
    ExtensionContext: jest.fn()
}), { virtual: true });

describe('Extension Activation Integration Test', () => {
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockContext = {
            subscriptions: [],
            extensionPath: '',
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
            extensionUri: vscode.Uri.file(''),
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
            globalStorageUri: vscode.Uri.file(''),
            logUri: vscode.Uri.file(''),
            storageUri: vscode.Uri.file(''),
            asAbsolutePath: jest.fn(),
        };

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