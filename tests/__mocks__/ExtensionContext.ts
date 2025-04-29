import * as vscode from 'vscode';

export function createMockExtensionContext(): vscode.ExtensionContext {
    return {
        subscriptions: [],
        extensionPath: '/test/extension/path',
        storageUri: vscode.Uri.file('/test/storage'),
        globalStorageUri: vscode.Uri.file('/test/global-storage'),
        logUri: vscode.Uri.file('/test/log'),
        extensionUri: vscode.Uri.file('/test/extension'),
        environmentVariableCollection: {} as vscode.EnvironmentVariableCollection,
        extensionMode: vscode.ExtensionMode.Test,
        globalState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            setKeysForSync: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        } as any,
        workspaceState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            setKeysForSync: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        } as any,
        secrets: {
            get: jest.fn(),
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
        } as vscode.SecretStorage,
        storagePath: '/test/storage/path',
        globalStoragePath: '/test/global-storage/path',
        logPath: '/test/log/path',
        asAbsolutePath: jest.fn(path => path)
    };
}