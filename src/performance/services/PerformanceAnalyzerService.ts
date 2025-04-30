import * as vscode from 'vscode';
import { AnalyzerFactory } from '../analyzers/analyzerFactory';
import { AnalyzerConfiguration, PerformanceAnalysisResult, PerformanceMetrics } from '../types';

export class PerformanceAnalyzerService {
    private readonly analyzerFactory: AnalyzerFactory;
    private metrics: PerformanceMetrics = {
        lastAnalysisTime: 0,
        totalIssuesFound: 0,
        issuesByType: {
            performance: 0,
            'memory-leak': 0,
            'cpu-intensive': 0,
            'memory-management': 0
        }
    };
    private configuration: AnalyzerConfiguration = {
        minSeverity: 'info',
        maxFileSizeKB: 1000
    };

    constructor(private readonly context: vscode.ExtensionContext) {
        this.analyzerFactory = AnalyzerFactory.getInstance();
    }

    public hasAnalyzer(language: string): boolean {
        return this.analyzerFactory.hasAnalyzer(language);
    }

    public canAnalyze(fileExtension: string): boolean {
        return this.analyzerFactory.getSupportedExtensions().includes(fileExtension);
    }

    public async analyzeDocument(document: vscode.TextDocument): Promise<PerformanceAnalysisResult> {
        const startTime = Date.now();
        try {
            // Check file size
            const fileSize = Buffer.from(document.getText()).length / 1024;
            if (fileSize > this.configuration.maxFileSizeKB) {
                return {
                    filePath: document.fileName,
                    issues: [],
                    skipped: true,
                    skipReason: `File size (${fileSize}KB) exceeds limit (${this.configuration.maxFileSizeKB}KB)`
                };
            }

            const analyzer = this.analyzerFactory.getAnalyzer(document.fileName);
            if (!analyzer) {
                return {
                    filePath: document.fileName,
                    issues: [],
                    skipped: true,
                    skipReason: 'Unsupported file type'
                };
            }

            const result = await analyzer.analyze(document.getText(), document.fileName);

            // Filter issues by severity
            result.issues = result.issues.filter(issue =>
                this.getSeverityLevel(issue.severity) >= this.getSeverityLevel(this.configuration.minSeverity)
            );

            // Update metrics
            this.metrics.lastAnalysisTime = Date.now() - startTime;
            this.metrics.totalIssuesFound += result.issues.length;
            result.issues.forEach(issue => {
                if (this.metrics.issuesByType[issue.type]) {
                    this.metrics.issuesByType[issue.type]++;
                }
            });

            return result;
        } catch (error) {
            return {
                filePath: document.fileName,
                issues: [],
                error: error instanceof Error ? error.message : 'Unknown error during analysis'
            };
        }
    }

    public getMetrics(): PerformanceMetrics {
        return { ...this.metrics };
    }

    public setConfiguration(config: Partial<AnalyzerConfiguration>): void {
        this.configuration = { ...this.configuration, ...config };
    }

    public generateRecommendations(result: PerformanceAnalysisResult): string[] {
        return result.issues.map(issue => {
            switch (issue.type) {
                case 'performance':
                    return `Consider using a Set for faster lookups`;
                case 'memory-leak':
                    return `Consider implementing proper cleanup in intervals/timeouts`;
                case 'cpu-intensive':
                    return `Consider memoization or dynamic programming approach`;
                case 'memory-management':
                    return `Consider implementing a cache eviction policy`;
                default:
                    return `Review the ${issue.type} issue`;
            }
        });
    }

    public getOptimizationExamples(result: PerformanceAnalysisResult): Array<{ original: string; optimized: string }> {
        return result.issues.map(issue => {
            switch (issue.type) {
                case 'performance':
                    return {
                        original: 'const items = []; for(let i = 0; i < 1000; i++) { items.push(i); }',
                        optimized: 'const items = Array(1000).fill().map((_, i) => i);'
                    };
                default:
                    return {
                        original: issue.code || '',
                        optimized: 'Optimization example not available'
                    };
            }
        });
    }

    private getSeverityLevel(severity: string): number {
        const levels: Record<string, number> = {
            error: 4,
            critical: 3,
            warning: 2,
            info: 1
        };
        return levels[severity] ?? 0;
    }
}
