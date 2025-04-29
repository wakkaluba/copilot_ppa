import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { SecurityScanResult, SecuritySeverity, SecurityIssue, SecuritySummary } from '../../types/security';
import { CodeSecurityScanner } from '../../security/codeScanner';
import { DependencyScanner } from '../../security/dependencyScanner';

export class SecurityScanService {
    private readonly logger: Logger;
    private readonly codeScanner: CodeSecurityScanner;
    private readonly dependencyScanner: DependencyScanner;

    constructor(context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.codeScanner = new CodeSecurityScanner(context);
        // Use the getInstance method instead of direct constructor
        this.dependencyScanner = DependencyScanner.getInstance(context);
    }

    public async runFullScan(): Promise<SecurityScanResult> {
        try {
            const [codeResult, dependencyResult] = await Promise.all([
                this.codeScanner.scanWorkspace(),
                this.dependencyScanner.scanWorkspaceDependencies()
            ]);

            return {
                timestamp: Date.now(), // Changed from new Date() to Date.now()
                issues: codeResult.issues,
                scannedFiles: codeResult.scannedFiles || 0,
                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                // Remove metrics field as it's not in the interface
            };
        } catch (error) {
            this.logger.error('Error during security scan', error);
            throw error;
        }
    }

    /**
     * Get detailed information about a security issue
     * @param issueId ID of the issue to get details for
     * @returns Detailed information about the security issue
     */
    public async getIssueDetails(issueId: string): Promise<SecurityIssue> {
        try {
            // First check if it's a code security issue
            const codeIssue = await this.codeScanner.getIssueDetails?.(issueId);
            if (codeIssue) {
                // Map to the correct SecurityIssue interface
                return {
                    id: codeIssue.id,
                    name: codeIssue.name || `Issue ${issueId}`,
                    description: codeIssue.description,
                    severity: this.normalizeSeverity(codeIssue.severity), // Convert to the correct enum
                    filePath: codeIssue.file || '',
                    line: codeIssue.line || 0,
                    column: codeIssue.column || 0,
                    recommendation: codeIssue.recommendation || 'No recommendation available'
                };
            }

            // Then check if it's a dependency vulnerability
            const dependencyIssue = await this.dependencyScanner.getVulnerabilityDetails?.(issueId);
            if (dependencyIssue) {
                // Format the dependency vulnerability as a security issue
                return {
                    id: dependencyIssue.id,
                    name: dependencyIssue.title || `Vulnerability ${issueId}`,
                    description: dependencyIssue.description || 'No description available',
                    severity: this.normalizeSeverity(dependencyIssue.severity),
                    filePath: 'package.json',
                    line: 0,
                    column: 0,
                    recommendation: `Update to version ${dependencyIssue.fixedIn || 'latest'}`
                };
            }

            throw new Error(`Issue with ID ${issueId} not found`);
        } catch (error) {
            this.logger.error(`Error getting issue details for ${issueId}`, error);
            throw error;
        }
    }

    private generateSummary(codeIssues: any[], dependencyIssues: any[]): SecuritySummary {
        const summary: SecuritySummary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        // Count code issues by severity
        [...codeIssues, ...dependencyIssues].forEach(issue => {
            const severityKey = this.normalizeSeverity(issue.severity);
            switch (severityKey) {
                case SecuritySeverity.CRITICAL:
                    summary.critical++;
                    break;
                case SecuritySeverity.HIGH:
                    summary.high++;
                    break;
                case SecuritySeverity.MEDIUM:
                    summary.medium++;
                    break;
                case SecuritySeverity.LOW:
                    summary.low++;
                    break;
            }
        });

        return summary;
    }
    
    private normalizeSeverity(severity: string): SecuritySeverity {
        switch (severity?.toLowerCase()) {
            case 'critical': return SecuritySeverity.CRITICAL;
            case 'high': return SecuritySeverity.HIGH;
            case 'medium': 
            case 'moderate': return SecuritySeverity.MEDIUM;
            case 'low': 
            default: return SecuritySeverity.LOW;
        }
    }

    public dispose(): void {
        this.codeScanner.dispose();
        this.dependencyScanner.dispose();
    }
}
