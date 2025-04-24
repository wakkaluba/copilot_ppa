import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import { DependencyVulnerability, VulnerabilityInfo } from '../types';
import { SecurityVulnerabilityDatabase } from '../database/SecurityVulnerabilityDatabase';

const execAsync = promisify(exec);

/**
 * Scanner for checking dependencies for known vulnerabilities
 */
export class DependencyScanner implements vscode.Disposable {
    private readonly vulnerabilityDb: SecurityVulnerabilityDatabase;
    private readonly npmAuditCache = new Map<string, DependencyVulnerability[]>();
    private readonly cacheTimeout = 1000 * 60 * 60; // 1 hour

    constructor(private readonly context: vscode.ExtensionContext) {
        this.vulnerabilityDb = new SecurityVulnerabilityDatabase(context);
    }

    /**
     * Check dependencies for known vulnerabilities
     */
    public async checkVulnerabilities(dependencies: Record<string, string>): Promise<DependencyVulnerability[]> {
        const vulnerabilities: DependencyVulnerability[] = [];
        const cacheKey = JSON.stringify(dependencies);
        
        // Check cache first
        const cached = this.npmAuditCache.get(cacheKey);
        if (cached && Date.now() - cached[0]?.timestamp < this.cacheTimeout) {
            return cached;
        }

        try {
            // Run npm audit
            const { stdout } = await execAsync('npm audit --json', {
                maxBuffer: 1024 * 1024 * 10 // 10MB
            });

            const auditResult = JSON.parse(stdout);
            
            // Process each vulnerability
            if (auditResult.vulnerabilities) {
                for (const [pkgName, vuln] of Object.entries<any>(auditResult.vulnerabilities)) {
                    if (!dependencies[pkgName]) {continue;}

                    const vulnInfo = await this.enrichVulnerabilityInfo(vuln);
                    vulnerabilities.push({
                        name: pkgName,
                        version: dependencies[pkgName],
                        vulnerabilityInfo: vulnInfo,
                        fixAvailable: vuln.fixAvailable || false,
                        fixedVersion: vuln.fixAvailable?.version,
                        timestamp: Date.now()
                    });
                }
            }
        } catch (error) {
            console.error('Error running npm audit:', error);
            
            // Fallback to database check if npm audit fails
            for (const [name, version] of Object.entries(dependencies)) {
                const vulns = await this.vulnerabilityDb.checkPackage(name, version);
                if (vulns.length > 0) {
                    vulnerabilities.push({
                        name,
                        version,
                        vulnerabilityInfo: vulns,
                        fixAvailable: vulns.some(v => v.patchedVersions?.length > 0),
                        fixedVersion: vulns[0]?.patchedVersions?.[0],
                        timestamp: Date.now()
                    });
                }
            }
        }

        // Update cache
        this.npmAuditCache.set(cacheKey, vulnerabilities);
        
        return vulnerabilities;
    }

    /**
     * Get detailed information about a specific vulnerability
     */
    public async getVulnerabilityDetails(vulnId: string): Promise<VulnerabilityInfo | undefined> {
        return this.vulnerabilityDb.getVulnerabilityDetails(vulnId);
    }

    /**
     * Enrich vulnerability information with additional details
     */
    private async enrichVulnerabilityInfo(vuln: any): Promise<VulnerabilityInfo[]> {
        const vulnInfo: VulnerabilityInfo[] = [];

        for (const advisory of vuln.via || []) {
            if (typeof advisory === 'object') {
                vulnInfo.push({
                    id: advisory.url || advisory.cwe?.[0] || 'UNKNOWN',
                    title: advisory.title || 'Unknown Vulnerability',
                    description: advisory.description || 'No description available',
                    severity: this.mapSeverity(advisory.severity),
                    vulnerableVersions: advisory.vulnerable_versions,
                    patchedVersions: advisory.patched_versions,
                    references: advisory.references,
                    recommendation: advisory.recommendation,
                    publishedDate: advisory.published
                });
            }
        }

        return vulnInfo;
    }

    /**
     * Map npm audit severity to our severity levels
     */
    private mapSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate':
            case 'medium': return 'medium';
            default: return 'low';
        }
    }

    public dispose(): void {
        this.npmAuditCache.clear();
    }
}