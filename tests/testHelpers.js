"use strict";
/**
 * Centralized helper functions for test files
 *
 * This provides type-safe access to the mocked vscode API
 * without requiring each test file to import the actual module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockEventEmitter = exports.getVSCodeMock = void 0;
exports.createMockExtensionContext = createMockExtensionContext;
// Export a mock vscode API helper 
var getVSCodeMock = function () {
    // Cast the mocked API to the vscode type
    return require('vscode');
};
exports.getVSCodeMock = getVSCodeMock;
// Export EventEmitter mock helper
var MockEventEmitter = /** @class */ (function () {
    function MockEventEmitter() {
        var _this = this;
        this.listeners = new Set();
        this.event = function (listener) {
            _this.listeners.add(listener);
            return {
                dispose: function () {
                    _this.listeners.delete(listener);
                }
            };
        };
    }
    MockEventEmitter.prototype.fire = function (data) {
        this.listeners.forEach(function (listener) { return listener(data); });
    };
    MockEventEmitter.prototype.dispose = function () {
        this.listeners.clear();
    };
    return MockEventEmitter;
}());
exports.MockEventEmitter = MockEventEmitter;
// Utility to create mock extension context
function createMockExtensionContext() {
    return {
        subscriptions: [],
        extensionPath: '/test/extension',
        extensionUri: {
            scheme: 'file',
            path: '/test/extension',
            authority: '',
            query: '',
            fragment: '',
            fsPath: '/test/extension',
            with: jest.fn(),
            toJSON: jest.fn()
        },
        storagePath: '/test/storage',
        storageUri: {},
        globalStoragePath: '/test/globalStorage',
        globalStorageUri: {},
        logPath: '/test/log',
        logUri: {},
        extensionMode: 2,
        environmentVariableCollection: {},
        asAbsolutePath: jest.fn(function (relativePath) { return "/test/extension/".concat(relativePath); }),
        workspaceState: {
            get: jest.fn(),
            update: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        },
        globalState: {
            get: jest.fn(),
            update: jest.fn(),
            keys: jest.fn().mockReturnValue([]),
            setKeysForSync: jest.fn()
        },
        secrets: {
            get: jest.fn(),
            store: jest.fn(),
            delete: jest.fn(),
            onDidChange: jest.fn()
        },
        extension: {
            id: 'test.extension',
            extensionPath: '/test/extension',
            extensionUri: {
                scheme: 'file',
                path: '/test/extension',
                authority: '',
                query: '',
                fragment: '',
                fsPath: '/test/extension',
                with: jest.fn(),
                toJSON: jest.fn()
            },
            isActive: true,
            packageJSON: {},
            extensionKind: 1,
            exports: {},
            // Add the missing activate method
            activate: function () { return Promise.resolve(); }
        },
        languageModelAccessInformation: {
            onDidChange: jest.fn(),
            canSendRequest: jest.fn().mockReturnValue(true)
        }
    };
}
