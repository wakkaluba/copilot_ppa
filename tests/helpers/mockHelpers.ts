import * as vscode from 'vscode';
import { EventEmitter } from 'events';

/**
 * Create a mock extension context
 * @returns Mock extension context
 */
export function createMockExtensionContext(): vscode.ExtensionContext {
    return {
        subscriptions: [],
        workspaceState: createMockMemento(),
        globalState: createMockMemento(),
        extensionPath: '/mock/extension/path',
        storagePath: '/mock/storage/path',
        globalStoragePath: '/mock/global/storage/path',
        logPath: '/mock/log/path',
        asAbsolutePath: (relativePath: string) => `/mock/extension/path/${relativePath}`,
        extensionUri: vscode.Uri.file('/mock/extension/path'),
        environmentVariableCollection: createMockEnvironmentVariableCollection(),
        extensionMode: vscode.ExtensionMode.Test,
        logUri: vscode.Uri.file('/mock/log/path'),
        secrets: createMockSecretStorage(),
        storageUri: vscode.Uri.file('/mock/storage/path'),
        globalStorageUri: vscode.Uri.file('/mock/global/storage/path')
    };
}

/**
 * Create a mock Memento object
 * @returns Mock Memento object
 */
export function createMockMemento(): vscode.Memento & { setKeysForSync(keys: readonly string[]): void } {
    const storage = new Map<string, any>();
    
    return {
        get<T>(key: string, defaultValue?: T): T {
            return storage.has(key) ? storage.get(key) : (defaultValue as T);
        },
        update(key: string, value: any): Thenable<void> {
            storage.set(key, value);
            return Promise.resolve();
        },
        keys(): readonly string[] {
            return Array.from(storage.keys());
        },
        setKeysForSync(keys: readonly string[]): void {
            // Mock implementation
        }
    };
}

/**
 * Create a mock Secret Storage
 * @returns Mock SecretStorage
 */
function createMockSecretStorage(): vscode.SecretStorage {
    const secrets = new Map<string, string>();
    const onDidChangeEmitter = new vscode.EventEmitter<vscode.SecretStorageChangeEvent>();
    
    return {
        get(key: string): Thenable<string | undefined> {
            return Promise.resolve(secrets.get(key));
        },
        store(key: string, value: string): Thenable<void> {
            secrets.set(key, value);
            return Promise.resolve();
        },
        delete(key: string): Thenable<void> {
            secrets.delete(key);
            return Promise.resolve();
        },
        onDidChange: onDidChangeEmitter.event
    };
}

/**
 * Create a mock Environment Variable Collection
 * @returns Mock Environment Variable Collection
 */
function createMockEnvironmentVariableCollection(): vscode.EnvironmentVariableCollection {
    const variables = new Map<string, vscode.EnvironmentVariableMutator>();
    
    return {
        persistent: true,
        replace(variable: string, value: string): void {
            variables.set(variable, { value, type: vscode.EnvironmentVariableMutatorType.Replace });
        },
        append(variable: string, value: string): void {
            variables.set(variable, { value, type: vscode.EnvironmentVariableMutatorType.Append });
        },
        prepend(variable: string, value: string): void {
            variables.set(variable, { value, type: vscode.EnvironmentVariableMutatorType.Prepend });
        },
        get(variable: string): vscode.EnvironmentVariableMutator | undefined {
            return variables.get(variable);
        },
        forEach(callback: (variable: string, mutator: vscode.EnvironmentVariableMutator, collection: vscode.EnvironmentVariableCollection) => any, thisArg?: any): void {
            variables.forEach((mutator, variable) => {
                callback.call(thisArg, variable, mutator, this);
            });
        },
        delete(variable: string): void {
            variables.delete(variable);
        },
        clear(): void {
            variables.clear();
        },
        getScoped(scope: vscode.EnvironmentVariableScope): vscode.EnvironmentVariableCollection {
            return this; // For simplicity, return the same collection
        },
        [Symbol.iterator](): Iterator<[string, vscode.EnvironmentVariableMutator]> {
            return variables.entries();
        }
    };
}

/**
 * Create a mock output channel
 * @param name Channel name
 * @returns Mock output channel
 */
