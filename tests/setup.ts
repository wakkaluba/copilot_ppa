/* eslint-disable @typescript-eslint/no-unused-vars */
import * as vscode from 'vscode';
// The vscode import is required for the test environment setup
// even though it appears unused in this file

// Mock VS Code API (no import needed since we're mocking the module)
jest.mock('vscode', () => {
  return {
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
      withProgress: jest.fn(),
      createWebviewPanel: jest.fn(),
      createStatusBarItem: jest.fn().mockReturnValue({
        text: '',
        tooltip: '',
        command: '',
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      }),
    },
    workspace: {
      getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn(),
        update: jest.fn(),
        has: jest.fn(),
        inspect: jest.fn()
      }),
      fs: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        readDirectory: jest.fn(),
        stat: jest.fn(),
        createDirectory: jest.fn(),
      },
      onDidChangeConfiguration: jest.fn(),
      findFiles: jest.fn(),
      workspaceFolders: [],
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn(),
    },
    Uri: {
      file: jest.fn(path => ({ 
        fsPath: path,
        scheme: 'file',
        path,
        with: jest.fn()
      })),
      parse: jest.fn(),
    },
    Position: jest.fn(),
    Range: jest.fn(),
    EventEmitter: jest.fn().mockImplementation(() => ({
      event: jest.fn(),
      fire: jest.fn()
    })),
    ViewColumn: {
      Active: -1,
      Beside: -2,
      One: 1,
      Two: 2,
      Three: 3
    },
    StatusBarAlignment: {
      Left: 1,
      Right: 2
    },
    ThemeColor: jest.fn(),
    ProgressLocation: {
      Notification: 15
    },
    LogLevel: {
      Trace: 0,
      Debug: 1,
      Info: 2,
      Warning: 3,
      Error: 4,
      Critical: 5,
      Off: 6
    },
    FileType: {
      Unknown: 0,
      File: 1,
      Directory: 2,
      SymbolicLink: 64
    },
    FileSystemError: {
      FileNotFound: jest.fn(),
      FileExists: jest.fn(),
      FileNotADirectory: jest.fn(),
      FileIsADirectory: jest.fn(),
      NoPermissions: jest.fn(),
      Unavailable: jest.fn()
    },
    ExtensionMode: {
      Development: 1,
      Test: 2,
      Production: 3
    },
    EnvironmentVariableMutatorType: {
      Replace: 1,
      Append: 2,
      Prepend: 3
    },
    EndOfLine: {
      LF: 1,
      CRLF: 2
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3
    }
  };
});

// Setup global test environment
beforeAll(() => {
  // Any setup before all tests
});

afterAll(() => {
  // Any cleanup after all tests
  jest.restoreAllMocks();
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});
