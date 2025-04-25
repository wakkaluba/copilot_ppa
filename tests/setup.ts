import * as vscode from 'vscode';

// Mock the VS Code namespace
jest.mock('vscode', () => {
  return {
    window: {
      showInformationMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      createOutputChannel: jest.fn().mockReturnValue({
        appendLine: jest.fn(),
        show: jest.fn(),
        clear: jest.fn(),
        replace: jest.fn(),
        append: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        dispose: jest.fn(),
        onDidChangeLogLevel: jest.fn(),
        logLevel: 1, // LogLevel.Info
        name: 'Mock Log Output Channel'
      }),
      createWebviewPanel: jest.fn().mockReturnValue({
        webview: {
          html: '',
          onDidReceiveMessage: jest.fn(),
          postMessage: jest.fn(),
          asWebviewUri: jest.fn(),
          cspSource: '',
          options: {}
        },
        onDidDispose: jest.fn(),
        reveal: jest.fn(),
        dispose: jest.fn(),
        onDidChangeViewState: jest.fn(),
        viewColumn: 1,
        active: true,
        visible: true
      }),
      createStatusBarItem: jest.fn().mockReturnValue({
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
        text: '',
        tooltip: '',
        command: '',
        color: undefined,
        backgroundColor: undefined,
        alignment: 1,
        priority: 0,
        name: ''
      }),
      activeTextEditor: undefined,
      onDidChangeActiveTextEditor: jest.fn(),
      visibleTextEditors: [],
      onDidChangeActiveColorTheme: jest.fn(),
      activeColorTheme: {
        kind: 1
      },
      registerTreeDataProvider: jest.fn(),
      registerWebviewViewProvider: jest.fn(),
      withProgress: jest.fn().mockImplementation((options, callback) => callback({
        report: jest.fn()
      }))
    },
    workspace: {
      getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn(),
        has: jest.fn(),
        update: jest.fn(),
        inspect: jest.fn()
      }),
      workspaceFolders: [],
      fs: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        createDirectory: jest.fn(),
        readDirectory: jest.fn(),
        stat: jest.fn(),
        rename: jest.fn(),
        copy: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn()
      },
      onDidChangeConfiguration: jest.fn(),
      onDidChangeWorkspaceFolders: jest.fn(),
      onDidOpenTextDocument: jest.fn(),
      onDidChangeTextDocument: jest.fn(),
      getWorkspaceFolder: jest.fn(),
      openTextDocument: jest.fn(),
      saveAll: jest.fn(),
      textDocuments: []
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn(),
      getCommands: jest.fn().mockResolvedValue([])
    },
    Uri: {
      file: jest.fn(path => ({ path, scheme: 'file', fsPath: path })),
      parse: jest.fn(),
      joinPath: jest.fn()
    },
    FileType: {
      File: 1,
      Directory: 2,
      SymbolicLink: 64
    },
    extensions: {
      getExtension: jest.fn()
    },
    languages: {
      createDiagnosticCollection: jest.fn().mockReturnValue({
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        dispose: jest.fn()
      }),
      registerHoverProvider: jest.fn(),
      registerCompletionItemProvider: jest.fn(),
      registerCodeLensProvider: jest.fn(),
      registerCodeActionsProvider: jest.fn()
    },
    ViewColumn: {
      One: 1,
      Two: 2,
      Three: 3,
      Active: -1
    },
    Position: jest.fn().mockImplementation((line, character) => ({
      line,
      character,
      compareTo: jest.fn(),
      isAfter: jest.fn(),
      isBefore: jest.fn(),
      isEqual: jest.fn(),
      translate: jest.fn(),
      with: jest.fn()
    })),
    Range: jest.fn().mockImplementation((startLine, startCharacter, endLine, endCharacter) => ({
      start: { line: startLine, character: startCharacter },
      end: { line: endLine, character: endCharacter },
      isEmpty: jest.fn(),
      isSingleLine: jest.fn(),
      contains: jest.fn(),
      intersection: jest.fn(),
      union: jest.fn(),
      with: jest.fn()
    })),
    Disposable: {
      from: jest.fn()
    },
    EventEmitter: jest.fn().mockImplementation(() => ({
      event: jest.fn(),
      fire: jest.fn(),
      dispose: jest.fn()
    })),
    ColorThemeKind: {
      Light: 1,
      Dark: 2,
      HighContrast: 3,
      HighContrastLight: 4
    },
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    TreeItemCollapsibleState: {
      None: 0,
      Collapsed: 1,
      Expanded: 2
    },
    ExtensionMode: {
      Development: 1,
      Test: 2,
      Production: 3
    },
    LogLevel: {
      Off: 0,
      Trace: 1,
      Debug: 2,
      Info: 3,
      Warning: 4,
      Error: 5
    },
    ExtensionKind: {
      UI: 1,
      Workspace: 2
    },
    EndOfLine: {
      LF: 1,
      CRLF: 2
    },
    EnvironmentVariableScope: {
      Global: 1
    },
    ExtensionContext: jest.fn().mockImplementation(() => ({
      subscriptions: [],
      extensionPath: '',
      storagePath: '',
      globalStoragePath: '',
      logPath: '',
      extensionUri: { path: '', scheme: 'file', fsPath: '' },
      globalStorageUri: { path: '', scheme: 'file', fsPath: '' },
      logUri: { path: '', scheme: 'file', fsPath: '' },
      storageUri: { path: '', scheme: 'file', fsPath: '' },
      extensionMode: 2, // ExtensionMode.Test
      globalState: {
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn(),
        keys: jest.fn().mockReturnValue([])
      },
      workspaceState: {
        get: jest.fn(),
        update: jest.fn(),
        keys: jest.fn().mockReturnValue([])
      },
      secrets: {
        get: jest.fn(),
        store: jest.fn(),
        delete: jest.fn(),
        onDidChange: jest.fn()
      },
      environmentVariableCollection: {
        persistent: true,
        replace: jest.fn(),
        append: jest.fn(),
        prepend: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
        getScoped: jest.fn(),
        description: '',
        [Symbol.iterator]: jest.fn()
      },
      extension: {
        id: 'test-extension',
        extensionUri: { path: '', scheme: 'file', fsPath: '' },
        extensionPath: '',
        isActive: true,
        packageJSON: {},
        exports: {},
        activate: jest.fn(),
        extensionKind: 1 // ExtensionKind.UI
      },
      languageModelAccessInformation: {
        endpoint: "https://mock-endpoint.com",
        authHeader: "mock-auth-header"
      },
      asAbsolutePath: jest.fn(path => `/mock/extension/path/${path}`)
    }))
  };
});

// Create a class for Memento implementation
class MockMemento implements vscode.Memento {
  private storage = new Map<string, any>();

  get<T>(key: string): T | undefined;
  get<T>(key: string, defaultValue: T): T;
  get(key: string, defaultValue?: any) {
    return this.storage.has(key) ? this.storage.get(key) : defaultValue;
  }

  update(key: string, value: any): Thenable<void> {
    this.storage.set(key, value);
    return Promise.resolve();
  }

  keys(): readonly string[] {
    return Array.from(this.storage.keys());
  }

  setKeysForSync(keys: readonly string[]): void {
    // This method is necessary for the GlobalState interface
  }
}

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
