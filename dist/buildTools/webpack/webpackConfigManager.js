"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackConfigManager = void 0;
const services_1 = require("./services");
class WebpackConfigManager {
    configDetector;
    configAnalyzer;
    optimizationService;
    logger;
    constructor(configDetectorOrLogger, configAnalyzer, optimizationService, loggerParam) {
        // Handle single logger constructor case
        if (arguments.length === 1 && 'debug' in configDetectorOrLogger) {
            this.logger = configDetectorOrLogger;
            this.configDetector = new services_1.WebpackConfigDetector();
            this.configAnalyzer = new services_1.WebpackConfigAnalyzer();
            this.optimizationService = new services_1.WebpackOptimizationService();
        }
        else {
            // Handle full constructor case
            this.configDetector = configDetectorOrLogger;
            this.configAnalyzer = configAnalyzer;
            this.optimizationService = optimizationService;
            this.logger = loggerParam;
        }
    }
    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath The root directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    async detectConfigs(workspacePath) {
        try {
            this.logger.debug(`Searching for webpack configs in ${workspacePath}`);
            return await this.configDetector.detectConfigs(workspacePath);
        }
        catch (error) {
            this.logger.error('Error detecting webpack configs:', error);
            throw new Error(`Failed to detect webpack configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Analysis results including entry points, output config, loaders, plugins, and optimization suggestions
     */
    async analyzeConfig(configPath) {
        try {
            this.logger.debug(`Analyzing webpack config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(analysis.content, analysis.entryPoints, analysis.loaders, analysis.plugins);
            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        }
        catch (error) {
            this.logger.error('Error analyzing webpack config:', error);
            throw new Error(`Failed to analyze webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validates a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Validation results containing any errors or warnings
     */
    async validateConfig(configPath) {
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
        }
        catch (error) {
            this.logger.error('Error validating webpack config:', error);
            throw new Error(`Failed to validate webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generates optimization suggestions for a webpack configuration
     * @param configPath Path to the webpack config file
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
exports.WebpackConfigManager = WebpackConfigManager;
//# sourceMappingURL=webpackConfigManager.js.map