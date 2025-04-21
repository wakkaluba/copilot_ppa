import { RollupInput, RollupOptimization, IRollupOptimizationService } from '../types';
import { ILogger } from '../../../services/logging/ILogger';

export class RollupOptimizationService implements IRollupOptimizationService {
    constructor(private readonly logger: ILogger) {}

    /**
     * Generates optimization suggestions for a Rollup configuration
     */
    public generateOptimizations(
        content: string,
        inputs: RollupInput[],
        outputFormats: string[],
        pluginNames: string[]
    ): RollupOptimization[] {
        const suggestions: RollupOptimization[] = [];

        try {
            this.suggestBasicOptimizations(content, suggestions);
            this.suggestFormatSpecificOptimizations(outputFormats, suggestions);
            this.suggestInputSpecificOptimizations(inputs, suggestions);
            this.suggestPluginOptimizations(pluginNames, content, suggestions);
            this.suggestPerformanceOptimizations(content, suggestions);

            this.logger.debug('Generated optimization suggestions:', suggestions);
            return suggestions;
        } catch (error) {
            this.logger.error('Error generating optimization suggestions:', error);
            return [];
        }
    }

    private suggestBasicOptimizations(content: string, suggestions: RollupOptimization[]): void {
        // Minification suggestion
        if (!this.hasPlugin(content, ['terser', 'uglify'])) {
            suggestions.push({
                title: 'Add Minification',
                description: 'Use rollup-plugin-terser to minify the bundle and reduce its size',
                code: `
import { terser } from 'rollup-plugin-terser';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    terser()
  ]
};`
            });
        }

        // Source map suggestion
        if (!content.includes('sourcemap') && !content.includes('sourceMap')) {
            suggestions.push({
                title: 'Enable Source Maps',
                description: 'Add source maps for better debugging experience',
                code: `
export default {
  // ...existing config
  output: {
    // ...existing output config
    sourcemap: true
  }
};`
            });
        }

        // Bundle size reporting suggestion
        if (!this.hasPlugin(content, ['filesize'])) {
            suggestions.push({
                title: 'Add Bundle Size Reporting',
                description: 'Use rollup-plugin-filesize to monitor bundle size',
                code: `
import filesize from 'rollup-plugin-filesize';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    filesize()
  ]
};`
            });
        }
    }

    private suggestFormatSpecificOptimizations(formats: string[], suggestions: RollupOptimization[]): void {
        // UMD/IIFE format suggestions
        if (formats.some(f => ['umd', 'iife'].includes(f)) && !formats.includes('es')) {
            suggestions.push({
                title: 'Add ES Module Build',
                description: 'Add an ES module build for modern browsers and bundlers',
                code: `
export default {
  // ...existing config
  output: [
    // ...existing outputs
    {
      file: 'dist/bundle.esm.js',
      format: 'es',
      sourcemap: true
    }
  ]
};`
            });
        }

        // ES module suggestions
        if (formats.includes('es') && !this.hasExport(formats, 'module')) {
            suggestions.push({
                title: 'Add package.json Module Field',
                description: 'Add "module" field to package.json for better tree-shaking support',
                code: `
// In package.json:
{
  "main": "dist/bundle.cjs.js",
  "module": "dist/bundle.esm.js"
}`
            });
        }
    }

    private suggestInputSpecificOptimizations(inputs: RollupInput[], suggestions: RollupOptimization[]): void {
        // Multiple entry points suggestion
        if (inputs.length > 1 && !this.hasPlugin(inputs.map(i => i.path).join(), ['dynamic-import-vars'])) {
            suggestions.push({
                title: 'Optimize Multiple Entry Points',
                description: 'Use @rollup/plugin-dynamic-import-vars for better code splitting',
                code: `
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    dynamicImportVars()
  ]
};`
            });
        }

        // TypeScript input suggestion
        if (inputs.some(i => i.path.endsWith('.ts')) && !this.hasPlugin(inputs.map(i => i.path).join(), ['typescript'])) {
            suggestions.push({
                title: 'Add TypeScript Support',
                description: 'Use @rollup/plugin-typescript for TypeScript compilation',
                code: `
import typescript from '@rollup/plugin-typescript';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    typescript()
  ]
};`
            });
        }
    }

    private suggestPluginOptimizations(pluginNames: string[], content: string, suggestions: RollupOptimization[]): void {
        // Node resolution suggestion
        if (!pluginNames.includes('resolve') && content.includes('import')) {
            suggestions.push({
                title: 'Add Node Resolution',
                description: 'Use @rollup/plugin-node-resolve to handle node_modules imports',
                code: `
import resolve from '@rollup/plugin-node-resolve';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    resolve()
  ]
};`
            });
        }

        // CommonJS support suggestion
        if (!pluginNames.includes('commonjs') && (content.includes('require(') || content.includes('module.exports'))) {
            suggestions.push({
                title: 'Add CommonJS Support',
                description: 'Use @rollup/plugin-commonjs to handle CommonJS modules',
                code: `
import commonjs from '@rollup/plugin-commonjs';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    commonjs()
  ]
};`
            });
        }

        // Bundle visualization suggestion
        if (!pluginNames.includes('visualizer')) {
            suggestions.push({
                title: 'Add Bundle Visualization',
                description: 'Use rollup-plugin-visualizer to analyze bundle content',
                code: `
import visualizer from 'rollup-plugin-visualizer';

export default {
  // ...existing config
  plugins: [
    // ...existing plugins
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
};`
            });
        }
    }

    private suggestPerformanceOptimizations(content: string, suggestions: RollupOptimization[]): void {
        // Tree shaking suggestion
        if (!content.includes('treeshake') || content.includes('treeshake: false')) {
            suggestions.push({
                title: 'Enable Tree Shaking',
                description: 'Enable advanced tree shaking options for better dead code elimination',
                code: `
export default {
  // ...existing config
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  }
};`
            });
        }

        // Fast builds suggestion
        if (!content.includes('cache') && !content.includes('experimentalCacheExpiry')) {
            suggestions.push({
                title: 'Enable Build Caching',
                description: 'Enable cache for faster incremental builds',
                code: `
export default {
  // ...existing config
  cache: true,
  experimentalCacheExpiry: 5
};`
            });
        }
    }

    private hasPlugin(content: string, pluginNames: string[]): boolean {
        return pluginNames.some(name => 
            content.includes(`'${name}'`) || 
            content.includes(`"${name}"`) || 
            content.includes(`from '${name}'`) || 
            content.includes(`from "${name}"`)
        );
    }

    private hasExport(formats: string[], type: string): boolean {
        return formats.includes(type);
    }
}