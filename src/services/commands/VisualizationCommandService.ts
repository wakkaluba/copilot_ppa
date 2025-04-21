import * as vscode from 'vscode';
import * as path from 'path';
import { ErrorHandler } from '../error/ErrorHandler';

export class VisualizationCommandService {
    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly errorHandler: ErrorHandler
    ) {}

    async showMetrics(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('metrics', 'PPA Metrics Dashboard');
            panel.webview.html = await this.getMetricsDashboardHtml();
            await vscode.window.showInformationMessage('Metrics dashboard opened');
        } catch (error) {
            this.errorHandler.handle('Failed to show metrics', error);
        }
    }

    async showMemoryVisualization(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('memoryVisualization', 'Memory Usage Visualization');
            const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'memoryVisualization.html');
            const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
            panel.webview.html = template.toString();
        } catch (error) {
            this.errorHandler.handle('Failed to show memory visualization', error);
        }
    }

    async showPerformanceMetrics(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('performanceMetrics', 'Performance Metrics');
            panel.webview.html = await this.getPerformanceMetricsHtml();
            await vscode.window.showInformationMessage('Performance metrics opened');
        } catch (error) {
            this.errorHandler.handle('Failed to show performance metrics', error);
        }
    }

    async exportMetrics(): Promise<void> {
        try {
            // TODO: Implement metrics export functionality
            const exportPath = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file('metrics_export.json'),
                filters: {
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            });

            if (exportPath) {
                // TODO: Collect and export metrics
                await vscode.window.showInformationMessage('Metrics exported successfully');
            }
        } catch (error) {
            this.errorHandler.handle('Failed to export metrics', error);
        }
    }

    private async createWebviewPanel(viewType: string, title: string): Promise<vscode.WebviewPanel> {
        return vscode.window.createWebviewPanel(
            viewType,
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                    vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview', 'templates'))
                ]
            }
        );
    }

    private async getMetricsDashboardHtml(): Promise<string> {
        const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'metricsDashboard.html');
        const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
        return template.toString();
    }

    private async getPerformanceMetricsHtml(): Promise<string> {
        const templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'performanceMetrics.html');
        const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
        return template.toString();
    }
}