import * as vscode from 'vscode';
import { EventEmitter } from '../../src/common/eventEmitter';

/**
 * Creates a mock extension context for tests
 */
export function createMockExtensionContext(): vscode.ExtensionContext {
    const secretsOnDidChangeEmitter = new vscode.EventEmitter<string>();
    
    return {
        extensionPath: '/mock/extension/path',
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        globalState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            setKeysForSync: jest.fn(),
        } as any,
        workspaceState: {
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
        } as any,
        subscriptions: [],
        asAbsolutePath: jest.fn(relativePath => `/mock/extension/path/${relativePath}`),
        extensionMode: vscode.ExtensionMode.Test,
        globalStoragePath: '/mock/extension/globalStoragePath',
        logPath: '/mock/extension/logPath',
        storagePath: '/mock/extension/storagePath',
        environmentVariableCollection: {} as any,
        logUri: vscode.Uri.file('/mock/extension/logPath'),
        globalStorageUri: vscode.Uri.file('/mock/extension/globalStorageUri'),
        storageUri: vscode.Uri.file('/mock/extension/storageUri'),
        secrets: {
            get: jest.fn().mockResolvedValue(undefined),
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            onDidChange: secretsOnDidChangeEmitter.event
        },
    };
}

/**
 * Create a mock logger for testing
 */
export function createMockLogger() {
    return {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    };
}

/**
 * Create a mock workspace manager for testing
 */
export function createMockWorkspaceManager() {
    return {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        deleteFile: jest.fn(),
        findFiles: jest.fn(),
        createDirectory: jest.fn(),
        fileExists: jest.fn(),
        resolveFilePath: jest.fn(),
    };
}

/**
 * Creates a mock document for testing
 */
export function createMockDocument(content: string = '', language: string = 'typescript'): vscode.TextDocument {
    return {
        uri: vscode.Uri.file('/mock/file.ts'),
        fileName: '/mock/file.ts',
        isUntitled: false,
        languageId: language,
        version: 1,
        isDirty: false,
        isClosed: false,
        save: jest.fn().mockResolvedValue(true),
        eol: vscode.EndOfLine.LF,
        lineCount: content.split('\n').length,
        lineAt: jest.fn(line => {
            const lines = content.split('\n');
            if (line >= 0 && line < lines.length) {
                const lineText = lines[line];
                return {
                    lineNumber: line,
                    text: lineText,
                    range: new vscode.Range(line, 0, line, lineText.length),
                    rangeIncludingLineBreak: new vscode.Range(line, 0, line, lineText.length + 1),
                    firstNonWhitespaceCharacterIndex: lineText.search(/\S/),
                    isEmptyOrWhitespace: lineText.trim().length === 0,
                };
            }
            throw new Error(`Invalid line number: ${line}`);
        }),
        offsetAt: jest.fn(),
        positionAt: jest.fn(),
        getText: jest.fn((range?: vscode.Range) => {
            if (!range) {
                return content;
            }
            const lines = content.split('\n');
            let result = '';
            for (let i = range.start.line; i <= range.end.line; i++) {
                if (i < lines.length) {
                    const line = lines[i];
                    if (i === range.start.line && i === range.end.line) {
                        result += line.substring(range.start.character, range.end.character);
                    } else if (i === range.start.line) {
                        result += line.substring(range.start.character) + '\n';
                    } else if (i === range.end.line) {
                        result += line.substring(0, range.end.character);
                    } else {
                        result += line + '\n';
                    }
                }
            }
            return result;
        }),
        getWordRangeAtPosition: jest.fn(),
        validateRange: jest.fn(range => range),
        validatePosition: jest.fn(position => position),
    } as any;
}
