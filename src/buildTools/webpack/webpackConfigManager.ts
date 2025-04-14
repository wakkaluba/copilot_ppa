import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';

export interface WebpackConfigAnalysis {
    entryPoints: any[];
    output: any;
    loaders: any[];
    plugins: any[];
    optimizationSuggestions: any[];
}

export class WebpackConfigManager {
    /**
     * Detects webpack configuration files in the given directory
     */
    public async detectConfigs(workspacePath: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const patterns = [
                'webpack.config.js',
                'webpack.*.config.js',
                '*webpack.config.js',
                '*webpack*.js',
                'webpack.config.ts',
                'webpack.*.config.ts',
                '*webpack.config.ts',
                '*webpack*.ts'
            ];
            
            const configs: string[] = [];
            
            for (const pattern of patterns) {
                const matches = glob.sync(pattern, { cwd: workspacePath });
                
                for (const match of matches) {
                    configs.push(path.join(workspacePath, match));
                }
            }
            
            // Remove duplicates
            resolve([...new Set(configs)]);
        });
    }
    
    /**
     * Analyzes a webpack configuration file
     */
    public async analyzeConfig(configPath: string): Promise<WebpackConfigAnalysis> {
        // This would normally require evaluating JavaScript to get the actual config
        // For now, we'll use static analysis as a simplified approach
        
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            
            // Simple regex-based analysis for demonstration purposes
            const entryPointsMatch = content.match(/entry\s*:\s*{([^}]*)}/s) || 
                                   content.match(/entry\s*:\s*\[([^\]]*)\]/s) ||
                                   content.match(/entry\s*:\s*['"]([^'"]*)['"]/s);
            
            const outputMatch = content.match(/output\s*:\s*{([^}]*)}/s);
            
            const loaderMatches = Array.from(content.matchAll(/use\s*:\s*\[([^\]]*)\]/gs) || []);
            const ruleMatches = Array.from(content.matchAll(/rules\s*:\s*\[([^\]]*)\]/gs) || []);
            
            const pluginMatches = Array.from(content.matchAll(/plugins\s*:\s*\[([^\]]*)\]/gs) || []);
            
            // Extract entry points
            const entryPoints = this.extractEntryPoints(entryPointsMatch ? entryPointsMatch[1] : '');
            
            // Extract output config
            const output = this.extractOutputConfig(outputMatch ? outputMatch[1] : '');
            
            // Extract loaders
            const loaders = this.extractLoaders(loaderMatches, ruleMatches);
            
            // Extract plugins
            const plugins = this.extractPlugins(pluginMatches);
            
            // Generate optimization suggestions
            const optimizationSuggestions = this.generateOptimizationSuggestions(content, entryPoints, loaders, plugins);
            
            return {
                entryPoints,
                output,
                loaders,
                plugins,
                optimizationSuggestions
            };
        } catch (error) {
            console.error('Error analyzing webpack config:', error);
            throw error;
        }
    }
    
    /**
     * Generates optimization suggestions for a webpack configuration
     */
    public async generateOptimizations(configPath: string): Promise<any[]> {
        const analysis = await this.analyzeConfig(configPath);
        
        return analysis.optimizationSuggestions;
    }
    
    private extractEntryPoints(entryPointsStr: string): any[] {
        const entryPoints: any[] = [];
        
        // Extract key-value pairs from the entry points string
        const entryMatches = Array.from(entryPointsStr.matchAll(/['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]/g));
        
        for (const match of entryMatches) {
            entryPoints.push({
                name: match[1],
                path: match[2]
            });
        }
        
        // If no key-value pairs found, try simple string entry point
        if (entryPoints.length === 0 && entryPointsStr.trim()) {
            const simpleMatch = entryPointsStr.match(/['"]([^'"]*)['"]/);
            if (simpleMatch) {
                entryPoints.push({
                    name: 'main',
                    path: simpleMatch[1]
                });
            }
        }
        
        return entryPoints;
    }
    
    private extractOutputConfig(outputStr: string): any {
        const pathMatch = outputStr.match(/path\s*:\s*['"]([^'"]*)['"]/);
        const filenameMatch = outputStr.match(/filename\s*:\s*['"]([^'"]*)['"]/);
        
        return {
            path: pathMatch ? pathMatch[1] : '',
            filename: filenameMatch ? filenameMatch[1] : ''
        };
    }
    
    private extractLoaders(loaderMatches: RegExpMatchArray[], ruleMatches: RegExpMatchArray[]): any[] {
        const loaders: any[] = [];
        
        // Process loader matches
        for (const match of loaderMatches) {
            const loaderContent = match[1];
            const loaderNameMatches = Array.from(loaderContent.matchAll(/['"]([^'"]*-loader)['"]/g));
            
            for (const loaderMatch of loaderNameMatches) {
                loaders.push({
                    name: loaderMatch[1],
                    test: 'Unknown',
                    options: {}
                });
            }
        }
        
        // Process rule matches
        for (const match of ruleMatches) {
            const ruleContent = match[1];
            const testMatches = Array.from(ruleContent.matchAll(/test\s*:\s*\/([^\/]*)\/[gi]*/g));
            const loaderMatches = Array.from(ruleContent.matchAll(/loader\s*:\s*['"]([^'"]*)['"]/g));
            
            for (let i = 0; i < Math.max(testMatches.length, loaderMatches.length); i++) {
                const test = i < testMatches.length ? testMatches[i][1] : 'Unknown';
                const loader = i < loaderMatches.length ? loaderMatches[i][1] : 'Unknown';
                
                loaders.push({
                    name: loader,
                    test: test,
                    options: {}
                });
            }
        }
        
        return loaders;
    }
    
    private extractPlugins(pluginMatches: RegExpMatchArray[]): any[] {
        const plugins: any[] = [];
        
        for (const match of pluginMatches) {
            const pluginContent = match[1];
            
            // Extract plugin constructor names
            const pluginConstructorMatches = Array.from(pluginContent.matchAll(/new\s+([A-Za-z0-9_]+)/g));
            
            for (const pluginMatch of pluginConstructorMatches) {
                const pluginName = pluginMatch[1];
                
                plugins.push({
                    name: pluginName,
                    description: this.getPluginDescription(pluginName)
                });
            }
        }
        
        return plugins;
    }
    
    private getPluginDescription(pluginName: string): string {
        // Common webpack plugins and their descriptions
        const pluginDescriptions: { [key: string]: string } = {
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
        
        return pluginDescriptions[pluginName] || 'A webpack plugin';
    }
    
    private generateOptimizationSuggestions(
        content: string, 
        entryPoints: any[], 
        loaders: any[], 
        plugins: any[]
    ): any[] {
        const suggestions: any[] = [];
        
        // Check for code splitting
        if (!content.includes('splitChunks') || !content.includes('optimization')) {
            suggestions.push({
                title: 'Enable Code Splitting',
                description: 'Use splitChunks to extract common dependencies into separate chunks',
                code: `
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\\\/]node_modules[\\\\/]/,
        name: 'vendors',
        chunks: 'all',
      },
    },
  },
},`
            });
        }
        
        // Check for production mode
        if (!content.includes('mode: "production"') && !content.includes("mode: 'production'")) {
            suggestions.push({
                title: 'Use Production Mode',
                description: 'Add mode: "production" to enable all production optimizations',
                code: `
module.exports = {
  mode: 'production',
  // ...rest of your config
};`
            });
        }
        
        // Check for TerserPlugin
        if (!plugins.some(p => p.name === 'TerserPlugin')) {
            suggestions.push({
                title: 'Add TerserPlugin for JavaScript Minification',
                description: 'Use TerserPlugin to minify your JavaScript in production builds',
                code: `
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  // ...
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
};`
            });
        }
        
        // Check for MiniCssExtractPlugin
        if (!plugins.some(p => p.name === 'MiniCssExtractPlugin')) {
            suggestions.push({
                title: 'Use MiniCssExtractPlugin for CSS',
                description: 'Extract CSS into separate files for production builds',
                code: `
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // ...
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
};`
            });
        }
        
        // Check for source maps in production
        if (content.includes('devtool') && content.includes('source-map') && 
            (content.includes('mode: "production"') || content.includes("mode: 'production'"))) {
            suggestions.push({
                title: 'Optimize Source Maps for Production',
                description: 'Use `hidden-source-map` or disable source maps in production for better performance',
                code: `
// For development
devtool: 'eval-source-map',

// For production
devtool: 'hidden-source-map', // or false to disable`
            });
        }
        
        return suggestions;
    }
}
