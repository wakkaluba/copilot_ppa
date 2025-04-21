import { ILogger } from '../../../services/logging/ILogger';
import { ViteBuildConfig, VitePlugin, ViteOptimizationOptions, ViteOptimization } from '../types';

export class ViteOptimizationService {
    constructor(private readonly logger: ILogger) {}

    /**
     * Generates optimization suggestions for a Vite configuration
     */
    public async generateSuggestions(
        content: string,
        build: ViteBuildConfig,
        plugins: VitePlugin[],
        optimizationOptions: ViteOptimizationOptions
    ): Promise<string[]> {
        try {
            const suggestions: ViteOptimization[] = [];

            // Check for build optimization suggestions
            this.checkBuildOptimizations(build, suggestions);

            // Check for plugin-related suggestions
            this.checkPluginOptimizations(plugins, suggestions);

            // Check for dependency optimization suggestions
            this.checkDependencyOptimizations(optimizationOptions, suggestions);

            // Check for performance optimizations
            this.checkPerformanceOptimizations(content, suggestions);

            return suggestions.map(s => `${s.title}: ${s.description}\n\nExample:\n${s.code}`);
        } catch (error) {
            this.logger.error('Error generating optimization suggestions:', error);
            throw new Error(`Failed to generate optimization suggestions: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private checkBuildOptimizations(build: ViteBuildConfig, suggestions: ViteOptimization[]): void {
        // Check for minification
        if (!build.minify) {
            suggestions.push({
                title: 'Enable Build Minification',
                description: 'Minify your build output to reduce bundle size. Consider using esbuild for faster builds.',
                code: `export default defineConfig({
  build: {
    minify: 'esbuild',
    target: 'esnext'  // Optimize for modern browsers
  }
})`
            });
        }

        // Check for source maps in production
        if (build.sourcemap === true) {
            suggestions.push({
                title: 'Optimize Source Maps',
                description: 'Consider using "hidden" source maps in production for debugging while keeping bundle size small.',
                code: `export default defineConfig({
  build: {
    sourcemap: 'hidden'  // or false for production
  }
})`
            });
        }

        // Check for module preload polyfill
        if (!content.includes('modulePreload')) {
            suggestions.push({
                title: 'Add Module Preload Polyfill',
                description: 'Improve initial page load performance with module preloading.',
                code: `export default defineConfig({
  build: {
    modulePreload: {
      polyfill: true,
      resolveDependencies: (filename, deps) => deps
    }
  }
})`
            });
        }
    }

    private checkPluginOptimizations(plugins: VitePlugin[], suggestions: ViteOptimization[]): void {
        // Check for compression plugin
        if (!plugins.some(p => p.name.toLowerCase().includes('compress'))) {
            suggestions.push({
                title: 'Add Compression Plugin',
                description: 'Compress your assets for faster delivery.',
                code: `import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'brotli',
      ext: '.br',
      threshold: 10240  // Only compress files > 10KB
    })
  ]
})`
            });
        }

        // Check for bundle analyzer
        if (!plugins.some(p => p.name.toLowerCase().includes('visualizer'))) {
            suggestions.push({
                title: 'Add Bundle Analysis',
                description: 'Analyze your bundle composition to identify optimization opportunities.',
                code: `import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})`
            });
        }

        // Check for legacy support if needed
        if (!plugins.some(p => p.name === 'LegacyPlugin')) {
            suggestions.push({
                title: 'Add Legacy Browser Support',
                description: 'Generate legacy bundles for older browsers while maintaining modern code for newer browsers.',
                code: `import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ]
})`
            });
        }
    }

    private checkDependencyOptimizations(options: ViteOptimizationOptions, suggestions: ViteOptimization[]): void {
        // Check for dependency optimization configuration
        if (!options.deps) {
            suggestions.push({
                title: 'Configure Dependency Optimization',
                description: 'Optimize dependency pre-bundling for faster development and production builds.',
                code: `export default defineConfig({
  optimizeDeps: {
    include: ['vue', 'lodash-es'],  // Add your major dependencies
    exclude: ['your-local-package'],  // Exclude packages that don't need optimization
    esbuildOptions: {
      target: 'esnext'  // Optimize for modern browsers
    }
  }
})`
            });
        }

        // Check for dynamic imports optimization
        suggestions.push({
            title: 'Optimize Dynamic Imports',
            description: 'Configure dynamic import warnings and chunk naming for better code splitting.',
            code: `export default defineConfig({
  build: {
    dynamicImportVarsOptions: {
      warnOnError: true,
      exclude: []
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'lodash-es'],
          'ui': ['./src/components/**/*.vue']
        }
      }
    }
  }
})`
        });
    }

    private checkPerformanceOptimizations(content: string, suggestions: ViteOptimization[]): void {
        // Check for asset handling optimization
        if (!content.includes('assetsInlineLimit')) {
            suggestions.push({
                title: 'Optimize Asset Handling',
                description: 'Configure asset inlining and handling for optimal loading performance.',
                code: `export default defineConfig({
  build: {
    assetsInlineLimit: 4096,  // Inline assets < 4kb
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]'
      }
    }
  }
})`
            });
        }

        // Check for build target optimization
        if (!content.includes('target:')) {
            suggestions.push({
                title: 'Optimize Build Target',
                description: 'Set appropriate browser targets for better performance and smaller bundle size.',
                code: `export default defineConfig({
  build: {
    target: ['esnext'],  // or ['es2020'] for broader compatibility
    polyfillDynamicImport: false  // Remove if you need older browser support
  }
})`
            });
        }

        // Check for CSS optimization
        if (!content.includes('cssCodeSplit')) {
            suggestions.push({
                title: 'Optimize CSS Handling',
                description: 'Configure CSS code splitting and modules for optimal loading.',
                code: `export default defineConfig({
  build: {
    cssCodeSplit: true,
    cssTarget: 'esnext',
    cssMinify: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local'
    },
    devSourcemap: true
  }
})`
            });
        }

        // Check for worker thread optimization
        if (content.includes('worker')) {
            suggestions.push({
                title: 'Optimize Web Workers',
                description: 'Configure worker bundling and loading for better performance.',
                code: `export default defineConfig({
  worker: {
    format: 'es',
    plugins: [],
    rollupOptions: {
      output: {
        format: 'es',
        sourcemap: true
      }
    }
  }
})`
            });
        }
    }
}