import * as vscode from 'vscode';
import { CopilotCommunicationAnalyzer } from '../debug/copilotCommunicationAnalyzer';
import { DebugDashboard } from '../debug/debugDashboard';
import { DebugConfigPanel } from '../debug/debugConfigPanel';
import { LogViewer } from '../debug/logViewer';
import { CudaDetector } from '../debug/cudaDetector';
import { ModelCompatibilityChecker } from '../debug/modelCompatibilityChecker';
import { AdvancedLogger, LogLevel } from '../utils/advancedLogger';

/**
 * Register debug-related commands
 */
export function registerDebugCommands(context: vscode.ExtensionContext): void {
    const logger = AdvancedLogger.getInstance();
    const analyzer = CopilotCommunicationAnalyzer.getInstance();
    const dashboard = DebugDashboard.getInstance();
    const cudaDetector = CudaDetector.getInstance();
    const modelChecker = ModelCompatibilityChecker.getInstance();
    const configPanel = DebugConfigPanel.getInstance();
    const logViewer = LogViewer.getInstance();
    
    // Register command to show debug dashboard
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.showDebugDashboard', () => {
            logger.info('Opening debug dashboard', {}, 'DebugCommands');
            dashboard.show();
        })
    );
    
    // Register command to show debug configuration
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.showDebugConfig', () => {
            logger.info('Opening debug configuration', {}, 'DebugCommands');
            configPanel.show();
        })
    );
    
    // Register command to show log viewer
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.showLogViewer', () => {
            logger.info('Opening log viewer', {}, 'DebugCommands');
            logViewer.show();
        })
    );
    
    // Register command to toggle communication analyzer
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.toggleCommunicationAnalyzer', async () => {
            const currentState = context.workspaceState.get<boolean>('copilotAnalyzerEnabled', false);
            const newState = !currentState;
            
            analyzer.setEnabled(newState);
            await context.workspaceState.update('copilotAnalyzerEnabled', newState);
            
            vscode.window.showInformationMessage(
                `Copilot communication analyzer ${newState ? 'enabled' : 'disabled'}`
            );
        })
    );
    
    // Register command to export communication data
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.exportCommunicationData', async () => {
            const filePath = await analyzer.exportCommunicationHistoryToFile();
            if (filePath) {
                vscode.window.showInformationMessage(`Copilot communication data exported to ${filePath}`);
            }
        })
    );
    
    // Register command to clear communication history
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.clearCommunicationHistory', () => {
            analyzer.clearHistory();
            vscode.window.showInformationMessage('Copilot communication history cleared');
        })
    );
    
    // Register command to check CUDA support
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.checkCudaSupport', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Checking CUDA Support',
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ message: 'Detecting GPU...' });
                    const info = await cudaDetector.detectCuda();
                    
                    const statusMessage = info.isAvailable 
                        ? `CUDA support detected: ${info.gpuName} (${info.totalMemoryMB}MB)`
                        : 'CUDA support not detected';
                        
                    vscode.window.showInformationMessage(statusMessage, 'Show Details').then(selection => {
                        if (selection === 'Show Details') {
                            // Show detailed information in a new dashboard
                            dashboard.show();
                        }
                    });
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to check CUDA support: ${error}`);
                }
            });
        })
    );
    
    // Register command to check model compatibility
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.checkModelCompatibility', async () => {
            modelChecker.showModelCompatibilityReport();
        })
    );
    
    // Register command to get model recommendations
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.getModelRecommendations', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Getting Model Recommendations',
                cancellable: false
            }, async (progress) => {
                try {
                    progress.report({ message: 'Analyzing GPU capabilities...' });
                    const recommendations = await cudaDetector.getRecommendedModels();
                    
                    const recommendedCount = recommendations.recommended.length;
                    const messageText = recommendedCount > 0 
                        ? `Found ${recommendedCount} recommended models for your system`
                        : 'No recommended models found for your system';
                        
                    vscode.window.showInformationMessage(messageText, 'Show Recommendations').then(selection => {
                        if (selection === 'Show Recommendations') {
                            modelChecker.showModelCompatibilityReport();
                        }
                    });
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to get model recommendations: ${error}`);
                }
            });
        })
    );
    
    // Register command to clear logs
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.clearLogs', () => {
            logger.clearLogs();
            vscode.window.showInformationMessage('All logs cleared');
        })
    );
    
    // Register command to show output channel
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.showOutputChannel', () => {
            logger.showOutputChannel();
        })
    );
    
    // Register command to export logs
    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.exportLogs', async () => {
            // Create a quick pick to select export format
            const format = await vscode.window.showQuickPick(
                [
                    { label: 'JSON', description: 'Export logs as JSON format' },
                    { label: 'CSV', description: 'Export logs as CSV format' },
                    { label: 'Text', description: 'Export logs as plain text' }
                ],
                { placeHolder: 'Select export format' }
            );
            
            if (!format) return;
            
            const formatType = format.label.toLowerCase() as 'json' | 'csv' | 'txt';
            
            // Show log viewer with the export dialog
            const viewer = LogViewer.getInstance();
            viewer.show();
            
            // Let the log viewer handle the export
            setTimeout(() => {
                // Use VS Code messaging system to export logs
                vscode.commands.executeCommand('workbench:action:webview.message', {
                    command: 'exportLogs',
                    format: formatType
                });
            }, 500);
        })
    );
    
    // Initialize the analyzer state from workspace state
    const initialState = context.workspaceState.get<boolean>('copilotAnalyzerEnabled', false);
    analyzer.setEnabled(initialState);
    logger.info(`Copilot communication analyzer initialized (${initialState ? 'enabled' : 'disabled'})`, {}, 'DebugCommands');
    
    // Auto open dashboard if configured
    const config = vscode.workspace.getConfiguration('copilot-ppa.debug');
    const autoOpenDashboard = config.get<boolean>('autoOpenDashboard', false);
    if (autoOpenDashboard) {
        // Delay opening to ensure extension is fully loaded
        setTimeout(() => {
            dashboard.show();
        }, 2000);
    }
}
