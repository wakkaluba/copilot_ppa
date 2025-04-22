"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSDocTSDocIntegration = void 0;
const vscode = __importStar(require("vscode"));
const ts = __importStar(require("typescript"));
/**
 * Service responsible for handling JSDoc/TSDoc generation and integration
 */
class JSDocTSDocIntegration {
    llmProvider;
    supportedLanguages = ['javascript', 'typescript'];
    outputChannel;
    /**
     * Constructor for the JSDoc/TSDoc integration service
     * @param llmProvider The LLM provider to use for generating documentation
     */
    constructor(llmProvider) {
        this.llmProvider = llmProvider;
        this.outputChannel = vscode.window.createOutputChannel('JSDoc/TSDoc Integration');
    }
    /**
     * Generate documentation for a specific file
     */
    async generateDocumentation(document, options = {}) {
        try {
            if (!this.supportedLanguages.includes(document.languageId)) {
                throw new Error(`Language ${document.languageId} not supported`);
            }
            const sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
            const edits = [];
            this.visitNode(sourceFile, document, edits, options);
            // Apply all edits in a single edit operation
            const workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(document.uri, edits);
            await vscode.workspace.applyEdit(workspaceEdit);
            this.outputChannel.appendLine(`Documentation generated for ${document.fileName}`);
        }
        catch (error) {
            this.outputChannel.appendLine(`Error generating documentation: ${error}`);
            throw error;
        }
    }
    /**
     * Generate documentation for a specific symbol
     */
    async generateSymbolDocumentation(node, existingDoc, options) {
        const nodeType = this.getNodeType(node);
        const symbolInfo = this.extractSymbolInfo(node);
        const prompt = this.buildDocumentationPrompt(nodeType, symbolInfo, existingDoc, options);
        const documentation = await this.llmProvider.generateDocumentation(prompt);
        return this.formatDocumentation(documentation, options.style || 'jsdoc');
    }
    /**
     * Visit AST nodes to find documentation targets
     */
    visitNode(node, document, edits, options) {
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
                    this.outputChannel.appendLine(`Error generating documentation for symbol: ${error}`);
                });
            }
        }
        ts.forEachChild(node, child => this.visitNode(child, document, edits, options));
    }
    /**
     * Check if a node should be documented
     */
    shouldDocumentNode(node) {
        return (ts.isClassDeclaration(node) ||
            ts.isInterfaceDeclaration(node) ||
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isPropertyDeclaration(node) ||
            ts.isEnumDeclaration(node) ||
            ts.isTypeAliasDeclaration(node) ||
            (ts.isVariableDeclaration(node) && this.isExportedVariable(node)));
    }
    /**
     * Check if a variable declaration is exported
     */
    isExportedVariable(node) {
        const getParentStatement = (n) => {
            if (!n.parent)
                return undefined;
            if (ts.isVariableStatement(n.parent))
                return n.parent;
            return getParentStatement(n.parent);
        };
        const statement = getParentStatement(node);
        return statement?.modifiers?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
    }
    /**
     * Extract existing documentation from a node
     */
    getExistingDocumentation(node) {
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
        return docRanges.map(range => fullText.substring(range.start, range.end).trim()).join('\n');
    }
    /**
     * Extract relevant information from a node for documentation
     */
    extractSymbolInfo(node) {
        const info = {
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
    getNodeName(node) {
        if (ts.isIdentifier(node)) {
            return node.text;
        }
        if ('name' in node) {
            const name = node.name;
            return name?.text;
        }
        return undefined;
    }
    /**
     * Build a documentation prompt for the LLM
     */
    buildDocumentationPrompt(nodeType, symbolInfo, existingDoc, options) {
        let prompt = `Generate ${options.style || 'jsdoc'} documentation for:\n`;
        prompt += `Type: ${nodeType}\n`;
        prompt += `Name: ${symbolInfo['name'] || 'Anonymous'}\n`;
        if (symbolInfo['parameters']) {
            prompt += 'Parameters:\n';
            symbolInfo['parameters'].forEach((param) => {
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
    formatDocumentation(documentation, style) {
        const lines = documentation.split('\n').map(line => line.trim());
        const formatted = style === 'jsdoc'
            ? ['/**', ...lines.map(line => ` * ${line}`), ' */']
            : ['/**', ...lines.map(line => ` * ${line}`), ' */'];
        return formatted.join('\n');
    }
    /**
     * Get the type of a node for documentation purposes
     */
    getNodeType(node) {
        if (ts.isClassDeclaration(node))
            return 'class';
        if (ts.isInterfaceDeclaration(node))
            return 'interface';
        if (ts.isFunctionDeclaration(node))
            return 'function';
        if (ts.isMethodDeclaration(node))
            return 'method';
        if (ts.isPropertyDeclaration(node))
            return 'property';
        if (ts.isEnumDeclaration(node))
            return 'enum';
        if (ts.isTypeAliasDeclaration(node))
            return 'type';
        if (ts.isVariableDeclaration(node))
            return 'variable';
        return 'other';
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.JSDocTSDocIntegration = JSDocTSDocIntegration;
//# sourceMappingURL=jsdocTsDocIntegration.js.map