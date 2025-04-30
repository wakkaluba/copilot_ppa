import { ILogger } from '../../../services/logging/ILogger';
import { ViteConfigAnalysis } from '../types';
import { ConfigValidationError } from '../errors/ConfigValidationError';
export interface ConfigAnalysisResult {
    isValid: boolean;
    warnings: string[];
    errors: ConfigValidationError[];
    suggestions: string[];
    performance: {
        score: number;
        issues: string[];
    };
}
export interface ViteConfig {
    build?: {
        target?: string[];
        minify?: boolean | 'terser' | 'esbuild';
        sourcemap?: boolean;
        rollupOptions?: any;
    };
    optimizeDeps?: {
        include?: string[];
        exclude?: string[];
    };
    server?: {
        port?: number;
        https?: boolean;
    };
    plugins?: any[];
}
export declare class ViteConfigAnalyzer {
    private readonly logger;
    constructor(logger: ILogger);
    /**
     * Analyzes a Vite configuration file
     * @param configPath Path to the Vite config file
     */
    analyze(configPath: string): Promise<ViteConfigAnalysis>;
    analyzeConfig(config: ViteConfig): ConfigAnalysisResult;
    private validateBuildConfig;
    private validateOptimizeDeps;
    private validateServer;
    private analyzePerformance;
    private extractBuildConfig;
    private parseRollupOptions;
    private extractPlugins;
    private getPluginNameFromImport;
    private getPluginDescription;
    private extractOptimizationOptions;
    private extractArrayOption;
    private extractStringOption;
    private extractBooleanOption;
    private extractNumberOption;
}
