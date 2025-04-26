import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { SecurityScanResult, SecuritySeverity, SecurityIssue } from '../../types/security';
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
                timestamp: new Date(),
                issues: codeResult.issues,
                scannedFiles: codeResult.scannedFiles || 0,
                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                metrics: {
                    filesScanned: codeResult.filesScanned || codeResult.scannedFiles || 0,
                    issuesFound: codeResult.issues.length + dependencyResult.vulnerabilities.length,
                    scanDuration: codeResult.duration || 0
                }
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
                // Make sure we have all required fields by mapping between types if needed
                return {
                    id: codeIssue.id,
                    name: codeIssue.name || `Issue ${issueId}`,
                    description: codeIssue.description,
                    severity: codeIssue.severity as SecuritySeverity,
                    location: {
                        file: codeIssue.file || '',
                        line: codeIssue.line || 0,
                        column: codeIssue.column || 0
                    },
                    recommendation: codeIssue.recommendation || 'No recommendation available',
                    file: codeIssue.file || '',
                    line: codeIssue.line || 0,
                    column: codeIssue.column || 0
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
                    severity: dependencyIssue.severity as SecuritySeverity,
                    location: {
                        file: 'package.json',
                        line: 0,
                        column: 0
                    },
                    recommendation: `Update to version ${dependencyIssue.fixedIn || 'latest'}`,
                    file: 'package.json',
                    line: 0,
                    column: 0
                };
            }

            throw new Error(`Issue with ID ${issueId} not found`);
        } catch (error) {
            this.logger.error(`Error getting issue details for ${issueId}`, error);
            throw error;
        }
    }

    private generateSummary(codeIssues: any[], dependencyIssues: any[]) {
        const counts = {
            [SecuritySeverity.CRITICAL]: 0,
            [SecuritySeverity.HIGH]: 0,
            [SecuritySeverity.MEDIUM]: 0,
            [SecuritySeverity.LOW]: 0
        };

        [...codeIssues, ...dependencyIssues].forEach(issue => {
            // Map the severity to a valid key
            const severityKey = this.normalizeSeverity(issue.severity);
            if (counts.hasOwnProperty(severityKey)) {
                counts[severityKey as SecuritySeverity]++;
            }
        });

        return counts;
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
