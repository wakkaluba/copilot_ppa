"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock VS Code's Event and EventEmitter
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
// Create helper for EventEmitter creation
var createMockEventEmitter = function () { return new MockEventEmitter(); };
// Mock the VS Code API
jest.mock('vscode', function () { return ({
    EventEmitter: MockEventEmitter,
    workspace: {
        workspaceFolders: [
            {
                uri: {
                    fsPath: '/test/workspace',
                    toString: function () { return '/test/workspace'; }
                },
                name: 'test',
                index: 0
            }
        ],
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn(),
            has: jest.fn(),
            inspect: jest.fn()
        }),
        onDidChangeConfiguration: createMockEventEmitter().event,
        fs: {
            readFile: jest.fn(),
            writeFile: jest.fn(),
            readDirectory: jest.fn(),
            createDirectory: jest.fn(),
            delete: jest.fn(),
            rename: jest.fn(),
            stat: jest.fn()
        },
        findFiles: jest.fn()
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn(),
        getCommands: jest.fn()
    },
    window: {
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        createWebviewPanel: jest.fn(),
        createTerminal: jest.fn(),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInputBox: jest.fn(),
        showQuickPick: jest.fn(),
        createStatusBarItem: jest.fn().mockReturnValue({
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        activeTextEditor: undefined,
        onDidChangeActiveTextEditor: createMockEventEmitter().event,
        onDidChangeVisibleTextEditors: createMockEventEmitter().event,
        withProgress: jest.fn()
    },
    languages: {
        createDiagnosticCollection: jest.fn(),
        getDiagnostics: jest.fn()
    },
    Uri: {
        file: jest.fn(function (path) { return ({
            fsPath: path,
            scheme: 'file',
            path: path,
            with: jest.fn()
        }); }),
        parse: jest.fn(),
    },
    Position: jest.fn(),
    Range: jest.fn(),
    ViewColumn: {
        Active: -1,
        Beside: -2,
        One: 1,
        Two: 2,
        Three: 3
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2
    },
    ThemeColor: jest.fn(),
    ProgressLocation: {
        Notification: 15
    },
    LogLevel: {
        Trace: 0,
        Debug: 1,
        Info: 2,
        Warning: 3,
        Error: 4,
        Critical: 5,
        Off: 6
    },
    FileType: {
        Unknown: 0,
        File: 1,
        Directory: 2,
        SymbolicLink: 64
    },
    FileSystemError: {
        FileNotFound: jest.fn(),
        FileExists: jest.fn(),
        FileNotADirectory: jest.fn(),
        FileIsADirectory: jest.fn(),
        NoPermissions: jest.fn(),
        Unavailable: jest.fn()
    },
    ExtensionMode: {
        Development: 1,
        Test: 2,
        Production: 3
    },
    EnvironmentVariableMutatorType: {
        Replace: 1,
        Append: 2,
        Prepend: 3
    },
    EndOfLine: {
        LF: 1,
        CRLF: 2
    },
    ConfigurationTarget: {
        Global: 1,
        Workspace: 2,
        WorkspaceFolder: 3
    }
}); }, { virtual: true });
// Reset all mocks before each test
beforeEach(function () {
    jest.clearAllMocks();
});
// Set global testing timeouts
jest.setTimeout(10000);
// Mock node-fetch
jest.mock('node-fetch', function () {
    return jest.fn().mockImplementation(function () {
        return Promise.resolve({
            ok: true,
            status: 200,
            json: function () { return Promise.resolve({}); },
            text: function () { return Promise.resolve(''); }
        });
    });
});
// Setup environment variables needed for tests
process.env.NODE_ENV = 'test';
// Mock global.performance if needed
if (typeof global.performance === 'undefined') {
    global.performance = {
        now: function () { return Date.now(); }
    };
}
// Override console methods to catch errors during tests
var originalConsoleError = console.error;
console.error = function () {
    var _args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        _args[_i] = arguments[_i];
    }
    // Uncomment the line below if you want to see error messages during tests
    // originalConsoleError(..._args);
};
// Clean up function to run after all tests
afterAll(function () {
    // Restore original console methods
    console.error = originalConsoleError;
    jest.restoreAllMocks();
});
