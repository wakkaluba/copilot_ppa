import * as vscode from 'vscode';
import { AgentSidebarProvider } from '../../../sidebar/agentSidebarProvider';
import { LLMConnectionManager } from '../../../llm/llmConnectionManager';
import { mock, MockProxy } from 'jest-mock-extended';

describe('AgentSidebarProvider', () => {
    let provider: AgentSidebarProvider;
    let mockWebview: MockProxy<vscode.Webview>;
    let mockWebviewView: MockProxy<vscode.WebviewView>;
    let mockConnectionManager: MockProxy<LLMConnectionManager>;
    let mockExtensionUri: vscode.Uri;

    beforeEach(() => {
        mockWebview = mock<vscode.Webview>();
        mockWebviewView = mock<vscode.WebviewView>({
            webview: mockWebview
        });
        mockConnectionManager = mock<LLMConnectionManager>();
        mockExtensionUri = vscode.Uri.file('test-extension-path');

        provider = new AgentSidebarProvider(
            mockExtensionUri,
            mockConnectionManager
        );
    });

    describe('resolveWebviewView', () => {
        it('should initialize webview with correct options', () => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

            expect(mockWebview.options).toEqual({
                enableScripts: true,
                localResourceRoots: [mockExtensionUri]
            });
        });

        it('should set up HTML content', () => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);

            expect(mockWebview.html).toBeDefined();
            expect(mockWebview.html).toContain('<!DOCTYPE html>');
        });
    });

    describe('message handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should handle connect message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({ 
                type: 'connect' 
            });

            expect(mockConnectionManager.connect).toHaveBeenCalled();
        });

        it('should handle disconnect message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({ 
                type: 'disconnect' 
            });

            expect(mockConnectionManager.disconnect).toHaveBeenCalled();
        });

        it('should handle refreshModels message', async () => {
            const mockModels = [{ id: 'model1' }, { id: 'model2' }];
            mockConnectionManager.getAvailableModels.mockResolvedValue(mockModels);

            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({ 
                type: 'refreshModels' 
            });

            expect(mockConnectionManager.getAvailableModels).toHaveBeenCalled();
            expect(mockWebview.postMessage).toHaveBeenCalledWith({
                type: 'updateModels',
                data: mockModels
            });
        });

        it('should handle setModel message', async () => {
            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({ 
                type: 'setModel',
                data: 'test-model'
            });

            expect(mockConnectionManager.setModel).toHaveBeenCalledWith('test-model');
        });
    });

    describe('error handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as any, {} as any);
        });

        it('should handle connection errors', async () => {
            const error = new Error('Connection failed');
            mockConnectionManager.connect.mockRejectedValue(error);

            await mockWebview.onDidReceiveMessage.mock.calls[0][0]({ 
                type: 'connect' 
            });

            expect(mockWebview.postMessage).toHaveBeenCalledWith({
                type: 'showError',
                data: 'Failed to connect: Connection failed'
            });
        });
    });

    describe('cleanup', () => {
        it('should dispose of all resources', () => {
            const disposableMock = { dispose: jest.fn() };
            provider['_disposables'].push(disposableMock);

            provider.dispose();

            expect(disposableMock.dispose).toHaveBeenCalled();
            expect(provider['_messageHandlers'].size).toBe(0);
            expect(provider['_view']).toBeUndefined();
        });
    });
});