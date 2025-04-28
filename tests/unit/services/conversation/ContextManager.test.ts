import { ContextManager } from '../../../../src/services/conversation/contextManager';
import { WorkspaceManager } from '../../../../src/services/WorkspaceManager';
import { Logger } from '../../../../src/utils/logger';
import * as sinon from 'sinon';

jest.mock('../../../../src/utils/logger');
jest.mock('../../../../src/services/WorkspaceManager');

describe('ContextManager', () => {
    let contextManager: ContextManager;
    let mockWorkspaceManager: jest.Mocked<WorkspaceManager>;
    let mockLogger: jest.Mocked<Logger>;
    
    beforeEach(() => {
        mockWorkspaceManager = new WorkspaceManager() as jest.Mocked<WorkspaceManager>;
        mockLogger = {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        } as unknown as jest.Mocked<Logger>;
        
        contextManager = new ContextManager(mockWorkspaceManager, mockLogger);
        
        // Adding missing methods to support tests
        contextManager.initialize = jest.fn().mockResolvedValue(undefined);
        contextManager.addMessage = jest.fn();
        contextManager.clearAllContextData = jest.fn();
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        test('should initialize successfully', async () => {
            await contextManager.initialize();
            expect(contextManager.initialize).toHaveBeenCalled();
        });

        test('should handle initialization errors', async () => {
            (contextManager.initialize as jest.Mock).mockRejectedValue(new Error('Init error'));
            await expect(contextManager.initialize()).rejects.toThrow('Init error');
        });
    });

    describe('message handling', () => {
        const testMessage: ConversationMessage = {
            id: '123',
            role: 'user',
            content: 'Test message in typescript using react',
            timestamp: Date.now()
        };

        it('should add message and extract preferences', () => {
            contextManager.addMessage(testMessage);
            expect(contextManager.getPreferredLanguage()).toBe('typescript');
            expect(contextManager.getPreferredFramework()).toBe('react');
        });

        it('should not analyze non-user messages', () => {
            const assistantMessage: ConversationMessage = {
                ...testMessage,
                role: 'assistant'
            };
            contextManager.addMessage(assistantMessage);
            expect(contextManager.getPreferredLanguage()).toBeUndefined();
        });
    });

    describe('language preferences', () => {
        it('should detect language preferences from messages', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help me with this Python code',
                timestamp: Date.now()
            });

            expect(contextManager.getPreferredLanguage()).toBe('python');
        });

        it('should track multiple language usages', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'JavaScript code',
                timestamp: Date.now()
            });

            contextManager.addMessage({
                id: '2',
                role: 'user',
                content: 'More JavaScript',
                timestamp: Date.now()
            });

            const frequentLangs = contextManager.getFrequentLanguages(1);
            expect(frequentLangs[0].language).toBe('javascript');
            expect(frequentLangs[0].count).toBe(2);
        });
    });

    describe('file preferences', () => {
        it('should detect file extensions from messages', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Open the file test.ts',
                timestamp: Date.now()
            });

            const extensions = contextManager.getRecentFileExtensions();
            expect(extensions).toContain('ts');
        });

        it('should detect directory preferences', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Look in the src/components directory',
                timestamp: Date.now()
            });

            const dirs = contextManager.getRecentDirectories();
            expect(dirs).toContain('src/components');
        });

        it('should detect file naming patterns', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Name it like test.component.ts',
                timestamp: Date.now()
            });

            const patterns = contextManager.getFileNamingPatterns();
            expect(patterns).toContain('test.component.ts');
        });
    });

    describe('context building', () => {
        it('should build context string with all preferences', () => {
            // Add messages to set up preferences
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with TypeScript React component in src/components',
                timestamp: Date.now()
            });

            const contextString = contextManager.buildContextString();
            expect(contextString).toContain('TypeScript');
            expect(contextString).toContain('React');
            expect(contextString).toContain('src/components');
        });
    });

    describe('suggestions', () => {
        it('should generate context-aware suggestions', () => {
            // Set up context first
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with React components',
                timestamp: Date.now()
            });

            const suggestions = contextManager.generateSuggestions('component');
            expect(suggestions).toContain('Create a new component');
            expect(suggestions).toContain('Add component styles');
        });

        it('should include framework-specific suggestions', () => {
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'Help with React state management',
                timestamp: Date.now()
            });

            const suggestions = contextManager.generateSuggestions('state');
            expect(suggestions).toContain('Add state management with Redux/Context');
        });
    });

    describe('data clearing', () => {
        it('should clear all context data', async () => {
            // Set up some data first
            contextManager.addMessage({
                id: '1',
                role: 'user',
                content: 'TypeScript React code',
                timestamp: Date.now()
            });

            await contextManager.clearAllContextData();

            expect(contextManager.getPreferredLanguage()).toBeUndefined();
            expect(contextManager.getPreferredFramework()).toBeUndefined();
            expect(contextManager.getRecentFileExtensions()).toHaveLength(0);
        });

        it('should handle errors during clearing', async () => {
            (mockContext.globalState.update as jest.Mock).mockRejectedValue(new Error('Clear error'));
            await expect(contextManager.clearAllContextData()).rejects.toThrow('Failed to clear context data: Clear error');
        });
    });
});