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
const conversationManager_1 = require("../services/conversationManager");
const ConversationExportService_1 = require("../services/conversation/ConversationExportService");
const FileDialogService_1 = require("../services/dialog/FileDialogService");
const ConversationSelectionService_1 = require("../services/conversation/ConversationSelectionService");
class ConversationExportCommand {
    constructor(context) {
        const conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.exportService = new ConversationExportService_1.ConversationExportService(conversationManager);
        this.fileDialogService = new FileDialogService_1.FileDialogService();
        this.selectionService = new ConversationSelectionService_1.ConversationSelectionService(conversationManager);
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
            if (!conversationId) {
                conversationId = await this.selectionService.selectConversation('Select a conversation to export');
                if (!conversationId) {
                    return;
                }
            }
            const filepath = await this.fileDialogService.getSaveFilePath('conversation.json', ['json']);
            if (!filepath) {
                return;
            }
            await this.exportService.exportConversation(conversationId, filepath);
            vscode.window.showInformationMessage(`Conversation exported successfully`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
    async exportAllConversations() {
        try {
            const filepath = await this.fileDialogService.getSaveFilePath('all_conversations.json', ['json']);
            if (!filepath) {
                return;
            }
            await this.exportService.exportAllConversations(filepath);
            vscode.window.showInformationMessage(`All conversations exported successfully`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Export failed: ${error.message}`);
        }
    }
}
exports.ConversationExportCommand = ConversationExportCommand;
ConversationExportCommand.commandId = 'copilotPPA.exportConversation';
ConversationExportCommand.exportAllCommandId = 'copilotPPA.exportAllConversations';
//# sourceMappingURL=conversationExportCommand.js.map