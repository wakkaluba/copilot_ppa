import * as vscode from 'vscode';
import { HardwareSpecs } from '../../src/llm/hardwareSpecs';

// Define ExtensionMode values if not available in test environment
enum ExtensionMode {
    Production = 1,
    Development = 2,
    Test = 3
}

export const mockContext: vscode.ExtensionContext = {
    subscriptions: [],
    extensionPath: '/test/path',
    extensionUri: vscode.Uri.parse('file:///test/path'),
    storageUri: vscode.Uri.parse('file:///test/storage'),
    globalStorageUri: vscode.Uri.parse('file:///test/globalStorage'),
    logUri: vscode.Uri.parse('file:///test/log'),
    asAbsolutePath: (p: string) => `/test/path/${p}`,
    storagePath: '/test/storagePath',
    globalStoragePath: '/test/globalStoragePath',
    logPath: '/test/logPath',
    extensionMode: (vscode.ExtensionMode?.Development || ExtensionMode.Development) as vscode.ExtensionMode,
    globalState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve(),
        setKeysForSync: (keys: string[]) => {}
    },
    workspaceState: {
        keys: () => [],
        get: (key: string) => undefined,
        update: (key: string, value: any) => Promise.resolve()
    },
    secrets: {
        get: (key: string) => Promise.resolve(undefined),
        store: (key: string, value: string) => Promise.resolve(),
        delete: (key: string) => Promise.resolve(),
        onDidChange: new vscode.EventEmitter<vscode.SecretStorageChangeEvent>().event
    },
    environmentVariableCollection: {
        persistent: true,
        description: undefined,
        replace: (variable: string, value: string) => {},
        append: (variable: string, value: string) => {},
        prepend: (variable: string, value: string) => {},
        get: (variable: string): vscode.EnvironmentVariableMutator | undefined => undefined,
        forEach: (callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any) => {},
        delete: (variable: string) => {},
        clear: () => {},
        getScoped: (scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection => ({
            persistent: true,
            description: undefined,
            replace: () => {},
            append: () => {},
            prepend: () => {},
            get: () => undefined,
            forEach: () => {},
            delete: () => {},
            clear: () => {},
            [Symbol.iterator]: function* () { yield* []; }
        }),
        [Symbol.iterator]: function* () { yield* []; }
    } as vscode.GlobalEnvironmentVariableCollection,
    extension: {
        id: 'test-extension',
        extensionUri: vscode.Uri.parse('file:///test/path'),
        extensionPath: '/test/path',
        isActive: true,
        packageJSON: {},
        exports: undefined,
        activate: () => Promise.resolve(),
        extensionKind: vscode.ExtensionKind.Workspace
    },
    languageModelAccessInformation: {
        onDidChange: new vscode.EventEmitter<void>().event,
        canSendRequest: (chat: vscode.LanguageModelChat): boolean | undefined => true
    }
};

export const mockHardwareSpecs: HardwareSpecs = {
    gpu: {
        available: true,
        name: 'Test GPU',
        vram: 4096,
        cudaSupport: true
    },
    ram: {
        total: 16384,
        free: 8192
    },
    cpu: {
        cores: 8,
        model: 'Test CPU'
    }
};
