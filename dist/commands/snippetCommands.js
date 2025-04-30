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
exports.SnippetCommands = void 0;
const vscode = __importStar(require("vscode"));
const snippetManager_1 = require("../services/snippetManager");
const conversationManager_1 = require("../services/conversationManager");
const SnippetCreationService_1 = require("../services/snippets/SnippetCreationService");
const SnippetSelectionService_1 = require("../services/snippets/SnippetSelectionService");
const SnippetInsertionService_1 = require("../services/snippets/SnippetInsertionService");
class SnippetCommands {
    static createSnippetCommandId = 'copilotPPA.createSnippet';
    static insertSnippetCommandId = 'copilotPPA.insertSnippet';
    static manageSnippetsCommandId = 'copilotPPA.manageSnippets';
    creationService;
    selectionService;
    insertionService;
    constructor(context) {
        const snippetManager = snippetManager_1.SnippetManager.getInstance(context);
        const conversationManager = conversationManager_1.ConversationManager.getInstance(context);
        this.creationService = new SnippetCreationService_1.SnippetCreationService(snippetManager, conversationManager);
        this.selectionService = new SnippetSelectionService_1.SnippetSelectionService(snippetManager, conversationManager);
        this.insertionService = new SnippetInsertionService_1.SnippetInsertionService();
    }
    register() {
        return [
            vscode.commands.registerCommand(SnippetCommands.createSnippetCommandId, async (conversationId, messageIndices) => {
                await this.createSnippet(conversationId, messageIndices);
            }),
            vscode.commands.registerCommand(SnippetCommands.insertSnippetCommandId, async () => {
                await this.insertSnippet();
            }),
            vscode.commands.registerCommand(SnippetCommands.manageSnippetsCommandId, async () => {
                await this.manageSnippets();
            })
        ];
    }
    async createSnippet(conversationId, messageIndices) {
        try {
            await this.creationService.createSnippet(conversationId, messageIndices);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create snippet: ${error.message}`);
        }
    }
    async insertSnippet() {
        try {
            const snippet = await this.selectionService.selectSnippet();
            if (snippet) {
                await this.insertionService.insertSnippet(snippet);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to insert snippet: ${error.message}`);
        }
    }
    async manageSnippets() {
        await vscode.commands.executeCommand('copilotPPA.openSnippetsPanel');
    }
}
exports.SnippetCommands = SnippetCommands;
//# sourceMappingURL=snippetCommands.js.map