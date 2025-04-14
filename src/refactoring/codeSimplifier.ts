import * as vscode from 'vscode';
import { LLMProvider } from '../llm/llmProvider';
import { getCurrentProvider } from '../llm/providerManager';

/**
 * Provides functionality for simplifying code using LLM-based analysis
 */
export class CodeSimplifier {
    private llmProvider: LLMProvider | undefined;

    constructor() {
        this.llmProvider = getCurrentProvider();
    }

    /**
     * Simplifies the provided code using LLM analysis
     * @param code The code to simplify
     * @param language The programming language of the code
     * @returns Simplified code or null if simplification failed
     */
    public async simplifyCode(code: string, language: string): Promise<string | null> {
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
        } catch (error) {
            console.error('Error during code simplification:', error);
            vscode.window.showErrorMessage(`Failed to simplify code: ${error}`);
            return null;
        }
    }

    /**
     * Simplifies the code in the active editor
     */
    public async simplifyActiveEditorCode(): Promise<void> {
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
    private buildSimplificationPrompt(code: string, language: string): string {
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
    private extractSimplifiedCode(response: string): string {
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
