const vscode = require('./vscode');

describe('VS Code Mock', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('window namespace mock implementation', () => {
        // Test output channel
        const outputChannel = vscode.window.createOutputChannel('test');
        expect(outputChannel).toBeDefined();
        expect(typeof outputChannel.appendLine).toBe('function');
        expect(typeof outputChannel.clear).toBe('function');
        expect(typeof outputChannel.show).toBe('function');

        // Test information message
        vscode.window.showInformationMessage('info');
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('info');

        // Test warning message
        vscode.window.showWarningMessage('warning');
        expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('warning');

        // Test error message
        vscode.window.showErrorMessage('error');
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('error');

        // Test webview panel
        const webviewPanel = vscode.window.createWebviewPanel('test', 'Test', 1);
        expect(webviewPanel.webview).toBeDefined();
        expect(webviewPanel.webview.html).toBe('');
        expect(typeof webviewPanel.webview.onDidReceiveMessage).toBe('function');
        expect(typeof webviewPanel.webview.postMessage).toBe('function');
        expect(typeof webviewPanel.onDidDispose).toBe('function');
        expect(typeof webviewPanel.reveal).toBe('function');
        expect(typeof webviewPanel.dispose).toBe('function');

        // Test status bar item
        const statusBarItem = vscode.window.createStatusBarItem();
        expect(statusBarItem).toBeDefined();
        expect(typeof statusBarItem.show).toBe('function');
        expect(typeof statusBarItem.hide).toBe('function');
        expect(typeof statusBarItem.dispose).toBe('function');
    });

    test('workspace namespace mock implementation', () => {
        // Test configuration
        const config = vscode.workspace.getConfiguration('test');
        expect(config).toBeDefined();
        expect(typeof config.get).toBe('function');
        expect(typeof config.update).toBe('function');

        // Test workspace folders
        expect(Array.isArray(vscode.workspace.workspaceFolders)).toBe(true);

        // Test filesystem operations
        expect(typeof vscode.workspace.fs.readFile).toBe('function');
        expect(typeof vscode.workspace.fs.writeFile).toBe('function');
        expect(typeof vscode.workspace.fs.createDirectory).toBe('function');
        expect(typeof vscode.workspace.fs.readDirectory).toBe('function');
    });

    test('commands namespace mock implementation', () => {
        // Test command registration
        expect(typeof vscode.commands.registerCommand).toBe('function');
        expect(typeof vscode.commands.executeCommand).toBe('function');

        const disposable = vscode.commands.registerCommand('test.command', () => {});
        expect(disposable).toBeDefined();
    });

    test('URI mock implementation', () => {
        // Test URI file function
        const uri = vscode.Uri.file('/test/path');
        expect(uri).toBeDefined();
        expect(uri.path).toBe('/test/path');

        // Test URI parse function
        expect(typeof vscode.Uri.parse).toBe('function');
    });

    test('basic VS Code types mock implementation', () => {
        // Test Position constructor
        expect(typeof vscode.Position).toBe('function');

        // Test Range constructor
        expect(typeof vscode.Range).toBe('function');

        // Test StatusBarAlignment enum
        expect(vscode.StatusBarAlignment.Left).toBe(1);
        expect(vscode.StatusBarAlignment.Right).toBe(2);

        // Test TreeItemCollapsibleState enum
        expect(vscode.TreeItemCollapsibleState.None).toBe(0);
        expect(vscode.TreeItemCollapsibleState.Collapsed).toBe(1);
        expect(vscode.TreeItemCollapsibleState.Expanded).toBe(2);
    });

    test('mock behavior consistency', () => {
        // Test that mocks maintain state within a test
        const msg = 'test message';
        vscode.window.showInformationMessage(msg);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
        expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(msg);

        // Test that output channel operations are chainable
        const channel = vscode.window.createOutputChannel('test');
        channel.appendLine('line 1');
        channel.clear();
        channel.show();

        expect(channel.appendLine).toHaveBeenCalledWith('line 1');
        expect(channel.clear).toHaveBeenCalled();
        expect(channel.show).toHaveBeenCalled();
    });
});
