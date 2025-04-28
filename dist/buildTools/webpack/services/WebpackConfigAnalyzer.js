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
exports.WebpackConfigAnalyzer = void 0;
const fs = __importStar(require("fs"));
/**
 * Default logger implementation that does nothing
 */
class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
class WebpackConfigAnalyzer {
    constructor(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     */
    async analyze(configPath) {
        this.logger.debug(`Analyzing webpack config at ${configPath}`);
        try {
            const content = await fs.promises.readFile(configPath, 'utf-8');
            const entryPoints = this.extractEntryPoints(content);
            const output = this.extractOutput(content);
            const loaders = this.extractLoaders(content);
            const plugins = this.extractPlugins(content);
            return {
                entryPoints,
                output,
                loaders,
                plugins,
                content,
                optimizationSuggestions: [], // Will be filled by OptimizationService
                errors: [],
                warnings: []
            };
        }
        catch (error) {
            this.logger.error('Error analyzing webpack config:', error);
            throw new Error(`Failed to analyze webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    extractEntryPoints(content) {
        const entries = [];
        const entryMatch = content.match(/entry\s*:\s*({[^}]*}|\[[^\]]*\]|['"][^'"]*['"])/s);
        if (!entryMatch?.[1]) {
            return entries;
        }
        const entryContent = entryMatch[1];
        // Handle object syntax: { main: './src/index.js' }
        if (entryContent.startsWith('{')) {
            const entryMatches = Array.from(entryContent.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g));
            entryMatches.forEach(match => {
                if (match[1] && match[2]) {
                    entries.push({ name: match[1], path: match[2] });
                }
            });
        }
        // Handle array syntax: ['./src/index.js']
        else if (entryContent.startsWith('[')) {
            const entryPaths = Array.from(entryContent.matchAll(/['"]([^'"]+)['"]/g));
            entryPaths.forEach((match, index) => {
                if (match[1]) {
                    entries.push({ name: `entry${index + 1}`, path: match[1] });
                }
            });
        }
        // Handle string syntax: './src/index.js'
        else {
            const pathMatch = entryContent.match(/['"]([^'"]+)['"]/);
            if (pathMatch?.[1]) {
                entries.push({ name: 'main', path: pathMatch[1] });
            }
        }
        return entries;
    }
    extractOutput(content) {
        const outputMatch = content.match(/output\s*:\s*{([^}]*)}/s);
        if (!outputMatch?.[1]) {
            return { path: '', filename: '' };
        }
        const outputContent = outputMatch[1];
        const pathMatch = outputContent.match(/path\s*:\s*[^,}]+/);
        const filenameMatch = outputContent.match(/filename\s*:\s*['"]([^'"]+)['"]/);
        const publicPathMatch = outputContent.match(/publicPath\s*:\s*['"]([^'"]+)['"]/);
        return {
            path: pathMatch ? this.extractPathValue(pathMatch[0]) : '',
            filename: filenameMatch?.[1] || '',
            publicPath: publicPathMatch?.[1]
        };
    }
    extractPathValue(pathString) {
        // Handle path.resolve/join syntax
        const resolveMatch = pathString.match(/path\.(?:resolve|join)\s*\((.*)\)/);
        if (resolveMatch?.[1]) {
            const parts = Array.from(resolveMatch[1].matchAll(/['"]([^'"]+)['"]/g));
            return parts.map(match => match[1]).join('/');
        }
        // Handle direct string
        const directMatch = pathString.match(/['"]([^'"]+)['"]/);
        return directMatch?.[1] || '';
    }
    extractLoaders(content) {
        const loaders = [];
        const rulesMatch = content.match(/rules\s*:\s*\[(.*?)\]/s);
        if (rulesMatch?.[1]) {
            const rulesContent = rulesMatch[1];
            const ruleBlocks = this.extractRuleBlocks(rulesContent);
            ruleBlocks.forEach(block => {
                const test = this.extractTest(block);
                const loaderNames = this.extractLoaderNames(block);
                loaderNames.forEach(name => {
                    loaders.push({
                        name,
                        test,
                        options: this.extractLoaderOptions(block, name)
                    });
                });
            });
        }
        return loaders;
    }
    extractRuleBlocks(rulesContent) {
        const blocks = [];
        let depth = 0;
        let currentBlock = '';
        for (const char of rulesContent) {
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
    extractTest(ruleBlock) {
        const testMatch = ruleBlock.match(/test\s*:\s*\/([^/]+)\//);
        return testMatch?.[1] || '';
    }
    extractLoaderNames(ruleBlock) {
        const names = [];
        // Check for use array
        const useMatch = ruleBlock.match(/use\s*:\s*\[(.*?)\]/s);
        if (useMatch?.[1]) {
            const loaderMatches = Array.from(useMatch[1].matchAll(/['"]([^'"]*-loader)['"]/g));
            loaderMatches.forEach(match => {
                if (match[1]) {
                    names.push(match[1]);
                }
            });
        }
        // Check for single loader
        const loaderMatch = ruleBlock.match(/loader\s*:\s*['"]([^'"]*-loader)['"]/);
        if (loaderMatch?.[1]) {
            names.push(loaderMatch[1]);
        }
        return names;
    }
    extractLoaderOptions(ruleBlock, loaderName) {
        const options = {};
        const optionsMatch = ruleBlock.match(new RegExp(`${loaderName}.*?options\\s*:\\s*{([^}]*)}`, 's'));
        if (optionsMatch?.[1]) {
            const optionsContent = optionsMatch[1];
            const optionPairs = Array.from(optionsContent.matchAll(/(['"])?([^'":\s]+)\1\s*:\s*([^,}]+)/g));
            optionPairs.forEach(match => {
                if (match[2] && match[3]) {
                    const key = match[2];
                    let value = match[3].trim();
                    // Try to parse as JSON if possible
                    try {
                        value = JSON.parse(value);
                    }
                    catch {
                        // Keep as string if parsing fails
                    }
                    options[key] = value;
                }
            });
        }
        return options;
    }
    extractPlugins(content) {
        const plugins = [];
        const pluginsMatch = content.match(/plugins\s*:\s*\[(.*?)\]/s);
        if (pluginsMatch?.[1]) {
            const pluginsContent = pluginsMatch[1];
            const pluginMatches = Array.from(pluginsContent.matchAll(/new\s+([A-Za-z]+Plugin)/g));
            pluginMatches.forEach(match => {
                if (match[1]) {
                    plugins.push({
                        name: match[1],
                        description: this.getPluginDescription(match[1])
                    });
                }
            });
        }
        return plugins;
    }
    getPluginDescription(pluginName) {
        const descriptions = {
            'HtmlWebpackPlugin': 'Generates HTML files to serve your webpack bundles',
            'MiniCssExtractPlugin': 'Extracts CSS into separate files',
            'CleanWebpackPlugin': 'Cleans the build folder before each build',
            'CopyWebpackPlugin': 'Copies individual files or directories to the build directory',
            'DefinePlugin': 'Allows configuring global constants at compile time',
            'TerserPlugin': 'Minifies JavaScript',
            'OptimizeCSSAssetsPlugin': 'Optimizes and minimizes CSS assets',
            'BundleAnalyzerPlugin': 'Visualizes the size of webpack output files',
            'CompressionPlugin': 'Prepares compressed versions of assets to serve them with Content-Encoding'
        };
        return descriptions[pluginName] || 'A webpack plugin';
    }
}
exports.WebpackConfigAnalyzer = WebpackConfigAnalyzer;
//# sourceMappingURL=WebpackConfigAnalyzer.js.map