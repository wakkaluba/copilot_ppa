"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
/**
 * Service for generating security recommendations based on scan results
 */
class RecommendationService {
    context;
    codeScanner;
    dependencyScanner;
    constructor(context, codeScanner, dependencyScanner) {
        this.context = context;
        this.codeScanner = codeScanner;
        this.dependencyScanner = dependencyScanner;
    }
    async generate() {
        const codeIssues = await this.codeScanner.scanWorkspace();
        const depIssues = await this.dependencyScanner.scanWorkspaceDependencies();
        const recommendations = [
            ...this.generateCodeRecommendations(codeIssues),
            ...this.generateDependencyRecommendations(depIssues),
            ...this.generateGeneralRecommendations()
        ];
        return {
            recommendations: this.prioritizeRecommendations(recommendations),
            timestamp: Date.now()
        };
    }
    generateCodeRecommendations(codeResult) {
        const recommendations = [];
        // Group issues by type
        const issuesByType = new Map();
        codeResult.issues.forEach((issue) => {
            const issues = issuesByType.get(issue.id) || [];
            issues.push(issue);
            issuesByType.set(issue.id, issues);
        });
        // Generate recommendations for each issue type
        for (const [issueType, issues] of issuesByType) {
            const recommendation = this.createRecommendationForIssueType(issueType, issues);
            if (recommendation) {
                recommendations.push(recommendation);
            }
        }
        return recommendations;
    }
    generateDependencyRecommendations(depResult) {
        const recommendations = [];
        if (depResult.hasVulnerabilities) {
            // Group vulnerabilities by package
            const vulnsByPackage = new Map();
            depResult.vulnerabilities.forEach((vuln) => {
                const vulns = vulnsByPackage.get(vuln.packageName) || [];
                vulns.push(vuln);
                vulnsByPackage.set(vuln.packageName, vulns);
            });
            // Generate recommendations for vulnerable packages
            for (const [packageName, vulns] of vulnsByPackage) {
                recommendations.push(this.createRecommendationForVulnerablePackage(packageName, vulns));
            }
        }
        return recommendations;
    }
    generateGeneralRecommendations() {
        return [
            {
                id: 'GEN001',
                title: 'Implement Security Headers',
                description: 'Add security headers to protect against common web vulnerabilities',
                priority: 'medium',
                category: 'general',
                implementation: 'Add helmet middleware for Express or similar security headers for your framework'
            },
            {
                id: 'GEN002',
                title: 'Enable Content Security Policy',
                description: 'Implement CSP to prevent XSS and other injection attacks',
                priority: 'high',
                category: 'general',
                implementation: 'Add Content-Security-Policy header with appropriate directives'
            },
            {
                id: 'GEN003',
                title: 'Regular Security Updates',
                description: 'Regularly update dependencies and review security advisories',
                priority: 'high',
                category: 'general',
                implementation: 'Set up automated dependency updates and security scanning'
            }
        ];
    }
    createRecommendationForIssueType(issueType, issues) {
        const issue = issues[0]; // Use first issue as reference
        const count = issues.length;
        switch (issue.severity) {
            case 'critical':
            case 'high':
                return {
                    id: `CODE_${issueType}`,
                    title: `Fix ${issue.name} Issues`,
                    description: `Found ${count} ${issue.name.toLowerCase()} issues that need immediate attention`,
                    priority: issue.severity,
                    category: 'code',
                    implementation: issue.fix || issue.recommendation
                };
            case 'medium':
                if (count > 1) {
                    return {
                        id: `CODE_${issueType}`,
                        title: `Address ${issue.name} Issues`,
                        description: `Found ${count} medium-severity ${issue.name.toLowerCase()} issues`,
                        priority: 'medium',
                        category: 'code',
                        implementation: issue.fix || issue.recommendation
                    };
                }
                break;
            case 'low':
                if (count > 2) {
                    return {
                        id: `CODE_${issueType}`,
                        title: `Review ${issue.name} Issues`,
                        description: `Found ${count} low-severity ${issue.name.toLowerCase()} issues`,
                        priority: 'low',
                        category: 'code',
                        implementation: issue.fix || issue.recommendation
                    };
                }
                break;
        }
        return null;
    }
    createRecommendationForVulnerablePackage(packageName, vulns) {
        const highestSeverity = this.getHighestSeverity(vulns);
        const fixVersions = vulns.map(v => v.fixedVersion).filter(Boolean);
        const latestFixVersion = fixVersions.length > 0 ?
            fixVersions.reduce((a, b) => (a > b ? a : b)) :
            'latest';
        return {
            id: `DEP_${packageName}`,
            title: `Update Vulnerable Package: ${packageName}`,
            description: `Package has ${vulns.length} known vulnerabilities`,
            priority: highestSeverity,
            category: 'dependency',
            implementation: `Update ${packageName} to version ${latestFixVersion} or newer`
        };
    }
    getHighestSeverity(vulns) {
        const severityOrder = ['critical', 'high', 'medium', 'low'];
        const severities = vulns.map(v => v.severity);
        for (const sev of severityOrder) {
            if (severities.includes(sev)) {
                return sev;
            }
        }
        return 'low';
    }
    prioritizeRecommendations(recommendations) {
        const priorityOrder = {
            'critical': 0,
            'high': 1,
            'medium': 2,
            'low': 3
        };
        return recommendations.sort((a, b) => {
            const priorityA = priorityOrder[a.priority];
            const priorityB = priorityOrder[b.priority];
            return priorityA - priorityB;
        });
    }
    dispose() {
        // No resources to clean up
    }
}
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=RecommendationService.js.map