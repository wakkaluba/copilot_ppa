import * as vscode from 'vscode';
import { PerformanceManager } from '../performance/performanceManager';
import { Logger } from '../utils/logger';

/**
 * Register all performance-related commands
 */
export function registerPerformanceCommands(context: vscode.ExtensionContext): void {
    const perfManager = PerformanceManager.getInstance();
    const logger = Logger.getInstance();
    
    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('localLLMAgent.performance.toggleProfiling', async () => {
            const config = vscode.workspace.getConfiguration('localLLMAgent.performance');
            const currentValue = config.get<boolean>('profilingEnabled', false);
            
            // Toggle the value
            await config.update('profilingEnabled', !currentValue, vscode.ConfigurationTarget.Global);
            
            // Reinitialize the performance manager to apply changes
            perfManager.initialize();
            
            vscode.window.showInformationMessage(
                `Performance profiling ${!currentValue ? 'enabled' : 'disabled'}`
            );
        }),
        
        vscode.commands.registerCommand('localLLMAgent.performance.generateReport', () => {
            perfManager.generatePerformanceReport();
            vscode.window.showInformationMessage('Performance report generated. Check the output log.');
        }),
        
        vscode.commands.registerCommand('localLLMAgent.performance.clearCache', () => {
            perfManager.getCachingService().clearAll();
            vscode.window.showInformationMessage('Cache cleared successfully.');
        }),
        
        vscode.commands.registerCommand('localLLMAgent.performance.analyzeBottlenecks', () => {
            const bottleneckDetector = perfManager.getBottleneckDetector();
            const bottlenecks = bottleneckDetector.analyzeAll();
            
            if (bottlenecks.critical.length === 0 && bottlenecks.warnings.length === 0) {
                vscode.window.showInformationMessage('No performance bottlenecks detected.');
                return;
            }
            
            logger.log('=== BOTTLENECK ANALYSIS ===');
            
            if (bottlenecks.critical.length > 0) {
                logger.log(`Critical bottlenecks (${bottlenecks.critical.length}):`);
                bottlenecks.critical.forEach(opId => {
                    logger.log(`- ${opId}`);
                });
            }
            
            if (bottlenecks.warnings.length > 0) {
                logger.log(`Performance warnings (${bottlenecks.warnings.length}):`);
                bottlenecks.warnings.forEach(opId => {
                    logger.log(`- ${opId}`);
                });
            }
            
            logger.log('==========================');
            
            vscode.window.showWarningMessage(
                `Found ${bottlenecks.critical.length} critical and ${bottlenecks.warnings.length} warning bottlenecks. See output log for details.`
            );
        }),
        
        vscode.commands.registerCommand('localLLMAgent.performance.optimizationSuggestions', async () => {
            const operations = Array.from(perfManager.getProfiler().getAllStats().keys());
            
            if (operations.length === 0) {
                vscode.window.showInformationMessage('No operations data available for optimization suggestions.');
                return;
            }
            
            const selected = await vscode.window.showQuickPick(operations, {
                placeHolder: 'Select an operation to get optimization suggestions'
            });
            
            if (!selected) {return;}
            
            const suggestions = perfManager.getBottleneckDetector().getOptimizationSuggestions(selected);
            
            logger.log(`=== OPTIMIZATION SUGGESTIONS FOR ${selected} ===`);
            suggestions.forEach((suggestion, index) => {
                logger.log(`${index + 1}. ${suggestion}`);
            });
            logger.log('==========================================');
            
            vscode.window.showInformationMessage('Optimization suggestions available in output log.');
        })
    );
    
    logger.log('Performance commands registered');
}
