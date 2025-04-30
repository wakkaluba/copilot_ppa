import * as vscode from 'vscode';
export interface CodeMetrics {
    cyclomaticComplexity: number;
    nestingDepth: number;
    maintainabilityIndex: number;
    linesOfCode: number;
    commentDensity?: number;
}
export interface FunctionAnalysis {
    name: string;
    complexity: number;
    nestingDepth: number;
    linesOfCode: number;
    maintainabilityIndex: number;
    grade: string;
}
/**
 * Analyzes code complexity using various tools
 */
export declare class ComplexityAnalyzer {
    private context;
    private jsService;
    private pyService;
    private reportService;
    private outputChannel;
    constructor(context: vscode.ExtensionContext);
    initialize(): Promise<void>;
    /**
     * Analyze the complexity of the current file
     */
    analyzeFile(): Promise<void>;
    /**
     * Calculates cyclomatic complexity for code
     * @param code The source code to analyze
     */
    calculateCyclomaticComplexity(code: string): number;
    /**
     * Calculates maximum nesting depth in code
     * @param code The source code to analyze
     */
    calculateNestingDepth(code: string): number;
    /**
     * Analyzes a specific function in the code
     * @param code The source code to analyze
     * @param functionName The name of the function to analyze
     */
    analyzeFunction(code: string, functionName: string): FunctionAnalysis;
    /**
     * Analyzes multiple metrics for the code
     * @param code The source code to analyze
     */
    analyzeMetrics(code: string): CodeMetrics;
    /**
     * Calculates a maintainability index (0-100 scale)
     * Using the Microsoft formula: MI = MAX(0, (171 - 5.2 * ln(Halstead Volume) - 0.23 * (Cyclomatic Complexity) - 16.2 * ln(Lines of Code)) * 100 / 171)
     * Simplified for this implementation
     * @param code The source code to analyze
     */
    calculateMaintainabilityIndex(code: string): number;
    /**
     * Returns a grade (A-F) based on cyclomatic complexity
     * @param complexity The cyclomatic complexity value
     */
    getComplexityGrade(complexity: number): string;
    /**
     * Dispose resources
     */
    dispose(): void;
}
