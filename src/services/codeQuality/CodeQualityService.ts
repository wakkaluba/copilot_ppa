import * as vscode from 'vscode';
import { SecurityIssue } from '../../security/types';
import { Logger } from '../../utils/logger';
import { BestPracticesChecker } from './analyzers/BestPracticesChecker';
import { SecurityAnalyzer } from './analyzers/SecurityAnalyzer';
import { AnalysisHistory, AnalysisMetrics, AnalysisResult } from './types';

export class CodeQualityService implements vscode.Disposable {
    private readonly analyzers: SecurityAnalyzer[] = [];
    private readonly bestPracticesChecker: BestPracticesChecker;
    private readonly diagnosticCollection: vscode.DiagnosticCollection;
    private readonly history: AnalysisHistory = { metrics: [], maxEntries: 30 };
    private readonly logger: Logger;

    constructor(context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.bestPracticesChecker = new BestPracticesChecker(this.logger);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('code-quality');
        this.analyzers.push(new SecurityAnalyzer());

        context.subscriptions.push(
            this.diagnosticCollection,
            vscode.workspace.onDidSaveTextDocument(this.onDocumentSaved.bind(this))
        );
    }

    public async analyzeDocument(document: vscode.TextDocument): Promise<AnalysisResult[]> {
        const results: AnalysisResult[] = [];

        try {
            const [bestPracticesResult, ...analyzerResults] = await Promise.all([
                this.bestPracticesChecker.analyzeDocument(document),
                ...this.analyzers.map(analyzer => analyzer.analyzeDocument(document))
            ]);

            results.push(bestPracticesResult, ...analyzerResults);
            this.updateDiagnostics(document.uri, results);
            await this.updateQualityHistory(document, results);
        } catch (error) {
            this.logger.error('Error analyzing document', error);
            throw error;
        }

        return results;
    }

    public async analyzeWorkspace(progressCallback?: (message: string) => void): Promise<AnalysisResult[]> {
        const results: AnalysisResult[] = [];
        const files = await vscode.workspace.findFiles('**/*.{ts,js,py,java}', '**/node_modules/**');

        for (const file of files) {
            progressCallback?.(`Analyzing ${file.fsPath}...`);
            const document = await vscode.workspace.openTextDocument(file);
            const fileResults = await this.analyzeDocument(document);
            results.push(...fileResults);
        }

        return results;
    }

    private updateDiagnostics(uri: vscode.Uri, results: AnalysisResult[]): void {
        const allDiagnostics = results.flatMap(result => result.diagnostics);
        this.diagnosticCollection.set(uri, allDiagnostics);
    }

    private async updateQualityHistory(document: vscode.TextDocument, results: AnalysisResult[]): Promise<void> {
        const metrics = await this.calculateMetrics(document, results);

        this.history.metrics.push(metrics);
        if (this.history.metrics.length > this.history.maxEntries) {
            this.history.metrics.shift();
        }
    }

    private async calculateMetrics(document: vscode.TextDocument, results: AnalysisResult[]): Promise<AnalysisMetrics> {
        const issues = results.flatMap(r => r.issues);

        // Calculate metrics based on issues and code analysis
        const complexity = this.calculateComplexityMetric(document, issues);
        const security = this.calculateSecurityMetric(issues);
        const maintainability = this.calculateMaintainabilityMetric(document, issues);
        const performance = this.calculatePerformanceMetric(document, issues);

        return {
            complexity,
            maintainability,
            security,
            performance,
            timestamp: Date.now()
        };
    }

    private calculateComplexityMetric(document: vscode.TextDocument, issues: SecurityIssue[]): number {
        const complexityIssues = issues.filter(i => i.id.startsWith('BP002'));
        const baseScore = 100;
        const deduction = complexityIssues.length * 10;
        return Math.max(0, Math.min(100, baseScore - deduction));
    }

    private calculateSecurityMetric(issues: SecurityIssue[]): number {
        const securityIssues = issues.filter(i => i.id.startsWith('SEC'));
        const weights = { critical: 25, high: 15, medium: 10, low: 5 };
        const baseScore = 100;

        const deduction = securityIssues.reduce((total, issue) => {
            const severityWeight = weights[issue.severity.toLowerCase() as keyof typeof weights] || 5;
            return total + severityWeight;
        }, 0);

        return Math.max(0, Math.min(100, baseScore - deduction));
    }

    private calculateMaintainabilityMetric(document: vscode.TextDocument, issues: SecurityIssue[]): number {
        const maintainabilityIssues = issues.filter(i =>
            i.id.startsWith('BP001') || // Long methods
            i.id.startsWith('BP003') || // Poor naming
            i.id.startsWith('BP004')    // Missing documentation
        );

        const baseScore = 100;
        const deduction = maintainabilityIssues.length * 5;
        return Math.max(0, Math.min(100, baseScore - deduction));
    }

    private calculatePerformanceMetric(document: vscode.TextDocument, issues: SecurityIssue[]): number {
        // For now, return a default score as we haven't implemented performance checks yet
        return 100;
    }

    private async onDocumentSaved(document: vscode.TextDocument): Promise<void> {
        if (this.shouldAnalyzeDocument(document)) {
            await this.analyzeDocument(document);
        }
    }

    private shouldAnalyzeDocument(document: vscode.TextDocument): boolean {
        const supportedLanguages = ['typescript', 'javascript', 'python', 'java'];
        return supportedLanguages.includes(document.languageId);
    }

    public getQualityHistory(): AnalysisHistory {
        return this.history;
    }

    public dispose(): void {
        this.diagnosticCollection.clear();
        this.diagnosticCollection.dispose();
        this.analyzers.forEach(analyzer => analyzer.dispose());
        this.bestPracticesChecker.dispose();
    }
}
