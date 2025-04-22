import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { ILogger } from '../../services/logging/ILogger';
import { ViteConfigAnalysis, VitePlugin, ViteInput, ViteOutput } from './types';
import { ViteConfigAnalyzer, ViteConfigDetector, ViteOptimizationService } from './services';
import { ConfigValidationError } from './errors/ConfigValidationError';

export class ViteConfigManager {
    private readonly configDetector: ViteConfigDetector;
    private readonly configAnalyzer: ViteConfigAnalyzer;
    private readonly optimizationService: ViteOptimizationService;
    private readonly logger: ILogger;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.configDetector = new ViteConfigDetector(logger);
        this.configAnalyzer = new ViteConfigAnalyzer(logger);
        this.optimizationService = new ViteOptimizationService(logger);
    }

    /**
     * Detects Vite configuration files in the given directory
     * @param workspacePath The root directory to search for Vite configs
     * @returns Array of absolute paths to Vite config files
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        try {
            this.logger.debug(`Detecting Vite configs in ${workspacePath}`);
            return await this.configDetector.detect(workspacePath);
        } catch (error) {
            this.logger.error('Error detecting Vite configs:', error);
            throw new Error(`Failed to detect Vite configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Analyzes a Vite configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    public async analyzeConfig(configPath: string): Promise<ViteConfigAnalysis> {
        try {
            this.logger.debug(`Analyzing Vite config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(
                analysis.content,
                analysis.plugins,
                analysis.optimizationOptions
            );

            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        } catch (error) {
            this.logger.error('Error analyzing Vite config:', error);
            throw new Error(`Failed to analyze Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Validates a Vite configuration file
     * @throws {ConfigValidationError} If validation fails
     */
    public async validateConfig(configPath: string): Promise<boolean> {
        try {
            this.logger.debug(`Validating Vite config at ${configPath}`);
            const analysis = await this.analyzeConfig(configPath);
            return analysis.isValid;
        } catch (error) {
            this.logger.error('Error validating Vite config:', error);
            throw new Error(`Failed to validate Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Generates optimization suggestions for a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If generation fails
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
     * @throws {ConfigValidationError} If the config is invalid
     * @returns The detected framework or null if none detected
     */
    public async detectFramework(configPath: string): Promise<string | null> {
        try {
            this.logger.debug(`Detecting framework in ${configPath}`);
            const content = await fs.promises.readFile(configPath, 'utf-8');
            
            if (content.includes('@vitejs/plugin-vue')) return 'vue';
            if (content.includes('@vitejs/plugin-react')) return 'react';
            if (content.includes('@sveltejs/vite-plugin')) return 'svelte';
            
            return null;
        } catch (error) {
            this.logger.error('Error detecting framework:', error);
            throw new Error(`Failed to detect framework: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
