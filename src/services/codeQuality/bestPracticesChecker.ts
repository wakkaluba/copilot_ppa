// Migrated from orphaned-code
import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { BestPracticeIssue, BestPracticesService } from './BestPracticesService';

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

  private mapSeverityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
      case 'critical':
        return vscode.DiagnosticSeverity.Error;
      case 'warning':
        return vscode.DiagnosticSeverity.Warning;
      case 'info':
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Hint;
    }
  }

  public dispose(): void {
    this._diagnosticCollection.dispose();
  }
}
