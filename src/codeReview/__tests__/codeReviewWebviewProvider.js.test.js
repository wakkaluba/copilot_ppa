import * as vscode from 'vscode';
import { CodeReviewWebviewProvider } from '../codeReviewWebviewProvider';

// Mock VS Code API
jest.mock('vscode', () => {
    const mockWebviewView = {
        webview: {
            html: '',
            options: {},
            onDidReceiveMessage: jest.fn(),
            postMessage: jest.fn().mockResolvedValue(true),
        }
    };

    return {
        Uri: {
            file: jest.fn(path => ({ path })),
            parse: jest.fn(url => ({ url })),
        },
        EventEmitter: jest.fn().mockImplementation(() => ({
            event: jest.fn(),
            fire: jest.fn(),
        })),
        window: {
            showErrorMessage: jest.fn(),
            showInformationMessage: jest.fn(),
        },
        commands: {
            registerCommand: jest.fn(),
            executeCommand: jest.fn(),
        },
        WebviewView: mockWebviewView,
    };
});

// Mock dependencies
const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};

const mockService = {
    getWebviewHtml: jest.fn().mockReturnValue('<html><body>Test HTML</body></html>'),
    handleWebviewMessage: jest.fn().mockResolvedValue({ command: 'response', data: 'test' }),
};

describe('CodeReviewWebviewProvider', () => {
    let provider;
    let mockExtensionUri;
    let mockExtensionContext;
    let mockWebviewView;

    beforeEach(() => {
        mockExtensionUri = vscode.Uri.file('/test/extension/path');
        mockExtensionContext = {
            extensionUri: mockExtensionUri,
            subscriptions: [],
        };

        mockWebviewView = {
            webview: {
                html: '',
                options: {},
                onDidReceiveMessage: jest.fn((callback) => {
                    mockWebviewView.webview._messageCallback = callback;
                    return { dispose: jest.fn() };
                }),
                postMessage: jest.fn().mockResolvedValue(true),
                asWebviewUri: jest.fn(uri => ({ uri })),
            },
            description: 'Code Review Panel',
            title: 'Code Review',
            visible: true,
            show: jest.fn(),
        };

        // Reset mocks
        jest.clearAllMocks();

        // Create provider
        provider = new CodeReviewWebviewProvider(
            mockLogger,
            mockExtensionUri,
            mockExtensionContext,
            mockService
        );
    });

    describe('resolveWebviewView', () => {
        it('should initialize the webview with correct options', () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            expect(mockWebviewView.webview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
        });

        it('should set HTML content from the service', () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            expect(mockService.getWebviewHtml).toHaveBeenCalledWith(mockWebviewView.webview, mockExtensionUri);
            expect(mockWebviewView.webview.html).toBe('<html><body>Test HTML</body></html>');
        });

        it('should set up message listener', () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should handle errors during initialization', () => {
            // Mock the service to throw an error
            mockService.getWebviewHtml.mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            expect(() => {
                provider.resolveWebviewView(mockWebviewView, {}, {});
            }).toThrow('Test error');

            expect(mockLogger.error).toHaveBeenCalledWith('Error resolving webview:', expect.any(Error));
        });
    });

    describe('webview message handling', () => {
        it('should pass messages to the service and send responses back', async () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await mockWebviewView.webview._messageCallback(message);

            expect(mockService.handleWebviewMessage).toHaveBeenCalledWith(message);
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({ command: 'response', data: 'test' });
        });

        it('should not send empty responses to the webview', async () => {
            mockService.handleWebviewMessage.mockResolvedValueOnce(null);

            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await mockWebviewView.webview._messageCallback(message);

            expect(mockService.handleWebviewMessage).toHaveBeenCalledWith(message);
            expect(mockWebviewView.webview.postMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during message processing', async () => {
            mockService.handleWebviewMessage.mockRejectedValueOnce(new Error('Message handling error'));

            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await mockWebviewView.webview._messageCallback(message);

            expect(mockLogger.error).toHaveBeenCalledWith('Error handling webview message:', expect.any(Error));
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to handle message: Message handling error');
        });

        it('should handle non-Error exceptions during message processing', async () => {
            mockService.handleWebviewMessage.mockRejectedValueOnce('String error');

            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await mockWebviewView.webview._messageCallback(message);

            expect(mockLogger.error).toHaveBeenCalledWith('Error handling webview message:', 'String error');
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to handle message: String error');
        });
    });

    describe('edge cases', () => {
        it('should handle undefined view when sending response', async () => {
            // Set up the provider and resolve the webview
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Capture the message handler
            const messageHandler = mockWebviewView.webview._messageCallback;

            // Set the private _view field to undefined by accessing it directly
            provider._view = undefined;

            // Now simulate a message that would trigger a response
            await messageHandler({ command: 'test', data: {} });

            // Should call service but not try to post a message (which would throw if _view is undefined)
            expect(mockService.handleWebviewMessage).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).not.toHaveBeenCalled();
        });

        it('should handle message callback before view is initialized', async () => {
            // Create a handler before resolveWebviewView is called
            const freshProvider = new CodeReviewWebviewProvider(
                mockLogger,
                mockExtensionUri,
                mockExtensionContext,
                mockService
            );

            // Try to access the private _setWebviewMessageListener method
            const messageHandler = freshProvider._setWebviewMessageListener.bind(freshProvider);

            // Create a mock webview
            const mockWebview = {
                onDidReceiveMessage: jest.fn((callback) => {
                    mockWebview._messageCallback = callback;
                    return { dispose: jest.fn() };
                }),
                postMessage: jest.fn(),
            };

            // Register message handler
            messageHandler(mockWebview);

            // Simulate a message
            await mockWebview._messageCallback({ command: 'test', data: {} });

            // Should call service but not crash even though _view is undefined
            expect(mockService.handleWebviewMessage).toHaveBeenCalled();
            expect(mockWebview.postMessage).not.toHaveBeenCalled();
        });

        it('should handle complex message data structures', async () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Complex message object with nested data
            const complexMessage = {
                command: 'analyze',
                data: {
                    files: [
                        { path: '/path/to/file1.js', content: 'const a = 1;' },
                        { path: '/path/to/file2.js', content: 'const b = 2;' }
                    ],
                    options: {
                        depth: 2,
                        includeTests: true,
                        settings: {
                            threshold: 0.8,
                            rules: ['no-unused-vars', 'indent']
                        }
                    },
                    user: {
                        id: 'user-123',
                        preferences: {
                            theme: 'dark',
                            fontSize: 14
                        }
                    }
                }
            };

            await mockWebviewView.webview._messageCallback(complexMessage);

            expect(mockService.handleWebviewMessage).toHaveBeenCalledWith(complexMessage);
        });

        it('should handle multiple consecutive messages', async () => {
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Multiple messages in sequence
            const messages = [
                { command: 'first', data: { index: 1 } },
                { command: 'second', data: { index: 2 } },
                { command: 'third', data: { index: 3 } }
            ];

            // Send messages in sequence
            for (const message of messages) {
                await mockWebviewView.webview._messageCallback(message);
            }

            // Verify all messages were processed
            expect(mockService.handleWebviewMessage).toHaveBeenCalledTimes(3);
            expect(mockService.handleWebviewMessage).toHaveBeenNthCalledWith(1, messages[0]);
            expect(mockService.handleWebviewMessage).toHaveBeenNthCalledWith(2, messages[1]);
            expect(mockService.handleWebviewMessage).toHaveBeenNthCalledWith(3, messages[2]);
        });
    });
});
