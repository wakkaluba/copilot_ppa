// Minimal VS Code mock for Jest
type = {};
module.exports = {
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        activeTextEditor: null
    },
    workspace: {
        onDidChangeConfiguration: jest.fn(),
        getConfiguration: jest.fn().mockReturnValue({ get: jest.fn() })
    },
    Uri: {
        file: (f) => ({ fsPath: f, toString: () => f })
    },
    TextDocument: function () {},
    ExtensionContext: function () {},
    TextEditor: function () {}
};
