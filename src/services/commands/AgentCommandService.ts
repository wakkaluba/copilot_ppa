import * as vscode from 'vscode';
import { ModelService } from '../../llm/modelService';
import { ErrorHandler } from '../error/ErrorHandler';

export class AgentCommandService {
    constructor(
        private readonly modelService: ModelService,
        private readonly errorHandler: ErrorHandler
    ) {}

    async startAgent(): Promise<void> {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Starting Copilot PPA agent...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50 });
                const recommendations = await this.modelService.getModelRecommendations();
                if (recommendations.length > 0) {
                    const defaultModel = recommendations[0];
                    if (defaultModel) {
                        await this.modelService.checkModelCompatibility(defaultModel.id);
                    }
                }
                progress.report({ increment: 50 });
                await vscode.window.showInformationMessage('Copilot PPA agent started successfully');
            });
        } catch (error) {
            this.errorHandler.handle('Failed to start Copilot PPA agent', error);
        }
    }

    async stopAgent(): Promise<void> {
        try {
            await this.modelService.dispose();
            await vscode.window.showInformationMessage('Copilot PPA agent stopped');
        } catch (error) {
            this.errorHandler.handle('Failed to stop Copilot PPA agent', error);
        }
    }

    async restartAgent(): Promise<void> {
        try {
            await this.stopAgent();
            await this.startAgent();
        } catch (error) {
            this.errorHandler.handle('Failed to restart Copilot PPA agent', error);
        }
    }
}