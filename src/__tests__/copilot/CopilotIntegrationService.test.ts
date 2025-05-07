import * as vscode from 'vscode';
import { CopilotApiRequest, CopilotIntegrationService } from '../../copilot/copilotIntegrationService';

jest.mock('vscode');

describe('CopilotIntegrationService', () => {
    let copilotService: CopilotIntegrationService;
    let mockContext: vscode.ExtensionContext;
    let mockExtension: vscode.Extension<any>;

    beforeEach(() => {
        // Reset all mocks
        jest.resetAllMocks();

        // Mock extension context
        mockContext = {
            subscriptions: [],
        } as unknown as vscode.ExtensionContext;

        // Mock Copilot extension
        mockExtension = {
            isActive: true,
            activate: jest.fn().mockResolvedValue(undefined),
            exports: {
                provideSuggestion: jest.fn()
            }
        } as unknown as vscode.Extension<any>;

        // Mock vscode.extensions.getExtension
        (vscode.extensions.getExtension as jest.Mock).mockReturnValue(mockExtension);

        // Mock vscode.window functions
        (vscode.window.showInformationMessage as jest.Mock).mockResolvedValue(undefined);
        (vscode.window.showWarningMessage as jest.Mock).mockResolvedValue(undefined);
        (vscode.window.showErrorMessage as jest.Mock).mockResolvedValue(undefined);

        // Create service instance
        copilotService = new CopilotIntegrationService(mockContext);
    });

    describe('constructor and initialization', () => {
        it('should initialize and connect to Copilot', async () => {
            // The constructor calls initialize internally
            expect(vscode.extensions.getExtension).toHaveBeenCalledWith('GitHub.copilot');
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Successfully connected to GitHub Copilot.');
        });

        it('should show a warning if Copilot extension is not installed', async () => {
            // Mock extension not found
            (vscode.extensions.getExtension as jest.Mock).mockReturnValueOnce(undefined);

            // Create new instance
            const service = new CopilotIntegrationService(mockContext);

            expect(vscode.window.showWarningMessage).toHaveBeenCalledWith('GitHub Copilot extension is not installed or not enabled.');
        });

        it('should activate the extension if it is not active', async () => {
            // Mock extension not active
            const inactiveExtension = {
                ...mockExtension,
                isActive: false
            };
            (vscode.extensions.getExtension as jest.Mock).mockReturnValueOnce(inactiveExtension);

            // Create new instance
            const service = new CopilotIntegrationService(mockContext);

            // Should attempt to activate
            expect(inactiveExtension.activate).toHaveBeenCalled();
        });

        it('should handle initialization errors gracefully', async () => {
            // Mock extension activation failure
            const errorExtension = {
                ...mockExtension,
                isActive: false,
                activate: jest.fn().mockRejectedValue(new Error('Activation error'))
            };
            (vscode.extensions.getExtension as jest.Mock).mockReturnValueOnce(errorExtension);

            // Create new instance
            const service = new CopilotIntegrationService(mockContext);

            // Should show error message
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(expect.stringContaining('Failed to initialize Copilot integration'));
        });
    });

    describe('isAvailable', () => {
        it('should return true when initialized and extension is active', () => {
            expect(copilotService.isAvailable()).toBe(true);
        });

        it('should return false when extension is not active', () => {
            // Access private property for testing
            (copilotService as any).copilotExtension = { isActive: false };
            expect(copilotService.isAvailable()).toBe(false);
        });

        it('should return false when not initialized', () => {
            // Access private property for testing
            (copilotService as any).isInitialized = false;
            expect(copilotService.isAvailable()).toBe(false);
        });
    });

    describe('sendPrompt', () => {
        it('should send a prompt to Copilot and return the response', async () => {
            // Mock Copilot API response
            const mockResponse = {
                suggestion: 'Test completion',
                model: 'gpt-4',
                finishReason: 'complete'
            };
            mockExtension.exports.provideSuggestion.mockResolvedValueOnce(mockResponse);

            // Test request
            const request: CopilotApiRequest = {
                prompt: 'Test prompt',
                context: 'Test context',
                options: {
                    temperature: 0.5,
                    maxTokens: 500
                }
            };

            // Execute and validate
            const response = await copilotService.sendPrompt(request);

            // Check API was called with correct parameters
            expect(mockExtension.exports.provideSuggestion).toHaveBeenCalledWith({
                prompt: 'Test prompt',
                context: 'Test context',
                options: {
                    temperature: 0.5,
                    maxTokens: 500,
                    stopSequences: [],
                    model: 'default'
                }
            });

            // Check response was formatted correctly
            expect(response).toEqual({
                completion: 'Test completion',
                model: 'gpt-4',
                finishReason: 'complete'
            });
        });

        it('should use default values for missing options', async () => {
            // Mock Copilot API response
            mockExtension.exports.provideSuggestion.mockResolvedValueOnce({
                suggestion: 'Test completion'
            });

            // Test request with minimal fields
            const request: CopilotApiRequest = {
                prompt: 'Test prompt'
            };

            // Execute
            await copilotService.sendPrompt(request);

            // Check API was called with default parameters
            expect(mockExtension.exports.provideSuggestion).toHaveBeenCalledWith({
                prompt: 'Test prompt',
                context: '',
                options: {
                    temperature: 0.7,
                    maxTokens: 800,
                    stopSequences: [],
                    model: 'default'
                }
            });
        });

        it('should try to initialize if not available', async () => {
            // Make service unavailable
            (copilotService as any).isInitialized = false;

            // Setup to become available after initialization
            (vscode.extensions.getExtension as jest.Mock).mockReturnValue(mockExtension);

            // Mock response
            mockExtension.exports.provideSuggestion.mockResolvedValueOnce({
                suggestion: 'Test completion'
            });

            // Test request
            const request: CopilotApiRequest = {
                prompt: 'Test prompt'
            };

            // Execute
            await copilotService.sendPrompt(request);

            // Should have tried to initialize
            expect(vscode.extensions.getExtension).toHaveBeenCalledWith('GitHub.copilot');
        });

        it('should throw an error if initialization fails', async () => {
            // Make service unavailable
            (copilotService as any).isInitialized = false;

            // Setup to remain unavailable after initialization
            (vscode.extensions.getExtension as jest.Mock).mockReturnValue(undefined);

            // Test request
            const request: CopilotApiRequest = {
                prompt: 'Test prompt'
            };

            // Execute and expect error
            await expect(copilotService.sendPrompt(request)).rejects.toThrow('GitHub Copilot is not available');
        });

        it('should handle API errors properly', async () => {
            // Mock API error
            mockExtension.exports.provideSuggestion.mockRejectedValueOnce(new Error('API error'));

            // Test request
            const request: CopilotApiRequest = {
                prompt: 'Test prompt'
            };

            // Execute and expect error
            await expect(copilotService.sendPrompt(request)).rejects.toThrow('Failed to get response from Copilot');
        });
    });

    describe('sendToCopilotChat', () => {
        it('should send a message to Copilot Chat', async () => {
            // Mock command execution
            (vscode.commands.executeCommand as jest.Mock).mockResolvedValueOnce(undefined);

            // Send message
            await copilotService.sendToCopilotChat('Hello Copilot');

            // Verify command was executed
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'github.copilot.chat.sendToCopilotChat',
                'Hello Copilot'
            );
        });

        it('should throw an error if Copilot is not available', async () => {
            // Make service unavailable
            (copilotService as any).isInitialized = false;

            // Send message and expect error
            await expect(copilotService.sendToCopilotChat('Hello')).rejects.toThrow('GitHub Copilot is not available');
        });

        it('should handle errors in command execution', async () => {
            // Mock command error
            (vscode.commands.executeCommand as jest.Mock).mockRejectedValueOnce(new Error('Command error'));

            // Send message and expect error
            await expect(copilotService.sendToCopilotChat('Hello')).rejects.toThrow('Failed to send message to Copilot Chat');
        });
    });

    describe('registerChatResponseCallback', () => {
        it('should register a callback for chat responses', () => {
            // Mock onDidChangeConfiguration
            const mockDisposable = {
                dispose: jest.fn()
            };
            (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockReturnValueOnce(mockDisposable);

            // Test callback
            const callback = jest.fn();

            // Register callback
            const disposable = copilotService.registerChatResponseCallback(callback);

            // Verify subscription was created
            expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();

            // Verify disposable was added to subscriptions
            expect(mockContext.subscriptions).toContain(mockDisposable);

            // Verify disposable was returned
            expect(disposable).toBe(mockDisposable);
        });

        it('should call the callback when a response is received', () => {
            // Mock onDidChangeConfiguration
            let configCallback: (event: any) => void;
            (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementationOnce((callback) => {
                configCallback = callback;
                return { dispose: jest.fn() };
            });

            // Mock configuration access
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValueOnce({
                get: jest.fn().mockReturnValue('Test response')
            });

            // Test callback
            const callback = jest.fn();

            // Register callback
            copilotService.registerChatResponseCallback(callback);

            // Simulate configuration change event
            configCallback({ affectsConfiguration: jest.fn().mockReturnValue(true) });

            // Verify callback was called with response
            expect(callback).toHaveBeenCalledWith('Test response');
        });

        it('should not call the callback if there is no response', () => {
            // Mock onDidChangeConfiguration
            let configCallback: (event: any) => void;
            (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementationOnce((callback) => {
                configCallback = callback;
                return { dispose: jest.fn() };
            });

            // Mock configuration access
            (vscode.workspace.getConfiguration as jest.Mock).mockReturnValueOnce({
                get: jest.fn().mockReturnValue(null)
            });

            // Test callback
            const callback = jest.fn();

            // Register callback
            copilotService.registerChatResponseCallback(callback);

            // Simulate configuration change event
            configCallback({ affectsConfiguration: jest.fn().mockReturnValue(true) });

            // Verify callback was not called
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
