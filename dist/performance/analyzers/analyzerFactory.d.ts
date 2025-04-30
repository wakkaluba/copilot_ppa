import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { AnalyzerOptions } from '../types';
type AnalyzerConstructor = new (options?: AnalyzerOptions) => BasePerformanceAnalyzer;
export declare class AnalyzerFactory {
    private static instance;
    private analyzers;
    private constructor();
    static getInstance(): AnalyzerFactory;
    getAnalyzer(filePath: string, options?: AnalyzerOptions): BasePerformanceAnalyzer;
    registerAnalyzer(extensions: string[], analyzerClass: AnalyzerConstructor): void;
    private registerDefaultAnalyzers;
}
export {};
