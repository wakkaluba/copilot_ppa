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
exports.RollupConfigAnalyzer = void 0;
const fs = __importStar(require("fs"));
const ConfigValidationError_1 = require("../errors/ConfigValidationError");
/**
 * Default logger implementation that does nothing
 */
class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
class RollupConfigAnalyzer {
    logger;
    constructor(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Analyzes a Rollup configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    async analyze(configPath) {
        try {
            const content = await fs.promises.readFile(configPath, 'utf-8');
            const analysis = {
                input: this.extractInput(content),
                output: this.extractOutput(content),
                plugins: this.extractPlugins(content),
                external: this.extractExternals(content),
                content,
                optimizationSuggestions: []
            };
            this.logger.debug(`Analyzed Rollup config at ${configPath}:`, analysis);
            return analysis;
        }
        catch (error) {
            if (error instanceof ConfigValidationError_1.ConfigValidationError) {
                throw error;
            }
            this.logger.error('Failed to analyze Rollup config:', error);
            throw new Error(`Failed to analyze Rollup config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    extractInput(content) {
        const inputs = [];
        const inputMatch = content.match(/input\s*:?\s*({[^}]*}|\[[^\]]*\]|['"][^'"]*['"])/s);
        if (!inputMatch?.[1]) {
            return inputs;
        }
        const inputContent = inputMatch[1];
        // Handle object syntax: { main: 'src/index.js' }
        if (inputContent.startsWith('{')) {
            const entryMatches = Array.from(inputContent.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g));
            entryMatches.forEach(match => {
                if (match[1] && match[2]) {
                    inputs.push({
                        name: match[1],
                        path: match[2],
                        external: this.extractExternals(content)
                    });
                }
            });
        }
        // Handle array syntax: ['src/index.js']
        else if (inputContent.startsWith('[')) {
            const entryPaths = Array.from(inputContent.matchAll(/['"]([^'"]+)['"]/g));
            entryPaths.forEach((match, index) => {
                if (match[1]) {
                    inputs.push({
                        name: `entry${index + 1}`,
                        path: match[1],
                        external: this.extractExternals(content)
                    });
                }
            });
        }
        // Handle string syntax: 'src/index.js'
        else {
            const pathMatch = inputContent.match(/['"]([^'"]+)['"]/);
            if (pathMatch?.[1]) {
                inputs.push({
                    name: 'main',
                    path: pathMatch[1],
                    external: this.extractExternals(content)
                });
            }
        }
        return inputs;
    }
    extractExternals(content) {
        const externals = [];
        const externalsMatch = content.match(/external\s*:?\s*\[(.*?)\]/s);
        if (externalsMatch?.[1]) {
            const externalContent = externalsMatch[1];
            const matches = Array.from(externalContent.matchAll(/['"]([^'"]+)['"]/g));
            matches.forEach(match => {
                if (match[1]) {
                    externals.push(match[1]);
                }
            });
        }
        return externals;
    }
    extractOutput(content) {
        const outputs = [];
        const outputMatch = content.match(/output\s*:?\s*({[^}]*}|\[[^\]]*\])/s);
        if (!outputMatch?.[1]) {
            return outputs;
        }
        const outputContent = outputMatch[1];
        // Handle array of outputs: [{ file: 'bundle.js' }, { file: 'bundle.min.js' }]
        if (outputContent.startsWith('[')) {
            const outputBlocks = this.extractBlocks(outputContent);
            outputBlocks.forEach(block => {
                const output = this.parseOutputBlock(block);
                if (output) {
                    outputs.push(output);
                }
            });
        }
        // Handle single output: { file: 'bundle.js' }
        else if (outputContent.startsWith('{')) {
            const output = this.parseOutputBlock(outputContent);
            if (output) {
                outputs.push(output);
            }
        }
        return outputs;
    }
    parseOutputBlock(block) {
        const fileMatch = block.match(/file\s*:\s*['"]([^'"]+)['"]/);
        const dirMatch = block.match(/dir\s*:\s*['"]([^'"]+)['"]/);
        const formatMatch = block.match(/format\s*:\s*['"]([^'"]+)['"]/);
        const nameMatch = block.match(/name\s*:\s*['"]([^'"]+)['"]/);
        const sourcemapMatch = block.match(/sourcemap\s*:\s*(true|false|['"]inline['"]|['"]hidden['"]),?/);
        if (!formatMatch) {
            return null;
        }
        const output = {
            format: formatMatch[1]
        };
        if (fileMatch) {
            output.file = fileMatch[1];
        }
        if (dirMatch) {
            output.dir = dirMatch[1];
        }
        if (nameMatch) {
            output.name = nameMatch[1];
        }
        if (sourcemapMatch) {
            const value = sourcemapMatch[1];
            output.sourcemap = value === 'true' ? true :
                value === 'false' ? false :
                    value.replace(/['"]/g, '');
        }
        return output;
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
        // Remove @rollup/ prefix if present
        const name = importPath.replace(/^@rollup\//, '');
        // Convert kebab-case to camelCase and add 'Plugin' suffix if not present
        return name.replace(/-([a-z])/g, g => g[1].toUpperCase())
            .replace(/^[a-z]/, c => c.toUpperCase()) +
            (!name.toLowerCase().endsWith('plugin') ? 'Plugin' : '');
    }
    getPluginDescription(pluginName) {
        const descriptions = {
            'CommonjsPlugin': 'Convert CommonJS modules to ES6',
            'NodeResolvePlugin': 'Locate and bundle third-party dependencies in node_modules',
            'TypescriptPlugin': 'Integration with TypeScript compiler',
            'TerserPlugin': 'Minify generated bundle',
            'JsonPlugin': 'Convert .json files to ES6 modules',
            'ReplacePlugin': 'Replace strings in files while bundling',
            'BabelPlugin': 'Transform code with Babel',
            'PostcssPlugin': 'Process CSS with PostCSS',
            'VuePlugin': 'Bundle Vue components',
            'ImagePlugin': 'Import images as data-URIs or files',
            'UrlPlugin': 'Import files as data-URIs or esModule',
            'SveltePlugin': 'Bundle Svelte components',
            'Alias': 'Define aliases for import paths',
            'VisualizePlugin': 'Visualize the bundle composition',
            'LiveReloadPlugin': 'Reload the browser on change'
        };
        return descriptions[pluginName] || 'A rollup plugin';
    }
    extractBlocks(content) {
        const blocks = [];
        let depth = 0;
        let currentBlock = '';
        for (const char of content) {
            if (char === '{') {
                depth++;
            }
            if (char === '}') {
                depth--;
            }
            currentBlock += char;
            if (depth === 0 && currentBlock.trim()) {
                blocks.push(currentBlock.trim());
                currentBlock = '';
            }
        }
        return blocks;
    }
}
exports.RollupConfigAnalyzer = RollupConfigAnalyzer;
//# sourceMappingURL=RollupConfigAnalyzer.js.map