/**
 * Defines severity levels for performance issues
 */
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
/**
 * Represents a specific performance issue detected in code
 */
export interface PerformanceIssue {
    title: string;
    description: string;
    severity: IssueSeverity;
    line: number;
    code: string;
    solution?: string;
    solutionCode?: string;
}
/**
 * Represents performance metrics for a file
 */
export interface PerformanceMetrics {
    [key: string]: number;
}
/**
 * Represents the result of analyzing a file's performance
 */
export interface PerformanceAnalysisResult {
    filePath: string;
    fileHash: string;
    issues: PerformanceIssue[];
    metrics: PerformanceMetrics;
}
/**
 * Represents the result of analyzing performance across a workspace
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
 * Interface for language-specific code analyzers
 */
export interface ILanguageAnalyzer {
    /**
     * Analyzes code for a specific language
     * @param fileContent The content of the file to analyze
     * @param filePath The path of the file being analyzed
     */
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    /**
     * Gets the supported file extensions for this analyzer
     */
    getSupportedExtensions(): string[];
}
/**
 * Interface for performance metrics calculation
 */
export interface IPerformanceMetricsCalculator {
    /**
     * Calculates performance metrics for a given file content
     */
    calculateMetrics(fileContent: string, language: string): PerformanceMetrics;
}
/**
 * Interface for performance report generation
 */
export interface IPerformanceReportGenerator {
    /**
     * Generates HTML for a file performance report
     */
    generateFileReportHtml(result: PerformanceAnalysisResult): string;
    /**
     * Generates HTML for a workspace performance report
     */
    generateWorkspaceReportHtml(result: WorkspacePerformanceResult): string;
}
/**
 * Interface for performance analysis service
 */
export interface IPerformanceAnalysisService {
    /**
     * Analyzes the active file for performance issues
     */
    analyzeActiveFile(): Promise<PerformanceAnalysisResult | null>;
    /**
     * Analyzes multiple files in a workspace
     */
    analyzeWorkspace(): Promise<WorkspacePerformanceResult>;
}
/**
 * Interface for managing performance analysis UI elements
 */
export interface IPerformanceUIManager {
    /**
     * Initializes the UI elements
     */
    initialize(): void;
    /**
     * Shows a report for a specific file's performance analysis
     */
    showFileAnalysisReport(result: PerformanceAnalysisResult): void;
    /**
     * Shows a comprehensive workspace performance report
     */
    showWorkspaceAnalysisReport(result: WorkspacePerformanceResult): void;
    /**
     * Disposes UI elements
     */
    dispose(): void;
}
