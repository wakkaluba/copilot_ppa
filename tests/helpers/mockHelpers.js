"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockExtensionContext = createMockExtensionContext;
exports.createMockMemento = createMockMemento;
exports.createMockOutputChannel = createMockOutputChannel;
exports.createMockLogOutputChannel = createMockLogOutputChannel;
exports.createMockDocument = createMockDocument;
exports.createMockWorkspaceFolder = createMockWorkspaceFolder;
var vscode = require("vscode");
var events_1 = require("events");
/**
 * Create a mock extension context
 * @returns Mock extension context
 */
function createMockExtensionContext() {
    return {
        subscriptions: [],
        workspaceState: createMockMemento(),
        globalState: createMockMemento(),
        extensionPath: '/mock/extension/path',
        storagePath: '/mock/storage/path',
        globalStoragePath: '/mock/global/storage/path',
        logPath: '/mock/log/path',
        asAbsolutePath: function (relativePath) { return "/mock/extension/path/".concat(relativePath); },
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
function createMockMemento() {
    var storage = new Map();
    return {
        get: function (key, defaultValue) {
            return storage.has(key) ? storage.get(key) : defaultValue;
        },
        update: function (key, value) {
            storage.set(key, value);
            return Promise.resolve();
        },
        keys: function () {
            return Array.from(storage.keys());
        },
        setKeysForSync: function (keys) {
            // Mock implementation
        }
    };
}
/**
 * Create a mock Secret Storage
 * @returns Mock SecretStorage
 */
function createMockSecretStorage() {
    var secrets = new Map();
    var onDidChangeEmitter = new vscode.EventEmitter();
    return {
        get: function (key) {
            return Promise.resolve(secrets.get(key));
        },
        store: function (key, value) {
            secrets.set(key, value);
            return Promise.resolve();
        },
        delete: function (key) {
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
function createMockEnvironmentVariableCollection() {
    var _a;
    var variables = new Map();
    return _a = {
            persistent: true,
            replace: function (variable, value) {
                variables.set(variable, { value: value, type: vscode.EnvironmentVariableMutatorType.Replace });
            },
            append: function (variable, value) {
                variables.set(variable, { value: value, type: vscode.EnvironmentVariableMutatorType.Append });
            },
            prepend: function (variable, value) {
                variables.set(variable, { value: value, type: vscode.EnvironmentVariableMutatorType.Prepend });
            },
            get: function (variable) {
                return variables.get(variable);
            },
            forEach: function (callback, thisArg) {
                var _this = this;
                variables.forEach(function (mutator, variable) {
                    callback.call(thisArg, variable, mutator, _this);
                });
            },
            delete: function (variable) {
                variables.delete(variable);
            },
            clear: function () {
                variables.clear();
            },
            getScoped: function (scope) {
                return this; // For simplicity, return the same collection
            }
        },
        _a[Symbol.iterator] = function () {
            return variables.entries();
        },
        _a;
}
/**
 * Create a mock output channel
 * @param name Channel name
 * @returns Mock output channel
 */
function createMockOutputChannel(name) {
    if (name === void 0) { name = 'Mock Channel'; }
    return {
        name: name,
        append: function (value) { },
        appendLine: function (value) { },
        clear: function () { },
        show: function (columnOrPreserveFocus, preserveFocus) { },
        hide: function () { },
        dispose: function () { },
        replace: function (value) { }
    };
}
/**
 * Create a mock LogOutputChannel
 * @param name Channel name
 * @returns Mock LogOutputChannel
 */
function createMockLogOutputChannel(name) {
    if (name === void 0) { name = 'Mock Log Channel'; }
    return {
        name: name,
        append: function (value) { },
        appendLine: function (value) { },
        clear: function () { },
        show: function (columnOrPreserveFocus, preserveFocus) { },
        hide: function () { },
        dispose: function () { },
        replace: function (value) { },
        trace: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        },
        debug: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        },
        info: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        },
        warn: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        },
        error: function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
        },
        logLevel: vscode.LogLevel.Info,
        onDidChangeLogLevel: new events_1.EventEmitter().event
    };
}
/**
 * Create a mock document
 * @param content Document content
 * @param language Language ID
 * @returns Mock TextDocument
 */
function createMockDocument(content, language) {
    if (language === void 0) { language = 'typescript'; }
    return {
        uri: vscode.Uri.file("/mock/path/document.".concat(language)),
        fileName: "/mock/path/document.".concat(language),
        isUntitled: false,
        languageId: language,
        version: 1,
        isDirty: false,
        isClosed: false,
        save: function () { return Promise.resolve(true); },
        eol: vscode.EndOfLine.LF,
        lineCount: content.split('\n').length,
        lineAt: function (line) {
            var lineNumber = typeof line === 'number' ? line : line.line;
            var lineContent = content.split('\n')[lineNumber] || '';
            return {
                lineNumber: lineNumber,
                text: lineContent,
                range: new vscode.Range(lineNumber, 0, lineNumber, lineContent.length),
                rangeIncludingLineBreak: new vscode.Range(lineNumber, 0, lineNumber, lineContent.length + 1),
                firstNonWhitespaceCharacterIndex: lineContent.search(/\S/),
                isEmptyOrWhitespace: lineContent.trim().length === 0
            };
        },
        offsetAt: function (position) {
            var lines = content.split('\n');
            var offset = 0;
            for (var i = 0; i < position.line; i++) {
                offset += lines[i].length + 1; // +1 for the line break
            }
            return offset + position.character;
        },
        positionAt: function (offset) {
            var lines = content.split('\n');
            var currentOffset = 0;
            var line = 0;
            for (; line < lines.length; line++) {
                var lineLength = lines[line].length + 1; // +1 for the line break
                if (currentOffset + lineLength > offset) {
                    break;
                }
                currentOffset += lineLength;
            }
            return new vscode.Position(line, offset - currentOffset);
        },
        getText: function (range) {
            if (!range) {
                return content;
            }
            var lines = content.split('\n');
            var result = '';
            for (var i = range.start.line; i <= range.end.line; i++) {
                var line = lines[i] || '';
                if (i === range.start.line && i === range.end.line) {
                    result += line.substring(range.start.character, range.end.character);
                }
                else if (i === range.start.line) {
                    result += line.substring(range.start.character) + '\n';
                }
                else if (i === range.end.line) {
                    result += line.substring(0, range.end.character);
                }
                else {
                    result += line + '\n';
                }
            }
            return result;
        },
        getWordRangeAtPosition: function (position) {
            return undefined; // Simple implementation, extend as needed
        },
        validateRange: function (range) { return range; },
        validatePosition: function (position) { return position; }
    };
}
/**
 * Create a mock workspace folder
 * @param name Folder name
 * @param path Folder path
 * @returns Mock workspace folder
 */
function createMockWorkspaceFolder(name, path) {
    if (name === void 0) { name = 'mock-workspace'; }
    if (path === void 0) { path = '/mock/workspace'; }
    return {
        uri: vscode.Uri.file(path),
        name: name,
        index: 0
    };
}
