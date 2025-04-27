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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViteConfigAnalyzer = void 0;
const fs = __importStar(require("fs"));
const ConfigValidationError_1 = require("../errors/ConfigValidationError");
class ViteConfigAnalyzer {
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Analyzes a Vite configuration file
     * @param configPath Path to the Vite config file
     */
    async analyze(configPath) {
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
                optimizationSuggestions: [] // Will be filled by OptimizationService
            };
        }
        catch (error) {
            this.logger.error('Error analyzing Vite config:', error);
            throw new Error(`Failed to analyze Vite configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    analyzeConfig(config) {
        const result = {
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
        }
        catch (error) {
            this.logger.error(`Error analyzing Vite configuration: ${error}`);
            result.isValid = false;
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('Failed to analyze configuration', 'ANALYSIS_ERROR', { error: error.message }));
        }
        return result;
    }
    validateBuildConfig(config, result) {
        if (!config.build) {
            return;
        }
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
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('Invalid minify option', 'INVALID_MINIFY', { value: config.build.minify, expected: ['boolean', 'terser', 'esbuild'] }));
        }
    }
    validateOptimizeDeps(config, result) {
        if (!config.optimizeDeps) {
            return;
        }
        if (config.optimizeDeps.include && !Array.isArray(config.optimizeDeps.include)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('optimizeDeps.include must be an array', 'INVALID_DEPS_INCLUDE', { value: typeof config.optimizeDeps.include, expected: 'array' }));
        }
        if (config.optimizeDeps.exclude && !Array.isArray(config.optimizeDeps.exclude)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('optimizeDeps.exclude must be an array', 'INVALID_DEPS_EXCLUDE', { value: typeof config.optimizeDeps.exclude, expected: 'array' }));
        }
    }
    validateServer(config, result) {
        if (!config.server) {
            return;
        }
        if (config.server.port && !Number.isInteger(config.server.port)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('server.port must be an integer', 'INVALID_PORT', { value: config.server.port, expected: 'integer' }));
        }
        if (config.server.https && typeof config.server.https !== 'boolean') {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('server.https must be a boolean', 'INVALID_HTTPS', { value: typeof config.server.https, expected: 'boolean' }));
        }
    }
    analyzePerformance(config, result) {
        let score = 100;
        // Check for source maps in production
        if (config.build?.sourcemap === true) {
            score -= 10;
            result.performance.issues.push('Source maps are enabled in production build, which increases bundle size');
            result.suggestions.push('Consider disabling source maps in production for better performance');
        }
        // Check for optimization settings
        if (!config.optimizeDeps?.include || config.optimizeDeps.include.length === 0) {
            score -= 5;
            result.performance.issues.push('No dependencies specified for pre-bundling optimization');
            result.suggestions.push('Consider specifying frequently used dependencies in optimizeDeps.include');
        }
        // Check minification settings
        if (config.build?.minify === false) {
            score -= 15;
            result.performance.issues.push('Minification is disabled');
            result.suggestions.push('Enable minification for better production performance');
        }
        result.performance.score = Math.max(0, score);
    }
    extractBuildConfig(content) {
        const buildConfig = {};
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
                        minifyMatch[1].replace(/['"]/g, '');
            }
            // Extract sourcemap
            const sourcemapMatch = buildContent.match(/sourcemap\s*:\s*(true|false|['"]inline['"]|['"]hidden['"])/);
            if (sourcemapMatch) {
                buildConfig.sourcemap = sourcemapMatch[1] === 'true' ? true :
                    sourcemap[1] === 'false' ? false :
                        sourcemapMatch[1].replace(/['"]/g, '');
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
                }
                catch (error) {
                    this.logger.warn('Error parsing rollup options:', error);
                }
            }
        }
        return buildConfig;
    }
    parseRollupOptions(optionsContent) {
        const options = {};
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
            const output = {};
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
    extractPlugins(content) {
        const plugins = [];
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
    getPluginNameFromImport(importPath) {
        // Remove @vitejs/ prefix if present
        const name = importPath.replace(/^@vitejs\//, '');
        // Convert kebab-case to camelCase and add 'Plugin' suffix if not present
        return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
            .replace(/^[a-z]/, c => c.toUpperCase()) +
            (!name.toLowerCase().endsWith('plugin') ? 'Plugin' : '');
    }
    getPluginDescription(pluginName) {
        const descriptions = {
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
    extractOptimizationOptions(content) {
        const options = {};
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
    extractArrayOption(content, optionName) {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*\\[([^\\]]*)\\]`));
        if (match?.[1]) {
            return match[1]
                .split(',')
                .map(item => item.trim().replace(/['"]/g, ''))
                .filter(Boolean);
        }
        return undefined;
    }
    extractStringOption(content, optionName) {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*['"]([^'"]+)['"]`));
        return match?.[1];
    }
    extractBooleanOption(content, optionName) {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*(true|false)`));
        if (match?.[1]) {
            return match[1] === 'true';
        }
        return undefined;
    }
    extractNumberOption(content, optionName) {
        const match = content.match(new RegExp(`${optionName}\\s*:\\s*(\\d+)`));
        if (match?.[1]) {
            return parseInt(match[1], 10);
        }
        return undefined;
    }
}
exports.ViteConfigAnalyzer = ViteConfigAnalyzer;
//# sourceMappingURL=ViteConfigAnalyzer.js.map