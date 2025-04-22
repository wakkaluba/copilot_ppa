"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupConfigManager = void 0;
class RollupConfigManager {
    configDetector;
    configAnalyzer;
    optimizationService;
    logger;
    constructor(configDetector, configAnalyzer, optimizationService, logger) {
        this.configDetector = configDetector;
        this.configAnalyzer = configAnalyzer;
        this.optimizationService = optimizationService;
        this.logger = logger;
    }
    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath The root directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    async detectConfigs(workspacePath) {
        try {
            this.logger.debug(`Detecting rollup configs in ${workspacePath}`);
            return await this.configDetector.detectConfigs(workspacePath);
        }
        catch (error) {
            this.logger.error('Error detecting rollup configs:', error);
            throw new Error(`Failed to detect rollup configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Analyzes a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns Analysis results including input config, output config, plugins, and optimization suggestions
     */
    async analyzeConfig(configPath) {
        try {
            this.logger.debug(`Analyzing rollup config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(analysis.content, analysis.input, analysis.output, analysis.plugins);
            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        }
        catch (error) {
            this.logger.error('Error analyzing rollup config:', error);
            throw new Error(`Failed to analyze rollup configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validates a rollup configuration file
     * @param configPath Path to the rollup config file
     * @returns True if the configuration is valid
     */
    async validateConfig(configPath) {
        try {
            this.logger.debug(`Validating rollup config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            // Basic validation - check if required fields are present
            return analysis.input.length > 0 &&
                analysis.output.some(output => output.file || output.dir);
        }
        catch (error) {
            this.logger.error('Error validating rollup config:', error);
            throw new Error(`Failed to validate rollup configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generates optimization suggestions for a rollup configuration
     * @param configPath Path to the rollup config file
     * @returns Array of optimization suggestions
     */
    async generateOptimizations(configPath) {
        try {
            this.logger.debug(`Generating optimization suggestions for ${configPath}`);
            const analysis = await this.analyzeConfig(configPath);
            return analysis.optimizationSuggestions;
        }
        catch (error) {
            this.logger.error('Error generating optimizations:', error);
            throw new Error(`Failed to generate optimization suggestions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.RollupConfigManager = RollupConfigManager;
//# sourceMappingURL=rollupConfigManager.js.map