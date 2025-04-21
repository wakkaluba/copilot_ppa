import * as vscode from 'vscode';
import { AgentCommandService } from './AgentCommandService';
import { ConfigurationCommandService } from './ConfigurationCommandService';
import { VisualizationCommandService } from './VisualizationCommandService';
import { ErrorHandler } from '../error/ErrorHandler';

export class MenuCommandService {
    constructor(
        private readonly agentService: AgentCommandService,
        private readonly configService: ConfigurationCommandService,
        private readonly visualizationService: VisualizationCommandService,
        private readonly errorHandler: ErrorHandler
    ) {}

    async openMenu(): Promise<void> {
        const options = [
            'Start Agent',
            'Stop Agent',
            'Configure Model',
            'Show Metrics Dashboard',
            'Clear Conversation History',
            'View Documentation'
        ] as const;
        
        const result = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select an action'
        });
        
        if (result) {
            try {
                switch (result) {
                    case 'Start Agent':
                        await this.agentService.startAgent();
                        break;
                    case 'Stop Agent':
                        await this.agentService.stopAgent();
                        break;
                    case 'Configure Model':
                        await this.configService.configureModel();
                        break;
                    case 'Show Metrics Dashboard':
                        await this.visualizationService.showMetrics();
                        break;
                    case 'Clear Conversation History':
                        await this.configService.clearConversation();
                        break;
                    case 'View Documentation':
                        await vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/copilot-ppa/docs'));
                        break;
                }
            } catch (error) {
                this.errorHandler.handle('Failed to execute menu action', error);
            }
        }
    }
}