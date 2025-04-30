import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, PerformanceIssue, AnalyzerOptions, LanguageMetricThresholds } from '../types';
export declare class JavaScriptAnalyzer extends BasePerformanceAnalyzer {
    protected thresholds: LanguageMetricThresholds;
    constructor(options?: AnalyzerOptions);
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    private parseCode;
    private analyzeAst;
    private analyzeFunctionComplexity;
    private analyzeClassComplexity;
    protected getCodeContext(content: string, position: number): string;
    protected createIssue(title: string, description: string, severity: PerformanceIssue['severity'], line: number, code: string, solution: string, solutionCode?: string): PerformanceIssue;
    private findLineNumber;
    private calculateConditionalComplexity;
}
