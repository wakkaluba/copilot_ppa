"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityTestingService = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
/**
 * Service for performing security testing
 */
class SecurityTestingService {
    outputChannel;
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Security Testing');
    }
    /**
     * Run security testing
     */
    async runSecurityTest(options) {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            return {
                success: false,
                message: 'No workspace folder found'
            };
        }
        this.outputChannel.appendLine(`Running security test on ${workspacePath} using ${options.tool || 'auto-detected tool'}`);
        this.outputChannel.show();
        try {
            // Detect the security tool if not specified
            const tool = options.tool || await this.detectSecurityTool(workspacePath);
            if (!tool) {
                return {
                    success: false,
                    message: 'No security testing tool detected'
                };
            }
            // Build the command based on the tool
            let command = options.command;
            if (!command) {
                command = this.buildSecurityCommand(tool, options);
            }
            this.outputChannel.appendLine(`Running command: ${command}`);
            // Execute the command
            const result = await this.executeCommand(command, workspacePath);
            // Parse the results
            const vulnerabilities = await this.parseSecurityResults(result, tool);
            // Filter vulnerabilities by severity if threshold is set
            let filteredVulnerabilities = vulnerabilities;
            if (options.severityThreshold) {
                filteredVulnerabilities = this.filterBySeverity(vulnerabilities, options.severityThreshold);
            }
            // Add vulnerabilities to the result
            result.securityTest = {
                vulnerabilities: filteredVulnerabilities,
                summary: this.generateSummary(filteredVulnerabilities)
            };
            // Determine if the test passes based on criteria
            const passesThreshold = options.threshold === undefined ||
                filteredVulnerabilities.length <= options.threshold;
            result.success = !options.failOnVulnerabilities ||
                (filteredVulnerabilities.length === 0) ||
                passesThreshold;
            if (!result.success) {
                result.message = `Found ${filteredVulnerabilities.length} vulnerabilities`;
                if (options.threshold !== undefined) {
                    result.message += ` (threshold: ${options.threshold})`;
                }
            }
            else if (filteredVulnerabilities.length > 0) {
                result.message = `Found ${filteredVulnerabilities.length} vulnerabilities, but within acceptable threshold`;
            }
            else {
                result.message = 'No vulnerabilities found';
            }
            this.outputChannel.appendLine(`Security test completed. Found ${filteredVulnerabilities.length} vulnerabilities.`);
            return result;
        }
        catch (error) {
            const errorMsg = `Error running security test: ${error instanceof Error ? error.message : String(error)}`;
            this.outputChannel.appendLine(errorMsg);
            return {
                success: false,
                message: errorMsg,
                details: error instanceof Error ? error.stack : undefined
            };
        }
    }
    /**
     * Execute a command and return the result
     */
    async executeCommand(command, cwd) {
        return new Promise((resolve) => {
            const process = cp.exec(command, { cwd });
            let stdout = '';
            let stderr = '';
            process.stdout?.on('data', (data) => {
                const output = data.toString();
                stdout += output;
                this.outputChannel.append(output);
            });
            process.stderr?.on('data', (data) => {
                const output = data.toString();
                stderr += output;
                this.outputChannel.append(output);
            });
            process.on('close', (code) => {
                // For npm audit and some other tools, a non-zero exit code might indicate vulnerabilities were found,
                // not that the command failed
                const isNpmAudit = command.includes('npm audit');
                const isSnyk = command.includes('snyk test');
                // Consider the test successful if it's npm audit or snyk test, even with non-zero exit code
                const success = code === 0 || isNpmAudit || isSnyk;
                const result = {
                    success,
                    message: success ? 'Security test completed successfully' : 'Security test failed',
                    exitCode: code,
                    stdout,
                    stderr
                };
                resolve(result);
            });
        });
    }
    /**
     * Detect which security testing tool to use
     */
    async detectSecurityTool(workspacePath) {
        // Check if Snyk CLI is installed
        try {
            await this.executeCommand('snyk --version', workspacePath);
            return 'snyk';
        }
        catch {
            // Snyk not available
        }
        // Check for package.json to use npm audit
        if (fs.existsSync(path.join(workspacePath, 'package.json'))) {
            return 'npm-audit';
        }
        // Check if OWASP Dependency Check is available
        try {
            await this.executeCommand('dependency-check --version', workspacePath);
            return 'owasp-dependency-check';
        }
        catch {
            // OWASP Dependency Check not available
        }
        // Check if Trivy is available
        try {
            await this.executeCommand('trivy --version', workspacePath);
            return 'trivy';
        }
        catch {
            // Trivy not available
        }
        // Default to npm audit if node_modules exists
        if (fs.existsSync(path.join(workspacePath, 'node_modules'))) {
            return 'npm-audit';
        }
        return undefined;
    }
    /**
     * Build the command to run the security test
     */
    buildSecurityCommand(tool, options) {
        switch (tool) {
            case 'snyk':
                return 'snyk test --json';
            case 'npm-audit':
                return 'npm audit --json';
            case 'owasp-dependency-check':
                return 'dependency-check --project "Security Test" --out . --scan .';
            case 'sonarqube':
                return 'sonar-scanner -Dsonar.projectKey=security-test -Dsonar.sources=.';
            case 'trivy':
                return 'trivy fs --format json .';
            case 'custom':
            default:
                return options.command || 'npm audit';
        }
    }
    /**
     * Parse security test results based on the tool used
     */
    async parseSecurityResults(result, tool) {
        const output = result.stdout || '';
        switch (tool) {
            case 'npm-audit':
                return this.parseNpmAuditResults(output);
            case 'snyk':
                return this.parseSnykResults(output);
            case 'owasp-dependency-check':
                return this.parseOwaspDependencyCheckResults(output);
            case 'trivy':
                return this.parseTrivyResults(output);
            case 'sonarqube':
                return this.parseSonarQubeResults(output);
            default:
                // Try to detect JSON in the output and parse it generically
                return this.parseGenericResults(output);
        }
    }
    /**
     * Parse npm audit results
     */
    parseNpmAuditResults(output) {
        const vulnerabilities = [];
        try {
            // npm audit outputs JSON
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const auditData = JSON.parse(jsonMatch[0]);
                // npm audit format for npm >= 7
                if (auditData.vulnerabilities) {
                    for (const [pkg, vuln] of Object.entries(auditData.vulnerabilities)) {
                        if (vuln.via) {
                            for (const viaVuln of (Array.isArray(vuln.via) ? vuln.via : [vuln.via])) {
                                if (typeof viaVuln === 'object') {
                                    vulnerabilities.push({
                                        id: viaVuln.name || viaVuln.url || 'Unknown',
                                        description: viaVuln.title || 'No description available',
                                        severity: this.mapNpmSeverity(viaVuln.severity),
                                        package: pkg,
                                        version: vuln.version,
                                        recommendation: vuln.fixAvailable ?
                                            `Update to ${vuln.fixAvailable.version || 'latest version'}` :
                                            'No fix available',
                                        url: viaVuln.url || '',
                                        cvssScore: viaVuln.cvss?.score
                                    });
                                }
                            }
                        }
                    }
                }
                // npm audit format for npm 6
                else if (auditData.actions) {
                    for (const action of auditData.actions) {
                        for (const vuln of action.resolves || []) {
                            const vulnInfo = auditData.advisories[vuln.id];
                            if (vulnInfo) {
                                vulnerabilities.push({
                                    id: vulnInfo.cves?.[0] || vulnInfo.title || vuln.id,
                                    description: vulnInfo.overview || 'No description available',
                                    severity: this.mapNpmSeverity(vulnInfo.severity),
                                    package: vuln.path.split('>')[0],
                                    version: vulnInfo.findings?.[0]?.version,
                                    recommendation: vulnInfo.recommendation || 'No recommendation available',
                                    url: vulnInfo.url || '',
                                    cvssScore: vulnInfo.cvss?.score
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing npm audit results: ${error}`);
        }
        return vulnerabilities;
    }
    /**
     * Parse Snyk test results
     */
    parseSnykResults(output) {
        const vulnerabilities = [];
        try {
            // Snyk outputs JSON
            const jsonMatch = output.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const snykData = JSON.parse(jsonMatch[0]);
                for (const vulnerability of snykData.vulnerabilities || []) {
                    vulnerabilities.push({
                        id: vulnerability.identifiers?.CVE?.[0] || vulnerability.identifiers?.CWE?.[0] || vulnerability.id || 'Unknown',
                        description: vulnerability.title || 'No description available',
                        severity: this.mapSnykSeverity(vulnerability.severity),
                        package: vulnerability.packageName,
                        version: vulnerability.version,
                        recommendation: vulnerability.fixedIn ?
                            `Update to a version >= ${vulnerability.fixedIn[0]}` :
                            'No fix available',
                        url: vulnerability.url || '',
                        cvssScore: vulnerability.cvssScore
                    });
                }
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing Snyk results: ${error}`);
        }
        return vulnerabilities;
    }
    /**
     * Parse OWASP Dependency Check results
     */
    parseOwaspDependencyCheckResults(output) {
        const vulnerabilities = [];
        try {
            // Look for the generated report file
            const reportFile = 'dependency-check-report.json';
            if (fs.existsSync(reportFile)) {
                const reportData = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
                for (const dependency of reportData.dependencies || []) {
                    for (const vulnerability of dependency.vulnerabilities || []) {
                        vulnerabilities.push({
                            id: vulnerability.name || 'Unknown',
                            description: vulnerability.description || 'No description available',
                            severity: this.mapCvssScore(vulnerability.cvssV3?.baseScore),
                            package: dependency.fileName,
                            version: dependency.version,
                            recommendation: 'Update to a newer version without this vulnerability',
                            url: vulnerability.references?.[0]?.url || '',
                            cvssScore: vulnerability.cvssV3?.baseScore
                        });
                    }
                }
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing OWASP Dependency Check results: ${error}`);
        }
        return vulnerabilities;
    }
    /**
     * Parse Trivy results
     */
    parseTrivyResults(output) {
        const vulnerabilities = [];
        try {
            // Trivy outputs JSON
            const jsonMatch = output.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                const trivyData = JSON.parse(jsonMatch[0]);
                for (const result of trivyData || []) {
                    for (const vulnerability of result.Vulnerabilities || []) {
                        vulnerabilities.push({
                            id: vulnerability.VulnerabilityID || 'Unknown',
                            description: vulnerability.Title || vulnerability.Description || 'No description available',
                            severity: this.mapTrivySeverity(vulnerability.Severity),
                            package: vulnerability.PkgName,
                            version: vulnerability.InstalledVersion,
                            recommendation: vulnerability.FixedVersion ?
                                `Update to version ${vulnerability.FixedVersion}` :
                                'No fix available',
                            url: vulnerability.PrimaryURL || '',
                            cvssScore: vulnerability.CVSS?.nvd?.V3Score
                        });
                    }
                }
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing Trivy results: ${error}`);
        }
        return vulnerabilities;
    }
    /**
     * Parse SonarQube results
     */
    parseSonarQubeResults(output) {
        // SonarQube doesn't provide direct output, but we could potentially parse the web API results
        // or console output if available
        return [];
    }
    /**
     * Try to parse generic security results
     */
    parseGenericResults(output) {
        const vulnerabilities = [];
        try {
            // Try to find JSON in the output
            const jsonMatch = output.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[0]);
                // Look for common patterns in the data
                if (Array.isArray(data)) {
                    // Array of vulnerabilities
                    for (const item of data) {
                        if (item.severity || item.cvss || item.cve) {
                            vulnerabilities.push({
                                id: item.id || item.cve || 'Unknown',
                                description: item.description || item.title || 'No description available',
                                severity: this.mapGenericSeverity(item.severity),
                                package: item.package || item.packageName,
                                version: item.version || item.affectedVersion,
                                recommendation: item.recommendation || item.solution || 'No recommendation available',
                                url: item.url || item.reference || '',
                                cvssScore: item.cvssScore || item.score
                            });
                        }
                    }
                }
                else if (data.vulnerabilities || data.issues || data.results) {
                    // Object with a vulnerabilities array
                    const vulnArray = data.vulnerabilities || data.issues || data.results || [];
                    for (const item of vulnArray) {
                        vulnerabilities.push({
                            id: item.id || item.cve || 'Unknown',
                            description: item.description || item.title || 'No description available',
                            severity: this.mapGenericSeverity(item.severity),
                            package: item.package || item.packageName,
                            version: item.version || item.affectedVersion,
                            recommendation: item.recommendation || item.solution || 'No recommendation available',
                            url: item.url || item.reference || '',
                            cvssScore: item.cvssScore || item.score
                        });
                    }
                }
            }
        }
        catch (error) {
            this.outputChannel.appendLine(`Error parsing generic security results: ${error}`);
        }
        return vulnerabilities;
    }
    /**
     * Map npm audit severity levels to standard levels
     */
    mapNpmSeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'info':
                return 'info';
            case 'low':
                return 'low';
            case 'moderate':
                return 'medium';
            case 'high':
                return 'high';
            case 'critical':
                return 'critical';
            default:
                return 'info';
        }
    }
    /**
     * Map Snyk severity levels to standard levels
     */
    mapSnykSeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'low':
                return 'low';
            case 'medium':
                return 'medium';
            case 'high':
                return 'high';
            case 'critical':
                return 'critical';
            default:
                return 'info';
        }
    }
    /**
     * Map Trivy severity levels to standard levels
     */
    mapTrivySeverity(severity) {
        switch (severity.toLowerCase()) {
            case 'low':
                return 'low';
            case 'medium':
                return 'medium';
            case 'high':
                return 'high';
            case 'critical':
                return 'critical';
            default:
                return 'info';
        }
    }
    /**
     * Map CVSS score to severity level
     */
    mapCvssScore(score) {
        if (!score)
            return 'info';
        if (score < 4.0)
            return 'low';
        if (score < 7.0)
            return 'medium';
        if (score < 9.0)
            return 'high';
        return 'critical';
    }
    /**
     * Map generic severity levels to standard levels
     */
    mapGenericSeverity(severity) {
        if (!severity)
            return 'info';
        const s = severity.toLowerCase();
        if (s.includes('critical'))
            return 'critical';
        if (s.includes('high'))
            return 'high';
        if (s.includes('medium') || s.includes('moderate'))
            return 'medium';
        if (s.includes('low'))
            return 'low';
        return 'info';
    }
    /**
     * Filter vulnerabilities by severity threshold
     */
    filterBySeverity(vulnerabilities, threshold) {
        const severityLevel = {
            'info': 0,
            'low': 1,
            'medium': 2,
            'high': 3,
            'critical': 4
        };
        const thresholdLevel = severityLevel[threshold];
        return vulnerabilities.filter(vuln => {
            const vulnLevel = severityLevel[vuln.severity];
            return vulnLevel >= thresholdLevel;
        });
    }
    /**
     * Generate a summary of vulnerabilities by severity
     */
    generateSummary(vulnerabilities) {
        const summary = {
            info: 0,
            low: 0,
            medium: 0,
            high: 0,
            critical: 0,
            total: vulnerabilities.length
        };
        for (const vuln of vulnerabilities) {
            summary[vuln.severity]++;
        }
        return summary;
    }
    /**
     * Clean up resources
     */
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.SecurityTestingService = SecurityTestingService;
//# sourceMappingURL=securityTestingService.js.map