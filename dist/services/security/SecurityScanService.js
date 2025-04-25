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
        this.dependencyScanner = new dependencyScanner_1.DependencyScanner(context);
    }
    async runFullScan() {
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
        }
        catch (error) {
            this.logger.error('Error during security scan', error);
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
            counts[issue.severity]++;
        });
        return counts;
    }
    dispose() {
        this.codeScanner.dispose();
        this.dependencyScanner.dispose();
    }
}
exports.SecurityScanService = SecurityScanService;
//# sourceMappingURL=SecurityScanService.js.map