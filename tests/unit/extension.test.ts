import * as vscode from 'vscode';
import { activate, deactivate } from '../../src/extension';

describe('Extension', () => {
  let mockContext: vscode.ExtensionContext;

  beforeEach(() => {
    // Create a mock context
    mockContext = {
      subscriptions: [],
      extensionMode: vscode.ExtensionMode.Development,
      extensionUri: vscode.Uri.file('/test'),
      extensionPath: '/test',
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
      globalStorageUri: vscode.Uri.file('/test/global'),
      logUri: vscode.Uri.file('/test/log'),
      storagePath: '/test/storage',
      storageUri: vscode.Uri.file('/test/storage'),
      logPath: '/test/log',
      asAbsolutePath: jest.fn(path => path),
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
      globalStoragePath: '/test/global/storage',
      extension: {
        id: 'test-extension',
        extensionUri: vscode.Uri.file('/test'),
        extensionPath: '/test',
        isActive: true,
        packageJSON: {},
        exports: {},
        activate: jest.fn(),
        extensionKind: vscode.ExtensionKind.UI
      },
      languageModelAccessInformation: {
        endpoint: "https://mock-endpoint.com",
        authHeader: "mock-auth-header"
      }
    };
  });

  describe('Activation', () => {
    it('should register commands on activation', async () => {
      await activate(mockContext);
      
      expect(vscode.commands.registerCommand).toHaveBeenCalled();
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it('should register the welcome message command', async () => {
      await activate(mockContext);
      
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'copilot-ppa.showWelcomeMessage',
        expect.any(Function)
      );
    });

    it('should initialize services', async () => {
      await activate(mockContext);
      
      // Verify service initialization through mocked commands
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'copilot-ppa.startAgent',
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        'copilot-ppa.stopAgent',
        expect.any(Function)
      );
    });
  });

  describe('Deactivation', () => {
    it('should clean up on deactivation', () => {
      const disposeStub = jest.fn();
      mockContext.subscriptions.push({ dispose: disposeStub });

      deactivate();

      expect(disposeStub).toHaveBeenCalled();
    });
  });

  describe('Command Execution', () => {
    it('should show welcome message when command is executed', async () => {
      await activate(mockContext);

      // Get the registered welcome message command handler
      const commandHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        call => call[0] === 'copilot-ppa.showWelcomeMessage'
      )?.[1];

      // Execute the command handler
      if (commandHandler) {
        await commandHandler();
      }

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        'Copilot Productivity and Performance Analyzer is active!'
      );
    });

    it('should handle agent start/stop commands', async () => {
      await activate(mockContext);

      // Get the start agent command handler
      const startHandler = (vscode.commands.registerCommand as jest.Mock).mock.calls.find(
        call => call[0] === 'copilot-ppa.startAgent'
      )?.[1];

      // Execute the command handler
      if (startHandler) {
        await startHandler();
      }

      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('Starting')
      );
    });
  });
});