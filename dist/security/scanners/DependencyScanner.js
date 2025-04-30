"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyScanner = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const SecurityVulnerabilityDatabase_1 = require("../database/SecurityVulnerabilityDatabase");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Scanner for checking dependencies for known vulnerabilities
 */
class DependencyScanner {
    context;
    vulnerabilityDb;
    npmAuditCache = new Map();
    cacheTimeout = 1000 * 60 * 60; // 1 hour
    constructor(context) {
        this.context = context;
        this.vulnerabilityDb = new SecurityVulnerabilityDatabase_1.SecurityVulnerabilityDatabase(context);
    }
    /**
     * Check dependencies for known vulnerabilities
     */
    async checkVulnerabilities(dependencies) {
        const vulnerabilities = [];
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
                for (const [pkgName, vuln] of Object.entries(auditResult.vulnerabilities)) {
                    if (!dependencies[pkgName]) {
                        continue;
                    }
                    const vulnInfo = await this.enrichVulnerabilityInfo(vuln);
                    vulnerabilities.push({
                        name: pkgName,
                        version: dependencies[pkgName],
                        vulnerabilityInfo: vulnInfo,
                        fixAvailable: vuln.fixAvailable || false,
                        fixedVersion: vuln.fixAvailable?.version,
                        timestamp: new Date()
                    });
                }
            }
        }
        catch (error) {
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
                        timestamp: new Date()
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
    async getVulnerabilityDetails(vulnId) {
        return this.vulnerabilityDb.getVulnerabilityDetails(vulnId);
    }
    /**
     * Enrich vulnerability information with additional details
     */
    async enrichVulnerabilityInfo(vuln) {
        const vulnInfo = [];
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
    mapSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'moderate':
            case 'medium': return 'medium';
            default: return 'low';
        }
    }
    dispose() {
        this.npmAuditCache.clear();
    }
}
exports.DependencyScanner = DependencyScanner;
//# sourceMappingURL=DependencyScanner.js.map