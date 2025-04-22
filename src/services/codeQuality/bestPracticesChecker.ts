import * as vscode from 'vscode';
import { BestPracticesService } from './BestPracticesService';
import { Logger } from '../../utils/logger';

export interface BestPracticeIssue {
    file: string;
    line: number;
    column: number;
    severity: 'suggestion' | 'warning' | 'error';
    description: string;
    recommendation: string;
    category: 'antiPattern' | 'design' | 'consistency' | 'documentation' | 'naming';
}

/**
 * Checks and enforces best practices in code
 */
export class BestPracticesChecker implements vscode.Disposable {
    private readonly _service: BestPracticesService;
    private readonly _diagnosticCollection: vscode.DiagnosticCollection;
    private readonly _logger: Logger;

    constructor(context: vscode.ExtensionContext, logger: Logger) {
        this._logger = logger;
        this._diagnosticCollection = vscode.languages.createDiagnosticCollection('best-practices');
        this._service = new BestPracticesService(context);

        context.subscriptions.push(this._diagnosticCollection);
    }

    /**
     * Detects anti-patterns in code
     */
    public async detectAntiPatterns(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        try {
            const issues = await this._service.detectAntiPatterns(document);
            this.updateDiagnostics(document, issues);
            return issues;
        } catch (error) {
            this._logger.error('Error detecting anti-patterns', error);
            return [];
        }
    }

    /**
     * Suggests design improvements
     */
    public async suggestDesignImprovements(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        try {
            const issues = await this._service.suggestDesignImprovements(document);
            this.updateDiagnostics(document, issues);
            return issues;
        } catch (error) {
            this._logger.error('Error suggesting design improvements', error);
            return [];
        }
    }

    /**
     * Checks code consistency
     */
    public async checkCodeConsistency(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        try {
            const issues = await this._service.checkCodeConsistency(document);
            this.updateDiagnostics(document, issues);
            return issues;
        } catch (error) {
            this._logger.error('Error checking code consistency', error);
            return [];
        }
    }

    /**
     * Run all checks at once
     */
    public async checkAll(document: vscode.TextDocument): Promise<BestPracticeIssue[]> {
        try {
            const [antiPatterns, designImprovements, consistencyIssues] = await Promise.all([
                this.detectAntiPatterns(document),
                this.suggestDesignImprovements(document),
                this.checkCodeConsistency(document)
            ]);

            const allIssues = [...antiPatterns, ...designImprovements, ...consistencyIssues];
            this.updateDiagnostics(document, allIssues);
            return allIssues;
        } catch (error) {
            this._logger.error('Error running all checks', error);
            return [];
        }
    }

    /**
     * Update diagnostics for document
     */
    private updateDiagnostics(document: vscode.TextDocument, issues: BestPracticeIssue[]): void {
        const diagnostics = issues.map(issue => {
            const range = new vscode.Range(
                issue.line - 1, issue.column - 1,
                issue.line - 1, issue.column + 20
            );
            
            const diagnostic = new vscode.Diagnostic(
                range,
                `${issue.description}\n${issue.recommendation}`,
                this.mapSeverityToDiagnosticSeverity(issue.severity)
            );
            
            diagnostic.source = 'Best Practices';
            return diagnostic;
        });
        
        this._diagnosticCollection.set(document.uri, diagnostics);
    }

    /**
     * Map severity to VS Code diagnostic severity
     */
    private mapSeverityToDiagnosticSeverity(severity: BestPracticeIssue['severity']): vscode.DiagnosticSeverity {
        switch (severity) {
            case 'error': return vscode.DiagnosticSeverity.Error;
            case 'warning': return vscode.DiagnosticSeverity.Warning;
            case 'suggestion': return vscode.DiagnosticSeverity.Hint;
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this._diagnosticCollection.dispose();
        this._service.dispose();
    }
}
