import * as vscode from 'vscode';
import { CoreAgent } from '../../../src/services/coreAgent';
import { WorkspaceManager } from '../../../src/services/WorkspaceManager';
import { createMockExtensionContext } from '../../helpers/mockHelpers';
import { ContextManager } from '../../../src/services/conversation/contextManager';
import { Logger } from '../../../src/utils/logger';

jest.mock('../../../src/services/WorkspaceManager');
jest.mock('../../../src/services/conversation/contextManager');
jest.mock('../../../src/utils/logger');

describe('CoreAgent', () => {
    let coreAgent: CoreAgent;
    let mockWorkspaceManager: jest.Mocked<WorkspaceManager>;
    let mockContextManager: jest.Mocked<ContextManager>;
    let mockLogger: jest.Mocked<Logger>;
    let mockContext: vscode.ExtensionContext;

    beforeEach(() => {
        mockContext = createMockExtensionContext();
        
        // Cast the mock to the correct type
        mockWorkspaceManager = {
            readFile: jest.fn(),
            writeFile: jest.fn(),
            deleteFile: jest.fn(),
            listFiles: jest.fn(),
            onFileChanged: jest.fn(),
            getInstance: jest.fn(),
            dispose: jest.fn()
        } as unknown as jest.Mocked<WorkspaceManager>;

        mockContextManager = {
            addMessage: jest.fn(),
            getRecentHistory: jest.fn(),
            clearContext: jest.fn(),
            dispose: jest.fn()
        } as unknown as jest.Mocked<ContextManager>;

        mockLogger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        } as unknown as jest.Mocked<Logger>;

        (WorkspaceManager as jest.MockedClass<typeof WorkspaceManager>).getInstance.mockReturnValue(mockWorkspaceManager);
        
        coreAgent = new CoreAgent(mockContextManager, mockLogger);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('processInput', () => {
        test('should process input and return response with context', async () => {
            const input = 'What is TypeScript?';
            const mockResponse = { 
                text: 'TypeScript is a typed superset of JavaScript.',
                context: { relevantFiles: ['file1.ts'] }
            };

            mockContextManager.addMessage.mockResolvedValue(mockResponse);

            const response = await coreAgent.processInput(input);

            expect(response).toEqual(mockResponse);
            expect(mockContextManager.addMessage).toHaveBeenCalledWith(input, 'user');
            expect(mockLogger.info).toHaveBeenCalled();
        });

        test('should handle errors during processing', async () => {
            const input = 'Invalid command';
            const error = new Error('Processing failed');
            mockContextManager.addMessage.mockRejectedValue(error);

            await expect(coreAgent.processInput(input)).rejects.toThrow('Processing failed');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('getSuggestions', () => {
        test('should return suggestions based on current input', async () => {
            const input = 'test';
            const mockSuggestions = ['suggestion1', 'suggestion2'];
            mockContextManager.getRecentHistory.mockResolvedValue(mockSuggestions);

            const suggestions = await coreAgent.getSuggestions(input);

            expect(suggestions).toEqual(mockSuggestions);
            expect(mockContextManager.getRecentHistory).toHaveBeenCalledWith(input);
        });

        test('should return empty array on error', async () => {
            const input = 'test';
            mockContextManager.getRecentHistory.mockRejectedValue(new Error('Failed to get suggestions'));

            const suggestions = await coreAgent.getSuggestions(input);

            expect(suggestions).toEqual([]);
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('clearContext', () => {
        test('should clear all context data', async () => {
            mockContextManager.clearContext.mockResolvedValue(undefined);
            
            await coreAgent.clearContext();
            
            expect(mockContextManager.clearContext).toHaveBeenCalled();
        });

        test('should handle errors during context clearing', async () => {
            const error = new Error('Clear failed');
            mockContextManager.clearContext.mockRejectedValue(error);
            
            await expect(coreAgent.clearContext()).rejects.toThrow('Clear failed');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('dispose', () => {
        test('should dispose all resources', () => {
            coreAgent.dispose();
            expect(mockContextManager.dispose).toHaveBeenCalled();
        });
    });
});