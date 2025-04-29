import * as vscode from 'vscode';
import { ContextManager } from '../../../../src/services/conversation/ContextManager';
import { ConversationMemoryService } from '../../../../src/services/conversation/services/ConversationMemoryService';
import { UserPreferencesService } from '../../../../src/services/conversation/services/UserPreferencesService';
import { FilePreferencesService } from '../../../../src/services/conversation/services/FilePreferencesService';
import { ContextAnalysisService } from '../../../../src/services/conversation/services/ContextAnalysisService';
import { Message, MessageType } from '../../../../src/services/conversation/models';

jest.mock('../../../../src/services/conversation/services/ConversationMemoryService');
jest.mock('../../../../src/services/conversation/services/UserPreferencesService');
jest.mock('../../../../src/services/conversation/services/FilePreferencesService');
jest.mock('../../../../src/services/conversation/services/ContextAnalysisService');

describe('ContextManager', () => {
    let contextManager: ContextManager;
    let mockExtensionContext: vscode.ExtensionContext;
    let mockConversationService: jest.Mocked<ConversationMemoryService>;
    let mockUserPreferencesService: jest.Mocked<UserPreferencesService>;
    let mockFilePreferencesService: jest.Mocked<FilePreferencesService>;
    let mockAnalysisService: jest.Mocked<ContextAnalysisService>;

    beforeEach(() => {
        // Reset singleton instance
        (ContextManager as any).instance = undefined;

        // Create mock extension context
        mockExtensionContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            storageUri: { fsPath: '/test/storage' } as any,
            globalState: {
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                keys: jest.fn().mockReturnValue([])
            } as any,
            workspaceState: {
                get: jest.fn(),
                update: jest.fn().mockResolvedValue(undefined),
                keys: jest.fn().mockReturnValue([])
            } as any,
            globalStorageUri: { fsPath: '/test/global-storage' } as any,
            logUri: { fsPath: '/test/logs' } as any,
            extensionUri: { fsPath: '/test/extension' } as any,
            asAbsolutePath: jest.fn(path => path)
        } as vscode.ExtensionContext;

        // Create mock services
        mockConversationService = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addMessage: jest.fn(),
            clearMessages: jest.fn().mockResolvedValue(undefined)
        } as any;

        mockUserPreferencesService = {
            initialize: jest.fn().mockResolvedValue(undefined),
            clearPreferences: jest.fn().mockResolvedValue(undefined)
        } as any;

        mockFilePreferencesService = {
            initialize: jest.fn().mockResolvedValue(undefined),
            clearPreferences: jest.fn().mockResolvedValue(undefined)
        } as any;

        mockAnalysisService = {
            analyzeMessage: jest.fn()
        } as any;

        // Set up mocked constructors
        (ConversationMemoryService as jest.Mock).mockImplementation(() => mockConversationService);
        (UserPreferencesService as jest.Mock).mockImplementation(() => mockUserPreferencesService);
        (FilePreferencesService as jest.Mock).mockImplementation(() => mockFilePreferencesService);
        (ContextAnalysisService as jest.Mock).mockImplementation(() => mockAnalysisService);

        contextManager = ContextManager.getInstance(mockExtensionContext);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Singleton Pattern', () => {
        it('should maintain a single instance', () => {
            const instance1 = ContextManager.getInstance(mockExtensionContext);
            const instance2 = ContextManager.getInstance(mockExtensionContext);
            expect(instance1).toBe(instance2);
        });
    });

    describe('Initialization', () => {
        it('should initialize all services successfully', async () => {
            await contextManager.initialize();

            expect(mockConversationService.initialize).toHaveBeenCalled();
            expect(mockUserPreferencesService.initialize).toHaveBeenCalled();
            expect(mockFilePreferencesService.initialize).toHaveBeenCalled();
        });

        it('should handle initialization errors', async () => {
            const error = new Error('Init failed');
            mockConversationService.initialize.mockRejectedValue(error);

            await expect(contextManager.initialize()).rejects.toThrow('Failed to initialize context manager: Init failed');
        });
    });

    describe('Message Handling', () => {
        it('should process user messages and extract preferences', () => {
            const message: Message = {
                type: MessageType.User,
                content: 'Help with TypeScript React component',
                timestamp: Date.now()
            };

            contextManager.addMessage(message);

            expect(mockConversationService.addMessage).toHaveBeenCalledWith(message);
            expect(mockAnalysisService.analyzeMessage).toHaveBeenCalledWith(
                message.content,
                mockUserPreferencesService,
                mockFilePreferencesService
            );

            expect(contextManager.getPreferredLanguage()).toBe('typescript');
            expect(contextManager.getPreferredFramework()).toBe('react');
        });

        it('should not analyze non-user messages', () => {
            const message: Message = {
                type: MessageType.Assistant,
                content: 'Here is help with TypeScript',
                timestamp: Date.now()
            };

            contextManager.addMessage(message);

            expect(mockConversationService.addMessage).toHaveBeenCalledWith(message);
            expect(mockAnalysisService.analyzeMessage).not.toHaveBeenCalled();
        });
    });

    describe('Context Building', () => {
        it('should build context string with all preferences', () => {
            const userMessage: Message = {
                type: MessageType.User,
                content: 'Help with TypeScript React component in src/components',
                timestamp: Date.now()
            };

            contextManager.addMessage(userMessage);

            const contextString = contextManager.buildContextString();
            expect(contextString).toContain('Preferred Language: Typescript');
            expect(contextString).toContain('Framework: React');
            expect(contextString).toContain('Project Directories: src, components');
        });
    });

    describe('Preference Management', () => {
        it('should extract and store file preferences', () => {
            const message: Message = {
                type: MessageType.User,
                content: 'Looking at files in src/components/UserService.ts and utils/helpers.js',
                timestamp: Date.now()
            };

            contextManager.addMessage(message);

            const extensions = contextManager.getRecentFileExtensions();
            expect(extensions).toContain('ts');
            expect(extensions).toContain('js');

            const directories = contextManager.getRecentDirectories();
            expect(directories).toContain('src');
            expect(directories).toContain('components');
            expect(directories).toContain('utils');

            const patterns = contextManager.getFileNamingPatterns();
            expect(patterns).toContain('service');
        });
    });

    describe('Context Clearing', () => {
        it('should clear all context data', async () => {
            const message: Message = {
                type: MessageType.User,
                content: 'TypeScript React code',
                timestamp: Date.now()
            };

            contextManager.addMessage(message);
            await contextManager.clearContext();

            expect(contextManager.getPreferredLanguage()).toBeUndefined();
            expect(contextManager.getPreferredFramework()).toBeUndefined();
            expect(contextManager.getRecentFileExtensions()).toHaveLength(0);
            expect(mockConversationService.clearMessages).toHaveBeenCalled();
            expect(mockUserPreferencesService.clearPreferences).toHaveBeenCalled();
            expect(mockFilePreferencesService.clearPreferences).toHaveBeenCalled();
        });
    });

    describe('Resource Management', () => {
        it('should dispose of all resources', () => {
            const disposableMock = { dispose: jest.fn() };
            (contextManager as any).disposables = [disposableMock, disposableMock];

            contextManager.dispose();

            expect(disposableMock.dispose).toHaveBeenCalledTimes(2);
            expect((contextManager as any).disposables).toHaveLength(0);
        });
    });
});