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
exports.KeybindingManager = exports.KeybindingCategory = void 0;
exports.initializeKeybindingManager = initializeKeybindingManager;
exports.getKeybindingManager = getKeybindingManager;
const vscode = __importStar(require("vscode"));
/**
 * Keybinding category for grouping shortcuts
 */
var KeybindingCategory;
(function (KeybindingCategory) {
    KeybindingCategory["Chat"] = "Chat Actions";
    KeybindingCategory["Code"] = "Code Actions";
    KeybindingCategory["Navigation"] = "Navigation";
    KeybindingCategory["Other"] = "Other";
})(KeybindingCategory || (exports.KeybindingCategory = KeybindingCategory = {}));
/**
 * Manager for custom keybindings
 */
class KeybindingManager {
    constructor(context) {
        this.context = context;
        this.keybindings = new Map();
        this.STORAGE_KEY = 'copilotPPA.customKeybindings';
        this.registerDefaultKeybindings();
        this.loadCustomKeybindings();
    }
    /**
     * Get all registered keybindings
     */
    getKeybindings() {
        return Array.from(this.keybindings.values());
    }
    /**
     * Get a specific keybinding by ID
     */
    getKeybinding(id) {
        return this.keybindings.get(id);
    }
    /**
     * Update a keybinding's key combination
     */
    updateKeybinding(id, keyShortcut) {
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
    resetKeybinding(id) {
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
    resetAllKeybindings() {
        this.registerDefaultKeybindings();
        this.context.globalState.update(this.STORAGE_KEY, undefined);
        vscode.commands.executeCommand('copilotPPA.keybindingsChanged');
    }
    /**
     * Get keybindings in VS Code's package.json format
     */
    getVSCodeKeybindings() {
        return this.getKeybindings().map(kb => ({
            key: kb.key,
            command: kb.command,
            ...(kb.when ? { when: kb.when } : {})
        }));
    }
    registerDefaultKeybindings() {
        const defaults = [
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
    getDefaultKeybinding(id) {
        const defaults = Array.from(this.keybindings.values()).filter(kb => kb.isDefault);
        return defaults.find(kb => kb.id === id);
    }
    loadCustomKeybindings() {
        const customKeybindings = this.context.globalState.get(this.STORAGE_KEY, {});
        for (const [id, key] of Object.entries(customKeybindings)) {
            const keybinding = this.keybindings.get(id);
            if (keybinding) {
                keybinding.key = key;
                keybinding.isDefault = false;
            }
        }
    }
    saveCustomKeybindings() {
        const customKeybindings = {};
        for (const [id, keybinding] of this.keybindings.entries()) {
            if (!keybinding.isDefault) {
                customKeybindings[id] = keybinding.key;
            }
        }
        this.context.globalState.update(this.STORAGE_KEY, customKeybindings);
    }
    isCustomCommand(command) {
        return command.startsWith('copilotPPA.');
    }
    updateVSCodeContext(id, key) {
        vscode.commands.executeCommand('setContext', `copilotPPA.keybinding.${id}`, key);
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