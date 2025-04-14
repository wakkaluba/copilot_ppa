// Mock vscode module
const vscode = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn()
    }),
    createWebviewPanel: jest.fn(),
    createTreeView: jest.fn(),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn().mockResolvedValue(undefined)
    }),
    onDidChangeConfiguration: jest.fn(),
    workspaceFolders: [],
    openTextDocument: jest.fn(),
    fs: {
      readDirectory: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
      createDirectory: jest.fn()
    }
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  ExtensionContext: jest.fn().mockImplementation(() => ({
    subscriptions: [],
    workspaceState: {
      get: jest.fn(),
      update: jest.fn()
    },
    globalState: {
      get: jest.fn(),
      update: jest.fn()
    },
    extensionPath: '/path/to/extension',
    storagePath: '/path/to/storage',
    logPath: '/path/to/logs'
  })),
  languages: {
    registerCodeLensProvider: jest.fn()
  },
  Uri: {
    file: jest.fn(path => ({ path })),
    parse: jest.fn(url => ({ url }))
  },
  ViewColumn: {
    Beside: 'Beside'
  },
  Position: jest.fn(),
  Range: jest.fn(),
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  }
};

// Mock out the VS Code module
jest.mock('vscode', () => vscode, { virtual: true });

// Define global testing objects
global.suite = (name, callback) => describe(name, callback);
global.test = (name, callback) => it(name, callback);

// Mock Mocha functions
global.suite = (name, fn) => describe(name, fn);
global.test = (name, fn) => it(name, fn);
global.suiteSetup = (fn) => beforeAll(fn);
global.suiteTeardown = (fn) => afterAll(fn);
global.setup = (fn) => beforeEach(fn);
global.teardown = (fn) => afterEach(fn);

// Add Mocha-like functions for Jest
global.suite = describe;
global.test = it;
global.suiteSetup = beforeAll;
global.suiteTeardown = afterAll;
global.setup = beforeEach;
global.teardown = afterEach;

// Map Mocha globals to Jest
global.suite = describe;
global.test = it;
global.suiteSetup = beforeAll;
global.suiteTeardown = afterAll;
global.setup = beforeEach;
global.teardown = afterEach;
