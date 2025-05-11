const vscode = require('vscode');
const { CodeExampleViewProvider } = require('../codeExampleView');
const { CodeExampleService } = require('../../services/codeExamples/codeExampleService');
const { CodeExampleWebviewService } = require('../../services/codeExamples/CodeExampleWebviewService');
const { CodeAnalysisService } = require('../../services/codeExamples/CodeAnalysisService');
const { WebviewHtmlService } = require('../../services/webview/WebviewHtmlService');

// Mock dependencies
jest.mock('vscode');
jest.mock('../../services/codeExamples/codeExampleService');
jest.mock('../../services/codeExamples/CodeExampleWebviewService');
jest.mock('../../services/codeExamples/CodeAnalysisService');
jest.mock('../../services/webview/WebviewHtmlService');

describe('CodeExampleViewProvider JavaScript', () => {
    let extensionUri;
    let codeExampleService;
    let provider;
    let mockWebviewView;
    let mockWebview;
    let mockWebviewService;
    let mockAnalysisService;
    let mockHtmlService;

    beforeEach(() => {
        // Set up mocks
        extensionUri = {};
        codeExampleService = new CodeExampleService();

        // Create mock services
        mockWebviewService = {
            initialize: jest.fn(),
            updateSearchResults: jest.fn(),
            setLoading: jest.fn(),
            insertCode: jest.fn(),
            copyToClipboard: jest.fn(),
            showError: jest.fn()
        };

        mockAnalysisService = {
            extractKeywords: jest.fn().mockReturnValue(['test', 'keywords'])
        };

        mockHtmlService = {
            generateCodeExampleHtml: jest.fn().mockReturnValue('<html>Test</html>')
        };

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
        provider.webviewService = mockWebviewService;
        provider.analysisService = mockAnalysisService;
        provider.htmlService = mockHtmlService;
    });

    // Test case specific to JavaScript implementation
    describe('JavaScript implementation', () => {
        it('should handle null query gracefully', async () => {
            // Initialize webview
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Act - call with null query
            await provider.searchCodeExamples(null);

            // Assert
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(true);
            expect(mockWebviewService.showError).toHaveBeenCalled();
            expect(mockWebviewService.setLoading).toHaveBeenCalledWith(false);
        });

        it('should handle undefined language gracefully', async () => {
            // Arrange - make sure editor is undefined
            vscode.window.activeTextEditor = undefined;

            // Initialize webview
            provider.resolveWebviewView(mockWebviewView, {}, {});

            // Mock service response
            codeExampleService.searchExamples = jest.fn().mockResolvedValue([]);
            codeExampleService.filterExamplesByRelevance = jest.fn().mockReturnValue([]);

            // Act - call with valid query but no language
            await provider.searchCodeExamples('test query');

            // Assert
            expect(codeExampleService.searchExamples).toHaveBeenCalledWith('test query', {
                language: undefined,
                maxResults: 10
            });
        });
    });
});
