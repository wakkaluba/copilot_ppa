import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { EnhancedChatProvider } from '../enhancedChatProvider';

// Create mocks for VS Code APIs
jest.mock('vscode', () => ({
    WebviewView: jest.fn(),
    window: {
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn(),
        showTextDocument: jest.fn().mockResolvedValue({
            insertSnippet: jest.fn().mockResolvedValue(undefined)
        })
    },
    env: {
        clipboard: {
            writeText: jest.fn().mockResolvedValue(undefined)
        }
    },
    workspace: {
        openTextDocument: jest.fn().mockResolvedValue({})
    },
    SnippetString: jest.fn().mockImplementation((text) => text)
}));

jest.mock('uuid');
(uuidv4 as jest.Mock).mockReturnValue('mock-uuid');

describe('EnhancedChatProvider', () => {
    let provider: EnhancedChatProvider;
    let mockContext: any;
    let mockContextManager: any;
    let mockLLMProvider: any;
    let mockWebviewView: any;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create mock context
        mockContext = {
            subscriptions: []
        };

        // Create mock context manager
        mockContextManager = {
            appendMessage: jest.fn(),
            listMessages: jest.fn().mockReturnValue([]),
            getContextString: jest.fn().mockReturnValue('mock context'),
            getCurrentConversationId: jest.fn().mockReturnValue('conversation-id'),
            clear: jest.fn().mockResolvedValue(undefined)
        };

        // Create mock LLM provider
        mockLLMProvider = {
            connect: jest.fn().mockResolvedValue(undefined),
            isConnected: jest.fn().mockReturnValue(true),
            generateResponse: jest.fn().mockImplementation((content, options, callback) => {
                callback('mock response');
                return Promise.resolve();
            })
        };

        // Create mock webview
        mockWebviewView = {
            webview: {
                onDidReceiveMessage: jest.fn().mockImplementation(callback => {
                    (mockWebviewView as any).messageCallback = callback;
                    return { dispose: jest.fn() };
                }),
                postMessage: jest.fn().mockResolvedValue(true)
            }
        };

        // Create instance of EnhancedChatProvider
        provider = new EnhancedChatProvider(mockContext, mockContextManager, mockLLMProvider);
    });

    describe('Constructor and Initialization', () => {
        it('should create instance with provided dependencies', () => {
            expect(provider).toBeDefined();
        });
    });

    describe('setWebview', () => {
        it('should set webview and register message handler', () => {
            provider.setWebview(mockWebviewView as any);
            expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should send initial messages and connection status', () => {
            provider.setWebview(mockWebviewView as any);
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateMessages',
                messages: []
            });
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateConnectionStatus',
                status: {
                    state: 'connected',
                    message: 'Connected to LLM',
                    isInputDisabled: false
                }
            });
        });
    });

    describe('Message handling', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should handle sendMessage command', async () => {
            const message = { type: 'sendMessage', message: 'test message' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'user',
                content: 'test message'
            }));
            expect(mockLLMProvider.generateResponse).toHaveBeenCalledWith(
                'test message',
                { context: 'mock context' },
                expect.any(Function)
            );
        });

        it('should handle clearChat command', async () => {
            const message = { type: 'clearChat' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockContextManager.clear).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateMessages',
                messages: []
            });
        });

        it('should handle getMessages command', async () => {
            const message = { type: 'getMessages' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockContextManager.listMessages).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateMessages',
                messages: []
            });
        });

        it('should handle getConnectionStatus command', async () => {
            const message = { type: 'getConnectionStatus' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockLLMProvider.isConnected).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateConnectionStatus',
                status: expect.objectContaining({
                    state: 'connected'
                })
            });
        });

        it('should handle connectLlm command', async () => {
            const message = { type: 'connectLlm' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockLLMProvider.connect).toHaveBeenCalled();
            expect(mockLLMProvider.isConnected).toHaveBeenCalled();
        });

        it('should handle copyToClipboard command', async () => {
            const message = { type: 'copyToClipboard', text: 'code to copy' };
            await (mockWebviewView as any).messageCallback(message);

            expect(vscode.env.clipboard.writeText).toHaveBeenCalledWith('code to copy');
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Copied to clipboard');
        });

        it('should handle createSnippet command', async () => {
            const message = { type: 'createSnippet', code: 'console.log("hello")', language: 'javascript' };
            await (mockWebviewView as any).messageCallback(message);

            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith({
                language: 'javascript',
                content: ''
            });
            expect(vscode.window.showTextDocument).toHaveBeenCalled();
            expect(vscode.window.showInformationMessage).toHaveBeenCalledWith('Code snippet created');
        });

        it('should handle continueIteration command', async () => {
            const message = { type: 'continueIteration' };
            await (mockWebviewView as any).messageCallback(message);

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'showContinuePrompt',
                message: 'Continue to iterate?'
            });
        });
    });

    describe('handleUserMessage', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should do nothing for empty messages', async () => {
            await provider.handleUserMessage('  ');
            expect(mockContextManager.appendMessage).not.toHaveBeenCalled();
        });

        it('should add user message to context and generate response', async () => {
            await provider.handleUserMessage('Hello LLM');

            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'user',
                content: 'Hello LLM'
            }));

            expect(mockLLMProvider.generateResponse).toHaveBeenCalled();
            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'assistant',
                content: 'mock response'
            }));
        });

        it('should handle offline mode when not connected', async () => {
            mockLLMProvider.isConnected.mockReturnValue(false);

            await provider.handleUserMessage('Offline message');

            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'user',
                content: 'Offline message'
            }));

            // Should add offline message
            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'system',
                content: expect.stringContaining('Currently offline')
            }));

            // Should not try to generate a response
            expect(mockLLMProvider.generateResponse).not.toHaveBeenCalled();
        });

        it('should show continue prompt for messages containing "continue" or "iterate"', async () => {
            await provider.handleUserMessage('Please continue with more examples');

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'showContinuePrompt',
                message: 'Continue to iterate?'
            });
        });
    });

    describe('Streaming response', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should stream response content to webview', async () => {
            // Setup generateResponse to call the callback multiple times to simulate streaming
            mockLLMProvider.generateResponse.mockImplementation((content, options, callback) => {
                callback('Part 1 ');
                callback('Part 2 ');
                callback('Part 3');
                return Promise.resolve();
            });

            await provider.handleUserMessage('Generate streaming response');

            // Check for multiple postMessage calls with updateStreamingContent
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateStreamingContent',
                content: 'Part 1 '
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateStreamingContent',
                content: 'Part 1 Part 2 '
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateStreamingContent',
                content: 'Part 1 Part 2 Part 3'
            });

            // Final message should contain the complete response
            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'assistant',
                content: 'Part 1 Part 2 Part 3'
            }));
        });
    });

    describe('Offline mode and syncing', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should sync offline messages when connection is restored', async () => {
            // First send a message in offline mode
            mockLLMProvider.isConnected.mockReturnValue(false);
            await provider.handleUserMessage('Offline message');

            // Then restore connection and sync
            mockLLMProvider.isConnected.mockReturnValue(true);
            await provider.syncOfflineMessages();

            // Should have generated a response for the cached message
            expect(mockLLMProvider.generateResponse).toHaveBeenCalled();
        });

        it('should not try to sync if no cached messages exist', async () => {
            await provider.syncOfflineMessages();

            // No cached messages so generateResponse should not be called
            expect(mockLLMProvider.generateResponse).not.toHaveBeenCalled();
        });
    });

    describe('Error handling', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should retry failed LLM responses', async () => {
            // Set up the generateResponse mock to fail on first attempt
            mockLLMProvider.generateResponse
                .mockRejectedValueOnce(new Error('Connection error'))
                .mockImplementationOnce((content, options, callback) => {
                    callback('Successful response after retry');
                    return Promise.resolve();
                });

            await provider.handleUserMessage('Test message with retry');

            // Should have been called twice (initial + 1 retry)
            expect(mockLLMProvider.generateResponse).toHaveBeenCalledTimes(2);

            // Should have added the final successful response
            expect(mockContextManager.appendMessage).toHaveBeenCalledWith(expect.objectContaining({
                role: 'assistant',
                content: 'Successful response after retry'
            }));
        });

        it('should handle errors from createCodeSnippet', async () => {
            // Make the workspace.openTextDocument throw an error
            vscode.workspace.openTextDocument.mockRejectedValue(new Error('File creation error'));

            const message = { type: 'createSnippet', code: 'test code', language: 'javascript' };
            await (mockWebviewView as any).messageCallback(message);

            // Should show error message
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
                expect.stringContaining('Failed to create snippet')
            );
        });
    });

    describe('clearHistory', () => {
        beforeEach(() => {
            provider.setWebview(mockWebviewView as any);
        });

        it('should clear context and update webview', async () => {
            await provider.clearHistory();

            expect(mockContextManager.clear).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateMessages',
                messages: []
            });
        });
    });

    describe('Dispose', () => {
        it('should clean up resources', () => {
            provider.dispose();
            // As the dispose method is empty in the implementation,
            // just verify it doesn't throw
            expect(true).toBe(true);
        });
    });
});
