import * as vscode from 'vscode';
import { PerformanceAnalyzer } from './performanceAnalyzer';

/**
 * Manager class for performance analysis functionality
 */
export class PerformanceManager {
    private context: vscode.ExtensionContext;
    private analyzer: PerformanceAnalyzer;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.analyzer = new PerformanceAnalyzer(context);
        
        this.registerCommands();
    }

    /**
     * Register all performance-related commands
     */
    private registerCommands(): void {
        // Register commands for performance analysis
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.performance.analyzeActiveFile', () => {
                this.analyzeActiveFile();
            })
        );
        
        this.context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.performance.analyzeWorkspace', () => {
                this.analyzeWorkspace();
            })
        );
    }

    /**
     * Analyze the active file for performance issues
     */
    private async analyzeActiveFile(): Promise<void> {
        try {
            const result = await this.analyzer.analyzeActiveFile();
            
            if (!result) {
                return;
            }
            
            // Show result count in a notification
            if (result.issues.length > 0) {
                vscode.window.showInformationMessage(
                    `Found ${result.issues.length} performance issues in ${path.basename(result.filePath)}`,
                    'Show Details'
                ).then(selection => {
                    if (selection === 'Show Details') {
                        this.analyzer.showFileAnalysisReport(result);
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    `No performance issues found in ${path.basename(result.filePath)}`
                );
            }
            
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
        }
    }

    /**
     * Analyze the entire workspace for performance issues
     */
    private async analyzeWorkspace(): Promise<void> {
        try {
            const result = await this.analyzer.analyzeWorkspace();
            
            const totalIssues = result.summary.totalIssues;
            
            if (totalIssues > 0) {
                vscode.window.showInformationMessage(
                    `Found ${totalIssues} performance issues in ${result.summary.filesAnalyzed} files`,
                    'Show Report'
                ).then(selection => {
                    if (selection === 'Show Report') {
                        this.analyzer.showWorkspaceAnalysisReport(result);
                    }
                });
            } else {
                vscode.window.showInformationMessage(
                    `No performance issues found in ${result.summary.filesAnalyzed} files`
                );
            }
            
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing workspace: ${error}`);
        }
    }
}

import * as path from 'path';
