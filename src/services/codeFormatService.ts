import * as vscode from 'vscode';
import * as path from 'path';

export class CodeFormatService {
    constructor() {}

    /**
     * Format the active document or selected text
     */
    public async formatCode(): Promise<boolean> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return false;
        }

        try {
            // If there's a selection, only format that range
            if (!editor.selection.isEmpty) {
                return await vscode.commands.executeCommand('editor.action.formatSelection');
            } else {
                // Otherwise format the entire document
                return await vscode.commands.executeCommand('editor.action.formatDocument');
            }
        } catch (error) {
            console.error('Error formatting code:', error);
            vscode.window.showErrorMessage(`Failed to format code: ${error}`);
            return false;
        }
    }

    /**
     * Optimize imports in the current file
     */
    public async optimizeImports(): Promise<boolean> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return false;
        }

        try {
            const document = editor.document;
            const fileExtension = path.extname(document.fileName);

            // Based on file type, execute the appropriate organize imports command
            switch (fileExtension) {
                case '.ts':
                case '.tsx':
                case '.js':
                case '.jsx':
                    // For TypeScript/JavaScript files
                    return await vscode.commands.executeCommand('typescript.organizeImports');
                
                case '.py':
                    // For Python files, if isort or other extension is available
                    return await vscode.commands.executeCommand('python.sortImports');
                
                case '.java':
                    // For Java files, if Java extension is available
                    return await vscode.commands.executeCommand('java.action.organizeImports');
                
                default:
                    vscode.window.showInformationMessage(
                        `Import optimization not supported for ${fileExtension} files`
                    );
                    return false;
            }
        } catch (error) {
            console.error('Error optimizing imports:', error);
            vscode.window.showErrorMessage(`Failed to optimize imports: ${error}`);
            return false;
        }
    }

    /**
     * Apply code style rules to fix common issues
     */
    public async applyCodeStyle(): Promise<boolean> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return false;
        }

        try {
            // First try to fix using ESLint
            const eslintResult = await vscode.commands.executeCommand('eslint.executeAutofix');
            
            // Then format the document
            await this.formatCode();
            
            return true;
        } catch (error) {
            console.error('Error applying code style:', error);
            vscode.window.showErrorMessage(`Failed to apply code style: ${error}`);
            return false;
        }
    }

    /**
     * Comprehensive code optimization including formatting, imports, and style fixes
     */
    public async optimizeCode(): Promise<boolean> {
        try {
            // Apply these steps in sequence
            await this.optimizeImports();
            await this.applyCodeStyle();
            await this.formatCode();
            
            vscode.window.showInformationMessage('Code optimization completed');
            return true;
        } catch (error) {
            console.error('Error during code optimization:', error);
            vscode.window.showErrorMessage(`Failed to optimize code: ${error}`);
            return false;
        }
    }
}
