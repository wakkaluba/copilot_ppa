import { ILogger } from '../../../services/logging/ILogger';
import { WebpackEntry, WebpackLoader, WebpackPlugin, WebpackOptimization } from '../types';

export class WebpackOptimizationService {
    constructor(private readonly logger: ILogger) {}

    /**
     * Generates optimization suggestions for a webpack configuration
     */
    public async generateSuggestions(
        content: string,
        entryPoints: WebpackEntry[],
        loaders: WebpackLoader[],
        plugins: WebpackPlugin[]
    ): Promise<WebpackOptimization[]> {
        this.logger.debug('Generating webpack optimization suggestions');
        const suggestions: WebpackOptimization[] = [];

        try {
            this.checkCodeSplitting(content, suggestions);
            this.checkProduction(content, suggestions);
            this.checkCacheOptimization(content, suggestions);
            this.checkMinification(plugins, suggestions);
            this.checkCssExtraction(plugins, loaders, suggestions);
            this.checkSourceMaps(content, suggestions);
            this.checkTreeShaking(content, suggestions);
            this.checkDynamicImports(content, entryPoints.length, suggestions);
            this.checkAssetOptimization(content, suggestions);
            this.checkModuleResolution(content, suggestions);

            return suggestions;
        } catch (error) {
            this.logger.error('Error generating optimization suggestions:', error);
            throw new Error(`Failed to generate optimization suggestions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private checkCodeSplitting(content: string, suggestions: WebpackOptimization[]): void {
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
    }

    private checkProduction(content: string, suggestions: WebpackOptimization[]): void {
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
    }

    private checkCacheOptimization(content: string, suggestions: WebpackOptimization[]): void {
        if (!content.includes('cache:')) {
            suggestions.push({
                title: 'Enable Build Caching',
                description: 'Use cache options to speed up rebuilds',
                code: `
module.exports = {
  // ...
  cache: {
    type: 'filesystem',
    buildDependencies: {
      config: [__filename]
    }
  },
};`
            });
        }
    }

    private checkMinification(plugins: WebpackPlugin[], suggestions: WebpackOptimization[]): void {
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
    }

    private checkCssExtraction(plugins: WebpackPlugin[], loaders: WebpackLoader[], suggestions: WebpackOptimization[]): void {
        if (loaders.some(l => l.name.includes('css-loader')) && !plugins.some(p => p.name === 'MiniCssExtractPlugin')) {
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
    }

    private checkSourceMaps(content: string, suggestions: WebpackOptimization[]): void {
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
    }

    private checkTreeShaking(content: string, suggestions: WebpackOptimization[]): void {
        if (!content.includes('sideEffects')) {
            suggestions.push({
                title: 'Enable Tree Shaking',
                description: 'Configure sideEffects to enable better tree shaking',
                code: `
module.exports = {
  // ...
  optimization: {
    usedExports: true,
  },
  // In package.json:
  // "sideEffects": false
};`
            });
        }
    }

    private checkDynamicImports(content: string, entryPointCount: number, suggestions: WebpackOptimization[]): void {
        if (!content.includes('import(') && entryPointCount === 1) {
            suggestions.push({
                title: 'Use Dynamic Imports',
                description: 'Consider using dynamic imports for code splitting and lazy loading',
                code: `
// Instead of:
import MyComponent from './MyComponent';

// Use:
const MyComponent = () => import('./MyComponent');`
            });
        }
    }

    private checkAssetOptimization(content: string, suggestions: WebpackOptimization[]): void {
        if (!content.includes('asset/resource') && !content.includes('file-loader')) {
            suggestions.push({
                title: 'Optimize Asset Loading',
                description: 'Use Asset Modules for optimized asset handling',
                code: `
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192 // 8kb
          }
        }
      }
    ]
  }
};`
            });
        }
    }

    private checkModuleResolution(content: string, suggestions: WebpackOptimization[]): void {
        if (!content.includes('resolve')) {
            suggestions.push({
                title: 'Optimize Module Resolution',
                description: 'Configure module resolution for faster builds',
                code: `
module.exports = {
  // ...
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    modules: ['node_modules'],
    symlinks: false,
    cacheWithContext: false
  }
};`
            });
        }
    }
}