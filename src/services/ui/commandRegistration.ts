import * as vscode from 'vscode';
import { getKeybindingManager } from './keybindingManager';

/**
 * Service to register commands and keybindings with VS Code
 */
export class CommandRegistrationService {
    private registeredCommands: Set<string> = new Set();
    
    constructor(private context: vscode.ExtensionContext) {}
    
    /**
     * Register all keybindings with VS Code
     */
    public registerAllKeybindings(): void {
        const keybindingManager = getKeybindingManager();
        const keybindings = keybindingManager.getKeybindings();
        
        for (const keybinding of keybindings) {
            this.registerCommand(keybinding.command, keybinding.id);
        }
        
        // Register an event listener for keybinding changes
        this.context.subscriptions.push(
            vscode.commands.registerCommand('copilotPPA.keybindingsChanged', () => {
                this.updateKeybindingContexts();
            })
        );
    }
    
    /**
     * Register a single command
     */
    private registerCommand(commandId: string, keybindingId: string): void {
        // Skip if already registered or not a custom command
        if (this.registeredCommands.has(commandId) || !commandId.startsWith('copilotPPA.')) {
            return;
        }
        
        // Set the context for when clauses
        const keybindingManager = getKeybindingManager();
        const keybinding = keybindingManager.getKeybinding(keybindingId);
        
        if (keybinding) {
            vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${keybindingId}`, keybinding.key);
            if (keybinding.when) {
                vscode.commands.executeCommand('setContext', `${keybindingId}.when`, keybinding.when);
            }
        }
        
        this.registeredCommands.add(commandId);
    }
    
    /**
     * Update all keybinding contexts
     */
    private updateKeybindingContexts(): void {
        const keybindingManager = getKeybindingManager();
        const keybindings = keybindingManager.getKeybindings();
        
        for (const keybinding of keybindings) {
            if (keybinding.command.startsWith('copilotPPA.')) {
                vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${keybinding.id}`, keybinding.key);
                if (keybinding.when) {
                    vscode.commands.executeCommand('setContext', `${keybinding.id}.when`, keybinding.when);
                }
            }
        }
    }
    
    /**
     * Register keyboard shortcut commands
     */
    public registerShortcutCommands(): void {
        // Register command to open keyboard shortcuts panel
        this.context.subscriptions.push(
            vscode.commands.registerCommand('copilotPPA.openKeyboardShortcuts', () => {
                vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
            })
        );

        // Chat commands
        this.context.subscriptions.push(
            // Send message command
            vscode.commands.registerCommand('copilotPPA.sendMessage', async () => {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.uri.scheme === 'chat') {
                    const text = editor.document.getText();
                    if (text.trim()) {
                        await vscode.commands.executeCommand('chat.sendMessage', { text });
                    }
                }
            }),

            // New line in chat command
            vscode.commands.registerCommand('copilotPPA.newLine', () => {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.uri.scheme === 'chat') {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, '\n');
                    });
                }
            }),

            // Clear chat command
            vscode.commands.registerCommand('copilotPPA.clearChat', async () => {
                await vscode.commands.executeCommand('chat.clearHistory');
                vscode.window.showInformationMessage('Chat history cleared');
            })
        );

        // Code commands
        this.context.subscriptions.push(
            // Explain code command
            vscode.commands.registerCommand('copilotPPA.explainCode', async () => {
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    await vscode.commands.executeCommand('chat.explain', { code: selectedText });
                } else {
                    vscode.window.showWarningMessage('Please select some code to explain.');
                }
            }),

            // Refactor code command
            vscode.commands.registerCommand('copilotPPA.refactorCode', async () => {
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    await vscode.commands.executeCommand('chat.refactor', { code: selectedText });
                } else {
                    vscode.window.showWarningMessage('Please select some code to refactor.');
                }
            }),

            // Document code command
            vscode.commands.registerCommand('copilotPPA.documentCode', async () => {
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    await vscode.commands.executeCommand('chat.document', { code: selectedText });
                } else {
                    vscode.window.showWarningMessage('Please select some code to document.');
                }
            })
        );

        // Navigation commands
        this.context.subscriptions.push(
            // Focus chat command
            vscode.commands.registerCommand('copilotPPA.focusChat', () => {
                vscode.commands.executeCommand('workbench.action.focusPanel', 'chat');
            }),

            // Toggle sidebar command
            vscode.commands.registerCommand('copilotPPA.toggleSidebar', () => {
                vscode.commands.executeCommand('workbench.view.extension.copilotPPA');
            })
        );
    }
}

// Singleton instance
let commandRegistrationService: CommandRegistrationService | undefined;

/**
 * Initialize the command registration service
 */
export function initializeCommandRegistrationService(context: vscode.ExtensionContext): CommandRegistrationService {
    commandRegistrationService = new CommandRegistrationService(context);
    return commandRegistrationService;
}

/**
 * Get the command registration service instance
 */
export function getCommandRegistrationService(): CommandRegistrationService {
    if (!commandRegistrationService) {
        throw new Error('Command Registration Service not initialized');
    }
    return commandRegistrationService;
}
