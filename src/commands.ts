import * as vscode from 'vscode';
import { LLMModelService } from './llm/modelService';

export class CommandManager {
    private modelService: LLMModelService;
    private context: vscode.ExtensionContext;
    
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Create the model service instance
        this.modelService = new LLMModelService(context);
        
        // Register commands
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.startAgent', this.startAgent),
            vscode.commands.registerCommand('copilot-ppa.stopAgent', this.stopAgent),
            vscode.commands.registerCommand('copilot-ppa.restartAgent', this.restartAgent),
            vscode.commands.registerCommand('copilot-ppa.configureModel', this.configureModel),
            vscode.commands.registerCommand('copilot-ppa.clearConversation', this.clearConversation)
            // Note: getModelRecommendations is now registered by LLMModelService
        );
    }

    registerCommands() {
        // Register commands here
        // For now, just adding a dummy disposable to ensure subscriptions gets something
        const disposable = {
            dispose: () => {}
        };
        
        this.context.subscriptions.push(disposable);
        
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
