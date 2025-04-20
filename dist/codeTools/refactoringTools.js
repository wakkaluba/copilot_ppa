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
exports.RefactoringTools = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
/**
 * Provides tools for code refactoring
 */
class RefactoringTools {
    outputChannel;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Refactoring');
    }
    /**
     * Initialize the refactoring tools
     */
    async initialize() {
        // Initialization logic
    }
    /**
     * Simplify code in the current editor
     */
    async simplifyCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        const selectedText = selection.isEmpty ? document.getText() : document.getText(selection);
        if (!selectedText.trim()) {
            vscode.window.showWarningMessage('No code selected or document is empty');
            return;
        }
        try {
            this.outputChannel.clear();
            this.outputChannel.show();
            this.outputChannel.appendLine('Analyzing code for simplification...');
            // Get language ID for context
            const languageId = document.languageId;
            // Get the LLM to simplify the code
            // This is a placeholder for the actual LLM call - we'll integrate with the extension's LLM service
            const simplifiedCode = await this.getLLMSimplifiedCode(selectedText, languageId);
            // Show the simplified code in a diff view
            this.showDiffView(document.uri, selectedText, simplifiedCode, selection.isEmpty ? "Entire File" : "Selected Code");
            // Offer to replace the code
            const replaceAction = await vscode.window.showInformationMessage('Apply the simplified code?', 'Replace', 'Cancel');
            if (replaceAction === 'Replace') {
                await editor.edit(editBuilder => {
                    const range = selection.isEmpty ?
                        new vscode.Range(0, 0, document.lineCount, 0) :
                        selection;
                    editBuilder.replace(range, simplifiedCode);
                });
                this.outputChannel.appendLine('Code successfully simplified and replaced');
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error simplifying code: ${error}`);
            vscode.window.showErrorMessage(`Failed to simplify code: ${error}`);
        }
    }
    /**
     * Remove unused code (dead code) in the current editor
     */
    async removeUnusedCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found');
            return;
        }
        const document = editor.document;
        const text = document.getText();
        if (!text.trim()) {
            vscode.window.showWarningMessage('Document is empty');
            return;
        }
        try {
            this.outputChannel.clear();
            this.outputChannel.show();
            this.outputChannel.appendLine('Analyzing code to detect unused elements...');
            // Get language ID for context
            const languageId = document.languageId;
            // Call the language-specific analyzer
            switch (languageId) {
                case 'javascript':
                case 'typescript':
                case 'javascriptreact':
                case 'typescriptreact':
                    await this.removeUnusedJSCode(document);
                    break;
                case 'python':
                    await this.removeUnusedPythonCode(document);
                    break;
                default:
                    // For unsupported languages, use a generic approach with the LLM
                    await this.removeUnusedCodeGeneric(document);
                    break;
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error removing unused code: ${error}`);
            vscode.window.showErrorMessage(`Failed to remove unused code: ${error}`);
        }
    }
    /**
     * Remove unused JavaScript/TypeScript code using static analysis tools
     */
    async removeUnusedJSCode(document) {
        // We'll use ESLint with no-unused-vars and no-dead-code plugins
        // This is a placeholder for the actual implementation
        const text = document.getText();
        // For now, we'll use the LLM to identify unused code
        const cleanedCode = await this.getLLMCleanedCode(text, document.languageId);
        // Show the cleaned code in a diff view
        this.showDiffView(document.uri, text, cleanedCode, "Entire File (Unused Code Removed)");
        // Offer to replace the code
        const replaceAction = await vscode.window.showInformationMessage('Apply the code with unused elements removed?', 'Replace', 'Cancel');
        if (replaceAction === 'Replace') {
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const range = new vscode.Range(0, 0, document.lineCount, 0);
                editBuilder.replace(range, cleanedCode);
            });
            this.outputChannel.appendLine('Unused code successfully removed');
        }
    }
    /**
     * Remove unused Python code
     */
    async removeUnusedPythonCode(document) {
        // We'll use pyflakes or vulture to identify unused code
        // This is a placeholder for the actual implementation
        const text = document.getText();
        // For now, we'll use the LLM to identify unused code
        const cleanedCode = await this.getLLMCleanedCode(text, document.languageId);
        // Show the cleaned code in a diff view
        this.showDiffView(document.uri, text, cleanedCode, "Entire File (Unused Code Removed)");
        // Offer to replace the code
        const replaceAction = await vscode.window.showInformationMessage('Apply the code with unused elements removed?', 'Replace', 'Cancel');
        if (replaceAction === 'Replace') {
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const range = new vscode.Range(0, 0, document.lineCount, 0);
                editBuilder.replace(range, cleanedCode);
            });
            this.outputChannel.appendLine('Unused code successfully removed');
        }
    }
    /**
     * Generic approach to remove unused code using the LLM
     */
    async removeUnusedCodeGeneric(document) {
        const text = document.getText();
        // Use the LLM to identify unused code
        const cleanedCode = await this.getLLMCleanedCode(text, document.languageId);
        // Show the cleaned code in a diff view
        this.showDiffView(document.uri, text, cleanedCode, "Entire File (Unused Code Removed)");
        // Offer to replace the code
        const replaceAction = await vscode.window.showInformationMessage('Apply the code with unused elements removed?', 'Replace', 'Cancel');
        if (replaceAction === 'Replace') {
            const editor = await vscode.window.showTextDocument(document);
            await editor.edit(editBuilder => {
                const range = new vscode.Range(0, 0, document.lineCount, 0);
                editBuilder.replace(range, cleanedCode);
            });
            this.outputChannel.appendLine('Unused code successfully removed');
        }
    }
    /**
     * Get simplified code from LLM (placeholder - will integrate with LLM service)
     */
    async getLLMSimplifiedCode(code, languageId) {
        // This is a placeholder for the actual LLM call
        // In a real implementation, this would call the extension's LLM service
        // Mock response for now
        return code
            .replace(/\/\/ TODO:.+\n/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n');
    }
    /**
     * Get code with unused elements removed (placeholder - will integrate with LLM service)
     */
    async getLLMCleanedCode(code, languageId) {
        // This is a placeholder for the actual LLM call
        // In a real implementation, this would call the extension's LLM service
        // Mock response for now - simplify by removing comments and extra whitespace
        return code
            .replace(/\/\/ TODO:.+\n/g, '')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\n\s*\n\s*\n/g, '\n\n');
    }
    /**
     * Show a diff view between original and new code
     */
    showDiffView(uri, originalCode, newCode, title) {
        const originalUri = uri.with({ scheme: 'original', path: uri.path + '.original' });
        const newUri = uri.with({ scheme: 'modified', path: uri.path + '.modified' });
        const originalDocument = vscode.workspace.openTextDocument(originalUri);
        const newDocument = vscode.workspace.openTextDocument(newUri);
        // Register content provider for our URIs
        vscode.workspace.registerTextDocumentContentProvider('original', {
            provideTextDocumentContent: () => originalCode
        });
        vscode.workspace.registerTextDocumentContentProvider('modified', {
            provideTextDocumentContent: () => newCode
        });
        // Show diff
        vscode.commands.executeCommand('vscode.diff', originalUri, newUri, `${title}: ${path.basename(uri.fsPath)}`);
    }
    /**
     * Dispose resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.RefactoringTools = RefactoringTools;
//# sourceMappingURL=refactoringTools.js.map