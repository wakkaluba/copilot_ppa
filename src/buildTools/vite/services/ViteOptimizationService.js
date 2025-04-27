"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViteOptimizationService = void 0;
var ViteOptimizationService = /** @class */ (function () {
    function ViteOptimizationService(logger) {
        this.logger = logger;
    }
    /**
     * Generates optimization suggestions for a Vite configuration
     */
    ViteOptimizationService.prototype.generateSuggestions = function (content, build, plugins, optimizationOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions;
            return __generator(this, function (_a) {
                try {
                    suggestions = [];
                    // Check for build optimization suggestions
                    this.checkBuildOptimizations(build, suggestions);
                    // Check for plugin-related suggestions
                    this.checkPluginOptimizations(plugins, suggestions);
                    // Check for dependency optimization suggestions
                    this.checkDependencyOptimizations(optimizationOptions, suggestions);
                    // Check for performance optimizations
                    this.checkPerformanceOptimizations(content, suggestions);
                    return [2 /*return*/, suggestions.map(function (s) { return "".concat(s.title, ": ").concat(s.description, "\n\nExample:\n").concat(s.code); })];
                }
                catch (error) {
                    this.logger.error('Error generating optimization suggestions:', error);
                    throw new Error("Failed to generate optimization suggestions: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    ViteOptimizationService.prototype.checkBuildOptimizations = function (build, suggestions) {
        // Check for minification
        if (!build.minify) {
            suggestions.push({
                title: 'Enable Build Minification',
                description: 'Minify your build output to reduce bundle size. Consider using esbuild for faster builds.',
                code: "export default defineConfig({\n  build: {\n    minify: 'esbuild',\n    target: 'esnext'  // Optimize for modern browsers\n  }\n})"
            });
        }
        // Check for source maps in production
        if (build.sourcemap === true) {
            suggestions.push({
                title: 'Optimize Source Maps',
                description: 'Consider using "hidden" source maps in production for debugging while keeping bundle size small.',
                code: "export default defineConfig({\n  build: {\n    sourcemap: 'hidden'  // or false for production\n  }\n})"
            });
        }
        // Check for module preload polyfill
        if (!content.includes('modulePreload')) {
            suggestions.push({
                title: 'Add Module Preload Polyfill',
                description: 'Improve initial page load performance with module preloading.',
                code: "export default defineConfig({\n  build: {\n    modulePreload: {\n      polyfill: true,\n      resolveDependencies: (filename, deps) => deps\n    }\n  }\n})"
            });
        }
    };
    ViteOptimizationService.prototype.checkPluginOptimizations = function (plugins, suggestions) {
        // Check for compression plugin
        if (!plugins.some(function (p) { return p.name.toLowerCase().includes('compress'); })) {
            suggestions.push({
                title: 'Add Compression Plugin',
                description: 'Compress your assets for faster delivery.',
                code: "import compression from 'vite-plugin-compression';\n\nexport default defineConfig({\n  plugins: [\n    compression({\n      algorithm: 'brotli',\n      ext: '.br',\n      threshold: 10240  // Only compress files > 10KB\n    })\n  ]\n})"
            });
        }
        // Check for bundle analyzer
        if (!plugins.some(function (p) { return p.name.toLowerCase().includes('visualizer'); })) {
            suggestions.push({
                title: 'Add Bundle Analysis',
                description: 'Analyze your bundle composition to identify optimization opportunities.',
                code: "import { visualizer } from 'rollup-plugin-visualizer';\n\nexport default defineConfig({\n  plugins: [\n    visualizer({\n      filename: 'stats.html',\n      open: true,\n      gzipSize: true,\n      brotliSize: true\n    })\n  ]\n})"
            });
        }
        // Check for legacy support if needed
        if (!plugins.some(function (p) { return p.name === 'LegacyPlugin'; })) {
            suggestions.push({
                title: 'Add Legacy Browser Support',
                description: 'Generate legacy bundles for older browsers while maintaining modern code for newer browsers.',
                code: "import legacy from '@vitejs/plugin-legacy';\n\nexport default defineConfig({\n  plugins: [\n    legacy({\n      targets: ['defaults', 'not IE 11'],\n      additionalLegacyPolyfills: ['regenerator-runtime/runtime']\n    })\n  ]\n})"
            });
        }
    };
    ViteOptimizationService.prototype.checkDependencyOptimizations = function (options, suggestions) {
        // Check for dependency optimization configuration
        if (!options.deps) {
            suggestions.push({
                title: 'Configure Dependency Optimization',
                description: 'Optimize dependency pre-bundling for faster development and production builds.',
                code: "export default defineConfig({\n  optimizeDeps: {\n    include: ['vue', 'lodash-es'],  // Add your major dependencies\n    exclude: ['your-local-package'],  // Exclude packages that don't need optimization\n    esbuildOptions: {\n      target: 'esnext'  // Optimize for modern browsers\n    }\n  }\n})"
            });
        }
        // Check for dynamic imports optimization
        suggestions.push({
            title: 'Optimize Dynamic Imports',
            description: 'Configure dynamic import warnings and chunk naming for better code splitting.',
            code: "export default defineConfig({\n  build: {\n    dynamicImportVarsOptions: {\n      warnOnError: true,\n      exclude: []\n    },\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          'vendor': ['vue', 'lodash-es'],\n          'ui': ['./src/components/**/*.vue']\n        }\n      }\n    }\n  }\n})"
        });
    };
    ViteOptimizationService.prototype.checkPerformanceOptimizations = function (content, suggestions) {
        // Check for asset handling optimization
        if (!content.includes('assetsInlineLimit')) {
            suggestions.push({
                title: 'Optimize Asset Handling',
                description: 'Configure asset inlining and handling for optimal loading performance.',
                code: "export default defineConfig({\n  build: {\n    assetsInlineLimit: 4096,  // Inline assets < 4kb\n    assetsDir: 'assets',\n    rollupOptions: {\n      output: {\n        assetFileNames: 'assets/[name].[hash].[ext]'\n      }\n    }\n  }\n})"
            });
        }
        // Check for build target optimization
        if (!content.includes('target:')) {
            suggestions.push({
                title: 'Optimize Build Target',
                description: 'Set appropriate browser targets for better performance and smaller bundle size.',
                code: "export default defineConfig({\n  build: {\n    target: ['esnext'],  // or ['es2020'] for broader compatibility\n    polyfillDynamicImport: false  // Remove if you need older browser support\n  }\n})"
            });
        }
        // Check for CSS optimization
        if (!content.includes('cssCodeSplit')) {
            suggestions.push({
                title: 'Optimize CSS Handling',
                description: 'Configure CSS code splitting and modules for optimal loading.',
                code: "export default defineConfig({\n  build: {\n    cssCodeSplit: true,\n    cssTarget: 'esnext',\n    cssMinify: true,\n  },\n  css: {\n    modules: {\n      localsConvention: 'camelCase',\n      scopeBehaviour: 'local'\n    },\n    devSourcemap: true\n  }\n})"
            });
        }
        // Check for worker thread optimization
        if (content.includes('worker')) {
            suggestions.push({
                title: 'Optimize Web Workers',
                description: 'Configure worker bundling and loading for better performance.',
                code: "export default defineConfig({\n  worker: {\n    format: 'es',\n    plugins: [],\n    rollupOptions: {\n      output: {\n        format: 'es',\n        sourcemap: true\n      }\n    }\n  }\n})"
            });
        }
    };
    return ViteOptimizationService;
}());
exports.ViteOptimizationService = ViteOptimizationService;
