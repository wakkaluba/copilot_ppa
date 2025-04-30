import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, AnalyzerOptions } from '../types';
import { ILogger } from '../../logging/ILogger';
import { TypeScriptPatternAnalyzer } from './services/TypeScriptPatternAnalyzer';
import { TypeScriptMetricsCalculator } from './services/TypeScriptMetricsCalculator';
export declare class TypeScriptAnalyzer extends BasePerformanceAnalyzer {
    private readonly logger;
    private readonly patternAnalyzer;
    private readonly metricsCalculator;
    constructor(logger: ILogger, patternAnalyzer: TypeScriptPatternAnalyzer, metricsCalculator: TypeScriptMetricsCalculator, options?: AnalyzerOptions);
    analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;
    private analyzeArrayOperations;
    private analyzeAsyncPatterns;
    private analyzeMemoryUsage;
    private analyzeDOMOperations;
    private analyzeEventHandlers;
    private calculateTypeScriptMetrics;
    private calculateAverageMethodLength;
}