export function createMockOutputChannel(name: string = 'Mock Channel'): vscode.OutputChannel {
    return {
        name,
        append(value: string): void { /* mock implementation */ },
        appendLine(value: string): void { /* mock implementation */ },
        clear(): void { /* mock implementation */ },
        show(preserveFocus?: boolean): void;
        show(column?: vscode.ViewColumn, preserveFocus?: boolean): void;
        show(columnOrPreserveFocus?: vscode.ViewColumn | boolean, preserveFocus?: boolean): void { /* mock implementation */ },
        hide(): void { /* mock implementation */ },
        dispose(): void { /* mock implementation */ },
        replace(value: string): void { /* mock implementation */ }
    };
}

/**
 * Create a mock LogOutputChannel
 * @param name Channel name
 * @returns Mock LogOutputChannel
 */
export function createMockLogOutputChannel(name: string = 'Mock Log Channel'): vscode.LogOutputChannel {
    return {
        name,
        append(value: string): void { /* mock implementation */ },
        appendLine(value: string): void { /* mock implementation */ },
        clear(): void { /* mock implementation */ },
        show(preserveFocus?: boolean): void;
        show(column?: vscode.ViewColumn, preserveFocus?: boolean): void;
        show(columnOrPreserveFocus?: vscode.ViewColumn | boolean, preserveFocus?: boolean): void { /* mock implementation */ },
        hide(): void { /* mock implementation */ },
        dispose(): void { /* mock implementation */ },
        replace(value: string): void { /* mock implementation */ },
        trace(message: string, ...args: any[]): void { /* mock implementation */ },
        debug(message: string, ...args: any[]): void { /* mock implementation */ },
        info(message: string, ...args: any[]): void { /* mock implementation */ },
        warn(message: string, ...args: any[]): void { /* mock implementation */ },
        error(message: string, ...args: any[]): void { /* mock implementation */ },
        logLevel: vscode.LogLevel.Info,
        onDidChangeLogLevel: new EventEmitter().event as vscode.Event<vscode.LogLevel>
    };
}

/**
 * Create a mock document
 * @param content Document content
 * @param language Language ID
 * @returns Mock TextDocument
 */
export function createMockDocument(content: string, language: string = 'typescript'): vscode.TextDocument {
    return {
        uri: vscode.Uri.file(`/mock/path/document.${language}`),
        fileName: `/mock/path/document.${language}`,
        isUntitled: false,
        languageId: language,
        version: 1,
        isDirty: false,
        isClosed: false,
        save: () => Promise.resolve(true),
        eol: vscode.EndOfLine.LF,
        lineCount: content.split('\n').length,
        lineAt: (line: number | vscode.Position) => {
            const lineNumber = typeof line === 'number' ? line : line.line;
            const lineContent = content.split('\n')[lineNumber] || '';
            return {
                lineNumber,
                text: lineContent,
                range: new vscode.Range(lineNumber, 0, lineNumber, lineContent.length),
                rangeIncludingLineBreak: new vscode.Range(lineNumber, 0, lineNumber, lineContent.length + 1),
                firstNonWhitespaceCharacterIndex: lineContent.search(/\S/),
                isEmptyOrWhitespace: lineContent.trim().length === 0
            };
        },
        offsetAt: (position: vscode.Position) => {
            const lines = content.split('\n');
            let offset = 0;
            for (let i = 0; i < position.line; i++) {
                offset += lines[i].length + 1; // +1 for the line break
            }
            return offset + position.character;
        },
        positionAt: (offset: number) => {
            const lines = content.split('\n');
            let currentOffset = 0;
            let line = 0;
            for (; line < lines.length; line++) {
                const lineLength = lines[line].length + 1; // +1 for the line break
                if (currentOffset + lineLength > offset) {
                    break;
                }
                currentOffset += lineLength;
            }
            return new vscode.Position(line, offset - currentOffset);
        },
        getText: (range?: vscode.Range) => {
            if (!range) {
                return content;
            }
            const lines = content.split('\n');
            let result = '';
            for (let i = range.start.line; i <= range.end.line; i++) {
                const line = lines[i] || '';
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
            return result;
        },
        getWordRangeAtPosition: (position: vscode.Position) => {
            return undefined; // Simple implementation, extend as needed
        },
        validateRange: (range: vscode.Range) => range,
        validatePosition: (position: vscode.Position) => position
    };
}

/**
 * Create a mock workspace folder
 * @param name Folder name
 * @param path Folder path
 * @returns Mock workspace folder
 */
export function createMockWorkspaceFolder(name: string = 'mock-workspace', path: string = '/mock/workspace'): vscode.WorkspaceFolder {
    return {
        uri: vscode.Uri.file(path),
        name: name,
        index: 0
    };
}