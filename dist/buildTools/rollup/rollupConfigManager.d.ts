import { RollupConfigAnalysis } from './types';
import { RollupConfigAnalyzer, RollupConfigDetector, RollupOptimizationService } from './services';
import { ILogger } from '../../services/logging/ILogger';
export declare class RollupConfigManager {
    private readonly configDetector;
    private readonly configAnalyzer;
    private readonly optimizationService;
    private readonly logger;
    /**
     * Create a RollupConfigManager with a logger only, defaults will be used for other dependencies
     * @param logger The logger to use
     */
    constructor(logger: ILogger);
    /**
     * Create a RollupConfigManager with all dependencies explicitly provided
     * @param configDetector The config detector service
     * @param configAnalyzer The config analyzer service
     * @param optimizationService The optimization service
     * @param logger The logger to use
     */
    constructor(configDetector: RollupConfigDetector, configAnalyzer: RollupConfigAnalyzer, optimizationService: RollupOptimizationService, logger: ILogger);
    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath The root directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    detectConfigs(workspacePath: string): Promise<string[]>;
    /**
     * Analyzes a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns Analysis results including input config, output config, plugins, and optimization suggestions
     */
    analyzeConfig(configPath: string): Promise<RollupConfigAnalysis>;
    /**
     * Validates a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns True if the configuration is valid
     */
    validateConfig(configPath: string): Promise<boolean>;
    /**
     * Generates optimization suggestions for a rollup configuration
     * @param configPath Path to the rollup config file
     * @returns Array of optimization suggestions
     */
    generateOptimizations(configPath: string): Promise<string[]>;
}
