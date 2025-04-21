import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { TypeScriptAnalyzer } from './typescriptAnalyzer';
import { PythonAnalyzer } from './pythonAnalyzer';
import { AnalyzerOptions } from '../types';
import * as path from 'path';

type AnalyzerConstructor = new (options?: AnalyzerOptions) => BasePerformanceAnalyzer;

export class AnalyzerFactory {
    private static instance: AnalyzerFactory;
    private analyzers: Map<string, AnalyzerConstructor>;

    private constructor() {
        this.analyzers = new Map();
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
        const analyzerClass = this.analyzers.get(extension) || this.analyzers.get('.*');
        
        if (!analyzerClass) {
            throw new Error(`No analyzer found for file type: ${extension}`);
        }

        return new analyzerClass(options);
    }

    public registerAnalyzer(extensions: string[], analyzerClass: AnalyzerConstructor): void {
        extensions.forEach(ext => {
            this.analyzers.set(ext.toLowerCase(), analyzerClass);
        });
    }

    private registerDefaultAnalyzers(): void {
        // Register TypeScript/JavaScript analyzer
        this.registerAnalyzer(['.ts', '.tsx', '.js', '.jsx'], TypeScriptAnalyzer);
        
        // Register Python analyzer
        this.registerAnalyzer(['.py', '.pyw'], PythonAnalyzer);

        // Default analyzer for unknown file types
        this.registerAnalyzer(['.*'], TypeScriptAnalyzer);
    }
}