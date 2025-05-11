// filepath: d:\___coding\tools\copilot_ppa\src\documentationGenerators\__tests__\jsdocTsDocIntegration.test.ts
import * as ts from 'typescript';
import * as vscode from 'vscode';
import { LLMInterface } from '../../llm-providers/llmInterface';
import { JSDocTSDocGenerationOptions } from '../../types/documentation';
import { JSDocTSDocIntegration } from '../jsdocTsDocIntegration';

// Mock dependencies
jest.mock('vscode');
jest.mock('typescript');
jest.mock('../../llm-providers/llmInterface');

describe('JSDocTSDocIntegration', () => {
    let llmProvider: LLMInterface;
    let integration: JSDocTSDocIntegration;
    let mockOutputChannel: vscode.OutputChannel;
    let mockDocument: vscode.TextDocument;
    let mockSourceFile: ts.SourceFile;
    let mockWorkspaceEdit: vscode.WorkspaceEdit;

    beforeEach(() => {
        // Mock LLM provider
        llmProvider = {
            generateDocumentation: jest.fn().mockResolvedValue('Generated documentation')
        } as unknown as LLMInterface;

        // Mock VS Code OutputChannel
        mockOutputChannel = {
            appendLine: jest.fn(),
            dispose: jest.fn()
        } as unknown as vscode.OutputChannel;

        // Mock VS Code window.createOutputChannel
        (vscode.window.createOutputChannel as jest.Mock).mockReturnValue(mockOutputChannel);

        // Mock document
        mockDocument = {
            languageId: 'typescript',
            fileName: 'test.ts',
            getText: jest.fn().mockReturnValue('const test = "Hello";'),
            uri: { fsPath: 'test.ts' }
        } as unknown as vscode.TextDocument;

        // Mock source file
        mockSourceFile = {
            getFullText: jest.fn().mockReturnValue('const test = "Hello";'),
            getSourceFile: jest.fn().mockReturnValue({
                getFullText: jest.fn().mockReturnValue('const test = "Hello";')
            })
        } as unknown as ts.SourceFile;

        // Mock ts.createSourceFile
        (ts.createSourceFile as jest.Mock).mockReturnValue(mockSourceFile);

        // Mock workspace edit
        mockWorkspaceEdit = {
            set: jest.fn()
        } as unknown as vscode.WorkspaceEdit;

        // Mock vscode.WorkspaceEdit constructor
        (vscode.WorkspaceEdit as jest.Mock).mockImplementation(() => mockWorkspaceEdit);

        // Mock vscode.workspace.applyEdit
        (vscode.workspace.applyEdit as jest.Mock).mockResolvedValue(true);

        // Mock Position and TextEdit
        (vscode.Position as jest.Mock).mockImplementation((line, character) => ({ line, character }));
        (vscode.TextEdit.insert as jest.Mock).mockImplementation((position, text) => ({ position, text }));

        // Create integration instance
        integration = new JSDocTSDocIntegration(llmProvider);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        it('should initialize with the provided LLM provider', () => {
            expect(integration).toBeDefined();
            expect(vscode.window.createOutputChannel).toHaveBeenCalledWith('JSDoc/TSDoc Integration');
        });
    });

    describe('generateDocumentation', () => {
        it('should generate documentation for a supported language', async () => {
            // Set up mocks for AST traversal
            jest.spyOn(ts, 'forEachChild').mockImplementation((node, callback) => {
                // Mock a class declaration node
                const mockNode = {
                    kind: ts.SyntaxKind.ClassDeclaration,
                    getStart: jest.fn().mockReturnValue(0),
                    getSourceFile: jest.fn().mockReturnValue(mockSourceFile)
                };
                callback(mockNode as unknown as ts.Node);
                return undefined;
            });

            // Mock shouldDocumentNode to return true
            jest.spyOn(integration as any, 'shouldDocumentNode').mockReturnValue(true);

            // Mock getExistingDocumentation to return undefined (no existing docs)
            jest.spyOn(integration as any, 'getExistingDocumentation').mockReturnValue(undefined);

            // Mock generateSymbolDocumentation
            jest.spyOn(integration as any, 'generateSymbolDocumentation').mockResolvedValue('/**\n * Generated doc\n */');

            // Execute the method
            await integration.generateDocumentation(mockDocument);

            // Verify that WorkspaceEdit was created and applied
            expect(vscode.WorkspaceEdit).toHaveBeenCalled();
            expect(mockWorkspaceEdit.set).toHaveBeenCalled();
            expect(vscode.workspace.applyEdit).toHaveBeenCalledWith(mockWorkspaceEdit);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Documentation generated for test.ts');
        });

        it('should throw an error for unsupported languages', async () => {
            // Set up mock for unsupported language
            const unsupportedDocument = {
                ...mockDocument,
                languageId: 'python'
            };

            // Execute the method and expect it to throw
            await expect(integration.generateDocumentation(unsupportedDocument))
                .rejects.toThrow('Language python not supported');

            // Verify error was logged
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('Error generating documentation')
            );
        });

        it('should handle errors during documentation generation', async () => {
            // Make source file creation throw an error
            (ts.createSourceFile as jest.Mock).mockImplementation(() => {
                throw new Error('Source file error');
            });

            // Execute the method and expect it to throw
            await expect(integration.generateDocumentation(mockDocument))
                .rejects.toThrow('Source file error');

            // Verify error was logged
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
                expect.stringContaining('Error generating documentation')
            );
        });

        it('should respect the overwrite option when existing documentation exists', async () => {
            // Set up mocks for AST traversal
            jest.spyOn(ts, 'forEachChild').mockImplementation((node, callback) => {
                // Mock a function declaration node
                const mockNode = {
                    kind: ts.SyntaxKind.FunctionDeclaration,
                    getStart: jest.fn().mockReturnValue(0),
                    getSourceFile: jest.fn().mockReturnValue(mockSourceFile)
                };
                callback(mockNode as unknown as ts.Node);
                return undefined;
            });

            // Mock shouldDocumentNode to return true
            jest.spyOn(integration as any, 'shouldDocumentNode').mockReturnValue(true);

            // Mock getExistingDocumentation to return existing docs
            jest.spyOn(integration as any, 'getExistingDocumentation').mockReturnValue('Existing doc');

            // Mock generateSymbolDocumentation
            const generateSymbolDocumentationSpy = jest.spyOn(integration as any, 'generateSymbolDocumentation')
                .mockResolvedValue('/**\n * Generated doc\n */');

            // Without overwrite option
            await integration.generateDocumentation(mockDocument);
            expect(generateSymbolDocumentationSpy).not.toHaveBeenCalled();

            // With overwrite option
            const options: JSDocTSDocGenerationOptions = { overwrite: true };
            await integration.generateDocumentation(mockDocument, options);
            expect(generateSymbolDocumentationSpy).toHaveBeenCalled();
        });
    });

    describe('Private Helper Methods', () => {
        it('should correctly identify nodes that should be documented', () => {
            const shouldDocumentNode = (integration as any).shouldDocumentNode.bind(integration);

            // Test with class declaration
            const classNode = { kind: ts.SyntaxKind.ClassDeclaration };
            (ts.isClassDeclaration as jest.Mock).mockReturnValueOnce(true);
            expect(shouldDocumentNode(classNode)).toBe(true);

            // Test with function declaration
            const functionNode = { kind: ts.SyntaxKind.FunctionDeclaration };
            (ts.isClassDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isFunctionDeclaration as jest.Mock).mockReturnValueOnce(true);
            expect(shouldDocumentNode(functionNode)).toBe(true);

            // Test with node that should not be documented
            const otherNode = { kind: ts.SyntaxKind.StringLiteral };
            (ts.isClassDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isFunctionDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isInterfaceDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isMethodDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isPropertyDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isEnumDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isTypeAliasDeclaration as jest.Mock).mockReturnValueOnce(false);
            (ts.isVariableDeclaration as jest.Mock).mockReturnValueOnce(false);
            expect(shouldDocumentNode(otherNode)).toBe(false);
        });

        it('should extract symbol information correctly', () => {
            const extractSymbolInfo = (integration as any).extractSymbolInfo.bind(integration);

            // Test with function declaration
            const functionNode = {
                kind: ts.SyntaxKind.FunctionDeclaration,
                name: { text: 'testFunction', getText: () => 'testFunction' },
                parameters: [
                    {
                        name: { getText: () => 'param1' },
                        type: { getText: () => 'string' }
                    }
                ],
                type: { getText: () => 'boolean' }
            };

            (ts.isFunctionLike as jest.Mock).mockReturnValueOnce(true);

            const info = extractSymbolInfo(functionNode);
            expect(info).toEqual({
                kind: ts.SyntaxKind.FunctionDeclaration,
                name: 'testFunction',
                parameters: [
                    { name: 'param1', type: 'string' }
                ],
                returnType: 'boolean'
            });
        });

        it('should correctly format documentation', () => {
            const formatDocumentation = (integration as any).formatDocumentation.bind(integration);

            // Test JSDoc format
            let result = formatDocumentation('Line 1\nLine 2', 'jsdoc');
            expect(result).toBe('/**\n * Line 1\n * Line 2\n */');

            // Test TSDoc format
            result = formatDocumentation('Line 1\nLine 2', 'tsdoc');
            expect(result).toBe('/**\n * Line 1\n * Line 2\n */');
        });

        it('should build a proper documentation prompt', () => {
            const buildDocumentationPrompt = (integration as any).buildDocumentationPrompt.bind(integration);

            const symbolInfo = {
                name: 'testFunction',
                parameters: [
                    { name: 'param1', type: 'string' }
                ],
                returnType: 'boolean'
            };

            // Without existing docs
            let result = buildDocumentationPrompt('function', symbolInfo, undefined, {});
            expect(result).toContain('Generate jsdoc documentation for:');
            expect(result).toContain('Type: function');
            expect(result).toContain('Name: testFunction');
            expect(result).toContain('Parameters:');
            expect(result).toContain('- param1: string');
            expect(result).toContain('Return type: boolean');

            // With existing docs
            result = buildDocumentationPrompt('function', symbolInfo, 'Existing doc', { style: 'tsdoc' });
            expect(result).toContain('Generate tsdoc documentation for:');
            expect(result).toContain('Existing documentation:');
            expect(result).toContain('Use TSDoc style documentation.');
        });
    });

    describe('dispose', () => {
        it('should dispose resources correctly', () => {
            integration.dispose();
            expect(mockOutputChannel.dispose).toHaveBeenCalled();
        });
    });
});
