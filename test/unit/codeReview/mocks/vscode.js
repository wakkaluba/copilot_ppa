// Mock VS Code module
const vscode = {
  ExtensionMode: {
    Development: 1,
    Production: 2,
    Test: 3
  },
  Disposable: {
    from: (...disposables) => ({
      dispose: () => disposables.forEach(d => d.dispose())
    })
  }
};

// Export the mock
module.exports = vscode;
