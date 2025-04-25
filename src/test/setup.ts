// This file sets up the test environment with mocks for VS Code APIs
import * as vscode from 'vscode';

// Mock VS Code API
export const mockVSCodeAPI = () => {
    const workspace: Partial<typeof vscode.workspace> = {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key: string, defaultValue: any) => defaultValue),
            update: jest.fn().mockResolvedValue(undefined),
            has: jest.fn().mockReturnValue(false),
        }),
        workspaceFolders: [
            {
                uri: { fsPath: '/test/workspace' },
                name: 'Test Workspace',
                index: 0
            }
        ],
        onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        fs: {
            readFile: jest.fn().mockResolvedValue(Buffer.from('')),
            writeFile: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            rename: jest.fn().mockResolvedValue(undefined),
            copy: jest.fn().mockResolvedValue(undefined),
            createDirectory: jest.fn().mockResolvedValue(undefined),
            stat: jest.fn().mockResolvedValue({
                type: vscode.FileType.File,
                ctime: Date.now(),
                mtime: Date.now(),
                size: 0
            }),
            readDirectory: jest.fn().mockResolvedValue([]),
            isWritableFileSystem: jest.fn().mockReturnValue(true)
        }
    };

    const window: Partial<typeof vscode.window> = {
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        createWebviewPanel: jest.fn().mockReturnValue({
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn().mockReturnValue({ dispose: jest.fn() }),
                postMessage: jest.fn().mockResolvedValue(true),
                asWebviewUri: jest.fn().mockImplementation(uri => uri),
                options: {}
            },
            onDidDispose: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            onDidChangeViewState: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            reveal: jest.fn(),
            dispose: jest.fn()
        }),
        showQuickPick: jest.fn(),
        showInputBox: jest.fn(),
        createStatusBarItem: jest.fn().mockReturnValue({
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        activeTextEditor: undefined,
        visibleTextEditors: [],
        onDidChangeActiveTextEditor: jest.fn().mockReturnValue({ dispose: jest.fn() })
    };

    const commands: Partial<typeof vscode.commands> = {
        registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        executeCommand: jest.fn()
    };

    const extensions: Partial<typeof vscode.extensions> = {
        getExtension: jest.fn().mockReturnValue({
            id: 'test-extension',
            extensionPath: '/test/extension/path',
            extensionUri: { fsPath: '/test/extension/path' },
            packageJSON: { version: '1.0.0' },
            extensionKind: vscode.ExtensionKind.UI,
            exports: undefined,
            activate: jest.fn().mockResolvedValue(undefined),
            isActive: true
        }),
        all: []
    };

    const mockExtensionContext: vscode.ExtensionContext = {
        subscriptions: [],
        workspaceState: {
            get: jest.fn().mockReturnValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            keys: jest.fn().mockReturnValue([])
        } as any,
        globalState: {
            get: jest.fn().mockReturnValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            setKeysForSync: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        } as any,
        extensionPath: '/test/extension/path',
        extensionUri: { fsPath: '/test/extension/path' } as any,
        asAbsolutePath: jest.fn().mockImplementation((path: string) => `/test/extension/path/${path}`),
        storagePath: '/test/storage/path',
        storageUri: { fsPath: '/test/storage/path' } as any,
        globalStoragePath: '/test/global-storage/path',
        globalStorageUri: { fsPath: '/test/global-storage/path' } as any,
        logPath: '/test/log/path',
        logUri: { fsPath: '/test/log/path' } as any,
        extensionMode: vscode.ExtensionMode.Test,
        secrets: {
            get: jest.fn().mockResolvedValue(undefined),
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined)
        }
    };

    // Apply the mocks
    (global as any).vscode = {
        workspace,
        window,
        commands,
        extensions,
        Uri: {
            file: jest.fn().mockImplementation((path: string) => ({ fsPath: path })),
            parse: jest.fn().mockImplementation((path: string) => ({ fsPath: path }))
        },
        FileType: {
            File: 1,
            Directory: 2,
            SymbolicLink: 64
        },
        ExtensionMode: {
            Development: 1,
            Test: 2,
            Production: 3
        },
        ExtensionKind: {
            UI: 1,
            Workspace: 2
        },
        EventEmitter: jest.fn().mockImplementation(() => ({
            event: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            fire: jest.fn()
        }))
    };

    return {
        workspace,
        window,
        commands,
        extensions,
        mockExtensionContext
    };
};

// Execute the mock setup
mockVSCodeAPI();
