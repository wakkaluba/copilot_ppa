import * as vscode from 'vscode';

export function createMockOutputChannel() {
    return {
        name: 'Mock Output Channel',
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
        show: jest.fn()
    };
}

export function createMockWebviewPanel() {
    return {
        viewType: 'mockWebview',
        title: 'Mock Webview',
        webview: {
            html: '',
            options: {},
            onDidReceiveMessage: jest.fn(),
            postMessage: jest.fn(),
            asWebviewUri: jest.fn(uri => uri),
            cspSource: ''
        },
        onDidDispose: jest.fn(),
        onDidChangeViewState: jest.fn(),
        reveal: jest.fn(),
        dispose: jest.fn(),
        visible: true,
        active: true,
        show: jest.fn()
    };
}

export function createMockExtensionContext() {
    return {
        subscriptions: [],
        extensionPath: '/mock/path',
        extensionUri: { fsPath: '/mock/path' },
        storagePath: '/mock/storage/path',
        globalState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            keys: jest.fn().mockReturnValue([])
        },
        workspaceState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            keys: jest.fn().mockReturnValue([])
        },
        secrets: {
            get: jest.fn().mockResolvedValue(''),
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined)
        },
        extensionMode: vscode.ExtensionMode.Test,
        logPath: '/mock/log/path',
        storageUri: { fsPath: '/mock/storage/path' },
        globalStorageUri: { fsPath: '/mock/global/storage/path' },
        logUri: { fsPath: '/mock/log/path' },
        asAbsolutePath: jest.fn(relativePath => `/mock/path/${relativePath}`)
    };
}

export function createMockConversationHistory() {
    return {
        addMessage: jest.fn(),
        getHistory: jest.fn().mockReturnValue([]),
        clearHistory: jest.fn(),
        saveConversation: jest.fn(),
        loadConversation: jest.fn(),
        getConversationList: jest.fn().mockResolvedValue([])
    };
}

export function createMockDocument(content = '', language = 'typescript') {
    return {
        fileName: 'test.ts',
        uri: { fsPath: '/mock/path/test.ts' },
        getText: jest.fn().mockReturnValue(content),
        languageId: language,
        lineCount: content.split('\n').length,
        lineAt: jest.fn(line => ({
            text: content.split('\n')[line],
            range: { start: { line }, end: { line } }
        })),
        save: jest.fn().mockResolvedValue(true)
    };
}

export function createMockWorkspaceFolder() {
    return {
        uri: { fsPath: '/mock/workspace' },
        name: 'mock-workspace',
        index: 0
    };
}