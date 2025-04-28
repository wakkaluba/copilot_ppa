import { jest } from '@jest/globals';

// VSCode API mock
const vscode = {
  window: {
    showInformationMessage: jest.fn().mockResolvedValue(undefined),
    showWarningMessage: jest.fn().mockResolvedValue(undefined),
    showErrorMessage: jest.fn().mockResolvedValue(undefined),
    showInputBox: jest.fn().mockResolvedValue(""),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      append: jest.fn(),
      show: jest.fn(),
      dispose: jest.fn(),
      clear: jest.fn()
    }),
    onDidChangeActiveColorTheme: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    createTextEditorDecorationType: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    showQuickPick: jest.fn().mockResolvedValue(undefined)
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn()
    }),
    workspaceFolders: [{ uri: { fsPath: '/test/workspace' } }],
    openTextDocument: jest.fn().mockResolvedValue({
      save: jest.fn().mockResolvedValue(true),
      getText: jest.fn().mockReturnValue("test content")
    }),
    onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    fs: {
      readFile: jest.fn().mockResolvedValue(Buffer.from("test content")),
      writeFile: jest.fn().mockResolvedValue(undefined),
      createDirectory: jest.fn().mockResolvedValue(undefined),
      stat: jest.fn().mockResolvedValue({ type: 1, size: 100 }),
      readDirectory: jest.fn().mockResolvedValue([])
    },
    isTrusted: true,
    requestWorkspaceTrust: jest.fn().mockResolvedValue(true)
  },
  commands: {
    executeCommand: jest.fn().mockResolvedValue(undefined),
    registerCommand: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    getCommands: jest.fn().mockResolvedValue([])
  },
  Uri: {
    file: jest.fn().mockImplementation(path => ({ fsPath: path, scheme: 'file' })),
    parse: jest.fn().mockImplementation(uri => ({ fsPath: uri, scheme: 'file' })),
    joinPath: jest.fn().mockImplementation((uri, ...pathSegments) => {
      const base = typeof uri === 'string' ? uri : uri.fsPath || '';
      return { fsPath: base + '/' + pathSegments.join('/'), scheme: 'file' };
    })
  },
  Position: jest.fn().mockImplementation((line, character) => ({ line, character })),
  Range: jest.fn().mockImplementation((start, end) => ({ start, end })),
  extensions: {
    getExtension: jest.fn().mockReturnValue({
      packageJSON: { version: '1.0.0' },
      extensionPath: '/test/extension/path'
    })
  },
  languages: {
    createDiagnosticCollection: jest.fn().mockReturnValue({
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    })
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3
  },
  FileSystemError: {
    FileNotFound: jest.fn().mockImplementation(() => new Error('File not found')),
    FileExists: jest.fn().mockImplementation(() => new Error('File exists')),
    FileNotADirectory: jest.fn().mockImplementation(() => new Error('Not a directory')),
    FileIsADirectory: jest.fn().mockImplementation(() => new Error('Is a directory')),
    NoPermissions: jest.fn().mockImplementation(() => new Error('No permissions')),
    Unavailable: jest.fn().mockImplementation(() => new Error('Unavailable'))
  },
  EventEmitter: jest.fn().mockImplementation(() => ({
    event: jest.fn(),
    fire: jest.fn(),
    dispose: jest.fn()
  })),
  ThemeColor: jest.fn(),
  ProgressLocation: { Notification: 1, Window: 10 },
  StatusBarAlignment: { Left: 1, Right: 2 },
  ViewColumn: { Active: -1, Beside: -2, One: 1 },
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 }
};

// Mock the vscode module
jest.mock('vscode', () => vscode, { virtual: true });

// Common mock setup for tests
global.beforeEach(() => {
  jest.clearAllMocks();
});

// Custom matcher for testing
expect.extend({
  toHaveMockCalls(received) {
    if (received.mock && received.mock.calls.length > 0) {
      return {
        message: () => `expected ${received.getMockName()} not to have been called`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received.getMockName()} to have been called`,
        pass: false
      };
    }
  },
});

// Mock for fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock content')),
    writeFile: jest.fn().mockResolvedValue(undefined),
    mkdir: jest.fn().mockResolvedValue(undefined),
    access: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ isDirectory: () => true }),
    readdir: jest.fn().mockResolvedValue([]),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('mock content'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  constants: { R_OK: 4, W_OK: 2, F_OK: 0 }
}));

// Mock for child_process
jest.mock('child_process', () => ({
  exec: jest.fn().mockImplementation((command, options, callback) => {
    if (callback) callback(null, { stdout: 'mock stdout', stderr: '' });
    return { 
      on: jest.fn(),
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() }
    };
  }),
  spawn: jest.fn().mockReturnValue({
    on: jest.fn(),
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() }
  })
}));

// Mock for axios
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    create: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ data: {} }),
      post: jest.fn().mockResolvedValue({ data: {} })
    })
  }
}));

// Set up globals
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn()
};
