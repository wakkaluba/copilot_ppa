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
        show: sinon.stub(),
        debug: sinon.stub(),
        error: sinon.stub(),
        info: sinon.stub(),
        trace: sinon.stub(),
        warn: sinon.stub(),
        logLevel: vscode.LogLevel.Info,
        onDidChangeLogLevel: new vscode.EventEmitter<vscode.LogLevel>().event,
    };
}

export function createMockDocument(content: string): vscode.TextDocument {
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
        lineCount: content.split('\n').length,
        lineAt: (line: number) => {
            const lines = content.split('\n');
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

export function createMockExtensionContext(): vscode.ExtensionContext {
    return {
        subscriptions: [],
        workspaceState: {
            get: sinon.stub(),
            update: sinon.stub(),
            keys: () => []
        },
        globalState: {
            get: sinon.stub(),
            update: sinon.stub(),
            setKeysForSync: sinon.stub(),
            keys: () => []
        },
        extensionPath: '/mock/extension/path',
        asAbsolutePath: (relativePath) => `/mock/extension/path/${relativePath}`,
        storagePath: '/mock/storage/path',
        logPath: '/mock/log/path',
        globalStoragePath: '/mock/global/storage/path',
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        environmentVariableCollection: {} as any,
        extensionMode: vscode.ExtensionMode.Test,
        logUri: vscode.Uri.file('/mock/log/path'),
        globalStorageUri: vscode.Uri.file('/mock/global/storage/path'),
        storageUri: vscode.Uri.file('/mock/storage/path'),
        secrets: {
            get: sinon.stub(),
            store: sinon.stub(),
            delete: sinon.stub()
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
        show: sinon.stub()
    };
}