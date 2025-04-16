import * as vscode from 'vscode';

// Mock VS Code's Event and EventEmitter
class MockEventEmitter<T> implements vscode.EventEmitter<T> {
    private listeners = new Set<(e: T) => any>();

    public event: vscode.Event<T> = (listener: (e: T) => any) => {
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
            update: jest.fn()
        }),
        onDidChangeConfiguration: createMockEventEmitter<vscode.ConfigurationChangeEvent>().event,
        fs: {
            readFile: jest.fn(),
            writeFile: jest.fn(),
            readDirectory: jest.fn(),
            createDirectory: jest.fn(),
            delete: jest.fn(),
            rename: jest.fn()
        }
    },
    commands: {
        registerCommand: jest.fn(),
        executeCommand: jest.fn(),
        getCommands: jest.fn()
    },
    window: {
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
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
        onDidChangeActiveTextEditor: createMockEventEmitter<vscode.TextEditor | undefined>().event,
        onDidChangeVisibleTextEditors: createMockEventEmitter<vscode.TextEditor[]>().event
    },
    languages: {
        createDiagnosticCollection: jest.fn(),
        getDiagnostics: jest.fn()
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
});
