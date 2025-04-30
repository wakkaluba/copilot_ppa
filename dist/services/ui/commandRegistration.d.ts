import * as vscode from 'vscode';
/**
 * Service to register commands and keybindings with VS Code
 */
export declare class CommandRegistrationService {
    private context;
    private registeredCommands;
    constructor(context: vscode.ExtensionContext);
    /**
     * Register all keybindings with VS Code
     */
    registerAllKeybindings(): void;
    /**
     * Register a single command
     */
    private registerCommand;
    /**
     * Update all keybinding contexts
     */
    private updateKeybindingContexts;
    /**
     * Register keyboard shortcut commands
     */
    registerShortcutCommands(): void;
}
/**
 * Initialize the command registration service
 */
export declare function initializeCommandRegistrationService(context: vscode.ExtensionContext): CommandRegistrationService;
/**
 * Get the command registration service instance
 */
export declare function getCommandRegistrationService(): CommandRegistrationService;
