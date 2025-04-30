import * as vscode from 'vscode';
/**
 * Common types for the performance analyzer
 */
/**
 * Interface for a performance issue found in code
 */
export interface PerformanceIssue {
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    line: number;
    column?: number;
    code: string | null;
    solution: string;
    solutionCode?: string;
}
/**
 * Common metrics tracked across all languages
 */
export interface BaseMetrics {
    linesOfCode: number;
    commentRatio?: number;
    nestingDepth?: number;
    averageMethodLength?: number;
}
/**
 * JavaScript/TypeScript specific metrics
 */
export interface JavaScriptMetrics extends BaseMetrics {
    asyncFunctionCount?: number;
    promiseUsageCount?: number;
    domOperationsCount?: number;
    eventListenerCount?: number;
    loopCount?: number;
    recursiveCallCount?: number;
}
/**
 * Java specific metrics
 */
export interface JavaMetrics extends BaseMetrics {
    classCount?: number;
    methodCount?: number;
    importCount?: number;
    streamApiUsage?: number;
    finalFieldCount?: number;
    genericTypeCount?: number;
    parallelStreamCount?: number;
    stringBuilderUsage?: number;
    synchronizedBlockCount?: number;
    concurrentUtilsCount?: number;
}
/**
 * C# specific metrics
 */
export interface CSharpMetrics extends BaseMetrics {
    classCount?: number;
    methodCount?: number;
    usingCount?: number;
    linqOperationsCount?: number;
    stringBuilderUsage?: number;
    lockStatementCount?: number;
    disposableUsageCount?: number;
}
/**
 * Interface for the result of a performance analysis
 */
export interface PerformanceAnalysisResult {
    filePath: string;
    fileSize: number;
    issues: PerformanceIssue[];
    metrics: Record<string, number>;
}
/**
 * Interface for the result of a workspace-wide performance analysis
 */
export interface WorkspacePerformanceResult {
    fileResults: PerformanceAnalysisResult[];
    summary: {
        filesAnalyzed: number;
        totalIssues: number;
        criticalIssues: number;
        highIssues: number;
        mediumIssues: number;
        lowIssues: number;
    };
}
/**
 * Interface defining performance thresholds for different metrics
 */
export interface PerformanceThresholds {
    cyclomaticComplexity: [number, number];
    nestedBlockDepth: [number, number];
    functionLength: [number, number];
    parameterCount: [number, number];
    maintainabilityIndex: [number, number];
    commentRatio: [number, number];
}
/**
 * Configuration options for performance analysis
 */
export interface PerformanceAnalyzerConfig {
    thresholds: PerformanceThresholds;
    excludePatterns: string[];
    maxFileSize: number;
    analyzeOnSave: boolean;
    showInlineMarkers: boolean;
}
/**
 * Definition of a language analyzer
 */
export interface LanguageAnalyzer {
    /**
     * Analyze code for performance issues
     * @param fileContent The content of the file to analyze
     * @param filePath The path to the file being analyzed
     * @returns Analysis results
     */
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
}
export interface CodeMetrics {
    cyclomaticComplexity: number;
    linesOfCode: number;
    commentRatio: number;
    functionCount: number;
    maintainabilityIndex: number;
    functionLength: number;
    nestedBlockDepth: number;
    parameterCount: number;
}
export interface LanguageMetricThresholds {
    cyclomaticComplexity: [number, number];
    nestedBlockDepth: [number, number];
    functionLength: [number, number];
    parameterCount: [number, number];
    maintainabilityIndex: [number, number];
    commentRatio: [number, number];
}
export interface AnalyzerOptions {
    maxFileSize: number;
    excludePatterns: string[];
    includeTests: boolean;
    thresholds: LanguageMetricThresholds;
}
export interface FileAnalysisContext {
    content: string;
    uri: vscode.Uri;
    languageId: string;
    version: number;
}
