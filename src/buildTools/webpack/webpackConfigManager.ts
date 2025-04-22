import { WebpackConfigAnalysis, WebpackOptimization } from './types';
import { 
    WebpackConfigDetector,
    WebpackConfigAnalyzer,
    WebpackOptimizationService
} from './services';
import { ILogger } from '../../services/logging/ILogger';
import { BuildToolConfigManager, ValidationResult } from '../types';

export class WebpackConfigManager implements BuildToolConfigManager {
    constructor(
        private readonly configDetector: WebpackConfigDetector,
        private readonly configAnalyzer: WebpackConfigAnalyzer,
        private readonly optimizationService: WebpackOptimizationService,
        private readonly logger: ILogger
    ) {}

    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath The root directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        try {
            this.logger.debug(`Searching for webpack configs in ${workspacePath}`);
            return await this.configDetector.detectConfigs(workspacePath);
        } catch (error) {
            this.logger.error('Error detecting webpack configs:', error);
            throw new Error(`Failed to detect webpack configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Analysis results including entry points, output config, loaders, plugins, and optimization suggestions
     */
    public async analyzeConfig(configPath: string): Promise<WebpackConfigAnalysis> {
        try {
            this.logger.debug(`Analyzing webpack config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(
                analysis.content,
                analysis.entryPoints,
                analysis.loaders,
                analysis.plugins
            );

            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        } catch (error) {
            this.logger.error('Error analyzing webpack config:', error);
            throw new Error(`Failed to analyze webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validates a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Validation results containing any errors or warnings
     */
    public async validateConfig(configPath: string): Promise<ValidationResult> {
        try {
            this.logger.debug(`Validating webpack config at ${configPath}`);
            const analysis = await this.analyzeConfig(configPath);
            
            return {
                isValid: analysis.errors.length === 0,
                errors: analysis.errors.map(error => ({
                    message: error.message,
                    line: error.line,
                    column: error.column,
                    severity: 'error'
                })),
                warnings: analysis.warnings.map(warning => ({
                    message: warning.message,
                    line: warning.line,
                    column: warning.column,
                    severity: 'warning'
                }))
            };
        } catch (error) {
            this.logger.error('Error validating webpack config:', error);
            throw new Error(`Failed to validate webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates optimization suggestions for a webpack configuration
     * @param configPath Path to the webpack config file
     * @returns Array of optimization suggestions
     */
    public async generateOptimizations(configPath: string): Promise<WebpackOptimization[]> {
        try {
            this.logger.debug(`Generating optimization suggestions for ${configPath}`);
            const analysis = await this.analyzeConfig(configPath);
            return analysis.optimizationSuggestions;
        } catch (error) {
            this.logger.error('Error generating optimizations:', error);
            throw new Error(`Failed to generate optimization suggestions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
