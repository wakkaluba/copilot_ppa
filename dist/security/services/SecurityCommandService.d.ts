import * as vscode from 'vscode';
import { SecurityAnalysisService } from './SecurityAnalysisService';
import { DependencyAnalysisService } from './DependencyAnalysisService';
import { RecommendationService } from './RecommendationService';
import { SecurityReportService } from './SecurityReportService';
/**
 * Service for registering and handling security-related commands
 */
export declare class SecurityCommandService implements vscode.Disposable {
    private readonly analysisSvc;
    private readonly dependencySvc;
    private readonly recommendationSvc;
    private readonly reportSvc;
    private readonly disposables;
    constructor(analysisSvc: SecurityAnalysisService, dependencySvc: DependencyAnalysisService, recommendationSvc: RecommendationService, reportSvc: SecurityReportService);
    /**
     * Register all security-related commands
     */
    private registerCommands;
    /**
     * Scan the active file for security issues
     */
    private scanActiveFile;
    /**
     * Scan the entire workspace for security issues
     */
    private scanWorkspace;
    /**
     * Check dependencies for vulnerabilities
     */
    private checkDependencies;
    /**
     * Generate security recommendations
     */
    private generateRecommendations;
    /**
     * Run a full security analysis
     */
    private runFullAnalysis;
    /**
     * Show security issues of a specific type
     */
    private showSecurityIssues;
    /**
     * Fix all security issues that have automated fixes
     */
    private fixAllIssues;
    /**
     * Apply a security fix to a specific issue
     */
    private applyFix;
    dispose(): void;
}
