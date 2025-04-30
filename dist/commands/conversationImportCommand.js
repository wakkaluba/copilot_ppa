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
exports.ConversationImportCommand = void 0;
const vscode = __importStar(require("vscode"));
const conversationManager_1 = require("../services/conversationManager");
class ConversationImportCommand {
    static commandId = 'copilotPPA.importConversation';
    conversationManager;
    constructor(context) {
        this.conversationManager = conversationManager_1.ConversationManager.getInstance(context);
    }
    register() {
        return vscode.commands.registerCommand(ConversationImportCommand.commandId, async () => {
            await this.importConversation();
        });
    }
    async importConversation() {
        try {
            // Get file path to import
            const filepath = await this.getOpenFilePath();
            if (!filepath) {
                return; // User cancelled
            }
            // Ask if we should replace existing conversations
            const replaceExisting = await this.shouldReplaceExisting();
            // Import the conversations
            const importedConversations = await this.conversationManager.importConversations(filepath, replaceExisting);
            if (importedConversations.length > 0) {
                vscode.window.showInformationMessage(`Successfully imported ${importedConversations.length} conversation(s)`);
            }
            else {
                vscode.window.showWarningMessage('No conversations were imported');
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Import failed: ${error.message}`);
        }
    }
    async getOpenFilePath() {
        const options = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'JSON Files': ['json'],
                'All Files': ['*']
            },
            openLabel: 'Import'
        };
        const fileUri = await vscode.window.showOpenDialog(options);
        if (fileUri && fileUri.length > 0) {
            return fileUri[0].fsPath;
        }
        return undefined;
    }
    async shouldReplaceExisting() {
        const options = [
            { label: 'Yes', description: 'Replace existing conversations with the same ID' },
            { label: 'No', description: 'Generate new IDs for imported conversations with duplicate IDs' }
        ];
        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: 'Replace existing conversations?'
        });
        return selection?.label === 'Yes';
    }
}
exports.ConversationImportCommand = ConversationImportCommand;
//# sourceMappingURL=conversationImportCommand.js.map