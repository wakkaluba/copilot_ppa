// filename: src/ui/__tests__/copilotIntegrationPanel.js.test.ts
import * as vscode from 'vscode';
import { ThemeService } from '../../services/ui/themeManager';
import { Logger } from '../../utils/logger';
import { CopilotIntegrationPanel } from '../copilotIntegrationPanel.js';
import { CopilotConnectionManager } from '../services/CopilotConnectionManager';
import { CopilotWebviewContentService } from '../services/CopilotWebviewContentService';
import { CopilotWebviewMessageHandler } from '../services/CopilotWebviewMessageHandler';
import { CopilotWebviewStateManager } from '../services/CopilotWebviewStateManager';

// Mocks
jest.mock('../services/CopilotWebviewContentService');
jest.mock('../services/CopilotWebviewStateManager');
jest.mock('../services/CopilotConnectionManager');
jest.mock('../services/CopilotWebviewMessageHandler');
jest.mock('../../utils/logger');
jest.mock('../../services/ui/themeManager');

// Mock vscode
jest.mock('vscode', () => {
  const originalModule = jest.requireActual('vscode');

  // Create a mock webview panel
  const mockWebviewPanel = {
    dispose: jest.fn(),
    reveal: jest.fn(),
    onDidDispose: jest.fn((callback) => {
      mockWebviewPanel.disposeCallback = callback;
      return { dispose: jest.fn() };
    }),
    disposeCallback: null,
    webview: {
      onDidReceiveMessage: jest.fn().mockReturnValue({ dispose: jest.fn() }),
      postMessage: jest.fn().mockResolvedValue(true),
      asWebviewUri: jest.fn(uri => ({ toString: () => uri.toString() + '-transformed' })),
      html: '',
    }
  };

  // Create a mock event emitter
  const mockEventEmitter = {
    event: jest.fn(),
    fire: jest.fn(),
    dispose: jest.fn()
  };

  return {
    ...originalModule,
    EventEmitter: jest.fn(() => mockEventEmitter),
    Uri: {
      file: jest.fn(path => ({
        path,
        toString: () => path,
        with: jest.fn().mockReturnThis(),
        fsPath: path
      })),
      joinPath: jest.fn((uri, ...pathSegments) => ({
        path: uri.path + '/' + pathSegments.join('/'),
        toString: () => uri.path + '/' + pathSegments.join('/'),
        with: jest.fn().mockReturnThis(),
        fsPath: uri.path + '/' + pathSegments.join('/')
      }))
    },
    window: {
      createWebviewPanel: jest.fn(() => mockWebviewPanel),
      showInformationMessage: jest.fn(),
      showErrorMessage: jest.fn(),
      onDidChangeActiveColorTheme: jest.fn(() => ({ dispose: jest.fn() }))
    },
    ViewColumn: {
      One: 1,
      Two: 2
    },
    // Mock other vscode APIs as needed
    Disposable: {
      from: jest.fn((...disposables) => ({ dispose: jest.fn() }))
    }
  };
}, { virtual: true });

