import { WebpackConfigAnalysis, WebpackOptimization } from './types';
import { 
    WebpackConfigDetector,
    WebpackConfigAnalyzer,
    WebpackOptimizationService
} from './services';
import { ILogger } from '../../services/logging/ILogger';
import { BuildToolConfigManager, ValidationResult } from '../types';

export class WebpackConfigManager implements BuildToolConfigManager {
    private readonly configDetector: WebpackConfigDetector;
    private readonly configAnalyzer: WebpackConfigAnalyzer;
    private readonly optimizationService: WebpackOptimizationService;
    private readonly logger: ILogger;

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
    constructor(
        configDetector: WebpackConfigDetector, 
        configAnalyzer: WebpackConfigAnalyzer,
        optimizationService: WebpackOptimizationService,
        logger: ILogger
    );

    constructor(
        configDetectorOrLogger: WebpackConfigDetector | ILogger,
        configAnalyzer?: WebpackConfigAnalyzer,
        optimizationService?: WebpackOptimizationService,
        loggerParam?: ILogger
    ) {
        // Handle single logger constructor case
        if (arguments.length === 1 && 'debug' in configDetectorOrLogger) {
            this.logger = configDetectorOrLogger;
            this.configDetector = new WebpackConfigDetector();
            this.configAnalyzer = new WebpackConfigAnalyzer();
            this.optimizationService = new WebpackOptimizationService();
        } else {
            // Handle full constructor case
            this.configDetector = configDetectorOrLogger as WebpackConfigDetector;
            this.configAnalyzer = configAnalyzer!;
            this.optimizationService = optimizationService!;
            this.logger = loggerParam!;
        }
    }

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
