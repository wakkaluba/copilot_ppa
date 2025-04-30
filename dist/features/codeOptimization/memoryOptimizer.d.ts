import * as vscode from 'vscode';
import { LLMService } from '../../services/llm/llmService';
export interface MemoryIssue {
    file: string;
    line: number;
    issue: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
    affectedMemory?: string;
}
export declare class MemoryOptimizer {
    private staticAnalyzer;
    private llmAnalyzer;
    private cacheService;
    private diagnosticCollector;
    private reportGenerator;
    constructor(context: vscode.ExtensionContext, llmService: LLMService);
    dispose(): void;
    analyzeCurrentFile(): Promise<MemoryIssue[]>;
    analyzeFile(fileUri: vscode.Uri): Promise<MemoryIssue[]>;
    analyzeWorkspace(): Promise<void>;
    findMemoryLeaks(): Promise<void>;
}
