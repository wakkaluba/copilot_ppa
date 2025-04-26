import type { EventEmitter as VSCodeEventEmitter, Event } from 'vscode';

// Mock VS Code's Event and EventEmitter
class MockEventEmitter<T> implements VSCodeEventEmitter<T> {
    private listeners = new Set<(e: T) => any>();

    public event: Event<T> = (listener: (e: T) => any) => {
        this.listeners.add(listener);
        return {
            dispose: () => {
                this.listeners.delete(listener);
            }
        };
    };

    public fire(data: T): void {
        this.listeners.forEach(listener => listener(data));
    }

    public dispose(): void {
        this.listeners.clear();
    }
}

// Create helper for EventEmitter creation
const createMockEventEmitter = <T>() => new MockEventEmitter<T>();

// Mock the VS Code API
jest.mock('vscode', () => ({
    EventEmitter: MockEventEmitter,
    workspace: {
        workspaceFolders: [
            {
                uri: {
                    fsPath: '/test/workspace',
                    toString: () => '/test/workspace'
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
        onDidChangeConfiguration: createMockEventEmitter<any>().event,
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
        onDidChangeActiveTextEditor: createMockEventEmitter<any>().event,
        onDidChangeVisibleTextEditors: createMockEventEmitter<any[]>().event,
        withProgress: jest.fn()
    },
    languages: {
        createDiagnosticCollection: jest.fn(),
        getDiagnostics: jest.fn()
    },
    Uri: {
        file: jest.fn(path => ({ 
            fsPath: path,
            scheme: 'file',
            path,
            with: jest.fn()
        })),
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
}), { virtual: true });

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Set global testing timeouts
jest.setTimeout(10000);

// Mock node-fetch
jest.mock('node-fetch', () => 
    jest.fn().mockImplementation(() => 
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve('')
        })
    )
);

// Setup environment variables needed for tests
process.env.NODE_ENV = 'test';

// Mock global.performance if needed
if (typeof global.performance === 'undefined') {
    global.performance = {
        now: () => Date.now()
    } as Performance;
}

// Override console methods to catch errors during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
    // Uncomment the line below if you want to see error messages during tests
    // originalConsoleError(...args);
};

// Clean up function to run after all tests
afterAll(() => {
    // Restore original console methods
    console.error = originalConsoleError;
    jest.restoreAllMocks();
});
