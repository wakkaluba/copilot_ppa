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
exports.CodeSimplifier = void 0;
const vscode = __importStar(require("vscode"));
const providerManager_1 = require("../llm/providerManager");
/**
 * Provides functionality for simplifying code using LLM-based analysis
 */
class CodeSimplifier {
    llmProvider;
    constructor() {
        this.llmProvider = (0, providerManager_1.getCurrentProvider)();
    }
    /**
     * Simplifies the provided code using LLM analysis
     * @param code The code to simplify
     * @param language The programming language of the code
     * @returns Simplified code or null if simplification failed
     */
    async simplifyCode(code, language) {
        if (!this.llmProvider) {
            vscode.window.showErrorMessage('No LLM provider available for code simplification');
            return null;
        }
        try {
            const prompt = this.buildSimplificationPrompt(code, language);
            const response = await this.llmProvider.getCompletion(prompt);
            if (!response) {
                return null;
            }
            // Extract the simplified code from the response
            return this.extractSimplifiedCode(response);
        }
        catch (error) {
            console.error('Error during code simplification:', error);
            vscode.window.showErrorMessage(`Failed to simplify code: ${error}`);
            return null;
        }
    }
    /**
     * Simplifies the code in the active editor
     */
    async simplifyActiveEditorCode() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('No editor is active');
            return;
        }
        const document = editor.document;
        const selection = editor.selection;
        const language = document.languageId;
        // Use selection or entire document
        const code = selection.isEmpty
            ? document.getText()
            : document.getText(selection);
        // Show progress indicator
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Simplifying code...',
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log('Code simplification was cancelled');
            });
            progress.report({ increment: 0 });
            const simplifiedCode = await this.simplifyCode(code, language);
            progress.report({ increment: 100 });
            if (simplifiedCode) {
                // Apply the simplification
                editor.edit(editBuilder => {
                    const range = selection.isEmpty
                        ? new vscode.Range(0, 0, document.lineCount, 0)
                        : selection;
                    editBuilder.replace(range, simplifiedCode);
                });
                vscode.window.showInformationMessage('Code simplified successfully');
            }
        });
    }
    /**
     * Builds the prompt for code simplification
     */
    buildSimplificationPrompt(code, language) {
        return `
You are an expert programmer tasked with simplifying code while maintaining its functionality.
Analyze the following ${language} code and provide a simplified version that:
- Removes unnecessary complexity
- Eliminates redundant code
- Uses more efficient patterns when appropriate
- Improves readability
- Maintains the original functionality

ORIGINAL CODE:
\`\`\`${language}
${code}
\`\`\`

SIMPLIFIED CODE:
`;
    }
    /**
     * Extracts the simplified code from the LLM response
     */
    extractSimplifiedCode(response) {
        // Try to extract code between markdown code blocks if present
        const codeBlockRegex = /```(?:\w+)?\s*([\s\S]+?)\s*```/;
        const match = response.match(codeBlockRegex);
        if (match && match[1]) {
            return match[1].trim();
        }
        // If no code blocks found, use the entire response
        return response.trim();
    }
}
exports.CodeSimplifier = CodeSimplifier;
//# sourceMappingURL=codeSimplifier.js.map