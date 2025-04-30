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
                timestamp: Date.now(), // Changed from new Date() to Date.now()
                issues: codeResult.issues,
                scannedFiles: codeResult.scannedFiles || 0,
                summary: this.generateSummary(codeResult.issues, dependencyResult.vulnerabilities),
                // Remove metrics field as it's not in the interface
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
        }
        catch (error) {
            this.logger.error(`Error getting issue details for ${issueId}`, error);
            throw error;
        }
    }
    generateSummary(codeIssues, dependencyIssues) {
        const summary = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };
        // Count code issues by severity
        [...codeIssues, ...dependencyIssues].forEach(issue => {
            const severityKey = this.normalizeSeverity(issue.severity);
            switch (severityKey) {
                case security_1.SecuritySeverity.CRITICAL:
                    summary.critical++;
                    break;
                case security_1.SecuritySeverity.HIGH:
                    summary.high++;
                    break;
                case security_1.SecuritySeverity.MEDIUM:
                    summary.medium++;
                    break;
                case security_1.SecuritySeverity.LOW:
                    summary.low++;
                    break;
            }
        });
        return summary;
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