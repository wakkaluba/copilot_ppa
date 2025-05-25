// Jest global setup for all tests.
// Add global mocks or setup code here if needed.

// Mock Node.js 'fs' module methods commonly used in tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(''),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn().mockReturnValue({ isDirectory: () => false }),
}));

// Inline VS Code mock to avoid recursive require issues
jest.mock('vscode', () => ({
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn(),
    showTextDocument: jest.fn(),
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      clear: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn(),
      append: jest.fn(),
      replace: jest.fn(),
      name: 'MockOutputChannel',
    })),
    createStatusBarItem: jest.fn(() => ({ show: jest.fn(), hide: jest.fn(), dispose: jest.fn(), text: '', tooltip: '', command: '', alignment: 0, priority: 0 })),
    withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
    activeTextEditor: null,
    visibleTextEditors: [],
    onDidChangeActiveTextEditor: jest.fn(),
    onDidChangeVisibleTextEditors: jest.fn(),
    onDidChangeTextEditorSelection: jest.fn(),
    onDidChangeTextEditorVisibleRanges: jest.fn(),
    onDidChangeTextEditorOptions: jest.fn(),
    onDidChangeTextEditorViewColumn: jest.fn(),
    onDidChangeWindowState: jest.fn(),
    createWebviewPanel: jest.fn(),
  },
  workspace: {
    onDidChangeConfiguration: jest.fn(),
    getConfiguration: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn(),
      onDidChange: jest.fn()
    })),
    getWorkspaceFolder: jest.fn(),
    workspaceFolders: [],
    onDidOpenTextDocument: jest.fn(),
    onDidCloseTextDocument: jest.fn(),
    onDidChangeTextDocument: jest.fn(),
    onDidSaveTextDocument: jest.fn(),
    openTextDocument: jest.fn(),
    textDocuments: [],
    fs: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      delete: jest.fn(),
      stat: jest.fn(),
      createDirectory: jest.fn(),
      copy: jest.fn(),
      rename: jest.fn(),
    },
    getConfigurationTarget: jest.fn(),
    asRelativePath: jest.fn(),
    updateWorkspaceFolders: jest.fn(),
    findFiles: jest.fn(),
    getWorkspaceFolder: jest.fn(),
    rootPath: '',
    name: 'MockWorkspace',
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn(),
    getCommands: jest.fn(),
    unregisterCommand: jest.fn(),
  },
  extensions: {
    getExtension: jest.fn(),
    all: [],
    onDidChange: jest.fn(),
  },
  env: {
    appName: 'VSCode',
    appRoot: '',
    language: 'en',
    machineId: 'mock-machine',
    sessionId: 'mock-session',
    clipboard: {
      readText: jest.fn(),
      writeText: jest.fn(),
    },
    openExternal: jest.fn(),
    shell: '',
    uiKind: 1,
  },
  ProgressLocation: {
    Notification: 1,
    Window: 2,
    SourceControl: 3,
  },
  SecretStorage: function () {
    return {
      get: jest.fn().mockResolvedValue(undefined),
      store: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      onDidChange: jest.fn()
    };
  },
  EventEmitter: function () {
    this._listeners = [];
    this.event = (listener) => {
      this._listeners.push(listener);
      return { dispose: jest.fn() };
    };
    this.fire = (...args) => {
      this._listeners.forEach(fn => fn(...args));
    };
    this.dispose = jest.fn();
  },
  OutputChannel: function () {},
  Uri: {
    file: (f) => ({ fsPath: f, toString: () => f })
  },
  ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
  ExtensionMode: { Test: 1, Production: 2, Development: 3 },
  TextDocument: function () {},
  ExtensionContext: function () {},
  TextEditor: function () {},
  Disposable: function () { return { dispose: jest.fn() }; },
}));

// Mock logger globally for all tests
// jest.mock('../src/utils/logger', () => {
//   return {
//     DummyLogger: class {
//       error = jest.fn();
//       info = jest.fn();
//       warn = jest.fn();
//     },
//     // Optionally export a default logger instance if used in codebase
//     logger: {
//       error: jest.fn(),
//       info: jest.fn(),
//       warn: jest.fn()
//     }
//   };
// });
