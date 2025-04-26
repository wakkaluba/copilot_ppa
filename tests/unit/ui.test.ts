import * as vscode from 'vscode';
import { ChatView } from '../../src/ui/chatView'; // Assuming correct casing
import { StatusBar } from '../../src/ui/statusBar'; // Assuming correct casing

// Define interfaces for mock objects for better typing
interface MockWebviewPanel {
    webview: {
        html: string;
        onDidReceiveMessage: vscode.Event<any>;
        postMessage: jest.Mock<Promise<boolean>, [any]>; // More specific mock type
        asWebviewUri: (uri: vscode.Uri) => vscode.Uri;
        options: { enableScripts: boolean };
        cspSource: string;
    };
    onDidDispose: jest.Mock<any, any>;
    dispose: jest.Mock<void, []>;
    reveal: jest.Mock<void, [vscode.ViewColumn?, boolean?]>;
    viewColumn?: vscode.ViewColumn;
    active: boolean;
    visible: boolean;
    options: vscode.WebviewPanelOptions;
    viewType: string;
    title: string;
    iconPath?: vscode.Uri | { light: vscode.Uri; dark: vscode.Uri };
}

interface MockStatusBarItem extends vscode.StatusBarItem {
    text: string;
    tooltip: string | vscode.MarkdownString | undefined;
    command: string | vscode.Command | undefined;
    show: jest.Mock<void, []>;
    hide: jest.Mock<void, []>;
    dispose: jest.Mock<void, []>;
}

describe('UI Components', () => {
  describe('ChatView', () => {
    let mockWebviewPanel: MockWebviewPanel;
    let mockEventEmitter: vscode.EventEmitter<any>;

    beforeEach(() => {
      mockEventEmitter = new vscode.EventEmitter<any>();

      // Use the defined interface for the mock
      mockWebviewPanel = {
        webview: {
          html: '',
          onDidReceiveMessage: mockEventEmitter.event,
          postMessage: jest.fn().mockResolvedValue(true), // Mock resolution value
          asWebviewUri: (uri: vscode.Uri) => uri,
          options: { enableScripts: true },
          cspSource: 'mock-csp-source'
        },
        onDidDispose: jest.fn(),
        dispose: jest.fn(),
        reveal: jest.fn(),
        active: true,
        visible: true,
        options: { enableCommandUris: true, enableScripts: true, retainContextWhenHidden: true },
        viewType: 'copilotPPAChat',
        title: 'Copilot PPA Chat',
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
      try {
          await chatView.sendMessage('Hello from test');
          expect(mockWebviewPanel.webview.postMessage).toHaveBeenCalledWith({
              type: 'message',
              content: 'Hello from test'
          });
      } catch (error) {
          // Use assert.fail for consistency if assert is preferred, or just fail the test
          // assert.fail(`Test failed with error: ${error}`);
          throw new Error(`Test failed during sendMessage: ${error}`); // Add error handling
      }
    });

    test('disposes webview correctly', () => {
      const chatView = new ChatView();
      chatView.dispose();
      
      expect(mockWebviewPanel.dispose).toHaveBeenCalled();
    });

    test('handles received messages', () => {
      const chatView = new ChatView();
      // Add explicit type for the callback parameter
      const messageHandler = jest.fn((message: any) => {}); 
      chatView.onMessage(messageHandler);

      // Simulate receiving a message
      const testMessage = { type: 'test', data: 'test data' };
      mockEventEmitter.fire(testMessage);

      expect(messageHandler).toHaveBeenCalledWith(testMessage);
    });
  });

  describe('StatusBar', () => {
    let mockStatusBarItem: MockStatusBarItem;

    beforeEach(() => {
      // Use the defined interface for the mock
      mockStatusBarItem = {
        id: 'copilotPPAStatus',
        alignment: vscode.StatusBarAlignment.Left,
        priority: 100,
        text: '',
        tooltip: '',
        command: '',
        show: jest.fn(),
        hide: jest.fn(),
        dispose: jest.fn(),
        color: undefined,
        backgroundColor: undefined,
        name: undefined,
        accessibilityInformation: undefined,
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
