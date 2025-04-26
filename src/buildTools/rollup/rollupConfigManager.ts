import { RollupConfigAnalysis, RollupPlugin, RollupInput, RollupOutput } from './types';
import { RollupConfigAnalyzer, RollupConfigDetector, RollupOptimizationService } from './services';
import { ILogger } from '../../services/logging/ILogger';

export class RollupConfigManager {
    private readonly configDetector: RollupConfigDetector;
    private readonly configAnalyzer: RollupConfigAnalyzer;
    private readonly optimizationService: RollupOptimizationService;
    private readonly logger: ILogger;

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
    constructor(
        configDetector: RollupConfigDetector,
        configAnalyzer: RollupConfigAnalyzer,
        optimizationService: RollupOptimizationService,
        logger: ILogger
    );

    constructor(
        configDetectorOrLogger: RollupConfigDetector | ILogger,
        configAnalyzer?: RollupConfigAnalyzer,
        optimizationService?: RollupOptimizationService,
        loggerParam?: ILogger
    ) {
        // Handle single logger constructor case
        if (arguments.length === 1 && 'debug' in configDetectorOrLogger) {
            this.logger = configDetectorOrLogger;
            this.configDetector = new RollupConfigDetector();
            this.configAnalyzer = new RollupConfigAnalyzer();
            this.optimizationService = new RollupOptimizationService();
        } else {
            // Handle full constructor case
            this.configDetector = configDetectorOrLogger as RollupConfigDetector;
            this.configAnalyzer = configAnalyzer!;
            this.optimizationService = optimizationService!;
            this.logger = loggerParam!;
        }
    }

    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath The root directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        try {
            this.logger.debug(`Detecting rollup configs in ${workspacePath}`);
            return await this.configDetector.detectConfigs(workspacePath);
        } catch (error) {
            this.logger.error('Error detecting rollup configs:', error);
            throw new Error(`Failed to detect rollup configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns Analysis results including input config, output config, plugins, and optimization suggestions
     */
    public async analyzeConfig(configPath: string): Promise<RollupConfigAnalysis> {
        try {
            this.logger.debug(`Analyzing rollup config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(
                analysis.content,
                analysis.input,
                analysis.output,
                analysis.plugins
            );

            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        } catch (error) {
            this.logger.error('Error analyzing rollup config:', error);
            throw new Error(`Failed to analyze rollup configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validates a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns True if the configuration is valid
     */
    public async validateConfig(configPath: string): Promise<boolean> {
        try {
            this.logger.debug(`Validating rollup config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            
            // Basic validation - check if required fields are present
            return analysis.input.length > 0 && 
                   analysis.output.some(output => output.file || output.dir);
        } catch (error) {
            this.logger.error('Error validating rollup config:', error);
            throw new Error(`Failed to validate rollup configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates optimization suggestions for a rollup configuration
     * @param configPath Path to the rollup config file
     * @returns Array of optimization suggestions
     */
    public async generateOptimizations(configPath: string): Promise<string[]> {
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
