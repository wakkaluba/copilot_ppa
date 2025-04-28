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
exports.CodeFormatService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class CodeFormatService {
    constructor() { }
    /**
     * Format the active document or selected text
     */
    async formatCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return false;
        }
        try {
            // If there's a selection, only format that range
            if (!editor.selection.isEmpty) {
                return await vscode.commands.executeCommand('editor.action.formatSelection');
            }
            else {
                // Otherwise format the entire document
                return await vscode.commands.executeCommand('editor.action.formatDocument');
            }
        }
        catch (error) {
            console.error('Error formatting code:', error);
            vscode.window.showErrorMessage(`Failed to format code: ${error}`);
            return false;
        }
    }
    /**
     * Optimize imports in the current file
     */
    async optimizeImports() {
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
                    vscode.window.showInformationMessage(`Import optimization not supported for ${fileExtension} files`);
                    return false;
            }
        }
        catch (error) {
            console.error('Error optimizing imports:', error);
            vscode.window.showErrorMessage(`Failed to optimize imports: ${error}`);
            return false;
        }
    }
    /**
     * Apply code style rules to fix common issues
     */
    async applyCodeStyle() {
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
        }
        catch (error) {
            console.error('Error applying code style:', error);
            vscode.window.showErrorMessage(`Failed to apply code style: ${error}`);
            return false;
        }
    }
    /**
     * Comprehensive code optimization including formatting, imports, and style fixes
     */
    async optimizeCode() {
        try {
            // Apply these steps in sequence
            await this.optimizeImports();
            await this.applyCodeStyle();
            await this.formatCode();
            vscode.window.showInformationMessage('Code optimization completed');
            return true;
        }
        catch (error) {
            console.error('Error during code optimization:', error);
            vscode.window.showErrorMessage(`Failed to optimize code: ${error}`);
            return false;
        }
    }
}
exports.CodeFormatService = CodeFormatService;
//# sourceMappingURL=codeFormatService.js.map