import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { LLMService } from '../../services/llm/llmService';

export interface PerformanceIssue {
    file: string;
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
}

export class PerformanceAnalyzer {
    private llmService: LLMService;
    private context: vscode.ExtensionContext;
    private diagnosticCollection: vscode.DiagnosticCollection;
    
    constructor(context: vscode.ExtensionContext, llmService: LLMService) {
        this.context = context;
        this.llmService = llmService;
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('performance-issues');
        
        context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzePerformance', 
                this.analyzeCurrentFile.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspacePerformance',
                this.analyzeWorkspace.bind(this)),
            this.diagnosticCollection
        );
    }
    
    /**
     * Analyzes the currently active file for performance issues
     */
    public async analyzeCurrentFile(): Promise<PerformanceIssue[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        
        const document = editor.document;
        return this.analyzeFile(document.uri);
    }
    
    /**
     * Analyzes an individual file for performance issues
     */
    public async analyzeFile(fileUri: vscode.Uri): Promise<PerformanceIssue[]> {
        const document = await vscode.workspace.openTextDocument(fileUri);
        const fileContent = document.getText();
        const fileName = path.basename(fileUri.fsPath);
        const fileExtension = path.extname(fileUri.fsPath).substring(1);
        
        // Clear previous diagnostics for this file
        this.diagnosticCollection.delete(fileUri);
        
        try {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Analyzing performance for ${fileName}`,
                cancellable: true
            }, async (progress, token) => {
                progress.report({ increment: 0 });
                
                // Perform static analysis first
                const staticIssues = await this.performStaticAnalysis(fileContent, fileExtension);
                progress.report({ increment: 50, message: 'Static analysis complete' });
                
                if (token.isCancellationRequested) {
                    return [];
                }
                
                // Use LLM for more complex analysis
                const llmIssues = await this.performLLMAnalysis(fileContent, fileExtension);
                progress.report({ increment: 50, message: 'LLM analysis complete' });
                
                // Combine results
                const issues = [...staticIssues, ...llmIssues].map(issue => ({
                    ...issue,
                    file: fileUri.fsPath
                }));
                
                // Add diagnostics
                this.addDiagnostics(fileUri, issues, document);
                
                // Show results in output channel
                this.displayResults(issues);
                
                return issues;
            });
            
            return [];
        } catch (error) {
            vscode.window.showErrorMessage(`Error analyzing file: ${error}`);
            return [];
        }
    }
    
    /**
     * Analyzes all files in the workspace for performance issues
     */
    public async analyzeWorkspace(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace performance',
            cancellable: true
        }, async (progress, token) => {
            // Get all files in workspace
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx}', '**/node_modules/**');
            
            let processedFiles = 0;
            const totalFiles = files.length;
            
            // Process each file
            for (const fileUri of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                
                await this.analyzeFile(fileUri);
                
                processedFiles++;
                progress.report({ 
                    increment: (100 / totalFiles),
                    message: `Processed ${processedFiles} of ${totalFiles} files`
                });
            }
        });
    }
    
    /**
     * Performs static analysis on the file content
     */
    private async performStaticAnalysis(content: string, fileType: string): Promise<PerformanceIssue[]> {
        const issues: PerformanceIssue[] = [];
        
        // Check for common performance issues based on file type
        const lines = content.split('\n');
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Check for excessive nesting (cyclomatic complexity indicator)
            const indentation = line.search(/\S|$/);
            if (indentation > 24) { // More than 6 levels of nesting (assuming 4 spaces per level)
                issues.push({
                    file: '',
                    line: i,
                    issue: 'Excessive nesting depth detected',
                    severity: 'medium',
                    suggestion: 'Consider refactoring to reduce nesting. Extract code blocks into separate functions.'
                });
            }
            
            // Check for large array/object literals
            if (line.includes('[') && line.length > 120) {
                issues.push({
                    file: '',
                    line: i,
                    issue: 'Large array literal',
                    severity: 'low',
                    suggestion: 'Consider loading large data from external sources or splitting into smaller chunks.'
                });
            }
            
            // JavaScript/TypeScript specific checks
            if (['js', 'ts', 'jsx', 'tsx'].includes(fileType)) {
                // Check for inefficient list operations
                if (line.includes('.forEach') && (line.includes('.push') || line.includes('.map'))) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Inefficient array operation',
                        severity: 'medium',
                        suggestion: 'Use map or filter directly instead of forEach with push for better performance.'
                    });
                }
                
                // Check for potential memory leaks in event listeners
                if (line.includes('addEventListener') && !content.includes('removeEventListener')) {
                    issues.push({
                        file: '',
                        line: i,
                        issue: 'Potential memory leak',
                        severity: 'high',
                        suggestion: 'Ensure event listeners are properly removed when no longer needed.'
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * Uses LLM to identify complex performance issues
     */
    private async performLLMAnalysis(content: string, fileType: string): Promise<PerformanceIssue[]> {
        // Only analyze files under a certain size to prevent token limit issues
        if (content.length > 10000) {
            content = content.substring(0, 10000) + "\n... (content truncated for analysis)";
        }
        
        const prompt = `
        Analyze the following ${fileType} code for performance issues, bottlenecks, and optimization opportunities.
        Focus on algorithmic efficiency, memory usage, and computational complexity.
        Format your response as a JSON array of issues with the following structure:
        [
          {
            "line": <line number>,
            "issue": "<description of the performance issue>",
            "severity": "<low|medium|high>",
            "suggestion": "<specific suggestion to improve performance>"
          }
        ]
        
        Code to analyze:
        \`\`\`${fileType}
        ${content}
        \`\`\`
        
        Only return the JSON array, nothing else.
        `;
        
        try {
            const response = await this.llmService.sendMessage(prompt);
            
            try {
                // Extract JSON from response
                const jsonStr = response.trim().replace(/```json|```/g, '').trim();
                const issues = JSON.parse(jsonStr) as Array<Omit<PerformanceIssue, 'file'>>;
                
                return issues.map(issue => ({
                    file: '',
                    ...issue
                }));
            } catch (error) {
                console.error('Failed to parse LLM response as JSON:', error);
                console.debug('Raw response:', response);
                return [];
            }
        } catch (error) {
            console.error('Error getting LLM analysis:', error);
            return [];
        }
    }
    
    /**
     * Adds diagnostics to the file for visualization in the editor
     */
    private addDiagnostics(fileUri: vscode.Uri, issues: PerformanceIssue[], document: vscode.TextDocument): void {
        const diagnostics: vscode.Diagnostic[] = issues.map(issue => {
            const line = document.lineAt(issue.line);
            const range = new vscode.Range(issue.line, 0, issue.line, line.text.length);
            
            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.issue}: ${issue.suggestion}`,
                this.getSeverity(issue.severity)
            );
            
            diagnostic.source = 'Performance Analyzer';
            return diagnostic;
        });
        
        this.diagnosticCollection.set(fileUri, diagnostics);
    }
    
    /**
     * Maps the severity level to a vscode.DiagnosticSeverity
     */
    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'high':
                return vscode.DiagnosticSeverity.Error;
            case 'medium':
                return vscode.DiagnosticSeverity.Warning;
            case 'low':
            default:
                return vscode.DiagnosticSeverity.Information;
        }
    }
    
    /**
     * Displays the results in an output channel
     */
    private displayResults(issues: PerformanceIssue[]): void {
        const outputChannel = vscode.window.createOutputChannel('Performance Analysis');
        outputChannel.clear();
        
        if (issues.length === 0) {
            outputChannel.appendLine('No performance issues detected.');
            return;
        }
        
        outputChannel.appendLine(`Found ${issues.length} potential performance issues:`);
        outputChannel.appendLine('');
        
        issues.forEach(issue => {
            outputChannel.appendLine(`File: ${issue.file}`);
            outputChannel.appendLine(`Line: ${issue.line + 1}`);
            outputChannel.appendLine(`Severity: ${issue.severity.toUpperCase()}`);
            outputChannel.appendLine(`Issue: ${issue.issue}`);
            outputChannel.appendLine(`Suggestion: ${issue.suggestion}`);
            outputChannel.appendLine('-------------------------------------------');
        });
        
        outputChannel.show();
    }
}
