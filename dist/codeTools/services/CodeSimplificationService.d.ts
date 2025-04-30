import * as vscode from 'vscode';
/**
 * Service to simplify code by applying best practices and removing unnecessary complexity
 */
export declare class CodeSimplificationService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Get content from the editor
     * @param editor Active text editor
     * @returns Object containing text and selection
     */
    getEditorContent(editor: vscode.TextEditor): Promise<{
        text: string;
        selection: vscode.Selection;
    }>;
    /**
     * Simplify code by applying best practices
     * @param text Code to simplify
     * @param languageId Language identifier
     * @returns Simplified code
     */
    simplifyCode(text: string, languageId: string): Promise<string>;
}
