"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RollupOptimizationService = void 0;
/**
 * Default logger implementation that does nothing
 */
class NoOpLogger {
    debug() { }
    info() { }
    warn() { }
    error() { }
}
class RollupOptimizationService {
    constructor(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Generates optimization suggestions for a rollup configuration
     */
    async generateSuggestions(content, input, output, plugins) {
        try {
            const suggestions = [];
            // Check for code splitting
            if (!content.includes('experimentalCodeSplitting') && !content.includes('output.dir')) {
                suggestions.push({
                    title: 'Enable Code Splitting',
                    description: 'Use code splitting to improve initial load time by breaking the bundle into smaller chunks',
                    code: `export default {
    input: ['src/index.js', 'src/admin.js'],
    output: {
        dir: 'dist',
        format: 'es',
        chunkFileNames: '[name]-[hash].js'
    }
}`
                });
            }
            // Check for minification
            if (!plugins.some(p => p.name === 'TerserPlugin')) {
                suggestions.push({
                    title: 'Add JavaScript Minification',
                    description: 'Minify JavaScript to reduce bundle size',
                    code: `import { terser } from 'rollup-plugin-terser';

export default {
    // ...existing config...
    plugins: [
        // ...other plugins...
        terser({
            compress: {
                drop_console: true,
                drop_debugger: true
            },
            format: {
                comments: false
            }
        })
    ]
}`
                });
            }
            // Check for environment variables
            if (!plugins.some(p => p.name === 'ReplacePlugin')) {
                suggestions.push({
                    title: 'Add Environment Variable Support',
                    description: 'Replace environment variables at build time for better optimization',
                    code: `import replace from '@rollup/plugin-replace';

export default {
    // ...existing config...
    plugins: [
        // ...other plugins...
        replace({
            preventAssignment: true,
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.API_URL': JSON.stringify(process.env.API_URL)
        })
    ]
}`
                });
            }
            // Check for bundle analysis
            if (!plugins.some(p => p.name === 'VisualizePlugin')) {
                suggestions.push({
                    title: 'Add Bundle Analysis',
                    description: 'Visualize bundle composition to identify optimization opportunities',
                    code: `import { visualizer } from 'rollup-plugin-visualizer';

export default {
    // ...existing config...
    plugins: [
        // ...other plugins...
        visualizer({
            filename: 'stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true
        })
    ]
}`
                });
            }
            // Check for module resolution optimization
            if (!plugins.some(p => p.name === 'NodeResolvePlugin')) {
                suggestions.push({
                    title: 'Optimize Module Resolution',
                    description: 'Add Node resolution support for better dependency handling',
                    code: `import resolve from '@rollup/plugin-node-resolve';

export default {
    // ...existing config...
    plugins: [
        // ...other plugins...
        resolve({
            preferBuiltins: true,
            browser: true
        })
    ]
}`
                });
            }
            // Check for CommonJS dependencies
            if (!plugins.some(p => p.name === 'CommonjsPlugin')) {
                suggestions.push({
                    title: 'Add CommonJS Support',
                    description: 'Convert CommonJS modules to ES6 for better tree-shaking',
                    code: `import commonjs from '@rollup/plugin-commonjs';

export default {
    // ...existing config...
    plugins: [
        // ...other plugins...
        commonjs({
            include: 'node_modules/**',
            extensions: ['.js', '.cjs']
        })
    ]
}`
                });
            }
            // Check for source maps
            if (!output.some(o => o.sourcemap)) {
                suggestions.push({
                    title: 'Enable Source Maps',
                    description: 'Add source maps for better debugging experience',
                    code: `export default {
    // ...existing config...
    output: {
        // ...other output options...
        sourcemap: true
    }
}`
                });
            }
            // Check for dynamic imports optimization
            if (content.includes('import(') && !content.includes('manualChunks')) {
                suggestions.push({
                    title: 'Optimize Dynamic Imports',
                    description: 'Configure manual chunks for better code splitting of dynamic imports',
                    code: `export default {
    // ...existing config...
    output: {
        // ...other output options...
        manualChunks: {
            vendor: ['react', 'react-dom', 'lodash'],
            // Add more chunks as needed
        }
    }
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
exports.RollupOptimizationService = RollupOptimizationService;
//# sourceMappingURL=RollupOptimizationService.js.map