describe('CopilotIntegrationPanel (JavaScript)', () => {
  let panel: CopilotIntegrationPanel;
  let context: vscode.ExtensionContext;
  let mockContentService: jest.Mocked<CopilotWebviewContentService>;
  let mockStateManager: jest.Mocked<CopilotWebviewStateManager>;
  let mockConnectionManager: jest.Mocked<CopilotConnectionManager>;
  let mockMessageHandler: jest.Mocked<CopilotWebviewMessageHandler>;
  let mockLogger: jest.Mocked<Logger>;
  let mockThemeService: jest.Mocked<ThemeService>;
  let mockPanel: any;
  let eventEmitters: any = {};

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Set up mock context
    context = {
      extensionUri: vscode.Uri.file('/extension/path'),
      subscriptions: [],
    } as unknown as vscode.ExtensionContext;

    // Set up mock logger
    mockLogger = {
      getInstance: jest.fn().mockReturnThis(),
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;
    (Logger.getInstance as jest.Mock).mockReturnValue(mockLogger);

    // Set up mock theme service
    mockThemeService = {
      getInstance: jest.fn().mockReturnThis(),
      getCurrentTheme: jest.fn().mockReturnValue({ primary: '#000000' }),
      getThemeCSS: jest.fn().mockReturnValue('body { color: #000 }'),
    } as unknown as jest.Mocked<ThemeService>;
    (ThemeService.getInstance as jest.Mock).mockReturnValue(mockThemeService);

    // Set up mock state manager with event emitter
    eventEmitters.stateChanged = { event: jest.fn(), fire: jest.fn(), dispose: jest.fn() };
    mockStateManager = {
      onStateChanged: jest.fn(() => eventEmitters.stateChanged.event),
      getState: jest.fn().mockReturnValue({ messages: [] }),
      updateState: jest.fn(),
      dispose: jest.fn(),
    } as unknown as jest.Mocked<CopilotWebviewStateManager>;
    (CopilotWebviewStateManager as jest.Mock).mockImplementation(() => mockStateManager);

    // Set up mock connection manager with event emitter
    eventEmitters.connectionChanged = { event: jest.fn(), fire: jest.fn(), dispose: jest.fn() };
    mockConnectionManager = {
      onConnectionChanged: jest.fn(() => eventEmitters.connectionChanged.event),
      isConnected: jest.fn().mockReturnValue(true),
      initialize: jest.fn().mockResolvedValue(undefined),
      sendMessage: jest.fn().mockResolvedValue('Mock response'),
      dispose: jest.fn(),
      wrapError: jest.fn((message, error) => new Error(`${message}: ${error.message}`)),
      getErrorMessage: jest.fn(error => error instanceof Error ? error.message : String(error)),
    } as unknown as jest.Mocked<CopilotConnectionManager>;
    (CopilotConnectionManager as jest.Mock).mockImplementation(() => mockConnectionManager);

    // Set up mock message handler
    mockMessageHandler = {
      handleMessage: jest.fn().mockResolvedValue({ command: 'reply', text: 'Mock reply' }),
      dispose: jest.fn(),
    } as unknown as jest.Mocked<CopilotWebviewMessageHandler>;
    (CopilotWebviewMessageHandler as jest.Mock).mockImplementation(() => mockMessageHandler);

    // Set up mock content service
    mockContentService = {
      generateWebviewContent: jest.fn().mockReturnValue('<html>Mock content</html>'),
    } as unknown as jest.Mocked<CopilotWebviewContentService>;
    (CopilotWebviewContentService as jest.Mock).mockImplementation(() => mockContentService);

    // Create the panel instance
    const CreatePanelClass = CopilotIntegrationPanel as any;
    panel = CreatePanelClass.getInstance(context);

    // Get reference to the mock panel created by vscode.window.createWebviewPanel
    mockPanel = (vscode.window.createWebviewPanel as jest.Mock).mock.results[0]?.value;
  });

  afterEach(() => {
    // Clean up
    if (panel) {
      panel.dispose();
    }
  });

  describe('getInstance', () => {
    it('should create singleton instance', () => {
      const instance1 = CopilotIntegrationPanel.getInstance(context);
      const instance2 = CopilotIntegrationPanel.getInstance(context);

      expect(instance1).toBe(instance2);
      expect(CopilotWebviewContentService).toHaveBeenCalledTimes(1);
      expect(CopilotWebviewStateManager).toHaveBeenCalledTimes(1);
      expect(CopilotConnectionManager).toHaveBeenCalledTimes(1);
      expect(CopilotWebviewMessageHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('show', () => {
    it('should create and initialize webview panel on first call', async () => {
      await panel.show();

      expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
        'copilotIntegration',
        'AI Assistant',
        vscode.ViewColumn.Two,
        expect.objectContaining({
          enableScripts: true,
          retainContextWhenHidden: true
        })
      );

      expect(mockConnectionManager.initialize).toHaveBeenCalled();
      expect(mockPanel.webview.onDidReceiveMessage).toHaveBeenCalled();
      expect(mockContentService.generateWebviewContent).toHaveBeenCalled();
    });

    it('should reveal existing panel on subsequent calls', async () => {
      await panel.show();
      await panel.show();

      expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
      expect(mockPanel.reveal).toHaveBeenCalledTimes(1);
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Connection failed');
      mockConnectionManager.initialize.mockRejectedValueOnce(error);

      await expect(panel.show()).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error showing Copilot integration panel',
        error
      );
    });
  });

  describe('webview message handling', () => {
    it('should process messages from webview and respond', async () => {
      await panel.show();

      // Simulate receiving a message from the webview
      const messageCallback = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];
      const message = { command: 'sendMessage', text: 'Hello AI' };

      await messageCallback(message);

      expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(message);
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
        command: 'reply',
        text: 'Mock reply'
      });
    });

    it('should handle message processing errors', async () => {
      await panel.show();

      const error = new Error('Processing failed');
      mockMessageHandler.handleMessage.mockRejectedValueOnce(error);

      const messageCallback = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];
      await messageCallback({ command: 'sendMessage', text: 'Hello AI' });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error handling webview message',
        error
      );
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
        command: 'showError',
        text: expect.stringContaining('Processing failed')
      });
    });
  });

  describe('content updates', () => {
    it('should update content when theme changes', async () => {
      await panel.show();

      // Clear initial calls
      mockContentService.generateWebviewContent.mockClear();

      // Simulate theme change event
      const themeChangeCallback = vscode.window.onDidChangeActiveColorTheme.mock.calls[0][0];
      themeChangeCallback();

      expect(mockContentService.generateWebviewContent).toHaveBeenCalled();
    });

    it('should update content when state changes', async () => {
      await panel.show();

      // Clear initial calls
      mockContentService.generateWebviewContent.mockClear();

      // Simulate state change event
      const stateChangeCallback = mockStateManager.onStateChanged.mock.calls[0][0];
      stateChangeCallback();

      expect(mockContentService.generateWebviewContent).toHaveBeenCalled();
    });

    it('should update content when connection status changes', async () => {
      await panel.show();

      // Clear initial calls
      mockContentService.generateWebviewContent.mockClear();

      // Simulate connection change event
      const connectionChangeCallback = mockConnectionManager.onConnectionChanged.mock.calls[0][0];
      connectionChangeCallback();

      expect(mockContentService.generateWebviewContent).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('should clean up resources when disposed', async () => {
      await panel.show();
      panel.dispose();

      expect(mockPanel.dispose).toHaveBeenCalled();
      expect(mockStateManager.dispose).toHaveBeenCalled();
      expect(mockConnectionManager.dispose).toHaveBeenCalled();
      expect(mockMessageHandler.dispose).toHaveBeenCalled();
    });

    it('should clean up when panel is disposed', async () => {
      await panel.show();

      // Simulate panel dispose event
      mockPanel.disposeCallback();

      expect(mockStateManager.dispose).toHaveBeenCalled();
      expect(mockConnectionManager.dispose).toHaveBeenCalled();
      expect(mockMessageHandler.dispose).toHaveBeenCalled();
    });
  });

  // JavaScript-specific tests
  describe('JS-specific behavior', () => {
    it('should handle null values gracefully', async () => {
      await panel.show();

      // Test with null message
      const messageCallback = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];
      await messageCallback(null);

      // Should not throw error
      expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(null);
    });

    it('should handle undefined properly', async () => {
      await panel.show();

      // Make onConnectionChanged return undefined
      mockConnectionManager.onConnectionChanged.mockReturnValueOnce(undefined);

      // This shouldn't throw an error when setting up listeners
      const newPanel = CopilotIntegrationPanel.getInstance(context);
      expect(newPanel).toBeDefined();
    });

    it('should handle various JS data types in messages', async () => {
      await panel.show();

      const messageCallback = mockPanel.webview.onDidReceiveMessage.mock.calls[0][0];

      // Test with objects
      await messageCallback({ command: 'complexData', data: { test: true, value: 42 } });
      expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'complexData' })
      );

      // Test with arrays
      await messageCallback({ command: 'arrayData', data: [1, 2, 3] });
      expect(mockMessageHandler.handleMessage).toHaveBeenCalledWith(
        expect.objectContaining({ command: 'arrayData' })
      );

      // Test with special JS values
      await messageCallback({ command: 'specialValues', data: {
        undef: undefined,
        nullVal: null,
        nan: NaN,
        inf: Infinity
      }});
      expect(mockMessageHandler.handleMessage).toHaveBeenCalled();
    });
  });
});
