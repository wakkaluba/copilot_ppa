import * as fs from 'fs';
import { ILogger } from '../../../services/logging/ILogger';
import { ViteConfigAnalysis, ViteBuildConfig, VitePlugin, ViteOptimizationOptions } from '../types';
import { ConfigValidationError } from '../errors/ConfigValidationError';

export interface ConfigAnalysisResult {
    isValid: boolean;
    warnings: string[];
    errors: ConfigValidationError[];
    suggestions: string[];
    performance: {
        score: number;
        issues: string[];
    };
}

export interface ViteConfig {
    build?: {
        target?: string[];
        minify?: boolean | 'terser' | 'esbuild';
        sourcemap?: boolean;
        rollupOptions?: any;
    };
    optimizeDeps?: {
        include?: string[];
        exclude?: string[];
    };
    server?: {
        port?: number;
        https?: boolean;
    };
    plugins?: any[];
}

export class ViteConfigAnalyzer {
    constructor(private readonly logger: ILogger) {}

    /**
     * Analyzes a Vite configuration file
     * @param configPath Path to the Vite config file
     */
    public async analyze(configPath: string): Promise<ViteConfigAnalysis> {
        this.logger.debug(`Analyzing Vite config at ${configPath}`);

        try {
            const content = await fs.promises.readFile(configPath, 'utf-8');
            
            const build = this.extractBuildConfig(content);
            const plugins = this.extractPlugins(content);
            const optimizationOptions = this.extractOptimizationOptions(content);

            return {
                build,
                plugins,
                optimizationOptions,
                content,
                optimizationSuggestions: []  // Will be filled by OptimizationService
            };
        } catch (error) {
            this.logger.error('Error analyzing Vite config:', error);
            throw new Error(`Failed to analyze Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    analyzeConfig(config: ViteConfig): ConfigAnalysisResult {
        const result: ConfigAnalysisResult = {
            isValid: true,
            warnings: [],
            errors: [],
            suggestions: [],
            performance: {
                score: 100,
                issues: []
            }
        };

        try {
            this.validateBuildConfig(config, result);
            this.validateOptimizeDeps(config, result);
            this.validateServer(config, result);
            this.analyzePerformance(config, result);

            // Update validity based on errors
            result.isValid = result.errors.length === 0;
        } catch (error) {
            this.logger.error(`Error analyzing Vite configuration: ${error}`);
            result.isValid = false;
            result.errors.push(
                new ConfigValidationError(
                    'Failed to analyze configuration',
                    'ANALYSIS_ERROR',
                    { error: error.message }
                )
            );
        }

        return result;
    }

    private validateBuildConfig(config: ViteConfig, result: ConfigAnalysisResult): void {
        if (!config.build) {return;}

        if (config.build.target) {
            const validTargets = ['es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020'];
            for (const target of config.build.target) {
                if (!validTargets.includes(target)) {
                    result.warnings.push(`Invalid build target: ${target}`);
                }
            }
        }

        if (config.build.minify && typeof config.build.minify !== 'boolean' &&
            !['terser', 'esbuild'].includes(config.build.minify)) {
            result.errors.push(
                new ConfigValidationError(
                    'Invalid minify option',
                    'INVALID_MINIFY',
                    { value: config.build.minify, expected: ['boolean', 'terser', 'esbuild'] }
                )
            );
        }
    }

    private validateOptimizeDeps(config: ViteConfig, result: ConfigAnalysisResult): void {
        if (!config.optimizeDeps) {return;}

        if (config.optimizeDeps.include && !Array.isArray(config.optimizeDeps.include)) {
            result.errors.push(
                new ConfigValidationError(
                    'optimizeDeps.include must be an array',
                    'INVALID_DEPS_INCLUDE',
                    { value: typeof config.optimizeDeps.include, expected: 'array' }
                )
            );
        }

        if (config.optimizeDeps.exclude && !Array.isArray(config.optimizeDeps.exclude)) {
            result.errors.push(
                new ConfigValidationError(
                    'optimizeDeps.exclude must be an array',
                    'INVALID_DEPS_EXCLUDE',
                    { value: typeof config.optimizeDeps.exclude, expected: 'array' }
                )
            );
        }
    }

    private validateServer(config: ViteConfig, result: ConfigAnalysisResult): void {
        if (!config.server) {return;}

        if (config.server.port && !Number.isInteger(config.server.port)) {
            result.errors.push(
                new ConfigValidationError(
                    'server.port must be an integer',
                    'INVALID_PORT',
                    { value: config.server.port, expected: 'integer' }
                )
            );
        }

        if (config.server.https && typeof config.server.https !== 'boolean') {
            result.errors.push(
                new ConfigValidationError(
                    'server.https must be a boolean',
                    'INVALID_HTTPS',
                    { value: typeof config.server.https, expected: 'boolean' }
                )
            );
        }
    }

    private analyzePerformance(config: ViteConfig, result: ConfigAnalysisResult): void {
        let score = 100;

        // Check for source maps in production
        if (config.build?.sourcemap === true) {
            score -= 10;
            result.performance.issues.push(
                'Source maps are enabled in production build, which increases bundle size'
            );
            result.suggestions.push(
                'Consider disabling source maps in production for better performance'
            );
        }

        // Check for optimization settings
        if (!config.optimizeDeps?.include || config.optimizeDeps.include.length === 0) {
            score -= 5;
            result.performance.issues.push(
                'No dependencies specified for pre-bundling optimization'
            );
            result.suggestions.push(
                'Consider specifying frequently used dependencies in optimizeDeps.include'
            );
        }

        // Check minification settings
        if (config.build?.minify === false) {
            score -= 15;
            result.performance.issues.push('Minification is disabled');
            result.suggestions.push(
                'Enable minification for better production performance'
            );
        }

        result.performance.score = Math.max(0, score);
    }

    private extractBuildConfig(content: string): ViteBuildConfig {
        const buildConfig: ViteBuildConfig = {};
        const buildMatch = content.match(/build\s*:?\s*({[^}]*})/s);

        if (buildMatch?.[1]) {
            const buildContent = buildMatch[1];

            // Extract outDir
            const outDirMatch = buildContent.match(/outDir\s*:\s*['"]([^'"]+)['"]/);
            if (outDirMatch?.[1]) {
                buildConfig.outDir = outDirMatch[1];
            }

            // Extract target
            const targetMatch = buildContent.match(/target\s*:\s*(?:['"]([^'"]+)['"]|\[([^\]]+)\])/);
            if (targetMatch) {
                buildConfig.target = targetMatch[2] ? 
                    targetMatch[2].split(',').map(t => t.trim().replace(/['"]/g, '')) :
                    targetMatch[1];
            }

            // Extract minify
            const minifyMatch = buildContent.match(/minify\s*:\s*(true|false|['"]terser['"]|['"]esbuild['"])/);
            if (minifyMatch) {
                buildConfig.minify = minifyMatch[1] === 'true' ? true :
                                   minifyMatch[1] === 'false' ? false :
                                   minifyMatch[1].replace(/['"]/g, '') as 'terser' | 'esbuild';
            }

            // Extract sourcemap
            const sourcemapMatch = buildContent.match(/sourcemap\s*:\s*(true|false|['"]inline['"]|['"]hidden['"])/);
            if (sourcemapMatch) {
                buildConfig.sourcemap = sourcemapMatch[1] === 'true' ? true :
                                      sourcemap[1] === 'false' ? false :
                                      sourcemapMatch[1].replace(/['"]/g, '') as 'inline' | 'hidden';
            }

            // Extract cssCodeSplit
            const cssCodeSplitMatch = buildContent.match(/cssCodeSplit\s*:\s*(true|false)/);
            if (cssCodeSplitMatch) {
                buildConfig.cssCodeSplit = cssCodeSplitMatch[1] === 'true';
            }

            // Extract cssModules
            const cssModulesMatch = buildContent.match(/cssModules\s*:\s*(true|false)/);
            if (cssModulesMatch) {
                buildConfig.cssModules = cssModulesMatch[1] === 'true';
            }

            // Extract assetsInlineLimit
            const assetsInlineLimitMatch = buildContent.match(/assetsInlineLimit\s*:\s*(\d+)/);
            if (assetsInlineLimitMatch) {
                buildConfig.assetsInlineLimit = parseInt(assetsInlineLimitMatch[1], 10);
            }

            // Extract rollupOptions if present
            const rollupOptionsMatch = buildContent.match(/rollupOptions\s*:\s*({[^}]*})/s);
            if (rollupOptionsMatch) {
                try {
                    buildConfig.rollupOptions = this.parseRollupOptions(rollupOptionsMatch[1]);
                } catch (error) {
                    this.logger.warn('Error parsing rollup options:', error);
                }
            }
        }

        return buildConfig;
    }

    private parseRollupOptions(optionsContent: string): Record<string, unknown> {
        const options: Record<string, unknown> = {};

        // Extract external
        const externalMatch = optionsContent.match(/external\s*:\s*\[(.*?)\]/s);
        if (externalMatch) {
            options.external = externalMatch[1]
                .split(',')
                .map(item => item.trim().replace(/['"]/g, ''))
                .filter(Boolean);
        }

        // Extract output options
        const outputMatch = optionsContent.match(/output\s*:\s*({[^}]*})/s);
        if (outputMatch) {
            const output: Record<string, unknown> = {};
            const outputContent = outputMatch[1];

            // Extract format
            const formatMatch = outputContent.match(/format\s*:\s*['"]([^'"]+)['"]/);
            if (formatMatch) {
                output.format = formatMatch[1];
            }

            // Extract entry names pattern
            const entryFileNamesMatch = outputContent.match(/entryFileNames\s*:\s*['"]([^'"]+)['"]/);
            if (entryFileNamesMatch) {
                output.entryFileNames = entryFileNamesMatch[1];
            }

            options.output = output;
        }

        return options;
    }

    private extractPlugins(content: string): VitePlugin[] {
        const plugins: VitePlugin[] = [];
        const pluginsMatch = content.match(/plugins\s*:?\s*\[(.*?)\]/s);

        if (pluginsMatch?.[1]) {
            const pluginsContent = pluginsMatch[1];
            const pluginMatches = Array.from(pluginsContent.matchAll(/(?:import|require)\(['"]([^'"]+)['"]\)/g));

            pluginMatches.forEach(match => {
                if (match[1]) {
                    const name = this.getPluginNameFromImport(match[1]);
                    plugins.push({
                        name,
                        description: this.getPluginDescription(name)
                    });
                }
            });
        }

        return plugins;
    }

    private getPluginNameFromImport(importPath: string): string {
        // Remove @vitejs/ prefix if present
        const name = importPath.replace(/^@vitejs\//, '');
        // Convert kebab-case to camelCase and add 'Plugin' suffix if not present
        return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
                  .replace(/^[a-z]/, c => c.toUpperCase()) +
                  (!name.toLowerCase().endsWith('plugin') ? 'Plugin' : '');
    }

    private getPluginDescription(pluginName: string): string {
        const descriptions: Record<string, string> = {
            'ReactPlugin': 'Enable React support in Vite',
            'VuePlugin': 'Enable Vue support in Vite',
            'SveltePlugin': 'Enable Svelte support in Vite',
            'LegacyPlugin': 'Generate legacy bundles for older browsers',
            'TypescriptPlugin': 'Add TypeScript support',
            'WindiCSSPlugin': 'Enable WindiCSS support',
            'TailwindPlugin': 'Enable Tailwind CSS support',
            'ImagePlugin': 'Optimize and transform images',
            'CompressPlugin': 'Compress build output',
            'PwaPlugin': 'Add PWA support',
            'InspectPlugin': 'Inspect bundled modules',
            'MarkdownPlugin': 'Import and process Markdown files',
            'PreloadPlugin': 'Add preload directives to HTML',
            'VisualizerPlugin': 'Visualize bundle composition'
        };

        return descriptions[pluginName] || 'A Vite plugin';
    }

    private extractOptimizationOptions(content: string): ViteOptimizationOptions {
        const options: ViteOptimizationOptions = {};
        const optimizeMatch = content.match(/optimizeDeps\s*:?\s*({[^}]*})/s);

        if (optimizeMatch?.[1]) {
            const optimizeContent = optimizeMatch[1];
            
            options.deps = {
                entries: this.extractArrayOption(optimizeContent, 'entries'),
                exclude: this.extractArrayOption(optimizeContent, 'exclude'),
                include: this.extractArrayOption(optimizeContent, 'include')
            };
        }

        const buildMatch = content.match(/build\s*:?\s*({[^}]*})/s);
        if (buildMatch?.[1]) {
            const buildContent = buildMatch[1];

            options.build = {
                target: this.extractStringOption(buildContent, 'target'),
                minify: this.extractBooleanOption(buildContent, 'minify'),
                cssCodeSplit: this.extractBooleanOption(buildContent, 'cssCodeSplit'),
                chunkSizeWarningLimit: this.extractNumberOption(buildContent, 'chunkSizeWarningLimit')
            };
        }

        return options;
    }

    private extractArrayOption(content: string, optionName: string): string[] | undefined {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*\\[([^\\]]*)\\]`));
        if (match?.[1]) {
            return match[1]
                .split(',')
                .map(item => item.trim().replace(/['"]/g, ''))
                .filter(Boolean);
        }
        return undefined;
    }

    private extractStringOption(content: string, optionName: string): string | undefined {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*['"]([^'"]+)['"]`));
        return match?.[1];
    }

    private extractBooleanOption(content: string, optionName: string): boolean | undefined {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*(true|false)`));
        if (match?.[1]) {
            return match[1] === 'true';
        }
        return undefined;
    }

    private extractNumberOption(content: string, optionName: string): number | undefined {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*(\\d+)`));
        if (match?.[1]) {
            return parseInt(match[1], 10);
        }
        return undefined;
    }
}