// tests/setup.js

// Set up global test environment
process.env.NODE_ENV = 'test';

// Mock vscode module since it's not available in the test environment
jest.mock('vscode', () => {
  return {
    // Add all vscode APIs you need to mock
    window: {
      createOutputChannel: jest.fn(() => ({
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      })),
      createLogOutputChannel: jest.fn(() => ({
        append: jest.fn(),
        appendLine: jest.fn(),
        clear: jest.fn(),
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
        logLevel: 1,
        onDidChangeLogLevel: { event: jest.fn() },
        trace: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      })),
      showErrorMessage: jest.fn(),
      showInformationMessage: jest.fn(),
      showWarningMessage: jest.fn(),
      withProgress: jest.fn()
    },
    EventEmitter: class {
      event = jest.fn();
      fire = jest.fn();
      dispose = jest.fn();
    },
    Uri: {
      parse: jest.fn(str => ({ fsPath: str.replace('file://', '') })),
      file: jest.fn(path => ({ fsPath: path }))
    },
    LogLevel: {
      Trace: 0,
      Debug: 1,
      Info: 2,
      Warning: 3,
      Error: 4,
      Off: 5
    },
    ExtensionMode: {
      Production: 1,
      Development: 2,
      Test: 3
    },
    DiagnosticSeverity: {
      Error: 0,
      Warning: 1,
      Information: 2,
      Hint: 3
    },
    ProgressLocation: {
      Notification: 15
    }
  };
});