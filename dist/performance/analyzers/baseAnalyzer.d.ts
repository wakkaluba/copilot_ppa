import { PerformanceAnalysisResult, PerformanceIssue, AnalyzerOptions, LanguageMetricThresholds } from '../types';
export declare abstract class BasePerformanceAnalyzer {
    protected thresholds: LanguageMetricThresholds;
    protected options: AnalyzerOptions;
    constructor(options?: AnalyzerOptions);
    abstract analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    protected createBaseResult(fileContent: string, filePath: string): PerformanceAnalysisResult;
    protected calculateBaseMetrics(content: string): Record<string, number>;
    protected extractCodeSnippet(lines: string[], lineIndex: number, contextLines?: number): string;
    protected findLineNumber(content: string, index: number): number;
    protected shouldAnalyzeFile(filePath: string): boolean;
    private isTestFile;
    private matchesGlobPattern;
    protected calculateContentHash(content: string): string;
    protected estimateMaxNestedDepth(content: string): number;
    protected analyzeComplexity(fileContent: string, lines: string[]): number;
    protected analyzeNesting(fileContent: string): number;
    protected analyzeResourceUsage(fileContent: string, lines: string[]): PerformanceIssue[];
    protected analyzeCommonAntiPatterns(fileContent: string, lines: string[]): PerformanceIssue[];
}
