import * as vscode from 'vscode';
/**
 * Service to display code differences
 */
export declare class CodeDiffService {
    /**
     * Show diff between original and modified code
     * @param uri Original file URI
     * @param originalContent Original content
     * @param modifiedContent Modified content
     * @param title Diff title
     */
    showDiff(uri: vscode.Uri, originalContent: string, modifiedContent: string, title: string): Promise<void>;
}
