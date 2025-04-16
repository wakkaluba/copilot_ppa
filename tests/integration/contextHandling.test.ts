import * as vscode from 'vscode';
import { ContextManager } from '../../src/context/contextManager';
import { LLMProviderFactory } from '../../src/providers/llmProviderFactory';

describe('Context Handling Integration', () => {
  let contextManager: ContextManager;
  let mockProviderFactory: LLMProviderFactory;

  beforeEach(() => {
    mockProviderFactory = new LLMProviderFactory();
    jest.spyOn(mockProviderFactory, 'createProvider').mockImplementation(() => ({
      sendMessage: jest.fn(),
      getContext: jest.fn(),
      getCapabilities: jest.fn()
    }));
    
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
      (vscode.workspace.findFiles as jest.Mock).mockResolvedValueOnce(mockFiles);

      // Mock file content for each file
      const fileContents: { [key: string]: string } = {
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
      const message = 'Test message';
      contextManager.addMessage('user', message);

      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toHaveProperty('role', 'user');
      expect(history[0]).toHaveProperty('content', message);
    });

    test('manages conversation history size', () => {
      // Add multiple messages beyond the default limit
      const messageLimit = 10;
      for (let i = 0; i < messageLimit + 5; i++) {
        contextManager.addMessage('user', `Message ${i}`);
      }

      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(messageLimit);
      expect(history[messageLimit - 1]).toHaveProperty('content', `Message ${messageLimit + 4}`);
    });

    test('clears conversation history', () => {
      contextManager.addMessage('user', 'Test message');
      contextManager.clearConversationHistory();

      const history = contextManager.getConversationHistory();
      expect(history).toHaveLength(0);
    });
  });

  describe('Context Building', () => {
    test('builds prompt with current context', async () => {
      // Mock active editor context
      (vscode.window.activeTextEditor as any) = {
        document: {
          uri: vscode.Uri.file('/test/file.js'),
          fileName: '/test/file.js',
          languageId: 'javascript',
          getText: jest.fn().mockReturnValue('function test() { return true; }')
        }
      };

      // Add some history
      contextManager.addMessage('user', 'What does this function do?');
      contextManager.addMessage('assistant', 'This function returns true.');

      const prompt = await contextManager.buildPrompt('Tell me more about this code');

      expect(prompt).toContain('/test/file.js');
      expect(prompt).toContain('function test()');
      expect(prompt).toContain('What does this function do?');
      expect(prompt).toContain('This function returns true.');
      expect(prompt).toContain('Tell me more about this code');
    });
  });
});
