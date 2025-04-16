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
exports.ConversationExportCommand = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const conversationManager_1 = require("../services/conversationManager");
class ConversationExportCommand {
    constructor(context) {
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
    }
    register() {
        return [
            vscode.commands.registerCommand(ConversationExportCommand.commandId, async (conversationId) => {
                await this.exportConversation(conversationId);
            }),
            vscode.commands.registerCommand(ConversationExportCommand.exportAllCommandId, async () => {
                await this.exportAllConversations();
            })
        ];
    }
    async exportConversation(conversationId) {
        try {
            // If no conversation ID is provided, let the user select one
            if (!conversationId) {
                conversationId = await this.selectConversation();
                if (!conversationId) {
                    return; // User cancelled
                }
            }
            // Get save location from user
            const filepath = await this.getSaveFilePath('conversation.json');
            if (!filepath) {
                return; // User cancelled
            }
            // Export the conversation
            const success = await this.conversationManager.exportConversation(conversationId, filepath);
            if (success) {
                vscode.window.showInformationMessage(`Conversation exported to ${path.basename(filepath)}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    async exportAllConversations() {
        try {
            // Get save location from user
            const filepath = await this.getSaveFilePath('all_conversations.json');
            if (!filepath) {
                return; // User cancelled
            }
            // Export all conversations
            const success = await this.conversationManager.exportAllConversations(filepath);
            if (success) {
                vscode.window.showInformationMessage(`All conversations exported to ${path.basename(filepath)}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    async selectConversation() {
        // Get all conversations
        const conversations = this.conversationManager.getAllConversations();
        if (conversations.length === 0) {
            vscode.window.showInformationMessage('No conversations to export');
            return undefined;
        }
        // Create quick pick items
        const items = conversations.map(conv => ({
            label: conv.title,
            description: `${conv.messages.length} messages · ${new Date(conv.updatedAt).toLocaleString()}`,
            conversationId: conv.id
        }));
        // Show quick pick
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a conversation to export',
            matchOnDescription: true
        });
        return selected?.conversationId;
    }
    async getSaveFilePath(defaultName) {
        const options = {
            defaultUri: vscode.Uri.file(path.join(this.getDefaultSaveLocation(), defaultName)),
            filters: {
                'JSON Files': ['json'],
                'All Files': ['*']
            },
            saveLabel: 'Export'
        };
        const uri = await vscode.window.showSaveDialog(options);
        return uri?.fsPath;
    }
    getDefaultSaveLocation() {
        // Try to get the first workspace folder, fall back to home directory
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            return workspaceFolders[0].uri.fsPath;
        }
        return process.env.HOME || process.env.USERPROFILE || '';
    }
}
exports.ConversationExportCommand = ConversationExportCommand;
ConversationExportCommand.commandId = 'copilotPPA.exportConversation';
ConversationExportCommand.exportAllCommandId = 'copilotPPA.exportAllConversations';
//# sourceMappingURL=conversationExportCommand.js.map