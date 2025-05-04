import * as path from 'path';
import * as vscode from 'vscode';
import { CodeDiffService } from '../../services/CodeDiffService';

// Mock VS Code APIs
jest.mock('vscode', () => {
    return {
        Uri: {
            with: jest.fn().mockImplementation(function(this: any, options: any) {
                return {
                    ...this,
                    ...options
                };
            }),
            file: jest.fn().mockImplementation((path: string) => ({
                fsPath: path,
                path: path,
                scheme: 'file',
                with: jest.fn().mockImplementation((options: any) => ({
                    fsPath: path,
                    path: path,
                    ...options
                }))
            }))
        },
        workspace: {
            openTextDocument: jest.fn().mockResolvedValue({
                lineCount: 10
            }),
            applyEdit: jest.fn().mockResolvedValue(true)
        },
        commands: {
            executeCommand: jest.fn().mockResolvedValue(undefined)
        },
        Range: jest.fn().mockImplementation((startLine, startChar, endLine, endChar) => ({
            startLine,
            startChar,
            endLine,
            endChar
        })),
        WorkspaceEdit: jest.fn().mockImplementation(() => ({
            replace: jest.fn()
        }))
    };
});

describe('CodeDiffService', () => {
    let codeDiffService: CodeDiffService;
    let mockUri: vscode.Uri;
    let mockOriginalUri: vscode.Uri;
    let mockModifiedUri: vscode.Uri;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create service instance
        codeDiffService = new CodeDiffService();

        // Set up mock URIs
        mockUri = vscode.Uri.file('/test/path/testfile.ts');
        mockOriginalUri = { ...mockUri, scheme: 'original', path: '/test/path/testfile.ts.original' };
        mockModifiedUri = { ...mockUri, scheme: 'modified', path: '/test/path/testfile.ts.modified' };

        // Setup Uri.with mock behavior for proper chaining
        (vscode.Uri.with as jest.Mock).mockImplementation(function(this: any, options: any) {
            if (options.scheme === 'original') {
                return mockOriginalUri;
            }
            if (options.scheme === 'modified') {
                return mockModifiedUri;
            }
            return this;
        });
    });

    describe('showDiff', () => {
        it('should create original and modified documents with correct content', async () => {
            // Arrange
            const originalContent = 'Original code';
            const modifiedContent = 'Modified code';
            const diffTitle = 'Test Diff';

            // Act
            await codeDiffService.showDiff(mockUri, originalContent, modifiedContent, diffTitle);

            // Assert
            // Check that documents were opened
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledTimes(2);
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(mockOriginalUri);
            expect(vscode.workspace.openTextDocument).toHaveBeenCalledWith(mockModifiedUri);

            // Check that edits were applied
            expect(vscode.workspace.applyEdit).toHaveBeenCalledTimes(2);

            // Check that diff command was executed
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'vscode.diff',
                mockOriginalUri,
                mockModifiedUri,
                'testfile.ts - Test Diff'
            );
        });

        it('should handle files with no content', async () => {
            // Arrange
            const originalContent = '';
            const modifiedContent = '';
            const diffTitle = 'Empty Diff';

            // Act
            await codeDiffService.showDiff(mockUri, originalContent, modifiedContent, diffTitle);

            // Assert
            expect(vscode.workspace.applyEdit).toHaveBeenCalledTimes(2);
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'vscode.diff',
                mockOriginalUri,
                mockModifiedUri,
                'testfile.ts - Empty Diff'
            );
        });

        it('should correctly format diff title with filename', async () => {
            // Arrange
            const originalContent = 'Some content';
            const modifiedContent = 'Different content';
            const diffTitle = 'Custom Title';
            const mockUriWithPath = vscode.Uri.file('/test/path/special-file.js');

            // Mock the basename function result
            jest.spyOn(path, 'basename').mockReturnValueOnce('special-file.js');

            // Act
            await codeDiffService.showDiff(mockUriWithPath, originalContent, modifiedContent, diffTitle);

            // Assert
            expect(vscode.commands.executeCommand).toHaveBeenCalledWith(
                'vscode.diff',
                expect.anything(),
                expect.anything(),
                'special-file.js - Custom Title'
            );
        });

        it('should handle error during document creation', async () => {
            // Arrange
            const originalContent = 'Original content';
            const modifiedContent = 'Modified content';
            const diffTitle = 'Error Test';

            // Setup mock to throw error on first call
            (vscode.workspace.openTextDocument as jest.Mock)
                .mockRejectedValueOnce(new Error('Document open error'));

            // Act & Assert
            await expect(
                codeDiffService.showDiff(mockUri, originalContent, modifiedContent, diffTitle)
            ).rejects.toThrow('Document open error');

            // Verify edit was not applied
            expect(vscode.workspace.applyEdit).not.toHaveBeenCalled();
        });

        it('should handle error during edit application', async () => {
            // Arrange
            const originalContent = 'Original content';
            const modifiedContent = 'Modified content';
            const diffTitle = 'Edit Error Test';

            // Setup mock to throw error on first applyEdit call
            (vscode.workspace.applyEdit as jest.Mock)
                .mockRejectedValueOnce(new Error('Edit application error'));

            // Act & Assert
            await expect(
                codeDiffService.showDiff(mockUri, originalContent, modifiedContent, diffTitle)
            ).rejects.toThrow('Edit application error');

            // Verify diff command was not executed
            expect(vscode.commands.executeCommand).not.toHaveBeenCalled();
        });
    });
});
