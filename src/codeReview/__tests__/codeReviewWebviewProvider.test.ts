import * as vscode from 'vscode';
import { ILogger } from '../../logging/ILogger';
import { CodeReviewWebviewProvider } from '../codeReviewWebviewProvider';
import { CodeReviewService } from '../services/CodeReviewService';

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
    let provider: CodeReviewWebviewProvider;
    let mockExtensionUri: vscode.Uri;
    let mockExtensionContext: vscode.ExtensionContext;
    let mockWebviewView: vscode.WebviewView;

    beforeEach(() => {
        mockExtensionUri = vscode.Uri.file('/test/extension/path');
        mockExtensionContext = {
            extensionUri: mockExtensionUri,
            subscriptions: [],
        } as unknown as vscode.ExtensionContext;

        mockWebviewView = {
            webview: {
                html: '',
                options: {},
                onDidReceiveMessage: jest.fn((callback) => {
                    (mockWebviewView.webview as any)._messageCallback = callback;
                    return { dispose: jest.fn() };
                }),
                postMessage: jest.fn().mockResolvedValue(true),
                asWebviewUri: jest.fn(uri => ({ uri })),
            },
            description: 'Code Review Panel',
            title: 'Code Review',
            visible: true,
            show: jest.fn(),
        } as unknown as vscode.WebviewView;

        // Reset mocks
        jest.clearAllMocks();

        // Create provider
        provider = new CodeReviewWebviewProvider(
            mockLogger as unknown as ILogger,
            mockExtensionUri,
            mockExtensionContext,
            mockService as unknown as CodeReviewService
        );
    });

    describe('resolveWebviewView', () => {
        it('should initialize the webview with correct options', () => {
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            expect(mockWebviewView.webview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
        });

        it('should set HTML content from the service', () => {
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            expect(mockService.getWebviewHtml).toHaveBeenCalledWith(mockWebviewView.webview, mockExtensionUri);
            expect(mockWebviewView.webview.html).toBe('<html><body>Test HTML</body></html>');
        });

        it('should set up message listener', () => {
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
        });

        it('should handle errors during initialization', () => {
            // Mock the service to throw an error
            mockService.getWebviewHtml.mockImplementationOnce(() => {
                throw new Error('Test error');
            });

            expect(() => {
                provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);
            }).toThrow('Test error');

            expect(mockLogger.error).toHaveBeenCalledWith('Error resolving webview:', expect.any(Error));
        });
    });

    describe('webview message handling', () => {
        it('should pass messages to the service and send responses back', async () => {
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await (mockWebviewView.webview as any)._messageCallback(message);

            expect(mockService.handleWebviewMessage).toHaveBeenCalledWith(message);
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({ command: 'response', data: 'test' });
        });

        it('should not send empty responses to the webview', async () => {
            mockService.handleWebviewMessage.mockResolvedValueOnce(null);

            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await (mockWebviewView.webview as any)._messageCallback(message);

            expect(mockService.handleWebviewMessage).toHaveBeenCalledWith(message);
            expect(mockWebviewView.webview.postMessage).not.toHaveBeenCalled();
        });

        it('should handle errors during message processing', async () => {
            mockService.handleWebviewMessage.mockRejectedValueOnce(new Error('Message handling error'));

            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await (mockWebviewView.webview as any)._messageCallback(message);

            expect(mockLogger.error).toHaveBeenCalledWith('Error handling webview message:', expect.any(Error));
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to handle message: Message handling error');
        });

        it('should handle non-Error exceptions during message processing', async () => {
            mockService.handleWebviewMessage.mockRejectedValueOnce('String error');

            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Simulate a message from the webview
            const message = { command: 'test', data: { key: 'value' } };
            await (mockWebviewView.webview as any)._messageCallback(message);

            expect(mockLogger.error).toHaveBeenCalledWith('Error handling webview message:', 'String error');
            expect(vscode.window.showErrorMessage).toHaveBeenCalledWith('Failed to handle message: String error');
        });
    });

    describe('edge cases', () => {
        it('should handle undefined view when sending response', async () => {
            // Set up the provider and resolve the webview
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Capture the message handler
            const messageHandler = (mockWebviewView.webview as any)._messageCallback;

            // Set the private _view field to undefined by accessing it directly
            (provider as any)._view = undefined;

            // Now simulate a message that would trigger a response
            await messageHandler({ command: 'test', data: {} });

            // Should call service but not try to post a message (which would throw if _view is undefined)
            expect(mockService.handleWebviewMessage).toHaveBeenCalled();
            expect(mockWebviewView.webview.postMessage).not.toHaveBeenCalled();
        });

        it('should handle message callback before view is initialized', async () => {
            // Create a handler before resolveWebviewView is called
            const provider = new CodeReviewWebviewProvider(
                mockLogger as unknown as ILogger,
                mockExtensionUri,
                mockExtensionContext,
                mockService as unknown as CodeReviewService
            );

            // Try to access the private _view field before it's set
            const messageHandler = (provider as any)._setWebviewMessageListener.bind(provider);

            // Create a mock webview
            const mockWebview = {
                onDidReceiveMessage: jest.fn((callback) => {
                    (mockWebview as any)._messageCallback = callback;
                    return { dispose: jest.fn() };
                }),
                postMessage: jest.fn(),
            } as unknown as vscode.Webview;

            // Register message handler
            messageHandler(mockWebview);

            // Simulate a message
            await (mockWebview as any)._messageCallback({ command: 'test', data: {} });

            // Should call service but not crash even though _view is undefined
            expect(mockService.handleWebviewMessage).toHaveBeenCalled();
            expect(mockWebview.postMessage).not.toHaveBeenCalled();
        });
    });
});
