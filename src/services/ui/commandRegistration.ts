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
        vscode.commands.registerCommand('copilotPPA.keybindingsChanged', () => {
            this.updateKeybindingContexts();
        });
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
            }
        }
    }
    
    /**
     * Register keyboard shortcut commands
     */
    public registerShortcutCommands(): void {
        // Register the command to open UI settings panel
        this.context.subscriptions.push(
            vscode.commands.registerCommand('copilotPPA.openKeyboardShortcuts', () => {
                vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
            })
        );
        
        // Add additional shortcut-specific commands here
        this.context.subscriptions.push(
            vscode.commands.registerCommand('copilotPPA.sendMessage', () => {
                // Implementation for sending message
                vscode.window.showInformationMessage('Message sent!');
            }),
            
            vscode.commands.registerCommand('copilotPPA.newLine', () => {
                // Implementation for new line in chat input
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit(editBuilder => {
                        editBuilder.insert(editor.selection.active, '\n');
                    });
                }
            }),
            
            vscode.commands.registerCommand('copilotPPA.clearChat', () => {
                // Implementation for clearing chat
                vscode.window.showInformationMessage('Chat cleared!');
            }),
            
            vscode.commands.registerCommand('copilotPPA.explainCode', () => {
                // Implementation for explaining code
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    vscode.window.showInformationMessage(`Explaining code: ${selectedText.substring(0, 50)}...`);
                } else {
                    vscode.window.showWarningMessage('Please select some code to explain.');
                }
            }),
            
            vscode.commands.registerCommand('copilotPPA.refactorCode', () => {
                // Implementation for refactoring code
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    vscode.window.showInformationMessage(`Refactoring code: ${selectedText.substring(0, 50)}...`);
                } else {
                    vscode.window.showWarningMessage('Please select some code to refactor.');
                }
            }),
            
            vscode.commands.registerCommand('copilotPPA.documentCode', () => {
                // Implementation for documenting code
                const editor = vscode.window.activeTextEditor;
                if (editor && !editor.selection.isEmpty) {
                    const selectedText = editor.document.getText(editor.selection);
                    vscode.window.showInformationMessage(`Documenting code: ${selectedText.substring(0, 50)}...`);
                } else {
                    vscode.window.showWarningMessage('Please select some code to document.');
                }
            }),
            
            vscode.commands.registerCommand('copilotPPA.focusChat', () => {
                // Implementation for focusing chat
                vscode.window.showInformationMessage('Chat input focused!');
            }),
            
            vscode.commands.registerCommand('copilotPPA.toggleSidebar', () => {
                // Implementation for toggling sidebar
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
