import * as vscode from 'vscode';
import * as path from 'path';
import { LanguageDesignAnalyzer } from './services/LanguageDesignAnalyzer';
import { ArchitectureAnalysisService } from './services/ArchitectureAnalysisService';
import { DesignDiagnosticService } from './services/DesignDiagnosticService';

export interface DesignIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'recommendation' | 'critical';
    description: string;
    improvement: string;
    category: 'architecture' | 'patterns' | 'structure' | 'modularization' | 'coupling';
}

export class DesignImprovementSuggester {
    private languageAnalyzer: LanguageDesignAnalyzer;
    private architectureService: ArchitectureAnalysisService;
    private diagnosticService: DesignDiagnosticService;

    constructor(context: vscode.ExtensionContext) {
        this.languageAnalyzer = new LanguageDesignAnalyzer();
        this.architectureService = new ArchitectureAnalysisService();
        this.diagnosticService = new DesignDiagnosticService(context);
    }

    /**
     * Analyzes a file for potential design improvements
     */
    public async analyzeDesign(document: vscode.TextDocument): Promise<DesignIssue[]> {
        const issues = await this.languageAnalyzer.analyze(document);
        this.diagnosticService.report(document, issues);
        return issues;
    }

    /**
     * Analyzes a workspace for architectural patterns and improvements
     */
    public async analyzeWorkspaceArchitecture(): Promise<DesignIssue[]> {
        const issues = await this.architectureService.analyzeWorkspace();
        return issues;
    }

    /**
     * Suggests architectural patterns based on project analysis
     */
    public suggestArchitecturalPatterns(codebase: string): string[] {
        return this.architectureService.suggestPatterns(codebase);
    }
}
