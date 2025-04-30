import * as vscode from 'vscode';
export interface DesignIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'recommendation' | 'critical';
    description: string;
    improvement: string;
    category: 'architecture' | 'patterns' | 'structure' | 'modularization' | 'coupling';
}
export declare class DesignImprovementSuggester {
    private languageAnalyzer;
    private architectureService;
    private diagnosticService;
    constructor(context: vscode.ExtensionContext);
    /**
     * Analyzes a file for potential design improvements
     */
    analyzeDesign(document: vscode.TextDocument): Promise<DesignIssue[]>;
    /**
     * Analyzes a workspace for architectural patterns and improvements
     */
    analyzeWorkspaceArchitecture(): Promise<DesignIssue[]>;
    /**
     * Suggests architectural patterns based on project analysis
     */
    suggestArchitecturalPatterns(codebase: string): string[];
}
