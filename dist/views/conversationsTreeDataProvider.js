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
exports.ConversationsTreeDataProvider = void 0;
const vscode = __importStar(require("vscode"));
class ConversationsTreeDataProvider {
    conversationManager;
    _onDidChangeTreeData = new vscode.EventEmitter();
    onDidChangeTreeData = this._onDidChangeTreeData.event;
    constructor(conversationManager) {
        this.conversationManager = conversationManager;
        // Listen to conversation changes
        this.conversationManager.onConversationChanged(() => this.refresh());
        this.conversationManager.onConversationAdded(() => this.refresh());
        this.conversationManager.onConversationRemoved(() => this.refresh());
        this.conversationManager.onConversationsImported(() => this.refresh());
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve([]);
        }
        else {
            return this.conversationManager.getConversations().then(conversations => {
                return conversations.map(conversation => new ConversationTreeItem(conversation));
            });
        }
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
}
exports.ConversationsTreeDataProvider = ConversationsTreeDataProvider;
class ConversationTreeItem extends vscode.TreeItem {
    conversation;
    constructor(conversation) {
        super(conversation.title, vscode.TreeItemCollapsibleState.None);
        this.conversation = conversation;
        this.tooltip = `${this.conversation.title}`;
        this.description = this.conversation.description;
    }
}
//# sourceMappingURL=conversationsTreeDataProvider.js.map