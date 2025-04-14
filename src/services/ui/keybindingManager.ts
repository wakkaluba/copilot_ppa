import * as vscode from 'vscode';

/**
 * Keybinding definition
 */
export interface Keybinding {
    /**
     * Unique ID for the keybinding
     */
    id: string;
    
    /**
     * Human-readable description
     */
    description: string;
    
    /**
     * The command to execute
     */
    command: string;
    
    /**
     * Keyboard shortcut
     */
    key: string;
    
    /**
     * When clause for when the keybinding is active
     */
    when?: string;
    
    /**
     * Is this a default keybinding
     */
    isDefault: boolean;
}

/**
 * Manager for custom keybindings
 */
export class KeybindingManager {
    private keybindings: Map<string, Keybinding> = new Map();
    
    constructor(private context: vscode.ExtensionContext) {
        // Register default keybindings
        this.registerDefaultKeybindings();
        
        // Load any custom keybindings
        this.loadCustomKeybindings();
    }
    
    /**
     * Get all keybindings
     */
    public getKeybindings(): Keybinding[] {
        return Array.from(this.keybindings.values());
    }
    
    /**
     * Get a keybinding by ID
     */
    public getKeybinding(id: string): Keybinding | undefined {
        return this.keybindings.get(id);
    }
    
    /**
     * Update a keybinding
     */
    public updateKeybinding(id: string, keyShortcut: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (!keybinding) {
            return false;
        }
        
        // Update the key
        keybinding.key = keyShortcut;
        
        // Save changes
        this.saveCustomKeybindings();
        
        // Notify VS Code of change if it involves a registered command
        if (keybinding.command.startsWith('copilotPPA.')) {
            vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${id}`, keyShortcut);
        }
        
        return true;
    }
    
    /**
     * Reset a keybinding to its default
     */
    public resetKeybinding(id: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (!keybinding || keybinding.isDefault) {
            return false;
        }
        
        // Find the default keybinding
        const defaultKeybinding = this.getDefaultKeybinding(id);
        if (!defaultKeybinding) {
            return false;
        }
        
        // Reset to default
        keybinding.key = defaultKeybinding.key;
        keybinding.isDefault = true;
        
        // Save changes
        this.saveCustomKeybindings();
        
        // Notify VS Code of change
        if (keybinding.command.startsWith('copilotPPA.')) {
            vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${id}`, keybinding.key);
        }
        
