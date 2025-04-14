// Mock for VS Code API
module.exports = {
  window: {
    showInformationMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      clear: jest.fn(),
      show: jest.fn()
    }),
    showQuickPick: jest.fn(),
    showInputBox: jest.fn(),
    createWebviewPanel: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    }),
    workspaceFolders: [],
    fs: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
      createDirectory: jest.fn(),
      readDirectory: jest.fn()
    },
    onDidChangeConfiguration: jest.fn()
  },
  commands: {
    registerCommand: jest.fn(),
    executeCommand: jest.fn()
  },
  Uri: {
    file: jest.fn(path => ({ path })),
    parse: jest.fn()
  },
  Position: jest.fn(),
  Range: jest.fn(),
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2
  }
};
