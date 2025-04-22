import * as vscode from 'vscode';
import * as ts from 'typescript';
import { LLMInterface } from '../llm-providers/llmInterface';
import { JSDocTSDocGenerationOptions, JSDocNodeType, TSDocNodeType } from '../types/documentation';

/**
 * Service responsible for handling JSDoc/TSDoc generation and integration
 */
export class JSDocTSDocIntegration {
    private readonly supportedLanguages = ['javascript', 'typescript'];
    private readonly outputChannel: vscode.OutputChannel;

    /**
     * Constructor for the JSDoc/TSDoc integration service
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(
        private readonly llmProvider: LLMInterface
    ) {
        this.outputChannel = vscode.window.createOutputChannel('JSDoc/TSDoc Integration');
    }

    /**
     * Generate documentation for a specific file
     */
    public async generateDocumentation(
        document: vscode.TextDocument,
        options: JSDocTSDocGenerationOptions = {}
    ): Promise<void> {
        try {
            if (!this.supportedLanguages.includes(document.languageId)) {
                throw new Error(`Language ${document.languageId} not supported`);
            }

            const sourceFile = ts.createSourceFile(
                document.fileName,
                document.getText(),
                ts.ScriptTarget.Latest,
                true
            );

            const edits: vscode.TextEdit[] = [];
            this.visitNode(sourceFile, document, edits, options);

            // Apply all edits in a single edit operation
            const workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(document.uri, edits);
            await vscode.workspace.applyEdit(workspaceEdit);

            this.outputChannel.appendLine(`Documentation generated for ${document.fileName}`);

        } catch (error) {
            this.outputChannel.appendLine(`Error generating documentation: ${error}`);
            throw error;
        }
    }

    /**
     * Generate documentation for a specific symbol
     */
    private async generateSymbolDocumentation(
        node: ts.Node,
        existingDoc: string | undefined,
        options: JSDocTSDocGenerationOptions
    ): Promise<string> {
        const nodeType = this.getNodeType(node);
        const symbolInfo = this.extractSymbolInfo(node);
        
        const prompt = this.buildDocumentationPrompt(
            nodeType,
            symbolInfo,
            existingDoc,
            options
        );

        const documentation = await this.llmProvider.generateDocumentation(prompt);
        return this.formatDocumentation(documentation, options.style || 'jsdoc');
    }

    /**
     * Visit AST nodes to find documentation targets
     */
    private visitNode(
        node: ts.Node,
        document: vscode.TextDocument,
        edits: vscode.TextEdit[],
        options: JSDocTSDocGenerationOptions
    ): void {
        if (this.shouldDocumentNode(node)) {
            const existingDoc = this.getExistingDocumentation(node);
            
            if (!existingDoc || options.overwrite) {
                this.generateSymbolDocumentation(node, existingDoc, options)
                    .then(docString => {
                        const position = document.positionAt(node.getStart());
                        const insertPosition = new vscode.Position(position.line, 0);
                        edits.push(vscode.TextEdit.insert(insertPosition, docString + '\n'));
                    })
                    .catch(error => {
                        this.outputChannel.appendLine(
                            `Error generating documentation for symbol: ${error}`
                        );
                    });
            }
        }

        ts.forEachChild(node, child => this.visitNode(child, document, edits, options));
    }

