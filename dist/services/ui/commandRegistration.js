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
exports.CommandRegistrationService = void 0;
exports.initializeCommandRegistrationService = initializeCommandRegistrationService;
exports.getCommandRegistrationService = getCommandRegistrationService;
const vscode = __importStar(require("vscode"));
const keybindingManager_1 = require("./keybindingManager");
/**
 * Service to register commands and keybindings with VS Code
 */
class CommandRegistrationService {
    constructor(context) {
        this.context = context;
        this.registeredCommands = new Set();
    }
    /**
     * Register all keybindings with VS Code
     */
    registerAllKeybindings() {
        const keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
        const keybindings = keybindingManager.getKeybindings();
        for (const keybinding of keybindings) {
            this.registerCommand(keybinding.command, keybinding.id);
        }
        // Register an event listener for keybinding changes
        this.context.subscriptions.push(vscode.commands.registerCommand('copilotPPA.keybindingsChanged', () => {
            this.updateKeybindingContexts();
        }));
    }
    /**
     * Register a single command
     */
    registerCommand(commandId, keybindingId) {
        // Skip if already registered or not a custom command
        if (this.registeredCommands.has(commandId) || !commandId.startsWith('copilotPPA.')) {
            return;
        }
        // Set the context for when clauses
        const keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
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
    updateKeybindingContexts() {
        const keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
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
    registerShortcutCommands() {
        // Register command to open keyboard shortcuts panel
        this.context.subscriptions.push(vscode.commands.registerCommand('copilotPPA.openKeyboardShortcuts', () => {
            vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
        }));
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
        }));
        // Code commands
        this.context.subscriptions.push(
        // Explain code command
        vscode.commands.registerCommand('copilotPPA.explainCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                const selectedText = editor.document.getText(editor.selection);
                await vscode.commands.executeCommand('chat.explain', { code: selectedText });
            }
            else {
                vscode.window.showWarningMessage('Please select some code to explain.');
            }
        }), 
        // Refactor code command
        vscode.commands.registerCommand('copilotPPA.refactorCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                const selectedText = editor.document.getText(editor.selection);
                await vscode.commands.executeCommand('chat.refactor', { code: selectedText });
            }
            else {
                vscode.window.showWarningMessage('Please select some code to refactor.');
            }
        }), 
        // Document code command
        vscode.commands.registerCommand('copilotPPA.documentCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor && !editor.selection.isEmpty) {
                const selectedText = editor.document.getText(editor.selection);
                await vscode.commands.executeCommand('chat.document', { code: selectedText });
            }
            else {
                vscode.window.showWarningMessage('Please select some code to document.');
            }
        }));
        // Navigation commands
        this.context.subscriptions.push(
        // Focus chat command
        vscode.commands.registerCommand('copilotPPA.focusChat', () => {
            vscode.commands.executeCommand('workbench.action.focusPanel', 'chat');
        }), 
        // Toggle sidebar command
        vscode.commands.registerCommand('copilotPPA.toggleSidebar', () => {
            vscode.commands.executeCommand('workbench.view.extension.copilotPPA');
        }));
    }
}
exports.CommandRegistrationService = CommandRegistrationService;
// Singleton instance
let commandRegistrationService;
/**
 * Initialize the command registration service
 */
function initializeCommandRegistrationService(context) {
    commandRegistrationService = new CommandRegistrationService(context);
    return commandRegistrationService;
}
/**
 * Get the command registration service instance
 */
function getCommandRegistrationService() {
    if (!commandRegistrationService) {
        throw new Error('Command Registration Service not initialized');
    }
    return commandRegistrationService;
}
//# sourceMappingURL=commandRegistration.js.map