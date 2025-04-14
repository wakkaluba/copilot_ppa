module.exports = {
  window: {
    showInformationMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showWarningMessage: jest.fn(),
    createOutputChannel: jest.fn().mockReturnValue({
      appendLine: jest.fn(),
      show: jest.fn()
    })
  },
  commands: {
    registerCommand: jest.fn()
  },
  workspace: {
    getConfiguration: jest.fn().mockReturnValue({
      get: jest.fn(),
      update: jest.fn()
    }),
    workspaceFolders: []
  },
  Uri: {
    file: jest.fn(path => ({ path })),
    parse: jest.fn()
  },
  Position: jest.fn(),
  Range: jest.fn(),
  // Add more VS Code API mocks as needed
};
