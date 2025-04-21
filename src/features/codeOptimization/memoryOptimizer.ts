import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { LLMService } from '../../services/llm/llmService';
import { StaticMemoryAnalyzer } from './memoryAnalyzer/StaticMemoryAnalyzer';
import { LLMMemoryAnalyzer } from './memoryAnalyzer/LLMMemoryAnalyzer';
import { MemoryCacheService } from './memoryAnalyzer/MemoryCacheService';
import { MemoryDiagnosticCollector } from './memoryAnalyzer/MemoryDiagnosticCollector';
import { MemoryReportGenerator } from './memoryAnalyzer/MemoryReportGenerator';

export interface MemoryIssue {
    file: string;
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
    affectedMemory?: string;
}

export class MemoryOptimizer {
    private staticAnalyzer: StaticMemoryAnalyzer;
    private llmAnalyzer: LLMMemoryAnalyzer;
    private cacheService: MemoryCacheService;
    private diagnosticCollector: MemoryDiagnosticCollector;
    private reportGenerator: MemoryReportGenerator;

    constructor(context: vscode.ExtensionContext, llmService: LLMService) {
        this.staticAnalyzer = new StaticMemoryAnalyzer();
        this.llmAnalyzer = new LLMMemoryAnalyzer(llmService);
        this.cacheService = new MemoryCacheService();
        this.diagnosticCollector = new MemoryDiagnosticCollector(context);
        this.reportGenerator = new MemoryReportGenerator(context);

        context.subscriptions.push(
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeMemoryUsage', 
                this.analyzeCurrentFile.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.analyzeWorkspaceMemory',
                this.analyzeWorkspace.bind(this)),
            vscode.commands.registerCommand('vscode-local-llm-agent.findMemoryLeaks',
                this.findMemoryLeaks.bind(this)),
            this.diagnosticCollector,
        );
    }

    public dispose(): void {
        this.diagnosticCollector.dispose();
        this.cacheService.clear();
    }

    public async analyzeCurrentFile(): Promise<MemoryIssue[]> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return [];
        }
        
        const document = editor.document;
        return this.analyzeFile(document.uri);
    }

    public async analyzeFile(fileUri: vscode.Uri): Promise<MemoryIssue[]> {
        const content = (await vscode.workspace.openTextDocument(fileUri)).getText();
        const cached = this.cacheService.get(content);
        let issues = cached || [];
        if (!cached) {
            const staticIssues = await this.staticAnalyzer.analyze(content);
            const llmIssues = await this.llmAnalyzer.analyze(content);
            issues = [...staticIssues, ...llmIssues];
            this.cacheService.store(content, issues);
        }
        this.diagnosticCollector.collect(fileUri, issues);
        return issues;
    }

    public async analyzeWorkspace(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showWarningMessage('No workspace folder open');
            return;
        }
        
        const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
        
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Analyzing workspace memory usage',
            cancellable: true
        }, async (progress, token) => {
            const files = await vscode.workspace.findFiles('**/*.{js,ts,jsx,tsx,py,java,c,cpp}', '**/node_modules/**');
            
            let processedFiles = 0;
            const totalFiles = files.length;
            let allIssues: MemoryIssue[] = [];
            
            for (const file of files) {
                if (token.isCancellationRequested) {
                    break;
                }
                
                const issues = await this.analyzeFile(file);
                allIssues = [...allIssues, ...issues];
                
                processedFiles++;
                progress.report({
                    increment: (100 / totalFiles),
                    message: `Processed ${processedFiles} of ${totalFiles} files`
                });
            }
            
            this.reportGenerator.generate(allIssues);
        });
    }

    public async findMemoryLeaks(): Promise<void> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active file to analyze');
            return;
        }
        const fileUri = editor.document.uri;
        const issues = await this.analyzeFile(fileUri);
    }
}
