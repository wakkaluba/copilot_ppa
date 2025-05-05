const { anything, deepEqual, instance, mock, verify, when } = require('ts-mockito');
const vscode = require('vscode');
const { CodeSimplificationService } = require('../services/CodeSimplificationService');

describe('CodeSimplificationService - JavaScript', () => {
    let service;
    let mockEditor;
    let mockDocument;
    let mockSelection;

    beforeEach(() => {
        // Create a new instance of the service for each test
        service = new CodeSimplificationService();

        // Mock VSCode objects
        mockEditor = mock(vscode.TextEditor);
        mockDocument = mock(vscode.TextDocument);
        mockSelection = mock(vscode.Selection);

        // Setup the mocks
        when(mockEditor.document).thenReturn(instance(mockDocument));
        when(mockEditor.selection).thenReturn(instance(mockSelection));
    });

    describe('initialize', () => {
        it('should initialize the service', async () => {
            // Currently the initialize method is a placeholder
            // This test ensures it exists and can be called without errors
            await expect(service.initialize()).resolves.not.toThrow();
        });
    });

    describe('getEditorContent', () => {
        it('should get full document text when selection is empty', async () => {
            // Setup
            const documentText = 'const x = 1;\nconst y = 2;\nconst z = x + y;';
            when(mockSelection.isEmpty).thenReturn(true);
            when(mockDocument.getText()).thenReturn(documentText);

            // Execute
            const result = await service.getEditorContent(instance(mockEditor));

            // Verify
            expect(result).toEqual({
                text: documentText,
                selection: instance(mockSelection)
            });
            verify(mockDocument.getText()).once();
            verify(mockDocument.getText(anything())).never();
        });

        it('should get selected text when selection is not empty', async () => {
            // Setup
            const selectedText = 'const y = 2;';
            const mockTextSelection = mock(vscode.Range);
            when(mockSelection.isEmpty).thenReturn(false);
            when(mockDocument.getText(deepEqual(instance(mockSelection)))).thenReturn(selectedText);

            // Execute
            const result = await service.getEditorContent(instance(mockEditor));

            // Verify
            expect(result).toEqual({
                text: selectedText,
                selection: instance(mockSelection)
            });
            verify(mockDocument.getText(deepEqual(instance(mockSelection)))).once();
            verify(mockDocument.getText()).never();
        });

        it('should handle empty text properly', async () => {
            // Setup
            when(mockSelection.isEmpty).thenReturn(true);
            when(mockDocument.getText()).thenReturn('');

            // Execute
            const result = await service.getEditorContent(instance(mockEditor));

            // Verify
            expect(result).toEqual({
                text: '',
                selection: instance(mockSelection)
            });
        });
    });

    describe('simplifyCode', () => {
        it('should return the original text for now (placeholder implementation)', async () => {
            // Setup
            const originalCode = 'function test() { if (true) { return 1; } else { return 2; } }';
            const languageId = 'typescript';

            // Execute
            const result = await service.simplifyCode(originalCode, languageId);

            // Verify
            expect(result).toBe(originalCode);
        });

        it('should handle empty code input', async () => {
            // Execute
            const result = await service.simplifyCode('', 'javascript');

            // Verify
            expect(result).toBe('');
        });

        it('should work with different language IDs', async () => {
            // Setup
            const originalCode = 'var x = 10; var y = 20; var z = x + y;';
            const languages = ['javascript', 'typescript', 'python', 'csharp', 'java'];

            // Execute and verify for each language
            for (const language of languages) {
                const result = await service.simplifyCode(originalCode, language);
                expect(result).toBe(originalCode);
            }
        });
    });
});
