import { ContextManager } from '../../src/context/contextManager';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';
import * as vscode from 'vscode';

describe('Context Handling Integration', () => {
  let contextManager: ContextManager;
  let mockProviderFactory: LLMProviderFactory;
  
  beforeEach(() => {
    mockProviderFactory = new LLMProviderFactory();
    contextManager = new ContextManager(mockProviderFactory);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Context Capture', () => {
    test('captures current file context', async () => {
      // Mock file content
      const fileUri = vscode.Uri.file('/test/file.js');
      const fileContent = 'function test() { return true; }';
      
      (vscode.workspace.fs.readFile as jest.Mock).mockResolvedValueOnce(
        Buffer.from(fileContent)
      );
      
      // Mock active editor
      (vscode.window.activeTextEditor as any) = {
        document: {
          uri: fileUri,
          fileName: '/test/file.js',
          languageId: 'javascript',
          getText: jest.fn().mockReturnValue(fileContent)
        }
      };
      
      const context = await contextManager.captureCurrentFileContext();
      
      expect(context).toHaveProperty('filePath', '/test/file.js');
      expect(context).toHaveProperty('language', 'javascript');
      expect(context).toHaveProperty('content', fileContent);
    });
    
    test('captures workspace context', async () => {
      // Mock workspace files
      const mockFiles = [
        vscode.Uri.file('/test/file1.js'),
        vscode.Uri.file('/test/file2.js'),
        vscode.Uri.file('/test/package.json')
      ];
      
      // Mock findFiles method
      (vscode.workspace.findFiles as jest.Mock) = jest.fn().mockResolvedValueOnce(mockFiles);
      
      // Mock file content for each file
      const fileContents = {
        '/test/file1.js': 'function file1() {}',
        '/test/file2.js': 'function file2() {}',
        '/test/package.json': '{ "name": "test-project" }'
      };
      
      (vscode.workspace.fs.readFile as jest.Mock).mockImplementation((uri) => {
        const content = fileContents[uri.fsPath] || '';
        return Promise.resolve(Buffer.from(content));
      });
      
      const context = await contextManager.captureWorkspaceContext(
        ['**/*.js', '**/package.json'],
        3
      );
      
      expect(context).toHaveProperty('files');
      expect(context.files).toHaveLength(3);
      expect(context.files[0]).toHaveProperty('filePath');
      expect(context.files[0]).toHaveProperty('content');
    });
  });
  
  describe('Context Management', () => {
    test('adds message to conversation history', () => {
      contextManager.addMessage('user', 'Test message');
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty('role', 'user');
      expect(history[0]).toHaveProperty('content', 'Test message');
    });
    
    test('manages conversation history size', () => {
      // Add multiple messages
      for (let i = 0; i < 15; i++) {
        contextManager.addMessage('user', `Message ${i}`);
      }
      
      // Default max history size should be 10
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(10);
      expect(history[9]).toHaveProperty('content', 'Message 14');
    });
    
    test('clears conversation history', () => {
      contextManager.addMessage('user', 'Test message');
      contextManager.clearConversationHistory();
      
      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(0);
    });
  });
  
  describe('Context Building', () => {
    test('builds context for prompt', async () => {
      // Mock active file context
      (vscode.window.activeTextEditor as any) = {
        document: {
          uri: vscode.Uri.file('/test/file.js'),
          fileName: '/test/file.js',
          languageId: 'javascript',
          getText: jest.fn().mockReturnValue('function test() {}')
        }
      };
      
      // Add some history
      contextManager.addMessage('user', 'How to improve this code?');
      contextManager.addMessage('assistant', 'Here are some suggestions...');
      
      const prompt = await contextManager.buildPromptWithContext('Optimize this code');
      
      expect(prompt).toContain('Optimize this code');
      expect(prompt).toContain('function test()');
      expect(prompt).toContain('How to improve this code?');
      expect(prompt).toContain('Here are some suggestions...');
    });
  });
});
