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
exports.RecommendationService = void 0;
const vscode = __importStar(require("vscode"));
class RecommendationService {
    analysisSvc;
    dependencySvc;
    disposables = [];
    recommendationCache = new Map();
    constructor(analysisSvc, dependencySvc) {
        this.analysisSvc = analysisSvc;
        this.dependencySvc = dependencySvc;
    }
    async generate() {
        const recommendations = [];
        // Generate code-based recommendations
        const codeResult = await this.analysisSvc.scanWorkspace();
        const codeRecommendations = await this.generateCodeRecommendations(codeResult);
        recommendations.push(...codeRecommendations);
        // Generate dependency-based recommendations
        const depResult = await this.dependencySvc.scanDependencies();
        const depRecommendations = await this.generateDependencyRecommendations(depResult);
        recommendations.push(...depRecommendations);
        // Add framework-specific recommendations
        const frameworkRecommendations = await this.generateFrameworkRecommendations();
        recommendations.push(...frameworkRecommendations);
        // Add general security best practices
        const bestPracticeRecommendations = this.generateBestPracticeRecommendations();
        recommendations.push(...bestPracticeRecommendations);
        // Calculate severity counts
        const analysisSummary = this.calculateSeverityCounts(recommendations);
        // Cache recommendations for quick lookup
        this.cacheRecommendations(recommendations);
        return {
            recommendations,
            analysisSummary
        };
    }
    async getRecommendationById(id) {
        return this.recommendationCache.get(id);
    }
    async getRecommendationsByCategory(category) {
        const recommendations = Array.from(this.recommendationCache.values());
        return recommendations.filter(rec => rec.category === category);
    }
    async generateCodeRecommendations(codeResult) {
        const recommendations = [];
        const issues = codeResult.issues || [];
        for (const issue of issues) {
            recommendations.push({
                id: `REC_${issue.id}`,
                title: `Fix ${issue.name}`,
                description: issue.description,
                severity: issue.severity,
                category: 'code',
                effort: this.estimateEffort(issue),
                implementationSteps: this.generateImplementationSteps(issue),
                codeExample: this.generateCodeExample(issue),
                implemented: false
            });
        }
        return recommendations;
    }
    async generateDependencyRecommendations(depResult) {
        const recommendations = [];
        const vulnerabilities = depResult.vulnerabilities || [];
        for (const vuln of vulnerabilities) {
            recommendations.push({
                id: `REC_DEP_${vuln.name}`,
                title: `Update vulnerable package ${vuln.name}`,
                description: `Package ${vuln.name} has known vulnerabilities`,
                severity: 'high',
                category: 'dependency',
                effort: 2,
                implementationSteps: [
                    `Update ${vuln.name} to version ${vuln.vulnerabilityInfo[0].fixedIn} or later`,
                    'Test the application with the updated dependency',
                    'Review breaking changes in the changelog'
                ],
                implemented: false
            });
        }
        return recommendations;
    }
    async generateFrameworkRecommendations() {
        const recommendations = [];
        // Framework-specific security recommendations
        const frameworkPatterns = [
            {
                files: '**/*.{jsx,tsx}',
                framework: 'React',
                recommendations: [
                    {
                        id: 'REC_REACT_XSS',
                        title: 'Prevent XSS in React',
                        description: 'Ensure proper sanitization of user input in React components',
                        severity: 'medium',
                        category: 'framework',
                        effort: 3
                    }
                ]
            },
            {
                files: '**/routes/*.{js,ts}',
                framework: 'Express',
                recommendations: [
                    {
                        id: 'REC_EXPRESS_HELMET',
                        title: 'Use Helmet middleware',
                        description: 'Add Helmet middleware to set security headers',
                        severity: 'high',
                        category: 'framework',
                        effort: 1
                    }
                ]
            }
        ];
        for (const pattern of frameworkPatterns) {
            const files = await vscode.workspace.findFiles(pattern.files);
            if (files.length > 0) {
                recommendations.push(...pattern.recommendations);
            }
        }
        return recommendations;
    }
    generateBestPracticeRecommendations() {
        return [
            {
                id: 'REC_BP_AUTH',
                title: 'Implement proper authentication',
                description: 'Ensure robust authentication mechanisms are in place',
                severity: 'high',
                category: 'general',
                effort: 4,
                implementationSteps: [
                    'Review current authentication implementation',
                    'Implement password hashing',
                    'Add multi-factor authentication',
                    'Implement proper session management'
                ],
                implemented: false
            },
            {
                id: 'REC_BP_LOGGING',
                title: 'Implement security logging',
                description: 'Add comprehensive security logging and monitoring',
                severity: 'medium',
                category: 'general',
                effort: 3,
                implementationSteps: [
                    'Add logging for security events',
                    'Implement audit trails',
                    'Set up log rotation',
                    'Add monitoring alerts'
                ],
                implemented: false
            }
        ];
    }
    calculateSeverityCounts(recommendations) {
        return recommendations.reduce((summary, rec) => {
            summary[rec.severity]++;
            return summary;
        }, {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        });
    }
    estimateEffort(issue) {
        // Estimate implementation effort (1-5)
        switch (issue.severity) {
            case 'critical': return 5;
            case 'high': return 4;
            case 'medium': return 3;
            case 'low': return 2;
            default: return 1;
        }
    }
    generateImplementationSteps(issue) {
        // Generate implementation steps based on issue type
        const baseSteps = [
            `Locate the issue in ${issue.location.file}`,
            `Review the problematic code around line ${issue.location.line}`
        ];
        if (issue.recommendation) {
            baseSteps.push(...issue.recommendation.split('\n'));
        }
        return baseSteps;
    }
    generateCodeExample(issue) {
        // Generate example code based on issue type
        if (issue.codeExample) {
            return issue.codeExample;
        }
        return undefined;
    }
    cacheRecommendations(recommendations) {
        this.recommendationCache.clear();
        for (const rec of recommendations) {
            this.recommendationCache.set(rec.id, rec);
        }
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.recommendationCache.clear();
    }
}
exports.RecommendationService = RecommendationService;
//# sourceMappingURL=RecommendationService.js.map