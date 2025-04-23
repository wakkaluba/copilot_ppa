import * as vscode from 'vscode';
import { VulnerabilityService } from './services/VulnerabilityService';
import { DependencyScanService } from './services/DependencyScanService';
import { VulnerabilityReportService } from './services/VulnerabilityReportService';
import { DependencyScanResult } from './types';
import { Logger } from '../utils/logger';

/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
export class DependencyScanner implements vscode.Disposable {
    private static instance: DependencyScanner;
    private readonly logger: Logger;
    private readonly vulnerabilityService: VulnerabilityService;
    private readonly scanService: DependencyScanService;
    private readonly reportService: VulnerabilityReportService;

    private constructor(context: vscode.ExtensionContext) {
        this.logger = Logger.getInstance();
        this.vulnerabilityService = new VulnerabilityService();
        this.scanService = new DependencyScanService(this.vulnerabilityService);
        this.reportService = new VulnerabilityReportService(context);
    }

    public static getInstance(context: vscode.ExtensionContext): DependencyScanner {
        if (!DependencyScanner.instance) {
            DependencyScanner.instance = new DependencyScanner(context);
        }
        return DependencyScanner.instance;
    }

    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    public async scanWorkspaceDependencies(silent: boolean = false): Promise<DependencyScanResult> {
        try {
            return await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Scanning dependencies for vulnerabilities...",
                cancellable: true
            }, async (progress, token) => {
                const result = await this.scanService.scanWorkspace();
                
                if (!silent) {
                    this.reportService.updateStatusBar(
                        result.hasVulnerabilities,
                        result.vulnerabilities.length
                    );
                }

                return result;
            });
        } catch (error) {
            this.logger.error('Error scanning workspace dependencies', error);
            throw error;
        }
    }

    /**
     * Shows a detailed vulnerability report
     */
    public async showVulnerabilityReport(): Promise<void> {
        try {
            const result = await this.scanWorkspaceDependencies();
            await this.reportService.showReport(result);
        } catch (error) {
            this.logger.error('Error showing vulnerability report', error);
            throw error;
        }
    }

    public dispose(): void {
        this.reportService.dispose();
    }
}
