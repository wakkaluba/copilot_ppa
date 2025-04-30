import { WebpackConfigAnalysis, WebpackOptimization } from './types';
import { WebpackConfigDetector, WebpackConfigAnalyzer, WebpackOptimizationService } from './services';
import { ILogger } from '../../services/logging/ILogger';
import { BuildToolConfigManager, ValidationResult } from '../types';
export declare class WebpackConfigManager implements BuildToolConfigManager {
    private readonly configDetector;
    private readonly configAnalyzer;
    private readonly optimizationService;
    private readonly logger;
    /**
     * Create a WebpackConfigManager with a logger only, defaults will be used for other dependencies
     * @param logger The logger to use
     */
    constructor(logger: ILogger);
    /**
     * Create a WebpackConfigManager with all dependencies explicitly provided
     * @param configDetector The config detector service
     * @param configAnalyzer The config analyzer service
     * @param optimizationService The optimization service
     * @param logger The logger to use
     */
    constructor(configDetector: WebpackConfigDetector, configAnalyzer: WebpackConfigAnalyzer, optimizationService: WebpackOptimizationService, logger: ILogger);
    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath The root directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    detectConfigs(workspacePath: string): Promise<string[]>;
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Analysis results including entry points, output config, loaders, plugins, and optimization suggestions
     */
    analyzeConfig(configPath: string): Promise<WebpackConfigAnalysis>;
    /**
     * Validates a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Validation results containing any errors or warnings
     */
    validateConfig(configPath: string): Promise<ValidationResult>;
    /**
     * Generates optimization suggestions for a webpack configuration
     * @param configPath Path to the webpack config file
     * @returns Array of optimization suggestions
     */
    generateOptimizations(configPath: string): Promise<WebpackOptimization[]>;
}
