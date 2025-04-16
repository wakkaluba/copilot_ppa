import * as vscode from 'vscode';
import { LLMModelService } from './llm/modelService';

export class CommandManager {
    private modelService: LLMModelService;
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Create the model service instance
        this.modelService = new LLMModelService(context);
    }

    registerCommands() {
        // Register commands with proper binding of 'this' context
        this.context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.startAgent', this.startAgent.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.stopAgent', this.stopAgent.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.restartAgent', this.restartAgent.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.configureModel', this.configureModel.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.clearConversation', this.clearConversation.bind(this))
            // Note: getModelRecommendations is now registered by LLMModelService
        );
        
        return this;
    }

    private async startAgent() {
        // TODO: Implement agent startup logic
        await vscode.window.showInformationMessage('Starting Copilot PPA agent...');
    }

    private async stopAgent() {
        // TODO: Implement agent shutdown logic
        await vscode.window.showInformationMessage('Stopping Copilot PPA agent...');
    }

    private async restartAgent() {
        await this.stopAgent();
        await this.startAgent();
    }

    private async configureModel() {
        // TODO: Show model configuration UI
        await vscode.window.showInformationMessage('Opening model configuration...');
    }

    private async clearConversation() {
        // TODO: Clear conversation history
        await vscode.window.showInformationMessage('Conversation history cleared');
    }
}
