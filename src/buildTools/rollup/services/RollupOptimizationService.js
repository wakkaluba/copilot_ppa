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
exports.RollupOptimizationService = void 0;
/**
 * Default logger implementation that does nothing
 */
var NoOpLogger = /** @class */ (function () {
    function NoOpLogger() {
    }
    NoOpLogger.prototype.debug = function () { };
    NoOpLogger.prototype.info = function () { };
    NoOpLogger.prototype.warn = function () { };
    NoOpLogger.prototype.error = function () { };
    return NoOpLogger;
}());
var RollupOptimizationService = /** @class */ (function () {
    function RollupOptimizationService(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Generates optimization suggestions for a rollup configuration
     */
    RollupOptimizationService.prototype.generateSuggestions = function (content, input, output, plugins) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions;
            return __generator(this, function (_a) {
                try {
                    suggestions = [];
                    // Check for code splitting
                    if (!content.includes('experimentalCodeSplitting') && !content.includes('output.dir')) {
                        suggestions.push({
                            title: 'Enable Code Splitting',
                            description: 'Use code splitting to improve initial load time by breaking the bundle into smaller chunks',
                            code: "export default {\n    input: ['src/index.js', 'src/admin.js'],\n    output: {\n        dir: 'dist',\n        format: 'es',\n        chunkFileNames: '[name]-[hash].js'\n    }\n}"
                        });
                    }
                    // Check for minification
                    if (!plugins.some(function (p) { return p.name === 'TerserPlugin'; })) {
                        suggestions.push({
                            title: 'Add JavaScript Minification',
                            description: 'Minify JavaScript to reduce bundle size',
                            code: "import { terser } from 'rollup-plugin-terser';\n\nexport default {\n    // ...existing config...\n    plugins: [\n        // ...other plugins...\n        terser({\n            compress: {\n                drop_console: true,\n                drop_debugger: true\n            },\n            format: {\n                comments: false\n            }\n        })\n    ]\n}"
                        });
                    }
                    // Check for environment variables
                    if (!plugins.some(function (p) { return p.name === 'ReplacePlugin'; })) {
                        suggestions.push({
                            title: 'Add Environment Variable Support',
                            description: 'Replace environment variables at build time for better optimization',
                            code: "import replace from '@rollup/plugin-replace';\n\nexport default {\n    // ...existing config...\n    plugins: [\n        // ...other plugins...\n        replace({\n            preventAssignment: true,\n            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),\n            'process.env.API_URL': JSON.stringify(process.env.API_URL)\n        })\n    ]\n}"
                        });
                    }
                    // Check for bundle analysis
                    if (!plugins.some(function (p) { return p.name === 'VisualizePlugin'; })) {
                        suggestions.push({
                            title: 'Add Bundle Analysis',
                            description: 'Visualize bundle composition to identify optimization opportunities',
                            code: "import { visualizer } from 'rollup-plugin-visualizer';\n\nexport default {\n    // ...existing config...\n    plugins: [\n        // ...other plugins...\n        visualizer({\n            filename: 'stats.html',\n            open: true,\n            gzipSize: true,\n            brotliSize: true\n        })\n    ]\n}"
                        });
                    }
                    // Check for module resolution optimization
                    if (!plugins.some(function (p) { return p.name === 'NodeResolvePlugin'; })) {
                        suggestions.push({
                            title: 'Optimize Module Resolution',
                            description: 'Add Node resolution support for better dependency handling',
                            code: "import resolve from '@rollup/plugin-node-resolve';\n\nexport default {\n    // ...existing config...\n    plugins: [\n        // ...other plugins...\n        resolve({\n            preferBuiltins: true,\n            browser: true\n        })\n    ]\n}"
                        });
                    }
                    // Check for CommonJS dependencies
                    if (!plugins.some(function (p) { return p.name === 'CommonjsPlugin'; })) {
                        suggestions.push({
                            title: 'Add CommonJS Support',
                            description: 'Convert CommonJS modules to ES6 for better tree-shaking',
                            code: "import commonjs from '@rollup/plugin-commonjs';\n\nexport default {\n    // ...existing config...\n    plugins: [\n        // ...other plugins...\n        commonjs({\n            include: 'node_modules/**',\n            extensions: ['.js', '.cjs']\n        })\n    ]\n}"
                        });
                    }
                    // Check for source maps
                    if (!output.some(function (o) { return o.sourcemap; })) {
                        suggestions.push({
                            title: 'Enable Source Maps',
                            description: 'Add source maps for better debugging experience',
                            code: "export default {\n    // ...existing config...\n    output: {\n        // ...other output options...\n        sourcemap: true\n    }\n}"
                        });
                    }
                    // Check for dynamic imports optimization
                    if (content.includes('import(') && !content.includes('manualChunks')) {
                        suggestions.push({
                            title: 'Optimize Dynamic Imports',
                            description: 'Configure manual chunks for better code splitting of dynamic imports',
                            code: "export default {\n    // ...existing config...\n    output: {\n        // ...other output options...\n        manualChunks: {\n            vendor: ['react', 'react-dom', 'lodash'],\n            // Add more chunks as needed\n        }\n    }\n}"
                        });
                    }
                    return [2 /*return*/, suggestions];
                }
                catch (error) {
                    this.logger.error('Error generating optimization suggestions:', error);
                    throw new Error("Failed to generate optimization suggestions: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    return RollupOptimizationService;
}());
exports.RollupOptimizationService = RollupOptimizationService;
