import * as vscode from 'vscode';
/**
 * Keybinding category for grouping shortcuts
 */
export declare enum KeybindingCategory {
    Chat = "Chat Actions",
    Code = "Code Actions",
    Navigation = "Navigation",
    Other = "Other"
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
export declare class KeybindingManager {
    private readonly context;
    private keybindings;
    private readonly STORAGE_KEY;
    constructor(context: vscode.ExtensionContext);
    /**
     * Get all registered keybindings
     */
    getKeybindings(): Keybinding[];
    /**
     * Get a specific keybinding by ID
     */
    getKeybinding(id: string): Keybinding | undefined;
    /**
     * Update a keybinding's key combination
     */
    updateKeybinding(id: string, keyShortcut: string): boolean;
    /**
     * Reset a keybinding to its default value
     */
    resetKeybinding(id: string): boolean;
    /**
     * Reset all keybindings to their defaults
     */
    resetAllKeybindings(): void;
    /**
     * Get keybindings in VS Code's package.json format
     */
    getVSCodeKeybindings(): Array<{
        key: string;
        command: string;
        when?: string | undefined;
    }>;
    private registerDefaultKeybindings;
    private getDefaultKeybinding;
    private loadCustomKeybindings;
    private saveCustomKeybindings;
    private isCustomCommand;
    private updateVSCodeContext;
}
/**
 * Initialize the keybinding manager
 */
export declare function initializeKeybindingManager(context: vscode.ExtensionContext): KeybindingManager;
/**
 * Get the keybinding manager instance
 */
export declare function getKeybindingManager(): KeybindingManager;