        return true;
    }
    
    /**
     * Reset all keybindings to defaults
     */
    public resetAllKeybindings(): void {
        // Re-register default keybindings
        this.registerDefaultKeybindings();
        
        // Clear any custom overrides
        this.context.globalState.update('copilotPPA.customKeybindings', undefined);
        
        // Notify of changes
        vscode.commands.executeCommand('copilotPPA.keybindingsChanged');
    }
    
    /**
     * Register default keybindings
     */
    private registerDefaultKeybindings(): void {
        const defaults: Keybinding[] = [
            // Chat actions
            {
                id: 'sendMessage',
                description: 'Send a message to the agent',
                command: 'copilotPPA.sendMessage',
                key: 'Enter',
                when: 'copilotPPA.chatInputFocused && !event.shiftKey',
                isDefault: true
            },
            {
                id: 'newLine',
                description: 'Insert a new line in the chat input',
                command: 'copilotPPA.newLine',
                key: 'Shift+Enter',
                when: 'copilotPPA.chatInputFocused',
                isDefault: true
            },
            {
                id: 'clearChat',
                description: 'Clear the chat',
                command: 'copilotPPA.clearChat',
                key: 'Ctrl+L',
                when: 'copilotPPA.chatViewFocused',
                isDefault: true
            },
            
            // Code actions
            {
                id: 'explainCode',
                description: 'Explain selected code',
                command: 'copilotPPA.explainCode',
                key: 'Ctrl+Shift+E',
                when: 'editorHasSelection',
                isDefault: true
            },
            {
                id: 'refactorCode',
                description: 'Refactor selected code',
                command: 'copilotPPA.refactorCode',
                key: 'Ctrl+Shift+R',
                when: 'editorHasSelection',
                isDefault: true
            },
            {
                id: 'documentCode',
                description: 'Document selected code',
                command: 'copilotPPA.documentCode',
                key: 'Ctrl+Shift+D',
                when: 'editorHasSelection',
                isDefault: true
            },
            
            // Other actions
            {
                id: 'focusChat',
                description: 'Focus the chat input',
                command: 'copilotPPA.focusChat',
                key: 'Ctrl+Shift+Space',
                isDefault: true
            },
            {
                id: 'toggleSidebar',
                description: 'Toggle the agent sidebar',
                command: 'copilotPPA.toggleSidebar',
                key: 'Ctrl+Shift+A',
                isDefault: true
            }
        ];
        
        // Register each default keybinding
        for (const keybinding of defaults) {
            this.keybindings.set(keybinding.id, keybinding);
        }
    }
    
    /**
     * Get the default keybinding for an ID
     */
    private getDefaultKeybinding(id: string): Keybinding | undefined {
        const defaults = [
            {
                id: 'sendMessage',
                description: 'Send a message to the agent',
                command: 'copilotPPA.sendMessage',
                key: 'Enter',
                when: 'copilotPPA.chatInputFocused && !event.shiftKey',
                isDefault: true
            },
            {
                id: 'newLine',
                description: 'Insert a new line in the chat input',
                command: 'copilotPPA.newLine',
                key: 'Shift+Enter',
                when: 'copilotPPA.chatInputFocused',
                isDefault: true
            },
            {
                id: 'clearChat',
                description: 'Clear the chat',
                command: 'copilotPPA.clearChat',
                key: 'Ctrl+L',
                when: 'copilotPPA.chatViewFocused',
                isDefault: true
            },
            {
                id: 'explainCode',
                description: 'Explain selected code',
                command: 'copilotPPA.explainCode',
                key: 'Ctrl+Shift+E',
                when: 'editorHasSelection',
                isDefault: true
            },
            {
                id: 'refactorCode',
                description: 'Refactor selected code',
                command: 'copilotPPA.refactorCode',
                key: 'Ctrl+Shift+R',
                when: 'editorHasSelection',
                isDefault: true
            },
            {
                id: 'documentCode',
                description: 'Document selected code',
                command: 'copilotPPA.documentCode',
                key: 'Ctrl+Shift+D',
                when: 'editorHasSelection',
                isDefault: true
            },
            {
                id: 'focusChat',
                description: 'Focus the chat input',
                command: 'copilotPPA.focusChat',
                key: 'Ctrl+Shift+Space',
                isDefault: true
            },
            {
                id: 'toggleSidebar',
                description: 'Toggle the agent sidebar',
                command: 'copilotPPA.toggleSidebar',
                key: 'Ctrl+Shift+A',
                isDefault: true
            }
        ];
        
        return defaults.find(kb => kb.id === id);
    }
    
    /**
     * Load custom keybindings from storage
     */
    private loadCustomKeybindings(): void {
        const customKeybindings = this.context.globalState.get<Record<string, string>>('copilotPPA.customKeybindings', {});
        
        // Apply custom keybindings over defaults
        for (const [id, key] of Object.entries(customKeybindings)) {
            const keybinding = this.keybindings.get(id);
            if (keybinding) {
                keybinding.key = key;
                keybinding.isDefault = false;
            }
        }
    }
    
    /**
     * Save custom keybindings to storage
     */
    private saveCustomKeybindings(): void {
        const customKeybindings: Record<string, string> = {};
        
        // Collect non-default keybindings
        for (const [id, keybinding] of this.keybindings.entries()) {
            if (!keybinding.isDefault) {
                customKeybindings[id] = keybinding.key;
            }
        }
        
        this.context.globalState.update('copilotPPA.customKeybindings', customKeybindings);
    }
    
    /**
     * Get keybindings in VS Code format for package.json
     */
    public getVSCodeKeybindings(): any[] {
        return this.getKeybindings().map(kb => ({
            key: kb.key,
            command: kb.command,
            when: kb.when
        }));
    }
}

// Singleton instance
let keybindingManager: KeybindingManager | undefined;

/**
 * Initialize the keybinding manager
 */
export function initializeKeybindingManager(context: vscode.ExtensionContext): KeybindingManager {
    keybindingManager = new KeybindingManager(context);
    return keybindingManager;
}

/**
 * Get the keybinding manager instance
 */
export function getKeybindingManager(): KeybindingManager {
    if (!keybindingManager) {
        throw new Error('Keybinding Manager not initialized');
    }
    return keybindingManager;
}
