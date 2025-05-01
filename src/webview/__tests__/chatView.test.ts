import { EventEmitter } from 'events';
import * as vscode from 'vscode';
import { UnifiedChatViewProvider } from '../chatView';

jest.mock('vscode');

describe('UnifiedChatViewProvider', () => {
    let provider: UnifiedChatViewProvider;
    let mockExtensionContext: vscode.ExtensionContext;
    let mockWebviewView: any;
    let mockEventBus: EventEmitter;

    beforeEach(() => {
        mockWebviewView = {
            webview: {
                html: '',
                options: {},
                onDidReceiveMessage: jest.fn(),
                postMessage: jest.fn(),
                asWebviewUri: jest.fn().mockReturnValue('mock-uri')
            },
            onDidDispose: jest.fn(),
            onDidChangeVisibility: jest.fn(),
            visible: true
        };

        mockEventBus = new EventEmitter();

        mockExtensionContext = {
            extensionUri: vscode.Uri.file('/test/extension/path'),
            subscriptions: []
        } as unknown as vscode.ExtensionContext;

        provider = new UnifiedChatViewProvider(mockExtensionContext, mockEventBus);
    });

    describe('webview initialization', () => {
        it('should set up webview with correct options', () => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

            expect(mockWebviewView.webview.options).toEqual({
                enableScripts: true,
                localResourceRoots: expect.any(Array)
            });
        });

        it('should initialize with HTML content', () => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

            expect(mockWebviewView.webview.html).toBeTruthy();
            expect(mockWebviewView.webview.html).toContain('<!DOCTYPE html>');
            expect(mockWebviewView.webview.html).toContain('Content-Security-Policy');
        });

        it('should set up message handlers', () => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

            expect(mockWebviewView.webview.onDidReceiveMessage).toHaveBeenCalled();
        });
    });

    describe('message handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should handle send message command', async () => {
            const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                command: 'sendMessage',
                text: 'Hello'
            });

            // Verify event emission or message processing
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'addMessage',
                    message: expect.objectContaining({
                        text: 'Hello',
                        isUser: true
                    })
                })
            );
        });

        it('should handle clear chat command', async () => {
            const messageHandler = mockWebviewView.webview.onDidReceiveMessage.mock.calls[0][0];

            await messageHandler({
                command: 'clearChat'
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'clearChat'
            });
        });

        it('should handle visibility changes', () => {
            const visibilityHandler = mockWebviewView.onDidChangeVisibility.mock.calls[0][0];

            mockWebviewView.visible = false;
            visibilityHandler();

            // Should handle visibility state appropriately
            expect(provider['view']?.visible).toBe(false);
        });
    });

    describe('chat updates', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should update chat with assistant message', () => {
            provider.updateChat({
                role: 'assistant',
                content: 'Hello, I can help you with that.',
                timestamp: new Date()
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'addMessage',
                message: expect.objectContaining({
                    text: 'Hello, I can help you with that.',
                    isUser: false
                })
            });
        });

        it('should update chat with user message', () => {
            provider.updateChat({
                role: 'user',
                content: 'Can you help me?',
                timestamp: new Date()
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'addMessage',
                message: expect.objectContaining({
                    text: 'Can you help me?',
                    isUser: true
                })
            });
        });

        it('should handle streaming updates', () => {
            provider.updateStreaming({
                content: 'Processing...',
                isComplete: false
            });

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateStreaming',
                content: 'Processing...',
                isComplete: false
            });
        });
    });

    describe('chat history', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should load chat history', async () => {
            const history = [
                { role: 'user', content: 'Hello', timestamp: new Date() },
                { role: 'assistant', content: 'Hi there!', timestamp: new Date() }
            ];

            await provider.loadChatHistory(history);

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledTimes(2);
            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'addMessage'
                })
            );
        });

        it('should clear chat history', () => {
            provider.clearChat();

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'clearChat'
            });
        });
    });

    describe('connection status', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should update connection status', () => {
            provider.updateConnectionStatus(true, 'GPT-4');

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateConnectionStatus',
                connected: true,
                model: 'GPT-4'
            });
        });

        it('should handle disconnected status', () => {
            provider.updateConnectionStatus(false);

            expect(mockWebviewView.webview.postMessage).toHaveBeenCalledWith({
                type: 'updateConnectionStatus',
                connected: false,
                model: undefined
            });
        });
    });

    describe('cleanup', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should clean up on disposal', () => {
            const disposeHandler = mockWebviewView.onDidDispose.mock.calls[0][0];
            disposeHandler();

            // Should handle cleanup appropriately
            expect(provider['view']).toBeUndefined();
        });
    });
});
