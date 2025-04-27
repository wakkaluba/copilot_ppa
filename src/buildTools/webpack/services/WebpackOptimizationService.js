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
exports.WebpackOptimizationService = void 0;
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
var WebpackOptimizationService = /** @class */ (function () {
    function WebpackOptimizationService(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Generates optimization suggestions for a webpack configuration
     */
    WebpackOptimizationService.prototype.generateSuggestions = function (content, entryPoints, loaders, plugins) {
        return __awaiter(this, void 0, void 0, function () {
            var suggestions;
            return __generator(this, function (_a) {
                try {
                    suggestions = [];
                    // Check for code splitting
                    if (!content.includes('splitChunks')) {
                        suggestions.push({
                            title: 'Enable Code Splitting',
                            description: 'Split your code into smaller chunks to improve initial load time',
                            code: "optimization: {\n    splitChunks: {\n        chunks: 'all',\n        minSize: 20000,\n        minRemainingSize: 0,\n        minChunks: 1,\n        maxAsyncRequests: 30,\n        maxInitialRequests: 30,\n        enforceSizeThreshold: 50000,\n        cacheGroups: {\n            defaultVendors: {\n                test: /[\\\\/]node_modules[\\\\/]/,\n                priority: -10,\n                reuseExistingChunk: true,\n            },\n            default: {\n                minChunks: 2,\n                priority: -20,\n                reuseExistingChunk: true,\n            },\n        },\n    },\n}"
                        });
                    }
                    // Check for minification
                    if (!plugins.some(function (p) { return p.name === 'TerserPlugin'; })) {
                        suggestions.push({
                            title: 'Add JavaScript Minification',
                            description: 'Minify JavaScript to reduce bundle size',
                            code: "const TerserPlugin = require('terser-webpack-plugin');\n\noptimization: {\n    minimize: true,\n    minimizer: [new TerserPlugin({\n        terserOptions: {\n            parse: {\n                ecma: 8,\n            },\n            compress: {\n                ecma: 5,\n                warnings: false,\n                comparisons: false,\n                inline: 2,\n            },\n            mangle: {\n                safari10: true,\n            },\n            output: {\n                ecma: 5,\n                comments: false,\n                ascii_only: true,\n            },\n        },\n    })],\n}"
                        });
                    }
                    // Check for CSS optimization
                    if (loaders.some(function (l) { return l.name.includes('css'); }) &&
                        !plugins.some(function (p) { return p.name === 'OptimizeCSSAssetsPlugin' || p.name === 'CssMinimizerPlugin'; })) {
                        suggestions.push({
                            title: 'Add CSS Optimization',
                            description: 'Optimize and minify CSS to reduce bundle size',
                            code: "const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');\n\noptimization: {\n    minimizer: [\n        // For webpack@5 you can use the '...' syntax to extend existing minimizers\n        '...',\n        new CssMinimizerPlugin(),\n    ],\n}"
                        });
                    }
                    // Check for caching
                    if (!content.includes('cache')) {
                        suggestions.push({
                            title: 'Enable Build Caching',
                            description: 'Cache the built modules to speed up rebuild process',
                            code: "cache: {\n    type: 'filesystem',\n    buildDependencies: {\n        config: [__filename],\n    },\n}"
                        });
                    }
                    // Check for compression
                    if (!plugins.some(function (p) { return p.name === 'CompressionPlugin'; })) {
                        suggestions.push({
                            title: 'Add Asset Compression',
                            description: 'Compress assets to reduce download size',
                            code: "const CompressionPlugin = require('compression-webpack-plugin');\n\nplugins: [\n    new CompressionPlugin({\n        algorithm: 'gzip',\n        test: /\\.js$|\\.css$|\\.html$/,\n        threshold: 10240,\n        minRatio: 0.8,\n    }),\n]"
                        });
                    }
                    // Check for bundle analysis
                    if (!plugins.some(function (p) { return p.name === 'BundleAnalyzerPlugin'; })) {
                        suggestions.push({
                            title: 'Add Bundle Analysis',
                            description: 'Visualize bundle size to identify optimization opportunities',
                            code: "const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;\n\nplugins: [\n    new BundleAnalyzerPlugin({\n        analyzerMode: 'static',\n        openAnalyzer: false,\n    }),\n]"
                        });
                    }
                    // Check for module concatenation
                    if (!content.includes('concatenateModules')) {
                        suggestions.push({
                            title: 'Enable Module Concatenation',
                            description: 'Combine modules into larger chunks to reduce overhead',
                            code: "optimization: {\n    concatenateModules: true,\n}"
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
    return WebpackOptimizationService;
}());
exports.WebpackOptimizationService = WebpackOptimizationService;
