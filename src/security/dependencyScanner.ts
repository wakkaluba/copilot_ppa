import * as vscode from 'vscode';
import { VulnerabilityService } from './services/VulnerabilityService';
import { DependencyScanService } from './services/DependencyScanService';
import { VulnerabilityReportService } from './services/VulnerabilityReportService';
import { DependencyScanResult, VulnerabilityInfo } from './types';

/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
export class DependencyScanner {
    private readonly vulnerabilityService: VulnerabilityService;
    private readonly scanService: DependencyScanService;
    private readonly reportService: VulnerabilityReportService;

    constructor(context: vscode.ExtensionContext) {
        this.vulnerabilityService = new VulnerabilityService();
        this.scanService = new DependencyScanService(this.vulnerabilityService);
        this.reportService = new VulnerabilityReportService(context);
    }

    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    public async scanWorkspaceDependencies(): Promise<DependencyScanResult> {
        const result = await this.scanService.scanWorkspace();
        this.reportService.updateStatusBar(result.hasVulnerabilities, result.vulnerabilities.length);
        return result;
    }

    /**
     * Shows a detailed vulnerability report
     */
    public async showVulnerabilityReport(): Promise<void> {
        const result = await this.scanWorkspaceDependencies();
        this.reportService.showReport(result);
    }
}
