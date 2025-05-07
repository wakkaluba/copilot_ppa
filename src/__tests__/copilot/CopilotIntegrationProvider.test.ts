// filepath: d:\___coding\tools\copilot_ppa\src\__tests__\copilot\CopilotIntegrationProvider.test.ts
import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from '../../../copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../../../copilot/copilotIntegrationService';
import { MultilingualPromptManager } from '../../../llm/multilingualPromptManager';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../../copilot/copilotIntegrationService');
jest.mock('../../../llm/multilingualPromptManager');

describe('CopilotIntegrationProvider Tests', () => {
    // Mock instances
    let mockContext: vscode.ExtensionContext;
    let mockCopilotService: jest.Mocked<CopilotIntegrationService>;
    let mockPromptManager: jest.Mocked<MultilingualPromptManager>;
    let mockDisposable: vscode.Disposable;

    // Provider instance
    let provider: CopilotIntegrationProvider;

    // Reset mocks before each test
    beforeEach(() => {
        // Clear all mocks
        jest.clearAllMocks();

        // Mock context
        mockContext = {
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        // Mock disposable
        mockDisposable = { dispose: jest.fn() } as unknown as vscode.Disposable;

        // Mock vscode commands
        (vscode.commands.registerCommand as jest.Mock).mockReturnValue(mockDisposable);

        // Mock CopilotIntegrationService
        mockCopilotService = {
            sendPrompt: jest.fn(),
            sendToCopilotChat: jest.fn(),
            registerChatResponseCallback: jest.fn().mockReturnValue(mockDisposable)
        } as unknown as jest.Mocked<CopilotIntegrationService>;
        (CopilotIntegrationService as jest.Mock).mockImplementation(() => mockCopilotService);

        // Mock MultilingualPromptManager
        mockPromptManager = {
            enhancePromptWithLanguage: jest.fn().mockImplementation((text) => `Enhanced: ${text}`)
        } as unknown as jest.Mocked<MultilingualPromptManager>;
        (MultilingualPromptManager as jest.Mock).mockImplementation(() => mockPromptManager);

        // Create provider instance
        provider = new CopilotIntegrationProvider(mockContext);
    });

    describe('Constructor and Command Registration', () => {
        test('should register commands on instantiation', () => {
            // Verify command registrations
            expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(3);
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.forwardToCopilot',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.sendToCopilotChat',
                expect.any(Function)
            );
            expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
                'copilot-ppa.getCompletionFromCopilot',
                expect.any(Function)
            );
        });
    });

    describe('forwardToCopilot', () => {
        test('should enhance prompt and send to Copilot service', async () => {
            // Setup test data
            const testText = 'Test prompt';
            const mockResponse = { completion: 'Test completion' };

            // Setup mock returns
            mockCopilotService.sendPrompt.mockResolvedValue(mockResponse);

            // Call method
            const result = await provider.forwardToCopilot(testText);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testText);
            expect(mockCopilotService.sendPrompt).toHaveBeenCalledWith({
                prompt: 'Enhanced: Test prompt',
                options: {
                    temperature: 0.7,
                    maxTokens: 800
                }
            });
            expect(result).toBe(mockResponse);
        });

        test('should handle error and show error message', async () => {
            // Setup test data
            const testText = 'Test prompt';
            const mockError = new Error('Test error');

            // Setup mock throws
            mockCopilotService.sendPrompt.mockRejectedValue(mockError);

            // Call method
            const result = await provider.forwardToCopilot(testText);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testText);
            expect(mockCopilotService.sendPrompt).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(`Error forwarding to Copilot: ${mockError}`);
            expect(result).toBeNull();
        });
    });

    describe('sendToCopilotChat', () => {
        test('should enhance prompt and send to Copilot chat', async () => {
            // Setup test data
            const testText = 'Test chat message';

            // Setup mock returns
            mockCopilotService.sendToCopilotChat.mockResolvedValue(undefined);

            // Call method
            await provider.sendToCopilotChat(testText);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testText);
            expect(mockCopilotService.sendToCopilotChat).toHaveBeenCalledWith('Enhanced: Test chat message');
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Message sent to Copilot Chat');
        });

        test('should handle error and show error message', async () => {
            // Setup test data
            const testText = 'Test chat message';
            const mockError = new Error('Test error');

            // Setup mock throws
            mockCopilotService.sendToCopilotChat.mockRejectedValue(mockError);

            // Call method
            await provider.sendToCopilotChat(testText);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testText);
            expect(mockCopilotService.sendToCopilotChat).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(`Error sending to Copilot Chat: ${mockError}`);
        });
    });

    describe('getCompletionFromCopilot', () => {
        test('should enhance prompt and get completion from Copilot', async () => {
            // Setup test data
            const testPrompt = 'Test completion prompt';
            const mockResponse = { completion: 'Test completion result' };

            // Setup mock returns
            mockCopilotService.sendPrompt.mockResolvedValue(mockResponse);

            // Call method
            const result = await provider.getCompletionFromCopilot(testPrompt);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testPrompt);
            expect(mockCopilotService.sendPrompt).toHaveBeenCalledWith({
                prompt: 'Enhanced: Test completion prompt',
                options: {
                    temperature: 0.2,
                    maxTokens: 500
                }
            });
            expect(result).toBe(mockResponse.completion);
        });

        test('should return null if no completion in response', async () => {
            // Setup test data
            const testPrompt = 'Test completion prompt';
            const mockResponse = { /* No completion property */ };

            // Setup mock returns
            mockCopilotService.sendPrompt.mockResolvedValue(mockResponse);

            // Call method
            const result = await provider.getCompletionFromCopilot(testPrompt);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testPrompt);
            expect(mockCopilotService.sendPrompt).toHaveBeenCalled();
            expect(result).toBeNull();
        });

        test('should handle error and show error message', async () => {
            // Setup test data
            const testPrompt = 'Test completion prompt';
            const mockError = new Error('Test error');

            // Setup mock throws
            mockCopilotService.sendPrompt.mockRejectedValue(mockError);

            // Call method
            const result = await provider.getCompletionFromCopilot(testPrompt);

            // Verify calls
            expect(mockPromptManager.enhancePromptWithLanguage).toHaveBeenCalledWith(testPrompt);
            expect(mockCopilotService.sendPrompt).toHaveBeenCalled();
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(`Error getting completion from Copilot: ${mockError}`);
            expect(result).toBeNull();
        });
    });

    describe('registerChatResponseCallback', () => {
        test('should register callback with Copilot service', () => {
            // Setup test data
            const mockCallback = jest.fn();

            // Call method
            const result = provider.registerChatResponseCallback(mockCallback);

            // Verify calls
            expect(mockCopilotService.registerChatResponseCallback).toHaveBeenCalledWith(mockCallback);
            expect(result).toBe(mockDisposable);
        });
    });

    describe('dispose', () => {
        test('should dispose all registered disposables', () => {
            // Call method
            provider.dispose();

            // Access the private disposables array using any
            const disposables = (provider as any).disposables;

            // Verify each disposable's dispose method was called
            for (const disposable of disposables) {
                expect(disposable.dispose).toHaveBeenCalled();
            }
        });
    });
});
