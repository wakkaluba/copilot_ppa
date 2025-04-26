"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityScanService = void 0;
const logger_1 = require("../../utils/logger");
const security_1 = require("../../types/security");
const codeScanner_1 = require("../../security/codeScanner");
const dependencyScanner_1 = require("../../security/dependencyScanner");
class SecurityScanService {
    logger;
    codeScanner;
    dependencyScanner;
    constructor(context) {
        this.logger = logger_1.Logger.getInstance();
        this.codeScanner = new codeScanner_1.CodeSecurityScanner(context);
        // Use the getInstance method instead of direct constructor
        this.dependencyScanner = dependencyScanner_1.DependencyScanner.getInstance(context);
    }
    async runFullScan() {
        try {
            const [codeResult, dependencyResult] = await Promise.all([
                this.codeScanner.scanWorkspace(),
                this.dependencyScanner.scanWorkspaceDependencies()
            ]);
            return {
                timestamp: Date.now(),
                issues: codeResult.issues,
                scannedFiles: codeResult.scannedFiles || 0,
                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                metrics: {
                    filesScanned: codeResult.filesScanned || codeResult.scannedFiles || 0,
                    issuesFound: codeResult.issues.length + dependencyResult.vulnerabilities.length,
                    scanDuration: codeResult.duration || 0
                }
            };
        }
        catch (error) {
            this.logger.error('Error during security scan', error);
            throw error;
        }
    }
    /**
     * Get detailed information about a security issue
     * @param issueId ID of the issue to get details for
     * @returns Detailed information about the security issue
     */
    async getIssueDetails(issueId) {
        try {
            // First check if it's a code security issue
            const codeIssue = await this.codeScanner.getIssueDetails?.(issueId);
            if (codeIssue) {
                // Make sure we have all required fields by mapping between types if needed
                return {
                    id: codeIssue.id,
                    name: codeIssue.name || `Issue ${issueId}`,
                    description: codeIssue.description,
                    severity: codeIssue.severity,
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
                    severity: dependencyIssue.severity,
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
        }
        catch (error) {
            this.logger.error(`Error getting issue details for ${issueId}`, error);
            throw error;
        }
    }
    generateSummary(codeIssues, dependencyIssues) {
        const counts = {
            [security_1.SecuritySeverity.CRITICAL]: 0,
            [security_1.SecuritySeverity.HIGH]: 0,
            [security_1.SecuritySeverity.MEDIUM]: 0,
            [security_1.SecuritySeverity.LOW]: 0
        };
        [...codeIssues, ...dependencyIssues].forEach(issue => {
            // Map the severity to a valid key
            const severityKey = this.normalizeSeverity(issue.severity);
            if (counts.hasOwnProperty(severityKey)) {
                counts[severityKey]++;
            }
        });
        return counts;
    }
    normalizeSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical': return security_1.SecuritySeverity.CRITICAL;
            case 'high': return security_1.SecuritySeverity.HIGH;
            case 'medium':
            case 'moderate': return security_1.SecuritySeverity.MEDIUM;
            case 'low':
            default: return security_1.SecuritySeverity.LOW;
        }
    }
    dispose() {
        this.codeScanner.dispose();
        this.dependencyScanner.dispose();
    }
}
exports.SecurityScanService = SecurityScanService;
//# sourceMappingURL=SecurityScanService.js.map