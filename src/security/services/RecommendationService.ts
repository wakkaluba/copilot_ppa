import * as vscode from 'vscode';
import { SecurityRecommendation, RecommendationResult, SecuritySummary } from '../types';
import { ISecurityAnalysisService } from './SecurityAnalysisService';
import { IDependencyAnalysisService } from './DependencyAnalysisService';

export interface IRecommendationService extends vscode.Disposable {
    generate(): Promise<RecommendationResult>;
    getRecommendationById(id: string): Promise<SecurityRecommendation | undefined>;
    getRecommendationsByCategory(category: string): Promise<SecurityRecommendation[]>;
}

export class RecommendationService implements IRecommendationService {
    private readonly disposables: vscode.Disposable[] = [];
    private recommendationCache: Map<string, SecurityRecommendation> = new Map();

    constructor(
        private readonly analysisSvc: ISecurityAnalysisService,
        private readonly dependencySvc: IDependencyAnalysisService
    ) {}

    public async generate(): Promise<RecommendationResult> {
        const recommendations: SecurityRecommendation[] = [];

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

    public async getRecommendationById(id: string): Promise<SecurityRecommendation | undefined> {
        return this.recommendationCache.get(id);
    }

    public async getRecommendationsByCategory(category: string): Promise<SecurityRecommendation[]> {
        const recommendations = Array.from(this.recommendationCache.values());
        return recommendations.filter(rec => rec.category === category);
    }

    private async generateCodeRecommendations(codeResult: any): Promise<SecurityRecommendation[]> {
        const recommendations: SecurityRecommendation[] = [];
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

    private async generateDependencyRecommendations(depResult: any): Promise<SecurityRecommendation[]> {
        const recommendations: SecurityRecommendation[] = [];
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

    private async generateFrameworkRecommendations(): Promise<SecurityRecommendation[]> {
        const recommendations: SecurityRecommendation[] = [];
        
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

    private generateBestPracticeRecommendations(): SecurityRecommendation[] {
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

    private calculateSeverityCounts(recommendations: SecurityRecommendation[]): SecuritySummary {
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

    private estimateEffort(issue: any): number {
        // Estimate implementation effort (1-5)
        switch (issue.severity) {
            case 'critical': return 5;
            case 'high': return 4;
            case 'medium': return 3;
            case 'low': return 2;
            default: return 1;
        }
    }

    private generateImplementationSteps(issue: any): string[] {
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

    private generateCodeExample(issue: any): string | undefined {
        // Generate example code based on issue type
        if (issue.codeExample) {
            return issue.codeExample;
        }
        return undefined;
    }

    private cacheRecommendations(recommendations: SecurityRecommendation[]): void {
        this.recommendationCache.clear();
        for (const rec of recommendations) {
            this.recommendationCache.set(rec.id, rec);
        }
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.recommendationCache.clear();
    }
}