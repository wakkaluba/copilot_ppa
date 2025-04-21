import * as vscode from 'vscode';
import { CodeSecurityScanner } from '../codeScanner';
import { DependencyScanner } from '../dependencyScanner';
import { SecurityRecommendations } from '../securityRecommendations';
import { SecurityAnalysisResult, SecuritySummary } from '../types';

export class SecurityAnalysisService {
    constructor(
        private codeScanner: CodeSecurityScanner,
        private dependencyScanner: DependencyScanner,
        private securityRecommendations: SecurityRecommendations
    ) {}

    public async runFullAnalysis(
        progressCallback?: (message: string, increment: number) => void
    ): Promise<SecurityAnalysisResult> {
        // Step 1: Scan workspace for code security issues
        progressCallback?.("Scanning code for security issues...", 0);
        const codeResult = await this.codeScanner.scanWorkspace(
            message => progressCallback?.(message, 0)
        );

        // Step 2: Check dependencies for vulnerabilities
        progressCallback?.("Checking dependencies for vulnerabilities...", 33);
        const dependencyResult = await this.dependencyScanner.scanWorkspaceDependencies();

        // Step 3: Generate security recommendations
        progressCallback?.("Generating security recommendations...", 66);
        const recommendationsResult = await this.securityRecommendations.generateRecommendations();

        // Calculate final results
        progressCallback?.("Calculating final results...", 90);
        const overallRiskScore = this.calculateOverallRiskScore(
            codeResult,
            dependencyResult,
            recommendationsResult
        );

        return {
            codeResult,
            dependencyResult,
            recommendationsResult,
            overallRiskScore,
            overallRiskLevel: this.calculateOverallRiskLevel(overallRiskScore),
            timestamp: Date.now()
        };
    }

    public async scanActiveFile(): Promise<SecurityAnalysisResult> {
        const codeResult = await this.codeScanner.scanActiveFile();
        const recommendationsResult = await this.securityRecommendations.generateRecommendations();
        
        return {
            codeResult,
            dependencyResult: {
                vulnerabilities: [],
                totalDependencies: 0,
                hasVulnerabilities: false,
                summary: this.getEmptySummary()
            },
            recommendationsResult,
            overallRiskScore: this.calculateOverallRiskScore(
                codeResult,
                null,
                recommendationsResult
            ),
            overallRiskLevel: 'medium',
            timestamp: Date.now()
        };
    }

    private calculateOverallRiskScore(
        codeResult: any,
        dependencyResult: any | null,
        recommendationsResult: any
    ): number {
        const codeIssuesWeight = 0.4;
        const dependencyVulnerabilitiesWeight = 0.3;
        const recommendationsWeight = 0.3;

        // Calculate code issues score
        const codeFilesScanned = codeResult.scannedFiles || 1;
        const codeIssuesScore = Math.min(100, (codeResult.issues.length / codeFilesScanned) * 100);

        // Calculate dependency score if available
        let dependencyScore = 0;
        if (dependencyResult) {
            const totalDeps = dependencyResult.totalDependencies || 1;
            dependencyScore = Math.min(100, (dependencyResult.vulnerabilities.length / totalDeps) * 200);
        }

        // Calculate recommendations score
        const recSummary = recommendationsResult.analysisSummary;
        const recommendationsScore = Math.min(100, (
            (recSummary.critical * 10) +
            (recSummary.high * 5) +
            (recSummary.medium * 2) +
            (recSummary.low * 0.5)
        ));

        // Calculate weighted risk score
        const weightedRiskScore = (
            (codeIssuesScore * codeIssuesWeight) +
            (dependencyScore * (dependencyResult ? dependencyVulnerabilitiesWeight : 0)) +
            (recommendationsScore * recommendationsWeight)
        );

        return Math.round(Math.min(100, weightedRiskScore));
    }

    private calculateOverallRiskLevel(riskScore: number): 'low' | 'medium' | 'high' {
        if (riskScore < 30) return 'low';
        if (riskScore < 70) return 'medium';
        return 'high';
    }

    private getEmptySummary(): SecuritySummary {
        return {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };
    }
}