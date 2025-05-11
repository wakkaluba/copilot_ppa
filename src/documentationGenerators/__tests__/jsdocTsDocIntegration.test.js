// filepath: d:\___coding\tools\copilot_ppa\src\documentationGenerators\__tests__\jsdocTsDocIntegration.test.js
const vscode = require('vscode');
const ts = require('typescript');
const { JSDocTSDocIntegration } = require('../jsdocTsDocIntegration');

// Mock dependencies
jest.mock('vscode');
jest.mock('typescript');
jest.mock('../../llm-providers/llmInterface');

describe('JSDocTSDocIntegration (JavaScript)', () => {
    let llmProvider;
    let integration;
    let mockOutputChannel;
    let mockDocument;
    let mockSourceFile;
    let mockWorkspaceEdit;

    beforeEach(() => {
        // Mock LLM provider
        llmProvider = {
            generateDocumentation: jest.fn().mockResolvedValue('Generated documentation')
        };

        // Mock VS Code OutputChannel
        mockOutputChannel = {
            appendLine: jest.fn(),
            dispose: jest.fn()
        };

        // Mock VS Code window.createOutputChannel
        vscode.window.createOutputChannel.mockReturnValue(mockOutputChannel);

        // Mock document
        mockDocument = {
            languageId: 'javascript',
            fileName: 'test.js',
            getText: jest.fn().mockReturnValue('const test = "Hello";'),
            uri: { fsPath: 'test.js' }
        };

        // Mock source file
        mockSourceFile = {
            getFullText: jest.fn().mockReturnValue('const test = "Hello";'),
            getSourceFile: jest.fn().mockReturnValue({
                getFullText: jest.fn().mockReturnValue('const test = "Hello";')
            })
        };

        // Mock ts.createSourceFile
        ts.createSourceFile.mockReturnValue(mockSourceFile);

        // Mock workspace edit
        mockWorkspaceEdit = {
            set: jest.fn()
        };

        // Mock vscode.WorkspaceEdit constructor
        vscode.WorkspaceEdit.mockImplementation(() => mockWorkspaceEdit);

        // Mock vscode.workspace.applyEdit
        vscode.workspace.applyEdit.mockResolvedValue(true);

        // Mock Position and TextEdit
        vscode.Position.mockImplementation((line, character) => ({ line, character }));
        vscode.TextEdit.insert.mockImplementation((position, text) => ({ position, text }));

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
                callback(mockNode);
                return undefined;
            });

            // Mock shouldDocumentNode to return true
            jest.spyOn(integration, 'shouldDocumentNode').mockReturnValue(true);

            // Mock getExistingDocumentation to return undefined (no existing docs)
            jest.spyOn(integration, 'getExistingDocumentation').mockReturnValue(undefined);

            // Mock generateSymbolDocumentation
            jest.spyOn(integration, 'generateSymbolDocumentation').mockResolvedValue('/**\n * Generated doc\n */');

            // Execute the method
            await integration.generateDocumentation(mockDocument);

            // Verify that WorkspaceEdit was created and applied
            expect(vscode.WorkspaceEdit).toHaveBeenCalled();
            expect(mockWorkspaceEdit.set).toHaveBeenCalled();
            expect(vscode.workspace.applyEdit).toHaveBeenCalledWith(mockWorkspaceEdit);
            expect(mockOutputChannel.appendLine).toHaveBeenCalledWith('Documentation generated for test.js');
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
            ts.createSourceFile.mockImplementation(() => {
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
                callback(mockNode);
                return undefined;
            });

            // Mock shouldDocumentNode to return true
            jest.spyOn(integration, 'shouldDocumentNode').mockReturnValue(true);

            // Mock getExistingDocumentation to return existing docs
            jest.spyOn(integration, 'getExistingDocumentation').mockReturnValue('Existing doc');

            // Mock generateSymbolDocumentation
            const generateSymbolDocumentationSpy = jest.spyOn(integration, 'generateSymbolDocumentation')
                .mockResolvedValue('/**\n * Generated doc\n */');

            // Without overwrite option
            await integration.generateDocumentation(mockDocument);
            expect(generateSymbolDocumentationSpy).not.toHaveBeenCalled();

            // With overwrite option
            const options = { overwrite: true };
            await integration.generateDocumentation(mockDocument, options);
            expect(generateSymbolDocumentationSpy).toHaveBeenCalled();
        });

        // JavaScript-specific test
        it('should handle non-standard JS constructs correctly', async () => {
            // Set up mocks for AST traversal with anonymous function
            jest.spyOn(ts, 'forEachChild').mockImplementation((node, callback) => {
                // Mock an anonymous function expression
                const mockNode = {
                    kind: ts.SyntaxKind.FunctionExpression,
                    getStart: jest.fn().mockReturnValue(0),
                    getSourceFile: jest.fn().mockReturnValue(mockSourceFile),
                    // No name property for anonymous function
                };
                callback(mockNode);
                return undefined;
            });

            // Mock shouldDocumentNode to return true
            jest.spyOn(integration, 'shouldDocumentNode').mockReturnValue(true);

            // Mock getExistingDocumentation to return undefined
            jest.spyOn(integration, 'getExistingDocumentation').mockReturnValue(undefined);

            // Mock extractSymbolInfo to simulate anonymous function
            jest.spyOn(integration, 'extractSymbolInfo').mockReturnValue({
                kind: ts.SyntaxKind.FunctionExpression,
                name: undefined, // Anonymous function
                parameters: [{ name: 'param1', type: 'any' }]
            });

            // Mock generateSymbolDocumentation
            jest.spyOn(integration, 'generateSymbolDocumentation').mockResolvedValue('/**\n * Generated doc\n */');

            // Execute the method
            await integration.generateDocumentation(mockDocument);

            // Verify that documentation was generated even for anonymous function
            expect(mockWorkspaceEdit.set).toHaveBeenCalled();
        });
    });

    describe('Private Helper Methods', () => {
        it('should correctly identify nodes that should be documented', () => {
            // Directly access the private method in JavaScript
            const shouldDocumentNode = integration.shouldDocumentNode;

            // Test with class declaration
            const classNode = { kind: ts.SyntaxKind.ClassDeclaration };
            ts.isClassDeclaration.mockReturnValueOnce(true);
            expect(shouldDocumentNode(classNode)).toBe(true);

            // Test with function declaration
            const functionNode = { kind: ts.SyntaxKind.FunctionDeclaration };
            ts.isClassDeclaration.mockReturnValueOnce(false);
            ts.isFunctionDeclaration.mockReturnValueOnce(true);
            expect(shouldDocumentNode(functionNode)).toBe(true);

            // Test with node that should not be documented
            const otherNode = { kind: ts.SyntaxKind.StringLiteral };
            ts.isClassDeclaration.mockReturnValueOnce(false);
            ts.isFunctionDeclaration.mockReturnValueOnce(false);
            ts.isInterfaceDeclaration.mockReturnValueOnce(false);
            ts.isMethodDeclaration.mockReturnValueOnce(false);
            ts.isPropertyDeclaration.mockReturnValueOnce(false);
            ts.isEnumDeclaration.mockReturnValueOnce(false);
            ts.isTypeAliasDeclaration.mockReturnValueOnce(false);
            ts.isVariableDeclaration.mockReturnValueOnce(false);
            expect(shouldDocumentNode(otherNode)).toBe(false);
        });

        it('should extract symbol information correctly', () => {
            // Directly access the private method in JavaScript
            const extractSymbolInfo = integration.extractSymbolInfo;

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

            ts.isFunctionLike.mockReturnValueOnce(true);

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
            // Directly access the private method in JavaScript
            const formatDocumentation = integration.formatDocumentation;

            // Test JSDoc format
            let result = formatDocumentation('Line 1\nLine 2', 'jsdoc');
            expect(result).toBe('/**\n * Line 1\n * Line 2\n */');

            // Test TSDoc format
            result = formatDocumentation('Line 1\nLine 2', 'tsdoc');
            expect(result).toBe('/**\n * Line 1\n * Line 2\n */');
        });

        it('should build a proper documentation prompt', () => {
            // Directly access the private method in JavaScript
            const buildDocumentationPrompt = integration.buildDocumentationPrompt;

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

        // JavaScript-specific test for dynamic nature of JS
        it('should handle undefined properties gracefully', () => {
            // Directly access the private method in JavaScript
            const extractSymbolInfo = integration.extractSymbolInfo;

            // Test with minimal node information
            const minimalNode = {
                kind: ts.SyntaxKind.VariableDeclaration,
                // No name, no type, no parameters
            };

            const info = extractSymbolInfo(minimalNode);
            expect(info).toEqual({
                kind: ts.SyntaxKind.VariableDeclaration,
                name: undefined
            });

            // Test with object mutation (JS specific)
            const node = {
                kind: ts.SyntaxKind.ClassDeclaration,
                name: { getText: () => 'TestClass' }
            };

            ts.isClassDeclaration.mockReturnValueOnce(true);

            // After getting info, modify the original node (JavaScript allows this)
            const info2 = extractSymbolInfo(node);
            delete node.name; // Modify after extraction

            // The extracted info should remain intact
            expect(info2.name).toBeDefined();
        });
    });

    describe('dispose', () => {
        it('should dispose resources correctly', () => {
            integration.dispose();
            expect(mockOutputChannel.dispose).toHaveBeenCalled();
        });
    });
});
