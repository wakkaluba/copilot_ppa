/**
 * Tests for copilotIntegrationService
 * Source: src\copilot\copilotIntegrationService.js
 */
const assert = require('assert');
const path = require('path');
const vscode = require('vscode');
const { CopilotIntegrationService } = require('../../src/copilot/copilotIntegrationService');

describe('copilotIntegrationService', () => {
    let service;
    let mockContext;
    let mockProvider;
    let mockEditor;
    let mockDocument;

    beforeEach(() => {
        // Setup mock vscode.ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            asAbsolutePath: (relativePath) => path.join('/test/path', relativePath)
        };

        // Setup mock CopilotIntegrationProvider
        mockProvider = {
            getCompletion: jest.fn()
        };

        // Setup mock TextEditor and TextDocument
        mockDocument = {
            getText: jest.fn(),
            lineAt: jest.fn()
        };

        mockEditor = {
            document: mockDocument,
            selection: {
                isEmpty: false,
                start: { line: 0, character: 0 },
                end: { line: 1, character: 0 }
            }
        };

        // Create service instance
        service = new CopilotIntegrationService(mockContext, mockProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided context', () => {
            assert.strictEqual(service.extensionContext, mockContext);
            assert.strictEqual(service.provider, mockProvider);
        });
    });

    describe('checkCopilotAvailability', () => {
        it('should set isAvailable to true when Copilot is available', async () => {
            const result = await service.checkCopilotAvailability();
            assert.strictEqual(result, true);
            assert.strictEqual(service.isAvailable, true);
        });
    });

    describe('isCopilotAvailable', () => {
        it('should return the current availability state', () => {
            service.isAvailable = true;
            assert.strictEqual(service.isCopilotAvailable(), true);

            service.isAvailable = false;
            assert.strictEqual(service.isCopilotAvailable(), false);
        });
    });

    describe('getCompletion', () => {
        it('should throw an error if Copilot is not available', async () => {
            service.isAvailable = false;
            await assert.rejects(
                async () => await service.getCompletion('code', 'prompt'),
                /Copilot is not available/
            );
        });

        it('should forward the request to provider when available', async () => {
            service.isAvailable = true;
            const mockResponse = { completion: 'test completion' };
            mockProvider.getCompletion.mockResolvedValue(mockResponse);

            const result = await service.getCompletion('test code', 'test prompt');
            assert.deepStrictEqual(result, mockResponse);

            expect(mockProvider.getCompletion).toHaveBeenCalledWith('test code', 'test prompt');
        });
    });

    describe('processSelectedCode', () => {
        it('should handle no editor case', async () => {
            await service.processSelectedCode(undefined);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });

        it('should handle empty selection case', async () => {
            const emptyEditor = {
                ...mockEditor,
                selection: {
                    isEmpty: true
                }
            };

            await service.processSelectedCode(emptyEditor);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });

        it('should handle selected code with prompt', async () => {
            service.isAvailable = true;
            mockDocument.getText.mockReturnValue('selected code');
            vscode.window.showInputBox.mockResolvedValue('test prompt');
            mockProvider.getCompletion.mockResolvedValue({ completion: 'test result' });

            await service.processSelectedCode(mockEditor);

            expect(mockDocument.getText).toHaveBeenCalledWith(mockEditor.selection);
            expect(vscode.window.showInputBox).toHaveBeenCalled();
            expect(mockProvider.getCompletion).toHaveBeenCalledWith('selected code', 'test prompt');
        });

        it('should handle canceled prompt', async () => {
            vscode.window.showInputBox.mockResolvedValue(undefined);

            await service.processSelectedCode(mockEditor);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });
    });
});
