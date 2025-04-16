import * as vscode from 'vscode';
import { ChatView } from '../../src/ui/chatView';
import { StatusBar } from '../../src/ui/statusBar';

describe('UI Components', () => {
  describe('ChatView', () => {
    let mockWebviewPanel: any;
    let mockEventEmitter: vscode.EventEmitter<any>;

    beforeEach(() => {
      mockEventEmitter = new vscode.EventEmitter();
      
      mockWebviewPanel = {
        webview: {
          html: '',
          onDidReceiveMessage: mockEventEmitter.event,
          postMessage: jest.fn().mockResolvedValue(undefined),
          asWebviewUri: (uri: vscode.Uri) => uri,
          options: { enableScripts: true },
          cspSource: 'mock-csp-source'
        },
        onDidDispose: jest.fn(),
        dispose: jest.fn()
      };

      (vscode.window.createWebviewPanel as jest.Mock).mockReturnValue(mockWebviewPanel);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test('initializes correctly', () => {
      const chatView = new ChatView();
      
      expect(vscode.window.createWebviewPanel).toHaveBeenCalledWith(
        'copilotPPAChat',
        'Copilot PPA Chat',
        vscode.ViewColumn.Beside,
        expect.objectContaining({
          enableScripts: true,
          retainContextWhenHidden: true
        })
      );
    });

    test('posts message to webview', async () => {
      const chatView = new ChatView();
      await chatView.sendMessage('Hello from test');
      
      expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
        type: 'message',
        content: 'Hello from test'
      });
    });

    test('disposes webview correctly', () => {
      const chatView = new ChatView();
      chatView.dispose();
      
      expect(mockWebviewPanel.dispose).toHaveBeenCalled();
    });

    test('handles received messages', () => {
      const chatView = new ChatView();
      const messageHandler = jest.fn();
      chatView.onMessage(messageHandler);

      // Simulate receiving a message
      mockEventEmitter.fire({ type: 'test', data: 'test data' });

      expect(messageHandler).toHaveBeenCalledWith({ type: 'test', data: 'test data' });
    });
  });

  describe('StatusBar', () => {
    let mockStatusBarItem: any;

    beforeEach(() => {
      mockStatusBarItem = {
        text: '',
        tooltip: '',
        command: '',
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn()
      };

      (vscode.window.createStatusBarItem as jest.Mock).mockReturnValue(mockStatusBarItem);
    });

    test('creates status bar item', () => {
      const statusBar = new StatusBar();
      
      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Left
      );
    });

    test('updates status text', () => {
      const statusBar = new StatusBar();
      statusBar.setStatus('Connected');
      
      expect(mockStatusBarItem.text).toBe('$(check) Copilot PPA: Connected');
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });

    test('shows error status', () => {
      const statusBar = new StatusBar();
      statusBar.setError('Connection failed');
      
      expect(mockStatusBarItem.text).toBe('$(error) Copilot PPA: Connection failed');
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });

    test('disposes status bar item', () => {
      const statusBar = new StatusBar();
      statusBar.dispose();
      
      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
    });

    test('handles click commands', () => {
      const statusBar = new StatusBar();
      const command = 'copilot-ppa.showMenu';
      statusBar.setCommand(command);
      
      expect(mockStatusBarItem.command).toBe(command);
    });
  });
});
