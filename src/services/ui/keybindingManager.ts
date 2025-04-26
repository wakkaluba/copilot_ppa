import * as vscode from 'vscode';

/**
 * Keybinding category for grouping shortcuts
 */
export enum KeybindingCategory {
    Chat = 'Chat Actions',
    Code = 'Code Actions',
    Navigation = 'Navigation',
    Other = 'Other'
}

/**
 * Keybinding definition interface
 */
export interface Keybinding {
    /** Unique ID for the keybinding */
    id: string;
    
    /** Human-readable description */
    description: string;
    
    /** The command to execute */
    command: string;
    
    /** Keyboard shortcut */
    key: string;
    
    /** When clause for when the keybinding is active */
    when?: string;
    
    /** Category for grouping */
    category: KeybindingCategory;
    
    /** Is this a default keybinding */
    isDefault: boolean;
}

/**
 * Manager for custom keybindings
 */
export class KeybindingManager {
    private keybindings: Map<string, Keybinding> = new Map();
    private readonly STORAGE_KEY = 'copilotPPA.customKeybindings';
    
    constructor(private readonly context: vscode.ExtensionContext) {
        this.registerDefaultKeybindings();
        this.loadCustomKeybindings();
    }

    /**
     * Get all registered keybindings
     */
    public getKeybindings(): Keybinding[] {
        return Array.from(this.keybindings.values());
    }

    /**
     * Get a specific keybinding by ID
     */
    public getKeybinding(id: string): Keybinding | undefined {
        return this.keybindings.get(id);
    }

    /**
     * Update a keybinding's key combination
     */
    public updateKeybinding(id: string, keyShortcut: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (!keybinding) {
            return false;
        }

        keybinding.key = keyShortcut;
        keybinding.isDefault = false;
        this.saveCustomKeybindings();

        if (this.isCustomCommand(keybinding.command)) {
            this.updateVSCodeContext(id, keyShortcut);
        }

        return true;
    }

    /**
     * Reset a keybinding to its default value
     */
    public resetKeybinding(id: string): boolean {
        const keybinding = this.keybindings.get(id);
        if (!keybinding || keybinding.isDefault) {
            return false;
        }

        const defaultKeybinding = this.getDefaultKeybinding(id);
        if (!defaultKeybinding) {
            return false;
        }

        keybinding.key = defaultKeybinding.key;
        keybinding.isDefault = true;
        this.saveCustomKeybindings();

        if (this.isCustomCommand(keybinding.command)) {
            this.updateVSCodeContext(id, keybinding.key);
        }

        return true;
    }

    /**
     * Reset all keybindings to their defaults
     */
    public resetAllKeybindings(): void {
        this.registerDefaultKeybindings();
        this.context.globalState.update(this.STORAGE_KEY, undefined);
        vscode.commands.executeCommand('copilotPPA.keybindingsChanged');
    }

    /**
     * Get keybindings in VS Code's package.json format
     */
    public getVSCodeKeybindings(): Array<{ key: string; command: string; when?: string | undefined }> {
        return this.getKeybindings().map(kb => ({
            key: kb.key,
            command: kb.command,
            ...(kb.when ? { when: kb.when } : {})
        }));
    }

    private registerDefaultKeybindings(): void {
        const defaults: Keybinding[] = [
            // Chat actions
            {
                id: 'sendMessage',
                description: 'Send a message to the agent',
                command: 'copilotPPA.sendMessage',
                key: 'Enter',
                when: 'copilotPPA.chatInputFocused && !event.shiftKey',
                category: KeybindingCategory.Chat,
                isDefault: true
            },
            {
                id: 'newLine',
                description: 'Insert a new line in the chat input',
                command: 'copilotPPA.newLine',
                key: 'Shift+Enter',
                when: 'copilotPPA.chatInputFocused',
                category: KeybindingCategory.Chat,
                isDefault: true
            },
            {
                id: 'clearChat',
                description: 'Clear the chat',
                command: 'copilotPPA.clearChat',
                key: 'Ctrl+L',
                when: 'copilotPPA.chatViewFocused',
                category: KeybindingCategory.Chat,
                isDefault: true
            },
            // Code actions
            {
                id: 'explainCode',
                description: 'Explain selected code',
                command: 'copilotPPA.explainCode',
                key: 'Ctrl+Shift+E',
                when: 'editorHasSelection',
                category: KeybindingCategory.Code,
                isDefault: true
            },
            {
                id: 'refactorCode',
                description: 'Refactor selected code',
                command: 'copilotPPA.refactorCode',
                key: 'Ctrl+Shift+R',
                when: 'editorHasSelection',
                category: KeybindingCategory.Code,
                isDefault: true
            },
            {
                id: 'documentCode',
                description: 'Document selected code',
                command: 'copilotPPA.documentCode',
                key: 'Ctrl+Shift+D',
                when: 'editorHasSelection',
                category: KeybindingCategory.Code,
                isDefault: true
            },
            // Navigation actions
            {
                id: 'focusChat',
                description: 'Focus the chat input',
                command: 'copilotPPA.focusChat',
                key: 'Ctrl+Shift+Space',
                category: KeybindingCategory.Navigation,
                isDefault: true
            },
            {
                id: 'toggleSidebar',
                description: 'Toggle the agent sidebar',
                command: 'copilotPPA.toggleSidebar',
                key: 'Ctrl+Shift+A',
                category: KeybindingCategory.Navigation,
                isDefault: true
            }
        ];

        this.keybindings.clear();
        for (const keybinding of defaults) {
            this.keybindings.set(keybinding.id, keybinding);
        }
    }

    private getDefaultKeybinding(id: string): Keybinding | undefined {
        const defaults = Array.from(this.keybindings.values()).filter(kb => kb.isDefault);
        return defaults.find(kb => kb.id === id);
    }

    private loadCustomKeybindings(): void {
        const customKeybindings = this.context.globalState.get<Record<string, string>>(this.STORAGE_KEY, {});
        
        for (const [id, key] of Object.entries(customKeybindings)) {
            const keybinding = this.keybindings.get(id);
            if (keybinding) {
                keybinding.key = key;
                keybinding.isDefault = false;
            }
        }
    }

    private saveCustomKeybindings(): void {
        const customKeybindings: Record<string, string> = {};
        
        for (const [id, keybinding] of this.keybindings.entries()) {
            if (!keybinding.isDefault) {
                customKeybindings[id] = keybinding.key;
            }
        }
        
        this.context.globalState.update(this.STORAGE_KEY, customKeybindings);
    }

    private isCustomCommand(command: string): boolean {
        return command.startsWith('copilotPPA.');
    }

    private updateVSCodeContext(id: string, key: string): void {
        vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${id}`, key);
    }
}

// Singleton instance
let keybindingManager?: KeybindingManager;

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
