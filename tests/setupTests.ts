// Mock VS Code namespace
const mockVscode = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      append: jest.fn(),
      clear: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn()
    }),
    createWebviewPanel: jest.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn(),
        postMessage: jest.fn().mockResolvedValue(undefined)
      },
      onDidDispose: jest.fn(),
      reveal: jest.fn(),
      dispose: jest.fn()
    }),
    createStatusBarItem: jest.fn().mockReturnValue({
      text: '',
      tooltip: '',
      command: '',
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    }),
    showQuickPick: jest.fn().mockResolvedValue(''),
    showInputBox: jest.fn().mockResolvedValue('')
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn().mockResolvedValue(undefined)
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      has: jest.fn()
    }),
    fs: {
      readFile: jest.fn().mockResolvedValue(Buffer.from('')),
      writeFile: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      readDirectory: jest.fn().mockResolvedValue([]),
      createDirectory: jest.fn().mockResolvedValue(undefined)
    },
    workspaceFolders: [{ uri: { fsPath: '/mock/workspace' }, name: 'mock', index: 0 }],
    onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() })
  },
  extensions: {
    getExtension: jest.fn()
  },
  Uri: {
    file: jest.fn(path => ({ fsPath: path, path, scheme: 'file' })),
    parse: jest.fn(uri => ({ fsPath: uri, path: uri, scheme: 'file' }))
  },
  FileType: { File: 1, Directory: 2, SymbolicLink: 64 },
  EventEmitter: jest.fn().mockReturnValue({
    event: jest.fn(),
    fire: jest.fn()
  }),
  ProgressLocation: { Notification: 1, Window: 10 },
  ViewColumn: { Active: -1, Beside: -2 }
};

jest.mock('vscode', () => mockVscode, { virtual: true });

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

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * Global test setup for all tests
 * This file is automatically included by Jest
 */

// Setup environment variables needed for tests
process.env.NODE_ENV = 'test';

// Mock global.performance if needed (for Node.js environments that don't support it)
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
  
  // Optionally log errors to a file for debugging
};

// Clean up function to run after all tests
afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
});
