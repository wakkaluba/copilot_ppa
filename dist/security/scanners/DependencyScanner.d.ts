import * as vscode from 'vscode';
import { DependencyVulnerability, VulnerabilityInfo } from '../types';
/**
 * Scanner for checking dependencies for known vulnerabilities
 */
export declare class DependencyScanner implements vscode.Disposable {
    private readonly context;
    private readonly vulnerabilityDb;
    private readonly npmAuditCache;
    private readonly cacheTimeout;
    constructor(context: vscode.ExtensionContext);
    /**
     * Check dependencies for known vulnerabilities
     */
    checkVulnerabilities(dependencies: Record<string, string>): Promise<DependencyVulnerability[]>;
    /**
     * Get detailed information about a specific vulnerability
     */
    getVulnerabilityDetails(vulnId: string): Promise<VulnerabilityInfo | undefined>;
    /**
     * Enrich vulnerability information with additional details
     */
    private enrichVulnerabilityInfo;
    /**
     * Map npm audit severity to our severity levels
     */
    private mapSeverity;
    dispose(): void;
}
