import * as vscode from 'vscode';
import { ChatView } from '../../src/ui/chatView';
import { StatusBar } from '../../src/ui/statusBar';

describe('UI Components', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('ChatView', () => {
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
      const mockPanel = vscode.window.createWebviewPanel.mock.results[0].value;
      
      await chatView.sendMessage('Hello from test');
      
      expect(mockPanel.webview.postMessage).toHaveBeenCalledWith({
        type: 'message',
        content: 'Hello from test'
      });
    });
    
    test('disposes webview correctly', () => {
      const chatView = new ChatView();
      const mockPanel = vscode.window.createWebviewPanel.mock.results[0].value;
      
      chatView.dispose();
      
      expect(mockPanel.dispose).toHaveBeenCalled();
    });
  });
  
  describe('StatusBar', () => {
    test('creates status bar item', () => {
      const statusBar = new StatusBar();
      
      expect(vscode.window.createStatusBarItem).toHaveBeenCalledWith(
        vscode.StatusBarAlignment.Left
      );
    });
    
    test('updates status text', () => {
      const statusBar = new StatusBar();
      const mockStatusBarItem = vscode.window.createStatusBarItem.mock.results[0].value;
      
      statusBar.setStatus('Connected');
      
      expect(mockStatusBarItem.text).toBe('$(check) Copilot PPA: Connected');
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });
    
    test('shows error status', () => {
      const statusBar = new StatusBar();
      const mockStatusBarItem = vscode.window.createStatusBarItem.mock.results[0].value;
      
      statusBar.setError('Connection failed');
      
      expect(mockStatusBarItem.text).toBe('$(error) Copilot PPA: Connection failed');
      expect(mockStatusBarItem.show).toHaveBeenCalled();
    });
    
    test('disposes status bar item', () => {
      const statusBar = new StatusBar();
      const mockStatusBarItem = vscode.window.createStatusBarItem.mock.results[0].value;
      
      statusBar.dispose();
      
      expect(mockStatusBarItem.dispose).toHaveBeenCalled();
    });
  });
});
