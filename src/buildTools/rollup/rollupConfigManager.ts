import { RollupConfigAnalysis, RollupOptimization, IRollupConfigManager, IRollupConfigDetector, IRollupConfigAnalyzer, IRollupOptimizationService, IRollupConfigValidationService } from './types';
import { RollupConfigDetector } from './services/RollupConfigDetector';
import { RollupConfigAnalyzer } from './services/RollupConfigAnalyzer';
import { RollupOptimizationService } from './services/RollupOptimizationService';
import { RollupConfigValidationService } from './services/RollupConfigValidationService';
import { ILogger } from '../../services/logging/ILogger';
import { ConfigValidationError } from './errors/ConfigValidationError';

export class RollupConfigManager implements IRollupConfigManager {
    private readonly configDetector: IRollupConfigDetector;
    private readonly configAnalyzer: IRollupConfigAnalyzer;
    private readonly optimizationService: IRollupOptimizationService;
    private readonly validationService: IRollupConfigValidationService;

    constructor(
        private readonly logger: ILogger,
        configDetector?: IRollupConfigDetector,
        configAnalyzer?: IRollupConfigAnalyzer,
        optimizationService?: IRollupOptimizationService,
        validationService?: IRollupConfigValidationService
    ) {
        this.configDetector = configDetector ?? new RollupConfigDetector(logger);
        this.configAnalyzer = configAnalyzer ?? new RollupConfigAnalyzer(logger);
        this.optimizationService = optimizationService ?? new RollupOptimizationService(logger);
        this.validationService = validationService ?? new RollupConfigValidationService(logger);
    }

    /**
     * Detects Rollup configuration files in the given directory
     * @throws {ConfigValidationError} If workspace path is invalid
     * @throws {Error} If detection fails
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        this.validationService.validateWorkspacePath(workspacePath);

        try {
            const configs = await this.configDetector.detectConfigs(workspacePath);
            
            if (configs.length === 0) {
                this.logger.warn(`No Rollup configuration files found in ${workspacePath}`);
            } else {
                this.logger.info(`Found ${configs.length} Rollup configuration files in ${workspacePath}`);
            }

            return configs;
        } catch (error) {
            this.logger.error('Error detecting rollup configs:', error);
            throw error;
        }
    }

    /**
     * Analyzes a Rollup configuration file and validates its structure
     * @throws {ConfigValidationError} If the configuration is invalid
     * @throws {Error} If analysis fails
     */
    public async analyzeConfig(configPath: string): Promise<RollupConfigAnalysis> {
        this.validationService.validateConfigPath(configPath);

        try {
            const analysis = await this.configAnalyzer.analyze(configPath);
            
            // Validate required configuration fields
            this.validationService.validateConfig(analysis);
            
            // Generate optimization suggestions
            analysis.optimizationSuggestions = this.optimizationService.generateOptimizations(
                analysis.content,
                analysis.input,
                analysis.output.map(o => o.format),
                analysis.plugins.map(p => p.name)
            );

            this.logger.info(`Successfully analyzed Rollup config at ${configPath}`);
            return analysis;
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                this.logger.warn(`Invalid Rollup config at ${configPath}:`, error.message);
                throw error;
            }
            this.logger.error('Error analyzing rollup config:', error);
            throw error;
        }
    }

    /**
     * Generates optimization suggestions for a Rollup configuration
     * @throws {ConfigValidationError} If the config path is invalid
     * @throws {Error} If optimization generation fails
     */
    public async generateOptimizations(configPath: string): Promise<RollupOptimization[]> {
        this.validationService.validateConfigPath(configPath);

        try {
            const analysis = await this.analyzeConfig(configPath);
            this.logger.info(`Generated ${analysis.optimizationSuggestions.length} optimization suggestions for ${configPath}`);
            return analysis.optimizationSuggestions;
        } catch (error) {
            this.logger.error('Error generating optimizations:', error);
            throw error;
        }
    }
}
