import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, LanguageMetricThresholds } from '../types';
export declare class JavaAnalyzer extends BasePerformanceAnalyzer {
    protected thresholds: LanguageMetricThresholds;
    private readonly memoryPatterns;
    private readonly concurrencyPatterns;
    private readonly performancePatterns;
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    private analyzeMemoryPatterns;
    private analyzeConcurrencyPatterns;
    private analyzePerformancePatterns;
    private analyzeCollectionUsage;
    private analyzeStreamOperations;
    private analyzeExceptionHandling;
    private analyzeJavaSpecifics;
    private calculateJavaMetrics;
    private findFirstOccurrence;
    private analyzeParallelStreamUsage;
}
