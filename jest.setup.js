// Mock vscode module with improved caching
const vscode = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    }),
    createWebviewPanel: jest.fn().mockReturnValue({
      webview: {
        html: '',
        onDidReceiveMessage: jest.fn()
      },
      onDidDispose: jest.fn(),
      reveal: jest.fn(),
      dispose: jest.fn()
    }),
    createTreeView: jest.fn().mockReturnValue({
      onDidChangeVisibility: jest.fn(),
      onDidChangeSelection: jest.fn(),
      reveal: jest.fn()
    }),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    withProgress: jest.fn().mockImplementation((options, task) => {
      return task({
        report: jest.fn()
      });
    }),
    createStatusBarItem: jest.fn().mockReturnValue({
      text: '',
      tooltip: '',
      command: '',
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn()
    })
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined),
      has: jest.fn()
    }),
    onDidChangeConfiguration: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    workspaceFolders: [],
    openTextDocument: jest.fn().mockResolvedValue({
      getText: jest.fn(),
      save: jest.fn(),
      lineAt: jest.fn(),
      positionAt: jest.fn(),
      offsetAt: jest.fn(),
      uri: { fsPath: '' }
    }),
    fs: {
      readDirectory: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      createDirectory: jest.fn(),
      stat: jest.fn(),
      delete: jest.fn()
    },
    workspaceFile: { fsPath: '/path/to/workspace' },
    createFileSystemWatcher: jest.fn().mockReturnValue({
      onDidChange: jest.fn(),
      onDidCreate: jest.fn(),
      onDidDelete: jest.fn(),
      dispose: jest.fn()
    }),
    findFiles: jest.fn().mockResolvedValue([])
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
    getCommands: jest.fn().mockResolvedValue([])
  },
  ExtensionContext: jest.fn().mockImplementation(() => ({
    subscriptions: [],
    workspaceState: {
      get: jest.fn(),
      update: jest.fn()
    },
    globalState: {
      get: jest.fn(),
      update: jest.fn(),
      setKeysForSync: jest.fn()
    },
    extensionPath: '/path/to/extension',
    storagePath: '/path/to/storage',
    logPath: '/path/to/logs',
    extensionUri: { fsPath: '/path/to/extension' }
  })),
  languages: {
    registerCodeLensProvider: jest.fn(),
    createDiagnosticCollection: jest.fn().mockReturnValue({
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      dispose: jest.fn()
    })
  },
  Uri: {
    file: jest.fn(path => ({ path, fsPath: path, scheme: 'file' })),
    parse: jest.fn(url => ({ url, fsPath: url, scheme: url.startsWith('file') ? 'file' : 'unknown' }))
  },
  ViewColumn: {
    Active: -1,
    Beside: -2,
    One: 1,
    Two: 2,
    Three: 3
  },
  Position: jest.fn((line, character) => ({ line, character })),
  Range: jest.fn((start, end) => ({ start, end })),
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  },
  CancellationTokenSource: jest.fn().mockImplementation(() => ({
    token: { isCancellationRequested: false },
    cancel: jest.fn(),
    dispose: jest.fn()
  })),
  ProgressLocation: {
    Notification: 15,
    Window: 10
  },
  ThemeIcon: jest.fn().mockImplementation(iconName => ({
    id: iconName
  })),
  debug: {
    registerDebugAdapterDescriptorFactory: jest.fn(),
    startDebugging: jest.fn()
  },
  env: {
    clipboard: {
      readText: jest.fn(),
      writeText: jest.fn()
    },
    openExternal: jest.fn(),
    language: 'en'
  },
  EventEmitter: jest.fn().mockImplementation(() => ({
    event: jest.fn(),
    fire: jest.fn()
  }))
};

// Enable caching for repeatable mock behavior
const mockCache = new Map();

// Custom function to get cached mock
global.getCachedMock = (key, factory) => {
  if (!mockCache.has(key)) {
    mockCache.set(key, factory());
  }
  return mockCache.get(key);
};

// Implement clearMockCache for test cleanup
global.clearMockCache = () => {
  mockCache.clear();
};

// Mock out the VS Code module
jest.mock('vscode', () => vscode, { virtual: true });

// Map Mocha globals to Jest - single declaration
global.suite = describe;
global.test = it;
global.suiteSetup = beforeAll;
global.suiteTeardown = afterAll;
global.setup = beforeEach;
global.teardown = afterEach;

// Import and add custom VS Code matchers to Jest
const vscodeMatchers = require('./src/test/matchers/vscode-matchers');
expect.extend(vscodeMatchers);

// Setup for each test - reset all mocks
beforeEach(() => {
  jest.clearAllMocks();
  clearMockCache();
});
