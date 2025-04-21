import * as vscode from 'vscode';
import { ModelService } from '../../llm/modelService';
import { ConfigManager } from '../../config';
import { ErrorHandler } from '../error/ErrorHandler';

export class ConfigurationCommandService {
    constructor(
        private readonly modelService: ModelService,
        private readonly configManager: ConfigManager,
        private readonly errorHandler: ErrorHandler
    ) {}

    async configureModel(): Promise<void> {
        try {
            const config = this.configManager.getConfig();
            
            const providers = ['ollama', 'lmstudio', 'huggingface', 'custom'];
            const selectedProvider = await vscode.window.showQuickPick(providers, {
                placeHolder: 'Select LLM provider',
                title: 'Configure LLM Model'
            });
            
            if (selectedProvider) {
                await this.configManager.updateConfig('llm.provider', selectedProvider);
                
                if (selectedProvider === 'custom') {
                    const endpoint = await vscode.window.showInputBox({
                        prompt: 'Enter custom LLM endpoint URL',
                        value: config.llm.endpoint,
                        validateInput: this.validateEndpointUrl
                    });
                    
                    if (endpoint) {
                        await this.configManager.updateConfig('llm.endpoint', endpoint);
                    }
                }
                
                await vscode.window.showInformationMessage(`Model provider updated to ${selectedProvider}`);
            }
        } catch (error) {
            this.errorHandler.handle('Failed to configure model', error);
        }
    }

    async clearConversation(): Promise<void> {
        try {
            await this.modelService.dispose();
            await vscode.window.showInformationMessage('Conversation history cleared');
        } catch (error) {
            this.errorHandler.handle('Failed to clear conversation', error);
        }
    }

    private validateEndpointUrl(url: string): string | undefined {
        try {
            new URL(url);
            return undefined;
        } catch {
            return 'Please enter a valid URL';
        }
    }
}