import * as vscode from 'vscode';
import * as sinon from 'sinon';

export function createMockLogOutputChannel(): vscode.LogOutputChannel {
    return {
        name: 'Mock Output',
        append: sinon.stub(),
        appendLine: sinon.stub(),
        clear: sinon.stub(),
        dispose: sinon.stub(),
        hide: sinon.stub(),
        show: function(columnOrPreserveFocus?: vscode.ViewColumn | boolean, preserveFocus?: boolean) {
            // This implementation handles both overloads
            return undefined;
        },
        debug: sinon.stub(),
        error: sinon.stub(),
        info: sinon.stub(),
        trace: sinon.stub(),
        warn: sinon.stub(),
        logLevel: vscode.LogLevel.Info,
        onDidChangeLogLevel: new vscode.EventEmitter<vscode.LogLevel>().event,
        replace: sinon.stub(),
    };
}

export function createMockDocument(content: string): vscode.TextDocument {
    const lines = content.split('\n');
    return {
        uri: vscode.Uri.file('mock.ts'),
        fileName: 'mock.ts',
        isUntitled: false,
        languageId: 'typescript',
        version: 1,
        isDirty: false,
        isClosed: false,
        save: () => Promise.resolve(true),
        eol: vscode.EndOfLine.LF,
        lineCount: lines.length,
        lineAt: function(lineOrPos: number | vscode.Position) {
            const line = typeof lineOrPos === 'number' ? lineOrPos : lineOrPos.line;
            return {
                lineNumber: line,
                text: lines[line],
                range: new vscode.Range(line, 0, line, lines[line].length),
                rangeIncludingLineBreak: new vscode.Range(line, 0, line, lines[line].length + 1),
                firstNonWhitespaceCharacterIndex: lines[line].search(/\S/),
                isEmptyOrWhitespace: lines[line].trim().length === 0
            };
        },
        offsetAt: () => 0,
        positionAt: () => new vscode.Position(0, 0),
        getText: () => content,
        getWordRangeAtPosition: () => undefined,
        validateRange: range => range,
        validatePosition: position => position
    };
}

/**
 * Creates a mock Memento implementation that fully implements the VS Code Memento interface
 */
export function createMockMemento(): vscode.Memento {
    const storage = new Map<string, any>();
    
    return {
        get: <T>(key: string, defaultValue?: T): T | undefined => {
            return storage.has(key) ? storage.get(key) : defaultValue;
        },
        update: (key: string, value: any): Thenable<void> => {
            storage.set(key, value);
            return Promise.resolve();
        },
        keys: (): readonly string[] => {
            return Array.from(storage.keys()) as readonly string[];
        }
    };
}

/**
 * Creates a mock global state that implements VS Code's GlobalState interface
 */
export function createMockGlobalState(): vscode.Memento & { setKeysForSync(keys: readonly string[]): Thenable<void> } {
    const memento = createMockMemento();
    return {
        ...memento,
        setKeysForSync: (keys: readonly string[]): Thenable<void> => Promise.resolve()
    };
}

/**
 * Creates a mock extension context with all required properties for testing
 */
export function createMockExtensionContext(): vscode.ExtensionContext {
    const mockMemento = createMockMemento();
    const mockGlobalState = createMockGlobalState();
    
    return {
        subscriptions: [],
        workspaceState: mockMemento,
        globalState: mockGlobalState,
        extensionPath: '/mock/extension/path',
        asAbsolutePath: (relativePath) => `/mock/extension/path/${relativePath}`,
        storagePath: '/mock/storage/path',
        logPath: '/mock/log/path',
        globalStoragePath: '/mock/global/storage/path',
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        extensionMode: vscode.ExtensionMode.Test,
        logUri: vscode.Uri.file('/mock/log/path'),
        globalStorageUri: vscode.Uri.file('/mock/global/storage/path'),
        storageUri: vscode.Uri.file('/mock/storage/path'),
        secrets: {
            get: sinon.stub().resolves(),
            store: sinon.stub().resolves(),
            delete: sinon.stub().resolves(),
            onDidChange: sinon.stub().returns({ dispose: sinon.stub() })
        },
        environmentVariableCollection: {
            persistent: true,
            replace: sinon.stub(),
            append: sinon.stub(),
            prepend: sinon.stub(),
            get: sinon.stub(),
            forEach: sinon.stub(),
            delete: sinon.stub(),
            clear: sinon.stub(),
            getScoped: sinon.stub(),
            description: '',
            [Symbol.iterator]: function*() { yield* []; }
        },
        extension: {
            id: 'test-extension',
            extensionUri: vscode.Uri.file('/mock/extension/path'),
            extensionPath: '/mock/extension/path',
            isActive: true,
            packageJSON: {},
            exports: {},
            activate: sinon.stub(),
            extensionKind: vscode.ExtensionKind.UI
        },
        languageModelAccessInformation: {
            endpoint: "https://mock-endpoint.com",
            authHeader: "mock-auth-header"
        }
    };
}

export function createMockWorkspaceFolder(): vscode.WorkspaceFolder {
    return {
        uri: vscode.Uri.file('/mock/workspace'),
        name: 'mock-workspace',
        index: 0
    };
}

export function createMockOutputChannel(): vscode.OutputChannel {
    return {
        name: 'Mock Output',
        append: sinon.stub(),
        appendLine: sinon.stub(),
        clear: sinon.stub(),
        dispose: sinon.stub(),
        hide: sinon.stub(),
        show: function(columnOrPreserveFocus?: vscode.ViewColumn | boolean, preserveFocus?: boolean) {
            // This implementation handles both overloads
            return undefined;
        },
        replace: sinon.stub()
    };
}