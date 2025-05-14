/**
 * Tests for copilotIntegrationService
 * Source: src\copilot\copilotIntegrationService.ts
 */
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { CopilotIntegrationProvider } from '../../src/copilot/copilotIntegrationProvider';
import { CopilotIntegrationService } from '../../src/copilot/copilotIntegrationService';

describe('copilotIntegrationService', () => {
    let service: CopilotIntegrationService;
    let mockContext: vscode.ExtensionContext;
    let mockProvider: CopilotIntegrationProvider;
    let mockEditor: vscode.TextEditor;
    let mockDocument: vscode.TextDocument;

    beforeEach(() => {
        // Setup mock vscode.ExtensionContext
        mockContext = {
            subscriptions: [],
            extensionPath: '/test/path',
            asAbsolutePath: (relativePath: string) => path.join('/test/path', relativePath)
        } as unknown as vscode.ExtensionContext;

        // Setup mock CopilotIntegrationProvider
        mockProvider = {
            getCompletion: jest.fn()
        } as unknown as CopilotIntegrationProvider;

        // Setup mock TextEditor and TextDocument
        mockDocument = {
            getText: jest.fn(),
            lineAt: jest.fn()
        } as unknown as vscode.TextDocument;

        mockEditor = {
            document: mockDocument,
            selection: {
                isEmpty: false,
                start: { line: 0, character: 0 },
                end: { line: 1, character: 0 }
            }
        } as unknown as vscode.TextEditor;

        // Create service instance
        service = new CopilotIntegrationService(mockContext, mockProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with the provided context', () => {
            assert.strictEqual(service['extensionContext'], mockContext);
            assert.strictEqual(service['provider'], mockProvider);
        });
    });

    describe('checkCopilotAvailability', () => {
        it('should set isAvailable to true when Copilot is available', async () => {
            const result = await service.checkCopilotAvailability();
            assert.strictEqual(result, true);
            assert.strictEqual(service['isAvailable'], true);
        });
    });

    describe('isCopilotAvailable', () => {
        it('should return the current availability state', () => {
            service['isAvailable'] = true;
            assert.strictEqual(service.isCopilotAvailable(), true);

            service['isAvailable'] = false;
            assert.strictEqual(service.isCopilotAvailable(), false);
        });
    });

    describe('getCompletion', () => {
        it('should throw an error if Copilot is not available', async () => {
            service['isAvailable'] = false;
            await assert.rejects(
                async () => await service.getCompletion('code', 'prompt'),
                /Copilot is not available/
            );
        });

        it('should forward the request to provider when available', async () => {
            service['isAvailable'] = true;
            const mockResponse = { completion: 'test completion' };
            (mockProvider.getCompletion as jest.Mock).mockResolvedValue(mockResponse);

            const result = await service.getCompletion('test code', 'test prompt');
            assert.deepStrictEqual(result, mockResponse);

            expect(mockProvider.getCompletion).toHaveBeenCalledWith('test code', 'test prompt');
        });
    });

    describe('processSelectedCode', () => {
        it('should handle no editor case', async () => {
            await service.processSelectedCode(undefined as unknown as vscode.TextEditor);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });

        it('should handle empty selection case', async () => {
            const emptyEditor = {
                ...mockEditor,
                selection: {
                    isEmpty: true
                }
            } as unknown as vscode.TextEditor;

            await service.processSelectedCode(emptyEditor);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });

        it('should handle selected code with prompt', async () => {
            service['isAvailable'] = true;
            (mockDocument.getText as jest.Mock).mockReturnValue('selected code');
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue('test prompt');
            (mockProvider.getCompletion as jest.Mock).mockResolvedValue({ completion: 'test result' });

            await service.processSelectedCode(mockEditor);

            expect(mockDocument.getText).toHaveBeenCalledWith(mockEditor.selection);
            expect(vscode.window.showInputBox).toHaveBeenCalled();
            expect(mockProvider.getCompletion).toHaveBeenCalledWith('selected code', 'test prompt');
        });

        it('should handle canceled prompt', async () => {
            (vscode.window.showInputBox as jest.Mock).mockResolvedValue(undefined);

            await service.processSelectedCode(mockEditor);
            expect(mockProvider.getCompletion).not.toHaveBeenCalled();
        });
    });
});
