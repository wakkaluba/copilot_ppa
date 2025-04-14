import * as vscode from 'vscode';

// Mock the VS Code namespace
jest.mock('vscode', () => {
  return {
    window: {
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      createOutputChannel: jest.fn().mockReturnValue({
        appendLine: jest.fn(),
        show: jest.fn(),
        clear: jest.fn()
      }),
      createWebviewPanel: jest.fn()
    },
    commands: {
      registerCommand: jest.fn(),
      executeCommand: jest.fn()
    },
    workspace: {
      getConfiguration: jest.fn().mockReturnValue({
        get: jest.fn(),
        has: jest.fn(),
        update: jest.fn()
      }),
      fs: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        readDirectory: jest.fn(),
        createDirectory: jest.fn()
      },
      onDidChangeConfiguration: jest.fn()
    },
    Uri: {
      file: jest.fn(path => ({ path, scheme: 'file' })),
      parse: jest.fn()
    },
    FileType: {
      File: 1,
      Directory: 2,
      SymbolicLink: 64
    },
    extensions: {
      getExtension: jest.fn()
    },
    ExtensionContext: {}
  };
});

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
