import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { ILogger } from '../../services/logging/ILogger';
import { ViteConfigAnalysis, VitePlugin, ViteInput, ViteOutput } from './types';
import { ViteConfigAnalyzer, ViteConfigDetector, ViteOptimizationService } from './services';
import { ConfigValidationError } from './errors/ConfigValidationError';

export class ViteConfigManager {
    constructor(
        private readonly configDetector: ViteConfigDetector,
        private readonly configAnalyzer: ViteConfigAnalyzer,
        private readonly optimizationService: ViteOptimizationService,
        private readonly logger: ILogger
    ) {}

    /**
     * Detects Vite configuration files in the given directory
     * @param workspacePath The root directory to search for Vite configs
     * @returns Array of absolute paths to Vite config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        try {
            this.logger.debug(`Detecting Vite configs in ${workspacePath}`);
            return await this.configDetector.detectConfigs(workspacePath);
        } catch (error) {
            this.logger.error('Error detecting Vite configs:', error);
            throw new Error(`Failed to detect Vite configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes a Vite configuration file
     * @param configPath Path to the Vite config file
     * @returns Analysis results including build config, plugins, and optimization suggestions
     */
    public async analyzeConfig(configPath: string): Promise<ViteConfigAnalysis> {
        try {
            this.logger.debug(`Analyzing Vite config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(
                analysis.content,
                analysis.build,
                analysis.plugins,
                analysis.optimizationOptions
            );

            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            this.logger.error('Error analyzing Vite config:', error);
            throw new Error(`Failed to analyze Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validates a Vite configuration file
     * @param configPath Path to the Vite config file
     * @returns True if the configuration is valid
     */
    public async validateConfig(configPath: string): Promise<boolean> {
        try {
            this.logger.debug(`Validating Vite config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            
            // Basic validation checks
            if (!analysis.build) {
                throw new ConfigValidationError('Missing build configuration', configPath, ['Build configuration is required']);
            }

            // Additional validation could be added here
            return true;
        } catch (error) {
            if (error instanceof ConfigValidationError) {
                throw error;
            }
            this.logger.error('Error validating Vite config:', error);
            throw new Error(`Failed to validate Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates optimization suggestions for a Vite configuration
     * @param configPath Path to the Vite config file
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

    /**
     * Gets the detected framework from a Vite configuration
     * @param configPath Path to the Vite config file
     * @returns The detected framework name or null if none detected
     */
    public async detectFramework(configPath: string): Promise<string | null> {
        try {
            this.logger.debug(`Detecting framework for Vite config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            
            // Check plugins to detect framework
            const frameworkPlugins = analysis.plugins.filter(plugin => 
                plugin.name.toLowerCase().includes('react') ||
                plugin.name.toLowerCase().includes('vue') ||
                plugin.name.toLowerCase().includes('svelte') ||
                plugin.name.toLowerCase().includes('solid')
            );

            if (frameworkPlugins.length > 0) {
                const framework = frameworkPlugins[0].name.toLowerCase();
                return framework.includes('react') ? 'React' :
                       framework.includes('vue') ? 'Vue' :
                       framework.includes('svelte') ? 'Svelte' :
                       framework.includes('solid') ? 'Solid' :
                       null;
            }

            return null;
        } catch (error) {
            this.logger.error('Error detecting framework:', error);
            throw new Error(`Failed to detect framework: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
