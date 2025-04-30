import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, LanguageMetricThresholds } from '../types';
export declare class PythonAnalyzer extends BasePerformanceAnalyzer {
    protected thresholds: LanguageMetricThresholds;
    private readonly memoryPatterns;
    private readonly performancePatterns;
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    private analyzeMemoryPatterns;
    private analyzePerformancePatterns;
    private analyzeComprehensions;
    private analyzeGeneratorUsage;
    private analyzeDataStructures;
    private analyzePythonSpecifics;
    private calculatePythonMetrics;
}
