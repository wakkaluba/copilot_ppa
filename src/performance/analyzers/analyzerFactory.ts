import * as path from 'path';
import { ILogger } from '../../common/logging';
import { ConsoleLogger } from '../../common/logging/consoleLogger';
import { AnalyzerOptions } from '../types';
import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { JavaAnalyzer } from './javaAnalyzer';
import { PythonAnalyzer } from './pythonAnalyzer';
import { TypeScriptMetricsCalculator } from './typescript/metricsCalculator';
import { TypeScriptPatternAnalyzer } from './typescript/patternAnalyzer';
import { TypeScriptAnalyzer } from './typescriptAnalyzer';

type SupportedLanguages = 'javascript' | 'typescript' | 'python' | 'java';

export class AnalyzerFactory {
    private static instance: AnalyzerFactory;
    private analyzers: Map<string, BasePerformanceAnalyzer>;
    private readonly logger: ILogger;
    private readonly tsPatternAnalyzer: TypeScriptPatternAnalyzer;
    private readonly tsMetricsCalculator: TypeScriptMetricsCalculator;

    private constructor() {
        this.analyzers = new Map();
        this.logger = new ConsoleLogger();
        this.tsPatternAnalyzer = new TypeScriptPatternAnalyzer(this.logger);
        this.tsMetricsCalculator = new TypeScriptMetricsCalculator();
        this.registerDefaultAnalyzers();
    }

    public static getInstance(): AnalyzerFactory {
        if (!AnalyzerFactory.instance) {
            AnalyzerFactory.instance = new AnalyzerFactory();
        }
        return AnalyzerFactory.instance;
    }

    public getAnalyzer(filePath: string, options?: AnalyzerOptions): BasePerformanceAnalyzer {
        const extension = path.extname(filePath).toLowerCase();
        const analyzer = this.analyzers.get(extension) || this.analyzers.get('.*');

        if (!analyzer) {
            throw new Error(`No analyzer found for file type: ${extension}`);
        }

        return analyzer;
    }

    private registerAnalyzer(extensions: string[], analyzer: BasePerformanceAnalyzer): void {
        extensions.forEach(ext => {
            this.analyzers.set(ext.toLowerCase(), analyzer);
        });
    }

    private registerDefaultAnalyzers(): void {
        const defaultOptions: AnalyzerOptions = {
            maxFileSize: 1000000,
            excludePatterns: [],
            includeTests: false,
            thresholds: {
                cyclomaticComplexity: [10, 20],
                nestedBlockDepth: [3, 5],
                functionLength: [20, 50],
                parameterCount: [3, 5],
                maintainabilityIndex: [70, 50],
                commentRatio: [0.1, 0.05]
            }
        };

        // Register TypeScript/JavaScript analyzer with all required dependencies
        const tsAnalyzer = new TypeScriptAnalyzer(
            this.logger,
            this.tsPatternAnalyzer,
            this.tsMetricsCalculator,
            defaultOptions
        );
        this.registerAnalyzer(['.ts', '.tsx', '.js', '.jsx'], tsAnalyzer);

        // Register Python analyzer
        const pyAnalyzer = new PythonAnalyzer(defaultOptions);
        this.registerAnalyzer(['.py', '.pyw'], pyAnalyzer);

        // Register Java analyzer
        const javaAnalyzer = new JavaAnalyzer(defaultOptions);
        this.registerAnalyzer(['.java'], javaAnalyzer);

        // Default analyzer for unknown file types
        this.registerAnalyzer(['.*'], tsAnalyzer);
    }

    private getLanguageExtensions(language: SupportedLanguages): string[] {
        const extensionMap: Record<SupportedLanguages, string[]> = {
            'javascript': ['.js', '.jsx'],
            'typescript': ['.ts', '.tsx'],
            'python': ['.py', '.pyw'],
            'java': ['.java']
        };
        return extensionMap[language] || [];
    }

    public hasAnalyzer(language: string): boolean {
        // Cast to SupportedLanguages to ensure type safety
        if (this.isSupportedLanguage(language)) {
            const extensions = this.getLanguageExtensions(language);
            return extensions.some(ext => this.analyzers.has(ext));
        }
        return false;
    }

    public getSupportedExtensions(): string[] {
        return Array.from(this.analyzers.keys()).filter(ext => ext !== '.*');
    }

    private isSupportedLanguage(language: string): language is SupportedLanguages {
        return ['javascript', 'typescript', 'python', 'java'].includes(language);
    }
}
