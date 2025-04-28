import { jest } from '@jest/globals';

// Map Mocha globals to Jest
global.suite = describe;
global.test = it;
global.suiteSetup = beforeAll;
global.suiteTeardown = afterAll;
global.setup = beforeEach;
global.teardown = afterEach;

// Mock VS Code's Event and EventEmitter
class MockEventEmitter<T> {
    private listeners = new Set<(e: T) => any>();

    event = jest.fn((listener: (e: T) => any) => {
        this.listeners.add(listener);
        return {
            dispose: () => {
                this.listeners.delete(listener);
            }
        };
    });

    fire(data: T) {
        this.listeners.forEach(listener => listener(data));
    }

    dispose() {
        this.listeners.clear();
    }
}

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Set reasonable test timeouts
jest.setTimeout(5000);

// Mock VS Code API
jest.mock('vscode', () => ({
    window: {
        createOutputChannel: jest.fn().mockReturnValue({
            appendLine: jest.fn(),
            append: jest.fn(),
            clear: jest.fn(),
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        showInformationMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        createStatusBarItem: jest.fn().mockReturnValue({
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        }),
        activeTextEditor: undefined
    },
    workspace: {
        getConfiguration: jest.fn().mockReturnValue({
            get: jest.fn(),
            update: jest.fn().mockResolvedValue(undefined),
            has: jest.fn()
        }),
        workspaceFolders: [],
        onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
        fs: {
            readFile: jest.fn().mockResolvedValue(Buffer.from('')),
            writeFile: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
            rename: jest.fn().mockResolvedValue(undefined)
        }
    },
    EventEmitter: MockEventEmitter,
    Uri: {
        file: jest.fn(path => ({ fsPath: path })),
        parse: jest.fn()
    },
    Range: jest.fn(),
    Position: jest.fn(),
    CancellationTokenSource: jest.fn().mockImplementation(() => ({
        token: { isCancellationRequested: false },
        dispose: jest.fn()
    })),
    ExtensionMode: {
        Development: 1,
        Test: 2, 
        Production: 3
    }
}), { virtual: true });

// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.JEST_WORKER_ID = '1';

// Mock global.performance if needed
if (!global.performance) {
    global.performance = {
        now: () => Date.now(),
        mark: jest.fn(),
        measure: jest.fn(),
        getEntriesByName: jest.fn().mockReturnValue([]),
        clearMarks: jest.fn(),
        clearMeasures: jest.fn()
    } as unknown as Performance;
}

// Export MockEventEmitter for use in tests
export { MockEventEmitter };
