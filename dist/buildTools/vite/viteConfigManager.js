"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViteConfigManager = void 0;
const fs = __importStar(require("fs"));
const services_1 = require("./services");
/**
 * Default logger implementation that does nothing
 */
class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
class ViteConfigManager {
    constructor(logger) {
        this.logger = logger || new NoOpLogger();
        this.configDetector = new services_1.ViteConfigDetector(this.logger);
        this.configAnalyzer = new services_1.ViteConfigAnalyzer(this.logger);
        this.optimizationService = new services_1.ViteOptimizationService(this.logger);
    }
    /**
     * Detects Vite configuration files in the given directory
     * @param workspacePath The root directory to search for Vite configs
     * @returns Array of absolute paths to Vite config files
     */
    async detectConfigs(workspacePath) {
        try {
            this.logger.debug(`Detecting Vite configs in ${workspacePath}`);
            return await this.configDetector.detect(workspacePath);
        }
        catch (error) {
            this.logger.error('Error detecting Vite configs:', error);
            throw new Error(`Failed to detect Vite configurations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Analyzes a Vite configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    async analyzeConfig(configPath) {
        try {
            this.logger.debug(`Analyzing Vite config at ${configPath}`);
            const analysis = await this.configAnalyzer.analyze(configPath);
            const suggestions = await this.optimizationService.generateSuggestions(analysis.content, analysis.plugins, analysis.optimizationOptions);
            return {
                ...analysis,
                optimizationSuggestions: suggestions
            };
        }
        catch (error) {
            this.logger.error('Error analyzing Vite config:', error);
            throw new Error(`Failed to analyze Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validates a Vite configuration file
     * @throws {ConfigValidationError} If validation fails
     */
    async validateConfig(configPath) {
        try {
            this.logger.debug(`Validating Vite config at ${configPath}`);
            const analysis = await this.analyzeConfig(configPath);
            return analysis.isValid;
        }
        catch (error) {
            this.logger.error('Error validating Vite config:', error);
            throw new Error(`Failed to validate Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generates optimization suggestions for a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If generation fails
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
    /**
     * Gets the detected framework from a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @returns The detected framework or null if none detected
     */
    async detectFramework(configPath) {
        try {
            this.logger.debug(`Detecting framework in ${configPath}`);
            const content = await fs.promises.readFile(configPath, 'utf-8');
            if (content.includes('@vitejs/plugin-vue')) {
                return 'vue';
            }
            if (content.includes('@vitejs/plugin-react')) {
                return 'react';
            }
            if (content.includes('@sveltejs/vite-plugin')) {
                return 'svelte';
            }
            return null;
        }
        catch (error) {
            this.logger.error('Error detecting framework:', error);
            throw new Error(`Failed to detect framework: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.ViteConfigManager = ViteConfigManager;
//# sourceMappingURL=viteConfigManager.js.map