import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult } from '../types';
export declare class CSharpAnalyzer extends BasePerformanceAnalyzer {
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    private analyzeLINQOperations;
    private analyzeStringOperations;
    private analyzeDisposableUsage;
    private analyzeAsyncAwait;
    private analyzeLoopAllocations;
    private calculateCSharpMetrics;
    private calculateAverageMethodLength;
}
