// Minimal VS Code mock for Jest
const EventEmitter = function() {
  this._listeners = [];
  this.event = (listener) => {
    this._listeners.push(listener);
    return { dispose: jest.fn() };
  };
  this.fire = (...args) => {
    this._listeners.forEach(fn => fn(...args));
  };
  this.dispose = jest.fn();
};

const OutputChannel = function() {
  return {
    appendLine: jest.fn(),
    clear: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
    append: jest.fn(),
    replace: jest.fn(),
    name: 'MockOutputChannel',
  };
};

const SecretStorage = function() {
  return {
    get: jest.fn().mockResolvedValue(undefined),
    store: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    onDidChange: new EventEmitter().event
  };
};

module.exports = {
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    showOpenDialog: jest.fn(),
    showSaveDialog: jest.fn(),
    showTextDocument: jest.fn(),
    createOutputChannel: jest.fn(() => OutputChannel()),
    createStatusBarItem: jest.fn(() => ({ show: jest.fn(), hide: jest.fn(), dispose: jest.fn(), text: '', tooltip: '', command: '', alignment: 0, priority: 0 })),
    withProgress: jest.fn((options, task) => task({ report: jest.fn() })),
    activeTextEditor: null,
    visibleTextEditors: [],
    onDidChangeActiveTextEditor: new EventEmitter().event,
    onDidChangeVisibleTextEditors: new EventEmitter().event,
    onDidChangeTextEditorSelection: new EventEmitter().event,
    onDidChangeTextEditorVisibleRanges: new EventEmitter().event,
    onDidChangeTextEditorOptions: new EventEmitter().event,
    onDidChangeTextEditorViewColumn: new EventEmitter().event,
    onDidChangeWindowState: new EventEmitter().event,
    createWebviewPanel: jest.fn(),
  },
  workspace: {
    onDidChangeConfiguration: new EventEmitter().event,
    getConfiguration: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      update: jest.fn(),
      has: jest.fn(),
      inspect: jest.fn(),
      onDidChange: new EventEmitter().event
    })),
    getWorkspaceFolder: jest.fn(),
    workspaceFolders: [],
    onDidOpenTextDocument: new EventEmitter().event,
    onDidCloseTextDocument: new EventEmitter().event,
    onDidChangeTextDocument: new EventEmitter().event,
    onDidSaveTextDocument: new EventEmitter().event,
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
    onDidChange: new EventEmitter().event,
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
  SecretStorage,
  EventEmitter,
  OutputChannel,
  Uri: {
    file: (f) => ({ fsPath: f, toString: () => f })
  },
  ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
  ExtensionMode: { Test: 1, Production: 2, Development: 3 },
  TextDocument: function () {},
  ExtensionContext: function () {},
  TextEditor: function () {},
  Disposable: function () { return { dispose: jest.fn() }; },
};
