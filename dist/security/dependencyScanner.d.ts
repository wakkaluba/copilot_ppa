import * as vscode from 'vscode';
import { DependencyScanResult, VulnerabilityInfo } from './types';
/**
 * Class responsible for scanning project dependencies for known vulnerabilities
 */
export declare class DependencyScanner implements vscode.Disposable {
    private static instance;
    private readonly logger;
    private readonly vulnerabilityService;
    private readonly scanService;
    private readonly reportService;
    private vulnerabilityCache;
    private constructor();
    static getInstance(context: vscode.ExtensionContext): DependencyScanner;
    /**
     * Scans the workspace for dependency files and checks for vulnerabilities
     */
    scanWorkspaceDependencies(silent?: boolean): Promise<DependencyScanResult>;
    /**
     * Get detailed information about a specific vulnerability
     * @param vulnId The ID of the vulnerability to retrieve details for
     * @returns Detailed vulnerability information, or undefined if not found
     */
    getVulnerabilityDetails(vulnId: string): Promise<VulnerabilityInfo | undefined>;
    /**
     * Shows a detailed vulnerability report
     */
    showVulnerabilityReport(): Promise<void>;
    dispose(): void;
}
