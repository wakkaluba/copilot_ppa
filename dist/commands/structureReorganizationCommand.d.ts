import * as vscode from 'vscode';
/**
 * Command handler for code structure reorganization
 */
export declare class StructureReorganizationCommand {
    private structureReorganizer;
    constructor();
    /**
     * Register the command with VS Code
     */
    register(): vscode.Disposable;
    /**
     * Execute the structure reorganization command
     */
    private executeCommand;
}
