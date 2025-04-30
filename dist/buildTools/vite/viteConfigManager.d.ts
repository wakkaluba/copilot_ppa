import { ILogger } from '../../services/logging/ILogger';
import { ViteConfigAnalysis } from './types';
export declare class ViteConfigManager {
    private readonly configDetector;
    private readonly configAnalyzer;
    private readonly optimizationService;
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Detects Vite configuration files in the given directory
     * @param workspacePath The root directory to search for Vite configs
     * @returns Array of absolute paths to Vite config files
     */
    detectConfigs(workspacePath: string): Promise<string[]>;
    /**
     * Analyzes a Vite configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    analyzeConfig(configPath: string): Promise<ViteConfigAnalysis>;
    /**
     * Validates a Vite configuration file
     * @throws {ConfigValidationError} If validation fails
     */
    validateConfig(configPath: string): Promise<boolean>;
    /**
     * Generates optimization suggestions for a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If generation fails
     */
    generateOptimizations(configPath: string): Promise<string[]>;
    /**
     * Gets the detected framework from a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @returns The detected framework or null if none detected
     */
    detectFramework(configPath: string): Promise<string | null>;
}
