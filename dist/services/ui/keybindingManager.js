"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeybindingManager = void 0;
exports.initializeKeybindingManager = initializeKeybindingManager;
exports.getKeybindingManager = getKeybindingManager;
const vscode = __importStar(require("vscode"));
/**
 * Manager for custom keybindings
 */
class KeybindingManager {
    context;
    keybindings = new Map();
    constructor(context) {
        this.context = context;
        // Register default keybindings
        this.registerDefaultKeybindings();
        // Load any custom keybindings
        this.loadCustomKeybindings();
    }
    /**
     * Get all keybindings
     */
    getKeybindings() {
        return Array.from(this.keybindings.values());
    }
    /**
     * Get a keybinding by ID
     */
    getKeybinding(id) {
        return this.keybindings.get(id);
    }
    /**
     * Update a keybinding
     */
    updateKeybinding(id, keyShortcut) {
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
    resetKeybinding(id) {
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
    resetAllKeybindings() {
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
    registerDefaultKeybindings() {
        const defaults = [
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
    getDefaultKeybinding(id) {
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
    loadCustomKeybindings() {
        const customKeybindings = this.context.globalState.get('copilotPPA.customKeybindings', {});
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
    saveCustomKeybindings() {
        const customKeybindings = {};
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
    getVSCodeKeybindings() {
        return this.getKeybindings().map(kb => ({
            key: kb.key,
            command: kb.command,
            when: kb.when
        }));
    }
}
exports.KeybindingManager = KeybindingManager;
// Singleton instance
let keybindingManager;
/**
 * Initialize the keybinding manager
 */
function initializeKeybindingManager(context) {
    keybindingManager = new KeybindingManager(context);
    return keybindingManager;
}
/**
 * Get the keybinding manager instance
 */
function getKeybindingManager() {
    if (!keybindingManager) {
        throw new Error('Keybinding Manager not initialized');
    }
    return keybindingManager;
}
//# sourceMappingURL=keybindingManager.js.map