"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeybindingManager = exports.KeybindingCategory = void 0;
exports.initializeKeybindingManager = initializeKeybindingManager;
exports.getKeybindingManager = getKeybindingManager;
var vscode = require("vscode");
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
var KeybindingManager = /** @class */ (function () {
    function KeybindingManager(context) {
        this.context = context;
        this.keybindings = new Map();
        this.STORAGE_KEY = 'copilotPPA.customKeybindings';
        this.registerDefaultKeybindings();
        this.loadCustomKeybindings();
    }
    /**
     * Get all registered keybindings
     */
    KeybindingManager.prototype.getKeybindings = function () {
        return Array.from(this.keybindings.values());
    };
    /**
     * Get a specific keybinding by ID
     */
    KeybindingManager.prototype.getKeybinding = function (id) {
        return this.keybindings.get(id);
    };
    /**
     * Update a keybinding's key combination
     */
    KeybindingManager.prototype.updateKeybinding = function (id, keyShortcut) {
        var keybinding = this.keybindings.get(id);
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
    };
    /**
     * Reset a keybinding to its default value
     */
    KeybindingManager.prototype.resetKeybinding = function (id) {
        var keybinding = this.keybindings.get(id);
        if (!keybinding || keybinding.isDefault) {
            return false;
        }
        var defaultKeybinding = this.getDefaultKeybinding(id);
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
    };
    /**
     * Reset all keybindings to their defaults
     */
    KeybindingManager.prototype.resetAllKeybindings = function () {
        this.registerDefaultKeybindings();
        this.context.globalState.update(this.STORAGE_KEY, undefined);
        vscode.commands.executeCommand('copilotPPA.keybindingsChanged');
    };
    /**
     * Get keybindings in VS Code's package.json format
     */
    KeybindingManager.prototype.getVSCodeKeybindings = function () {
        return this.getKeybindings().map(function (kb) { return (__assign({ key: kb.key, command: kb.command }, (kb.when ? { when: kb.when } : {}))); });
    };
    KeybindingManager.prototype.registerDefaultKeybindings = function () {
        var defaults = [
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
        for (var _i = 0, defaults_1 = defaults; _i < defaults_1.length; _i++) {
            var keybinding = defaults_1[_i];
            this.keybindings.set(keybinding.id, keybinding);
        }
    };
    KeybindingManager.prototype.getDefaultKeybinding = function (id) {
        var defaults = Array.from(this.keybindings.values()).filter(function (kb) { return kb.isDefault; });
        return defaults.find(function (kb) { return kb.id === id; });
    };
    KeybindingManager.prototype.loadCustomKeybindings = function () {
        var customKeybindings = this.context.globalState.get(this.STORAGE_KEY, {});
        for (var _i = 0, _a = Object.entries(customKeybindings); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], key = _b[1];
            var keybinding = this.keybindings.get(id);
            if (keybinding) {
                keybinding.key = key;
                keybinding.isDefault = false;
            }
        }
    };
    KeybindingManager.prototype.saveCustomKeybindings = function () {
        var customKeybindings = {};
        for (var _i = 0, _a = this.keybindings.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], id = _b[0], keybinding = _b[1];
            if (!keybinding.isDefault) {
                customKeybindings[id] = keybinding.key;
            }
        }
        this.context.globalState.update(this.STORAGE_KEY, customKeybindings);
    };
    KeybindingManager.prototype.isCustomCommand = function (command) {
        return command.startsWith('copilotPPA.');
    };
    KeybindingManager.prototype.updateVSCodeContext = function (id, key) {
        vscode.commands.executeCommand('setContext', "copilotPPA.keybinding.".concat(id), key);
    };
    return KeybindingManager;
}());
exports.KeybindingManager = KeybindingManager;
// Singleton instance
var keybindingManager;
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
