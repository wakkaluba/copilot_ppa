import * as vscode from 'vscode';
import { describe, expect, test, beforeEach, jest, afterEach } from '@jest/globals';
import { ContextManager } from '../../../src/services/ContextManager';
import { ConversationHistory } from '../../../src/services/ConversationHistory';
import { ConversationManager } from '../../../src/services/conversationManager';
import { PromptManager } from '../../../src/services/PromptManager';

// Mock the dependencies
jest.mock('../../../src/services/ConversationHistory');
jest.mock('../../../src/services/ConversationManager');
jest.mock('../../../src/services/PromptManager');

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockHistory: jest.Mocked<ConversationHistory>;
  let mockConversationManager: jest.Mocked<ConversationManager>;
  let mockPromptManager: jest.Mocked<PromptManager>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock instances
    mockHistory = new ConversationHistory() as jest.Mocked<ConversationHistory>;
    mockConversationManager = {
      getInstance: jest.fn().mockReturnValue(mockConversationManager),
      getCurrentContext: jest.fn().mockReturnValue([]),
      // Add other methods as needed
    } as unknown as jest.Mocked<ConversationManager>;

    mockPromptManager = {
      getInstance: jest.fn().mockReturnValue(mockPromptManager),
      // Add other methods as needed
    } as unknown as jest.Mocked<PromptManager>;

    // Mock getInstance methods on the classes
    (ConversationManager.getInstance as jest.Mock).mockReturnValue(mockConversationManager);
    (PromptManager.getInstance as jest.Mock).mockReturnValue(mockPromptManager);
    
    // Create instance of ContextManager
    contextManager = ContextManager.getInstance(mockHistory);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('getInstance should return singleton instance', () => {
    const instance1 = ContextManager.getInstance(mockHistory);
    const instance2 = ContextManager.getInstance(mockHistory);
    expect(instance1).toBe(instance2);
  });

  test('createContext should initialize a new context with default values', () => {
    const conversationId = 'test_conversation';
    const context = contextManager.createContext(conversationId);
    
    expect(context.conversationId).toBe(conversationId);
    expect(context.relevantFiles).toEqual([]);
    expect(context.systemPrompt).toContain('You are a helpful VS Code extension assistant');
  });

  test('updateContext should modify an existing context', () => {
    const conversationId = 'test_conversation';
    contextManager.createContext(conversationId);
    
    contextManager.updateContext(conversationId, {
      activeFile: 'test.ts',
      selectedCode: 'console.log("Hello");',
      codeLanguage: 'typescript'
    });
    
    const context = contextManager.getContext(conversationId);
    expect(context.activeFile).toBe('test.ts');
    expect(context.selectedCode).toBe('console.log("Hello");');
    expect(context.codeLanguage).toBe('typescript');
  });

  test('updateContext should throw error for non-existent context', () => {
    expect(() => {
      contextManager.updateContext('nonexistent_id', {
        activeFile: 'test.ts'
      });
    }).toThrow(/Context not found/);
  });

  test('getContext should create a new context if it does not exist', () => {
    const conversationId = 'new_conversation';
    const context = contextManager.getContext(conversationId);
    
    expect(context.conversationId).toBe(conversationId);
    expect(context.systemPrompt).toContain('VS Code extension assistant');
  });

  test('buildPrompt should incorporate context into the prompt', async () => {
    const conversationId = 'test_conversation';
    
    // Create a context with specific values
    contextManager.createContext(conversationId);
    contextManager.updateContext(conversationId, {
      activeFile: 'test.ts',
      selectedCode: 'function add(a, b) { return a + b; }',
      codeLanguage: 'typescript'
    });
    
    // Mock conversation history
    mockHistory.getConversation = jest.fn().mockReturnValue({
      id: conversationId,
      title: "Test Conversation",
      created: Date.now(),
      updated: Date.now(),
      messages: [
        { role: 'user', content: 'Help me understand this code', timestamp: new Date() },
        { role: 'assistant', content: 'This is a function that adds two numbers', timestamp: new Date() }
      ]
    });
    
    const prompt = await contextManager.buildPrompt(conversationId, 'What does this function do?');
    
    // Verify the prompt contains the expected elements
    expect(prompt).toContain('Current file: test.ts');
    expect(prompt).toContain('Selected code:');
    expect(prompt).toContain('function add(a, b) { return a + b; }');
    expect(prompt).toContain('What does this function do?');
  });

  test('buildContext should return relevant context and conversation history', async () => {
    const conversationId = 'test_conversation';
    const userPrompt = 'Help me with this code';
    
    // Mock conversation manager to return some context
    mockConversationManager.getCurrentContext.mockReturnValue([
      { role: 'user', content: 'Previous user message' },
      { role: 'assistant', content: 'Previous assistant response' }
    ]);
    
    const result = await contextManager.buildContext(conversationId, userPrompt);
    
    // Check that the context includes both history messages
    expect(result).toContain('Previous user message');
    expect(result).toContain('Previous assistant response');
    
    // Verify that getCurrentContext was called with the correct parameters
    expect(mockConversationManager.getCurrentContext).toHaveBeenCalledWith(
      expect.any(Number) // The max window size
    );
  });

  test('updateContext with a sliding window should keep only recent messages', async () => {
    const conversationId = 'test_conversation';
    const maxWindowSize = (contextManager as any).maxWindowSize;
    
    // Create a window and add multiple messages
    for (let i = 0; i < maxWindowSize + 3; i++) {
      await contextManager.updateContext(conversationId, `Message ${i}`, 1.0);
    }
    
    // Check that the window only contains the most recent messages
    const contextWindows = (contextManager as any).contextWindows;
    const window = contextWindows.get(conversationId);
    
    expect(window.messages.length).toBe(maxWindowSize);
    // The window should contain the most recent messages
    for (let i = 0; i < maxWindowSize; i++) {
      expect(window.messages[i]).toBe(`Message ${i + 3}`);
    }
  });

  test('setMaxWindowSize changes the maximum window size', () => {
    const newSize = 5;
    contextManager.setMaxWindowSize(newSize);
    expect((contextManager as any).maxWindowSize).toBe(newSize);
  });

  test('setRelevanceThreshold changes the relevance threshold', () => {
    const newThreshold = 0.75;
    contextManager.setRelevanceThreshold(newThreshold);
    expect((contextManager as any).relevanceThreshold).toBe(newThreshold);
  });

  describe('Language and Framework Preferences', () => {
    test('extractLanguagePreferences should detect language from code mentions', () => {
      const context = contextManager.createContext('test_conversation');
      
      contextManager.updateContext('test_conversation', {
        activeFile: 'test.ts',
        messageContent: 'I am working on a TypeScript project with React'
      });

      const preferences = contextManager.getPreferredLanguage();
      expect(preferences).toBe('typescript');
    });

    test('extractLanguagePreferences should detect framework from conversation', () => {
      const context = contextManager.createContext('test_conversation');
      
      contextManager.updateContext('test_conversation', {
        messageContent: 'I need help with my Laravel application'
      });

      const framework = contextManager.getPreferredFramework();
      expect(framework).toBe('laravel');
      expect(contextManager.getPreferredLanguage()).toBe('php');
    });
  });

  describe('File Management', () => {
    test('should track recently accessed directories', () => {
      contextManager.createContext('test_conversation');
      
      contextManager.updateContext('test_conversation', {
        messageContent: 'Looking at files in src/components/'
      });
      
      const recentDirs = contextManager.getRecentDirectories();
      expect(recentDirs).toContain('src/components');
    });

    test('should detect file naming patterns', () => {
      contextManager.createContext('test_conversation');
      
      contextManager.updateContext('test_conversation', {
        messageContent: 'Name the files like user.service.ts'
      });
      
      const patterns = contextManager.getFileNamingPatterns();
      expect(patterns).toContain('user.service.ts');
    });

    test('should track file extensions from active files', () => {
      contextManager.createContext('test_conversation');
      
      contextManager.updateContext('test_conversation', {
        activeFile: 'component.tsx',
        messageContent: 'Working on React components'
      });
      
      const extensions = contextManager.getRecentFileExtensions();
      expect(extensions).toContain('tsx');
    });
  });

  describe('Topic Extraction and Context Building', () => {
    test('should extract topics from conversation messages', () => {
      const messages = [
        { role: 'user', content: 'Help with TypeScript interfaces', timestamp: new Date() },
        { role: 'assistant', content: 'Here\'s how to define interfaces', timestamp: new Date() },
        { role: 'user', content: 'How to use generics?', timestamp: new Date() }
      ];

      const topics = (contextManager as any).extractTopics(messages);
      expect(topics).toContain('TypeScript interfaces');
      expect(topics).toContain('generics');
    });

    test('should build rich context string with all relevant information', async () => {
      const conversationId = 'test_conversation';
      contextManager.createContext(conversationId);
      
      // Set up various context elements
      contextManager.updateContext(conversationId, {
        activeFile: 'app.tsx',
        selectedCode: 'interface User { id: number; name: string; }',
        codeLanguage: 'typescript',
        messageContent: 'Working on user management in React'
      });

      const context = await contextManager.buildContext(conversationId, 'Help with this interface');
      
      expect(context).toContain('typescript');
      expect(context).toContain('React');
      expect(context).toContain('interface User');
      expect(context).toContain('app.tsx');
    });

    test('should prune irrelevant context based on relevance threshold', async () => {
      const conversationId = 'test_conversation';
      contextManager.setRelevanceThreshold(0.7);
      
      // Add several messages with varying relevance scores
      await contextManager.updateContext(conversationId, 'Relevant message about TypeScript', 0.8);
      await contextManager.updateContext(conversationId, 'Less relevant message about CSS', 0.5);
      await contextManager.updateContext(conversationId, 'Another relevant TypeScript message', 0.9);
      
      const context = await contextManager.buildContext(conversationId, 'Help with TypeScript');
      
      expect(context).toContain('Relevant message about TypeScript');
      expect(context).toContain('Another relevant TypeScript message');
      expect(context).not.toContain('Less relevant message about CSS');
    });
  });
});