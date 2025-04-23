import * as vscode from 'vscode';
import { WebviewMessage } from '../copilotIntegrationPanel';
import { CopilotWebviewStateManager } from './CopilotWebviewStateManager';
import { CopilotConnectionManager } from './CopilotConnectionManager';
import { Logger } from '../../utils/logger';

export class CopilotWebviewMessageHandler implements vscode.Disposable {
    constructor(
        private readonly stateManager: CopilotWebviewStateManager,
        private readonly connectionManager: CopilotConnectionManager,
        private readonly logger: Logger
    ) {}

    async handleMessage(message: WebviewMessage): Promise<any> {
        try {
            switch (message.command) {
                case 'toggleLLMMode':
                    await this.stateManager.toggleLLMMode();
                    break;

                case 'sendMessage':
                    if (message.text) {
                        return await this.handleMessageSend(message.text);
                    }
                    break;

                case 'reconnectCopilot':
                    await this.connectionManager.reconnect();
                    break;

                default:
                    this.logger.warn(`Unknown command: ${(message as any).command}`);
            }
        } catch (error) {
            this.logger.error('Error handling message', error);
            throw error;
        }
    }

    private async handleMessageSend(text: string): Promise<any> {
        if (!text.trim()) {
            return;
        }

        this.stateManager.addMessage('user', text);

        try {
            const response = await this.connectionManager.sendMessage(text);
            this.stateManager.addMessage('assistant', response);
            return { command: 'addResponse', text: response };
        } catch (error) {
            const errorMessage = this.connectionManager.getErrorMessage(error);
            return { command: 'showError', text: errorMessage };
        }
    }

    dispose(): void {
        // No resources to dispose
    }
}
