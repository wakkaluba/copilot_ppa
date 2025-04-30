import * as vscode from 'vscode';
/**
 * Adds command prefixes to messages based on toggle states
 */
export declare class CommandPrefixer {
    private toggleManager;
    constructor(context: vscode.ExtensionContext);
    /**
     * Add active command prefixes to a message
     */
    prefixMessage(message: string): string;
    /**
     * Register command decorators for a text editor
     */
    registerCommandDecorators(editor: vscode.TextEditor): vscode.Disposable[];
}
