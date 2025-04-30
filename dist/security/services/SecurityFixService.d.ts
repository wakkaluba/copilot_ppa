import * as vscode from 'vscode';
import { SecurityIssue } from '../types';
/**
 * Service for applying automated fixes to security issues
 */
export declare class SecurityFixService implements vscode.Disposable {
    private readonly disposables;
    constructor();
    /**
     * Apply an automated fix for a security issue
     */
    applyFix(issue: SecurityIssue): Promise<void>;
    private fixSqlInjection;
    private fixXss;
    private fixPathTraversal;
    private fixHardcodedCredentials;
    private fixWeakCrypto;
    private addToEnvFile;
    /**
     * Apply fix by issue ID and file path
     */
    applyFixById(issueId: string, filePath: string): Promise<void>;
    private findIssueRange;
    private generateFix;
    dispose(): void;
}
