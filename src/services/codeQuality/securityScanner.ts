// Migrated from orphaned-code
import { exec } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execAsync = promisify(exec);

export interface SecurityIssue {
  file: string;
  line: number;
  column: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

export class SecurityScanner {
  private _context: vscode.ExtensionContext;
  private _diagnosticCollection: vscode.DiagnosticCollection;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._diagnosticCollection = vscode.languages.createDiagnosticCollection('security-issues');
    context.subscriptions.push(this._diagnosticCollection);
  }

  public async scanDependencies(): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return issues;
    }
    for (const folder of workspaceFolders) {
      const packageJsonPath = path.join(folder.uri.fsPath, 'package.json');
      try {
        const { stdout } = await execAsync('npm audit --json', { cwd: folder.uri.fsPath });
        const auditResult = JSON.parse(stdout);
        if (auditResult.vulnerabilities) {
          for (const [pkgName, vuln] of Object.entries<any>(auditResult.vulnerabilities)) {
            for (const info of vuln.via || []) {
              if (typeof info === 'object') {
                issues.push({
                  file: packageJsonPath,
                  line: 1,
                  column: 1,
                  severity: this.mapSeverity(info.severity || 'low'),
                  description: `Vulnerability in dependency ${pkgName}: ${info.title || info.name}`,
                  recommendation: `Update to version ${vuln.fixAvailable?.version || 'latest'} or newer`
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Failed to run npm audit:', error);
      }
    }
    return issues;
  }

  public async scanFileForIssues(document: vscode.TextDocument): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];
    const text = document.getText();
    const filePath = document.uri.fsPath;
    const fileExtension = path.extname(filePath).toLowerCase();
    if (['.js', '.ts', '.jsx', '.tsx'].includes(fileExtension)) {
      this.checkJavaScriptSecurity(text, document, issues);
    } else if (['.py'].includes(fileExtension)) {
      this.checkPythonSecurity(text, document, issues);
    } else if (['.java'].includes(fileExtension)) {
      this.checkJavaSecurity(text, document, issues);
    }
    this.updateDiagnostics(document, issues);
    return issues;
  }

  public getSecurityRecommendations(document: vscode.TextDocument): string[] {
    // TODO: Implement proactive security recommendations
    return [];
  }

  private updateDiagnostics(document: vscode.TextDocument, issues: SecurityIssue[]): void {
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
      diagnostic.source = 'Security';
      return diagnostic;
    });
    this._diagnosticCollection.set(document.uri, diagnostics);
  }

  private mapSeverity(severity: string): SecurityIssue['severity'] {
    switch (severity) {
      case 'critical':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  private mapSeverityToDiagnosticSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
      case 'critical':
      case 'high':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      default:
        return vscode.DiagnosticSeverity.Information;
    }
  }

  private checkJavaScriptSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
    // TODO: Implement JavaScript/TypeScript security checks
  }

  private checkPythonSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
    // TODO: Implement Python security checks
  }

  private checkJavaSecurity(text: string, document: vscode.TextDocument, issues: SecurityIssue[]): void {
    // TODO: Implement Java security checks
  }

  public dispose(): void {
    this._diagnosticCollection.dispose();
  }
}
