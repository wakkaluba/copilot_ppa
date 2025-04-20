import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { TypeScriptAnalyzer } from './typescriptAnalyzer';
import { AnalyzerOptions } from '../types';
import * as path from 'path';

export class AnalyzerFactory {
    private static instance: AnalyzerFactory;
    private analyzers: Map<string, typeof BasePerformanceAnalyzer>;

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

    public registerAnalyzer(extensions: string[], analyzerClass: typeof BasePerformanceAnalyzer): void {
        extensions.forEach(ext => {
            this.analyzers.set(ext.toLowerCase(), analyzerClass);
        });
    }

    private registerDefaultAnalyzers(): void {
        // Register TypeScript analyzer for .ts and .tsx files
        this.registerAnalyzer(['.ts', '.tsx', '.js', '.jsx'], TypeScriptAnalyzer);
        
        // Default analyzer for unknown file types
        this.registerAnalyzer(['.*'], TypeScriptAnalyzer);
    }
}