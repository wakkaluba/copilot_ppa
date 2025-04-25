"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebpackOptimizationService = void 0;
class WebpackOptimizationService {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Generates optimization suggestions for a webpack configuration
     */
    async generateSuggestions(content, entryPoints, loaders, plugins) {
        try {
            const suggestions = [];
            // Check for code splitting
            if (!content.includes('splitChunks')) {
                suggestions.push({
                    title: 'Enable Code Splitting',
                    description: 'Split your code into smaller chunks to improve initial load time',
                    code: `optimization: {
    splitChunks: {
        chunks: 'all',
        minSize: 20000,
        minRemainingSize: 0,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
            defaultVendors: {
                test: /[\\\\/]node_modules[\\\\/]/,
                priority: -10,
                reuseExistingChunk: true,
            },
            default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
            },
        },
    },
}`
                });
            }
            // Check for minification
            if (!plugins.some(p => p.name === 'TerserPlugin')) {
                suggestions.push({
                    title: 'Add JavaScript Minification',
                    description: 'Minify JavaScript to reduce bundle size',
                    code: `const TerserPlugin = require('terser-webpack-plugin');

optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        terserOptions: {
            parse: {
                ecma: 8,
            },
            compress: {
                ecma: 5,
                warnings: false,
                comparisons: false,
                inline: 2,
            },
            mangle: {
                safari10: true,
            },
            output: {
                ecma: 5,
                comments: false,
                ascii_only: true,
            },
        },
    })],
}`
                });
            }
            // Check for CSS optimization
            if (loaders.some(l => l.name.includes('css')) &&
                !plugins.some(p => p.name === 'OptimizeCSSAssetsPlugin' || p.name === 'CssMinimizerPlugin')) {
                suggestions.push({
                    title: 'Add CSS Optimization',
                    description: 'Optimize and minify CSS to reduce bundle size',
                    code: `const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

optimization: {
    minimizer: [
        // For webpack@5 you can use the '...' syntax to extend existing minimizers
        '...',
        new CssMinimizerPlugin(),
    ],
}`
                });
            }
            // Check for caching
            if (!content.includes('cache')) {
                suggestions.push({
                    title: 'Enable Build Caching',
                    description: 'Cache the built modules to speed up rebuild process',
                    code: `cache: {
    type: 'filesystem',
    buildDependencies: {
        config: [__filename],
    },
}`
                });
            }
            // Check for compression
            if (!plugins.some(p => p.name === 'CompressionPlugin')) {
                suggestions.push({
                    title: 'Add Asset Compression',
                    description: 'Compress assets to reduce download size',
                    code: `const CompressionPlugin = require('compression-webpack-plugin');

plugins: [
    new CompressionPlugin({
        algorithm: 'gzip',
        test: /\\.js$|\\.css$|\\.html$/,
        threshold: 10240,
        minRatio: 0.8,
    }),
]`
                });
            }
            // Check for bundle analysis
            if (!plugins.some(p => p.name === 'BundleAnalyzerPlugin')) {
                suggestions.push({
                    title: 'Add Bundle Analysis',
                    description: 'Visualize bundle size to identify optimization opportunities',
                    code: `const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

plugins: [
    new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
    }),
]`
                });
            }
            // Check for module concatenation
            if (!content.includes('concatenateModules')) {
                suggestions.push({
                    title: 'Enable Module Concatenation',
                    description: 'Combine modules into larger chunks to reduce overhead',
                    code: `optimization: {
    concatenateModules: true,
}`
                });
            }
            return suggestions;
        }
        catch (error) {
            this.logger.error('Error generating optimization suggestions:', error);
            throw new Error(`Failed to generate optimization suggestions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.WebpackOptimizationService = WebpackOptimizationService;
//# sourceMappingURL=WebpackOptimizationService.js.map