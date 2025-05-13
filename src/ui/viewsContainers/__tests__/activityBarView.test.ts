import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as vscode from 'vscode';
import { mockWebviewView } from '../../../__mocks__/mockWebview';
import { ActivityBarView } from '../activityBarView';

describe('ActivityBarView', () => {
    let activityBarView: ActivityBarView;
    let mockExtensionUri: vscode.Uri;
    let mockRegisterProvider: jest.Mock;
    let mockExecuteCommand: jest.Mock;

    beforeEach(() => {
        mockExtensionUri = { fsPath: '/test/path' } as vscode.Uri;
        mockRegisterProvider = jest.fn();
        mockExecuteCommand = jest.fn();

        // Mock vscode.window.registerWebviewViewProvider
        (vscode.window as any).registerWebviewViewProvider = mockRegisterProvider;
        (vscode.commands as any).executeCommand = mockExecuteCommand;

        activityBarView = new ActivityBarView(mockExtensionUri, 'testContainer');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('initialize', () => {
        it('should register webview view provider', async () => {
            await activityBarView.initialize();

            expect(mockRegisterProvider).toHaveBeenCalledWith(
                'copilot-ppa.activityBar',
                expect.any(Object),
                expect.objectContaining({
                    webviewOptions: expect.objectContaining({
                        retainContextWhenHidden: true
                    })
                })
            );
        });
    });

    describe('webview resolution', () => {
        it('should setup webview when resolved', async () => {
            const mockView = mockWebviewView();
            await activityBarView.initialize();

            // Get provider callback and call it
            const providerArg = mockRegisterProvider.mock.calls[0][1];
            await providerArg.resolveWebviewView(mockView);

            expect(mockView.webview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
            expect(mockView.webview.html).toContain('<!DOCTYPE html>');
        });

        it('should handle navigation messages', async () => {
            const mockView = mockWebviewView();
            await activityBarView.initialize();

            const providerArg = mockRegisterProvider.mock.calls[0][1];
            await providerArg.resolveWebviewView(mockView);

            // Get message handler and simulate message
            const messageHandler = mockView.webview.onDidReceiveMessage.mock.calls[0][0];
            await messageHandler({ type: 'navigate', view: 'testView' });

            expect(mockExecuteCommand).toHaveBeenCalledWith('workbench.view.extension.testView');
        });

        it('should handle refresh messages', async () => {
            const mockView = mockWebviewView();
            await activityBarView.initialize();

            const providerArg = mockRegisterProvider.mock.calls[0][1];
            await providerArg.resolveWebviewView(mockView);

            // Get message handler and simulate refresh message
            const messageHandler = mockView.webview.onDidReceiveMessage.mock.calls[0][0];
            await messageHandler({ type: 'refresh' });

            expect(mockView.webview.postMessage).toHaveBeenCalledWith({ type: 'update' });
        });

        it('should handle message errors gracefully', async () => {
            const mockView = mockWebviewView();
            // Mock console.error to spy on it
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            await activityBarView.initialize();

            const providerArg = mockRegisterProvider.mock.calls[0][1];
            await providerArg.resolveWebviewView(mockView);

            // Get message handler and simulate a message that will throw
            const messageHandler = mockView.webview.onDidReceiveMessage.mock.calls[0][0];
            mockView.webview.postMessage.mockRejectedValue(new Error('Test error'));

            await messageHandler({ type: 'refresh' });

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error handling message:', expect.any(Error));

            // Clean up
            consoleErrorSpy.mockRestore();
        });
    });

    describe('dispose', () => {
        it('should dispose all disposables', async () => {
            const mockDisposable = { dispose: jest.fn() };
            const mockView = mockWebviewView();
            mockView.webview.onDidReceiveMessage.mockReturnValue(mockDisposable);

            await activityBarView.initialize();

            // Track this disposable directly
            activityBarView['_disposables'].push(mockDisposable);

            // Dispose of the view
            activityBarView.dispose();

            // Now verify the disposal
            expect(mockDisposable.dispose).toHaveBeenCalled();
        });
    });
});
