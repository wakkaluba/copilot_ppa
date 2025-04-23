import * as vscode from 'vscode';
import { Logger } from '../../utils/logger';
import { SecurityScanResult, SecuritySeverity } from '../../types/security';
import { CodeSecurityScanner } from '../../security/codeScanner';
import { DependencyScanner } from '../../security/dependencyScanner';

export class SecurityScanService {
    private readonly logger: Logger;
    private readonly codeScanner: CodeSecurityScanner;
    private readonly dependencyScanner: DependencyScanner;

    constructor(context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.codeScanner = new CodeSecurityScanner(context);
        this.dependencyScanner = new DependencyScanner(context);
    }

    public async runFullScan(): Promise<SecurityScanResult> {
        try {
            const [codeResult, dependencyResult] = await Promise.all([
                this.codeScanner.scanWorkspace(),
                this.dependencyScanner.scanWorkspaceDependencies()
            ]);

            return {
                timestamp: Date.now(),
                codeIssues: codeResult.issues,
                dependencyIssues: dependencyResult.vulnerabilities,
                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                metrics: {
                    filesScanned: codeResult.filesScanned,
                    issuesFound: codeResult.issues.length + dependencyResult.vulnerabilities.length,
                    scanDuration: codeResult.duration + dependencyResult.duration
                }
            };
        } catch (error) {
            this.logger.error('Error during security scan', error);
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
            counts[issue.severity]++;
        });

        return counts;
    }

    public dispose(): void {
        this.codeScanner.dispose();
        this.dependencyScanner.dispose();
    }
}
