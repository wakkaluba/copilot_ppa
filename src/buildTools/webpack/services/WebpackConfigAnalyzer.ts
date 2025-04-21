import * as fs from 'fs';
import { ILogger } from '../../../services/logging/ILogger';
import { WebpackConfigAnalysis, WebpackEntry, WebpackLoader, WebpackOutput, WebpackPlugin } from '../types';

export class WebpackConfigAnalyzer {
    constructor(private readonly logger: ILogger) {}

    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     */
    public async analyze(configPath: string): Promise<WebpackConfigAnalysis> {
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
                optimizationSuggestions: []  // Will be filled by OptimizationService
            };
        } catch (error) {
            this.logger.error('Error analyzing webpack config:', error);
            throw new Error(`Failed to analyze webpack configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private extractEntryPoints(content: string): WebpackEntry[] {
        const entries: WebpackEntry[] = [];
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

    private extractOutput(content: string): WebpackOutput {
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

    private extractPathValue(pathString: string): string {
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

    private extractLoaders(content: string): WebpackLoader[] {
        const loaders: WebpackLoader[] = [];
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

    private extractRuleBlocks(rulesContent: string): string[] {
        const blocks: string[] = [];
        let depth = 0;
        let currentBlock = '';

        for (const char of rulesContent) {
            if (char === '{') depth++;
            if (char === '}') depth--;

            currentBlock += char;

            if (depth === 0 && currentBlock.trim()) {
                blocks.push(currentBlock.trim());
                currentBlock = '';
            }
        }

        return blocks;
    }

    private extractTest(ruleBlock: string): string {
        const testMatch = ruleBlock.match(/test\s*:\s*\/([^/]+)\//);
        return testMatch?.[1] || '';
    }

    private extractLoaderNames(ruleBlock: string): string[] {
        const names: string[] = [];
        
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

    private extractLoaderOptions(ruleBlock: string, loaderName: string): Record<string, unknown> {
        const options: Record<string, unknown> = {};
        const optionsMatch = ruleBlock.match(new RegExp(`${loaderName}.*?options\\s*:\\s*{([^}]*)}`, 's'));
        
        if (optionsMatch?.[1]) {
            const optionsContent = optionsMatch[1];
            const optionPairs = Array.from(optionsContent.matchAll(/(['"])?([^'":\s]+)\1\s*:\s*([^,}]+)/g));
            
            optionPairs.forEach(match => {
                if (match[2] && match[3]) {
                    const key = match[2];
                    let value: unknown = match[3].trim();

                    // Try to parse as JSON if possible
                    try {
                        value = JSON.parse(value as string);
                    } catch {
                        // Keep as string if parsing fails
                    }

                    options[key] = value;
                }
            });
        }

        return options;
    }

    private extractPlugins(content: string): WebpackPlugin[] {
        const plugins: WebpackPlugin[] = [];
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

    private getPluginDescription(pluginName: string): string {
        const descriptions: Record<string, string> = {
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