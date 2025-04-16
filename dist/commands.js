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
exports.CommandManager = void 0;
const vscode = __importStar(require("vscode"));
const modelService_1 = require("./llm/modelService");
class CommandManager {
    constructor(context) {
        this.context = context;
        // Create the model service instance
        this.modelService = new modelService_1.LLMModelService(context);
    }
    registerCommands() {
        // Register commands with proper binding of 'this' context
        this.context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.startAgent', this.startAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.stopAgent', this.stopAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.restartAgent', this.restartAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.configureModel', this.configureModel.bind(this)), vscode.commands.registerCommand('copilot-ppa.clearConversation', this.clearConversation.bind(this))
        // Note: getModelRecommendations is now registered by LLMModelService
        );
        return this;
    }
    async startAgent() {
        // TODO: Implement agent startup logic
        await vscode.window.showInformationMessage('Starting Copilot PPA agent...');
    }
    async stopAgent() {
        // TODO: Implement agent shutdown logic
        await vscode.window.showInformationMessage('Stopping Copilot PPA agent...');
    }
    async restartAgent() {
        await this.stopAgent();
        await this.startAgent();
    }
    async configureModel() {
        // TODO: Show model configuration UI
        await vscode.window.showInformationMessage('Opening model configuration...');
    }
    async clearConversation() {
        // TODO: Clear conversation history
        await vscode.window.showInformationMessage('Conversation history cleared');
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commands.js.map