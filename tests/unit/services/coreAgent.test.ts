import * as vscode from 'vscode';
import { CoreAgent } from '../../../src/services/coreAgent';
import { ContextManager } from '../../../src/services/conversation/ContextManager';
import { ConversationMemory } from '../../../src/services/conversation/ConversationMemory';
import { UserPreferences } from '../../../src/services/conversation/UserPreferences';
import { FilePreferences } from '../../../src/services/conversation/FilePreferences';

jest.mock('vscode');
jest.mock('../../../src/services/conversation/ContextManager');
jest.mock('../../../src/services/conversation/ConversationMemory');
jest.mock('../../../src/services/conversation/UserPreferences');
jest.mock('../../../src/services/conversation/FilePreferences');

describe('CoreAgent', () => {
    let mockContext: vscode.ExtensionContext;
    let mockContextManager: jest.Mocked<ContextManager>;
    let agent: CoreAgent;

    beforeEach(() => {
        // Mock VS Code extension context
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
            },
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
            },
        } as unknown as vscode.ExtensionContext;

        // Mock ContextManager
        mockContextManager = {
            initialize: jest.fn().mockResolvedValue(undefined),
            addMessage: jest.fn(),
            getConversationHistory: jest.fn().mockReturnValue([]),
            getPreferredLanguage: jest.fn().mockReturnValue('typescript'),
            getFrequentLanguages: jest.fn().mockReturnValue([]),
            getPreferredFramework: jest.fn().mockReturnValue('react'),
            getRecentFileExtensions: jest.fn().mockReturnValue([]),
            getRecentDirectories: jest.fn().mockReturnValue([]),
            getFileNamingPatterns: jest.fn().mockReturnValue([]),
            buildContextString: jest.fn().mockReturnValue('Context string'),
            generateSuggestions: jest.fn().mockReturnValue([]),
            clearAllContextData: jest.fn().mockResolvedValue(undefined),
            dispose: jest.fn(),
        } as unknown as jest.Mocked<ContextManager>;

        // Create the agent with mocked dependencies
        agent = new CoreAgent(mockContext, mockContextManager);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processInput', () => {
        it('should process input and return response with context', async () => {
            const input = 'Test input';
            const expectedResponse = 'Test response';

            // Mock agent's internal processing
            mockContextManager.buildContextString.mockReturnValue('Test context');

            const response = await agent.processInput(input);

            expect(response).toEqual({
                response: expectedResponse,
                context: 'Test context'
            });

            expect(mockContextManager.addMessage).toHaveBeenCalledWith({
                id: expect.any(String),
                role: 'user',
                content: input,
                timestamp: expect.any(Number)
            });

            expect(mockContextManager.buildContextString).toHaveBeenCalled();
        });

        it('should handle errors during processing', async () => {
            const input = 'Test input';
            const error = new Error('Test error');
            mockContextManager.buildContextString.mockRejectedValue(error);

            await expect(agent.processInput(input)).rejects.toThrow('Failed to process input: Test error');
        });
    });

    describe('getSuggestions', () => {
        it('should return suggestions based on current input', () => {
            const input = 'test';
            const expectedSuggestions = ['Suggestion 1', 'Suggestion 2'];
            mockContextManager.generateSuggestions.mockReturnValue(expectedSuggestions);

            const suggestions = agent.getSuggestions(input);

            expect(suggestions).toEqual(expectedSuggestions);
            expect(mockContextManager.generateSuggestions).toHaveBeenCalledWith(input);
        });
    });

    describe('clearContext', () => {
        it('should clear all context data', async () => {
            await agent.clearContext();
            expect(mockContextManager.clearAllContextData).toHaveBeenCalled();
        });

        it('should handle errors during context clearing', async () => {
            mockContextManager.clearAllContextData.mockRejectedValue(new Error('Test error'));
            await expect(agent.clearContext()).rejects.toThrow('Failed to clear context: Test error');
        });
    });

    describe('dispose', () => {
        it('should dispose all resources', () => {
            agent.dispose();
            expect(mockContextManager.dispose).toHaveBeenCalled();
        });
    });
});