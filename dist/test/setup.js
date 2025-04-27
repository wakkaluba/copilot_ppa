"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockVSCodeAPI = void 0;
// This file sets up the test environment with mocks for VS Code APIs
const vscode = __importStar(require("vscode"));
// Mock VS Code API
const mockVSCodeAPI = () => {
    const workspace = {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
            update: jest.fn().mockResolvedValue(undefined),
            has: jest.fn().mockReturnValue(false),
        }),
        workspaceFolders: [
            {
                uri: { fsPath: '/test/workspace' },
                name: 'Test Workspace',
                index: 0
            }
        ],
        onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        fs: {
            readFile: jest.fn().mockResolvedValue(Buffer.from('')),
            writeFile: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            rename: jest.fn().mockResolvedValue(undefined),
            copy: jest.fn().mockResolvedValue(undefined),
            createDirectory: jest.fn().mockResolvedValue(undefined),
            stat: jest.fn().mockResolvedValue({
                type: vscode.FileType.File,
                ctime: Date.now(),
                mtime: Date.now(),
                size: 0
            }),
            readDirectory: jest.fn().mockResolvedValue([]),
            isWritableFileSystem: jest.fn().mockReturnValue(true)
        }
    };
    const window = {
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        createWebviewPanel: jest.fn().mockReturnValue({
            webview: {
                html: '',
                onDidReceiveMessage: jest.fn().mockReturnValue({ dispose: jest.fn() }),
                postMessage: jest.fn().mockResolvedValue(true),
                asWebviewUri: jest.fn().mockImplementation(uri => uri),
                options: {}
            },
            onDidDispose: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            onDidChangeViewState: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            reveal: jest.fn(),
            dispose: jest.fn()
        }),
        showQuickPick: jest.fn(),
        showInputBox: jest.fn(),
        createStatusBarItem: jest.fn().mockReturnValue({
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        activeTextEditor: undefined,
        visibleTextEditors: [],
        onDidChangeActiveTextEditor: jest.fn().mockReturnValue({ dispose: jest.fn() })
    };
    const commands = {
        registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        executeCommand: jest.fn()
    };
    const extensions = {
        getExtension: jest.fn().mockReturnValue({
            id: 'test-extension',
            extensionPath: '/test/extension/path',
            extensionUri: { fsPath: '/test/extension/path' },
            packageJSON: { version: '1.0.0' },
            extensionKind: vscode.ExtensionKind.UI,
            exports: undefined,
            activate: jest.fn().mockResolvedValue(undefined),
            isActive: true
        }),
        all: []
    };
    const mockExtensionContext = {
        subscriptions: [],
        workspaceState: {
            get: jest.fn().mockReturnValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            keys: jest.fn().mockReturnValue([])
        },
        globalState: {
            get: jest.fn().mockReturnValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            setKeysForSync: jest.fn(),
            keys: jest.fn().mockReturnValue([])
        },
        extensionPath: '/test/extension/path',
        extensionUri: { fsPath: '/test/extension/path' },
        asAbsolutePath: jest.fn().mockImplementation((path) => `/test/extension/path/${path}`),
        storagePath: '/test/storage/path',
        storageUri: { fsPath: '/test/storage/path' },
        globalStoragePath: '/test/global-storage/path',
        globalStorageUri: { fsPath: '/test/global-storage/path' },
        logPath: '/test/log/path',
        logUri: { fsPath: '/test/log/path' },
        extensionMode: vscode.ExtensionMode.Test,
        secrets: {
            get: jest.fn().mockResolvedValue(undefined),
            store: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined)
        }
    };
    // Apply the mocks
    global.vscode = {
        workspace,
        window,
        commands,
        extensions,
        Uri: {
            file: jest.fn().mockImplementation((path) => ({ fsPath: path })),
            parse: jest.fn().mockImplementation((path) => ({ fsPath: path }))
        },
        FileType: {
            File: 1,
            Directory: 2,
            SymbolicLink: 64
        },
        ExtensionMode: {
            Development: 1,
            Test: 2,
            Production: 3
        },
        ExtensionKind: {
            UI: 1,
            Workspace: 2
        },
        EventEmitter: jest.fn().mockImplementation(() => ({
            event: jest.fn().mockReturnValue({ dispose: jest.fn() }),
            fire: jest.fn()
        }))
    };
    return {
        workspace,
        window,
        commands,
        extensions,
        mockExtensionContext
    };
};
exports.mockVSCodeAPI = mockVSCodeAPI;
// Execute the mock setup
(0, exports.mockVSCodeAPI)();
//# sourceMappingURL=setup.js.map