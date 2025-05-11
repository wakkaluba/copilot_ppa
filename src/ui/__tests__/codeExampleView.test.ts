import * as vscode from 'vscode';
import { CodeAnalysisService } from '../../services/codeExamples/CodeAnalysisService';
import { CodeExampleService } from '../../services/codeExamples/codeExampleService';
import { CodeExampleWebviewService } from '../../services/codeExamples/CodeExampleWebviewService';
import { WebviewHtmlService } from '../../services/webview/WebviewHtmlService';
import { CodeExampleViewProvider } from '../codeExampleView';

// Mock dependencies
jest.mock('vscode');
jest.mock('../../services/codeExamples/codeExampleService');
jest.mock('../../services/codeExamples/CodeExampleWebviewService');
jest.mock('../../services/codeExamples/CodeAnalysisService');
jest.mock('../../services/webview/WebviewHtmlService');

describe('CodeExampleViewProvider', () => {
    let extensionUri: vscode.Uri;
    let codeExampleService: jest.Mocked<CodeExampleService>;
    let provider: CodeExampleViewProvider;
    let mockWebviewView: any;
    let mockWebview: any;
    let mockWebviewService: jest.Mocked<CodeExampleWebviewService>;
    let mockAnalysisService: jest.Mocked<CodeAnalysisService>;
    let mockHtmlService: jest.Mocked<WebviewHtmlService>;

    beforeEach(() => {
        // Set up mocks
        extensionUri = {} as vscode.Uri;
        codeExampleService = new CodeExampleService() as jest.Mocked<CodeExampleService>;

        // Create mock services
        mockWebviewService = {
            initialize: jest.fn(),
            updateSearchResults: jest.fn(),
            setLoading: jest.fn(),
            insertCode: jest.fn(),
            copyToClipboard: jest.fn(),
            showError: jest.fn()
        } as unknown as jest.Mocked<CodeExampleWebviewService>;

        mockAnalysisService = {
            extractKeywords: jest.fn().mockReturnValue(['test', 'keywords'])
        } as unknown as jest.Mocked<CodeAnalysisService>;

        mockHtmlService = {
            generateCodeExampleHtml: jest.fn().mockReturnValue('<html>Test</html>')
        } as unknown as jest.Mocked<WebviewHtmlService>;

        // Set up mock implementation for webview and webviewView
        mockWebview = {
            html: '',
            onDidReceiveMessage: jest.fn(),
            asWebviewUri: jest.fn((uri) => uri)
        };

        mockWebviewView = {
            webview: mockWebview
        };

        // Create the provider
        provider = new CodeExampleViewProvider(extensionUri, codeExampleService);

        // Replace the internal services with our mocks
        (provider as any).webviewService = mockWebviewService;
        (provider as any).analysisService = mockAnalysisService;
        (provider as any).htmlService = mockHtmlService;
    });

    describe('resolveWebviewView', () => {
        it('should initialize the webview properly', () => {
            // Act
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            // Assert
            expect(mockWebviewService.initialize).toHaveBeenCalledWith(mockWebviewView, extensionUri);
            expect(mockWebview.html).toBe('<html>Test</html>');
            expect(mockWebview.onDidReceiveMessage).toHaveBeenCalled();
        });
    });

    describe('message handling', () => {
        beforeEach(() => {
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);
        });

        it('should handle search message', async () => {
            // Arrange
            const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
            const searchData = { type: 'search', query: 'test query', language: 'javascript' };

            codeExampleService.searchExamples = jest.fn().mockResolvedValue([
                { id: '1', title: 'Example 1', code: 'console.log("test");' }
            ]);

            codeExampleService.filterExamplesByRelevance = jest.fn().mockReturnValue([
                { id: '1', title: 'Example 1', code: 'console.log("test");' }
            ]);

            // Act
            await messageHandler(searchData);

            // Assert
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(true);
            expect(codeExampleService.searchExamples).toHaveBeenCalledWith('test query', {
                language: 'javascript',
                maxResults: 10
            });
            expect(codeExampleService.filterExamplesByRelevance).toHaveBeenCalled();
            expect(mockWebviewService.updateSearchResults).toHaveBeenCalled();
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(false);
        });

        it('should handle insert message', async () => {
            // Arrange
            const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
            const insertData = { type: 'insert', code: 'console.log("test");' };

            // Act
            await messageHandler(insertData);

            // Assert
            expect(mockWebviewService.insertCode).toHaveBeenCalledWith('console.log("test");');
        });

        it('should handle copy message', async () => {
            // Arrange
            const messageHandler = mockWebview.onDidReceiveMessage.mock.calls[0][0];
            const copyData = { type: 'copy', code: 'console.log("test");' };

            // Act
            await messageHandler(copyData);

            // Assert
            expect(mockWebviewService.copyToClipboard).toHaveBeenCalledWith('console.log("test");');
        });
    });

    describe('searchCodeExamples', () => {
        it('should handle errors during search', async () => {
            // Arrange
            provider.resolveWebviewView(mockWebviewView, {} as vscode.WebviewViewResolveContext, {} as vscode.CancellationToken);

            const error = new Error('Test error');
            codeExampleService.searchExamples = jest.fn().mockRejectedValue(error);

            // Act
            await provider.searchCodeExamples('query', 'javascript');

            // Assert
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(true);
            expect(mockWebviewService.showError).toHaveBeenCalledWith(error);
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(false);
        });

        it('should do nothing if view is not initialized', async () => {
            // Act
            await provider.searchCodeExamples('query', 'javascript');

            // Assert
            expect(mockWebviewService.setLoading).not.toHaveBeenCalled();
            expect(codeExampleService.searchExamples).not.toHaveBeenCalled();
        });
    });
});
