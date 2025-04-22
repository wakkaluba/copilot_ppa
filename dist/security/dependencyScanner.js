"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyScanner = void 0;
const VulnerabilityService_1 = require("./services/VulnerabilityService");
const DependencyScanService_1 = require("./services/DependencyScanService");
const VulnerabilityReportService_1 = require("./services/VulnerabilityReportService");
/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
class DependencyScanner {
    vulnerabilityService;
    scanService;
    reportService;
    constructor(context) {
        this.vulnerabilityService = new VulnerabilityService_1.VulnerabilityService();
        this.scanService = new DependencyScanService_1.DependencyScanService(this.vulnerabilityService);
        this.reportService = new VulnerabilityReportService_1.VulnerabilityReportService(context);
    }
    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    async scanWorkspaceDependencies() {
        const result = await this.scanService.scanWorkspace();
        this.reportService.updateStatusBar(result.hasVulnerabilities, result.vulnerabilities.length);
        return result;
    }
    /**
     * Shows a detailed vulnerability report
     */
    async showVulnerabilityReport() {
        const result = await this.scanWorkspaceDependencies();
        this.reportService.showReport(result);
    }
}
exports.DependencyScanner = DependencyScanner;
//# sourceMappingURL=dependencyScanner.js.map