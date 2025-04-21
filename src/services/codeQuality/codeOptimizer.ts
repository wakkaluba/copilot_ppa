import * as vscode from 'vscode';
import { CodeOptimizerService } from './services/CodeOptimizerService';
import { OptimizationIssue } from './types';

export class CodeOptimizer {
    private service: CodeOptimizerService;

    constructor(context: vscode.ExtensionContext) {
        this.service = new CodeOptimizerService(context);
    }

    public async analyzePerformance(document: vscode.TextDocument): Promise<OptimizationIssue[]> {
        return this.service.analyzePerformance(document);
    }

    public async analyzeMemoryUsage(document: vscode.TextDocument): Promise<OptimizationIssue[]> {
        return this.service.analyzeMemoryUsage(document);
    }

    public analyzeRuntimeComplexity(document: vscode.TextDocument): OptimizationIssue[] {
        return this.service.analyzeRuntimeComplexity(document);
    }
}