    /**
     * Check if a node should be documented
     */
    private shouldDocumentNode(node: ts.Node): boolean {
        return (
            ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isPropertyDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node) ||
            (ts.isVariableDeclaration(node) && this.isExportedVariable(node))
        );
    }

    /**
     * Check if a variable declaration is exported
     */
    private isExportedVariable(node: ts.VariableDeclaration): boolean {
        const getParentStatement = (n: ts.Node): ts.VariableStatement | undefined => {
            if (!n.parent) return undefined;
            if (ts.isVariableStatement(n.parent)) return n.parent;
            return getParentStatement(n.parent);
        };

        const statement = getParentStatement(node);
        return statement?.modifiers?.some(
            modifier => modifier.kind === ts.SyntaxKind.ExportKeyword
        ) ?? false;
    }

    /**
     * Extract existing documentation from a node
     */
    private getExistingDocumentation(node: ts.Node): string | undefined {
        const jsDocNodes = ts.getJSDocTags(node);
        if (jsDocNodes.length === 0) {
            return undefined;
        }

        const sourceFile = node.getSourceFile();
        const fullText = sourceFile.getFullText();
        const docRanges = jsDocNodes.map(doc => ({
            start: doc.pos,
            end: doc.end
        }));

        return docRanges.map(range => 
            fullText.substring(range.start, range.end).trim()
        ).join('\n');
    }

    /**
     * Extract relevant information from a node for documentation
     */
    private extractSymbolInfo(node: ts.Node): Record<string, any> {
        const info: Record<string, any> = {
            kind: node.kind,
            name: this.getNodeName(node)
        };

        if (ts.isFunctionLike(node)) {
            info['parameters'] = node.parameters.map(param => ({
                name: param.name.getText(),
                type: param.type?.getText()
            }));
            info['returnType'] = node.type?.getText();
        }

        if (ts.isClassDeclaration(node)) {
            info['members'] = node.members.map(member => ({
                name: member.name?.getText(),
                kind: member.kind
            }));
        }

        return info;
    }

    /**
     * Get the name of a node
     */
    private getNodeName(node: ts.Node): string | undefined {
        if (ts.isIdentifier(node)) {
            return node.text;
        }
        if ('name' in node) {
            const name = (node as { name?: ts.Identifier }).name;
            return name?.text;
        }
        return undefined;
    }

    /**
     * Build a documentation prompt for the LLM
     */
    private buildDocumentationPrompt(
        nodeType: JSDocNodeType | TSDocNodeType,
        symbolInfo: Record<string, any>,
        existingDoc: string | undefined,
        options: JSDocTSDocGenerationOptions
    ): string {
        let prompt = `Generate ${options.style || 'jsdoc'} documentation for:\n`;
        prompt += `Type: ${nodeType}\n`;
        prompt += `Name: ${symbolInfo['name'] || 'Anonymous'}\n`;

        if (symbolInfo['parameters']) {
            prompt += 'Parameters:\n';
            symbolInfo['parameters'].forEach((param: { name: string; type: string }) => {
                prompt += `- ${param.name}: ${param.type || 'any'}\n`;
            });
        }

        if (symbolInfo['returnType']) {
            prompt += `Return type: ${symbolInfo['returnType']}\n`;
        }

        if (existingDoc) {
            prompt += `\nExisting documentation:\n${existingDoc}\n`;
        }

        if (options.style === 'tsdoc') {
            prompt += '\nUse TSDoc style documentation.';
        }

        return prompt;
    }

    /**
     * Format the generated documentation
     */
    private formatDocumentation(
        documentation: string,
        style: 'jsdoc' | 'tsdoc'
    ): string {
        const lines = documentation.split('\n').map(line => line.trim());
        const formatted = style === 'jsdoc'
            ? ['/**', ...lines.map(line => ` * ${line}`), ' */']
            : ['/**', ...lines.map(line => ` * ${line}`), ' */'];

        return formatted.join('\n');
    }

    /**
     * Get the type of a node for documentation purposes
     */
    private getNodeType(node: ts.Node): JSDocNodeType | TSDocNodeType {
        if (ts.isClassDeclaration(node)) return 'class';
        if (ts.isInterfaceDeclaration(node)) return 'interface';
        if (ts.isFunctionDeclaration(node)) return 'function';
        if (ts.isMethodDeclaration(node)) return 'method';
        if (ts.isPropertyDeclaration(node)) return 'property';
        if (ts.isEnumDeclaration(node)) return 'enum';
        if (ts.isTypeAliasDeclaration(node)) return 'type';
        if (ts.isVariableDeclaration(node)) return 'variable';
        return 'other';
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
}
