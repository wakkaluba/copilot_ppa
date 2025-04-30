import * as vscode from 'vscode';
import { SecurityScanResult, SecurityIssue } from '../../types/security';
export declare class SecurityScanService {
    private readonly logger;
    private readonly codeScanner;
    private readonly dependencyScanner;
    constructor(context: vscode.ExtensionContext);
    runFullScan(): Promise<SecurityScanResult>;
    /**
     * Get detailed information about a security issue
     * @param issueId ID of the issue to get details for
     * @returns Detailed information about the security issue
     */
    getIssueDetails(issueId: string): Promise<SecurityIssue>;
    private generateSummary;
    private normalizeSeverity;
    dispose(): void;
}
