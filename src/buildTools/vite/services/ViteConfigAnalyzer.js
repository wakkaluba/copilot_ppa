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
exports.ViteConfigAnalyzer = void 0;
var fs = require("fs");
var ConfigValidationError_1 = require("../errors/ConfigValidationError");
var ViteConfigAnalyzer = /** @class */ (function () {
    function ViteConfigAnalyzer(logger) {
        this.logger = logger;
    }
    /**
     * Analyzes a Vite configuration file
     * @param configPath Path to the Vite config file
     */
    ViteConfigAnalyzer.prototype.analyze = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, build, plugins, optimizationOptions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("Analyzing Vite config at ".concat(configPath));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.promises.readFile(configPath, 'utf-8')];
                    case 2:
                        content = _a.sent();
                        build = this.extractBuildConfig(content);
                        plugins = this.extractPlugins(content);
                        optimizationOptions = this.extractOptimizationOptions(content);
                        return [2 /*return*/, {
                                build: build,
                                plugins: plugins,
                                optimizationOptions: optimizationOptions,
                                content: content,
                                optimizationSuggestions: [] // Will be filled by OptimizationService
                            }];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error analyzing Vite config:', error_1);
                        throw new Error("Failed to analyze Vite configuration: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ViteConfigAnalyzer.prototype.analyzeConfig = function (config) {
        var result = {
            isValid: true,
            warnings: [],
            errors: [],
            suggestions: [],
            performance: {
                score: 100,
                issues: []
            }
        };
        try {
            this.validateBuildConfig(config, result);
            this.validateOptimizeDeps(config, result);
            this.validateServer(config, result);
            this.analyzePerformance(config, result);
            // Update validity based on errors
            result.isValid = result.errors.length === 0;
        }
        catch (error) {
            this.logger.error("Error analyzing Vite configuration: ".concat(error));
            result.isValid = false;
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('Failed to analyze configuration', 'ANALYSIS_ERROR', { error: error.message }));
        }
        return result;
    };
    ViteConfigAnalyzer.prototype.validateBuildConfig = function (config, result) {
        if (!config.build) {
            return;
        }
        if (config.build.target) {
            var validTargets = ['es2015', 'es2016', 'es2017', 'es2018', 'es2019', 'es2020'];
            for (var _i = 0, _a = config.build.target; _i < _a.length; _i++) {
                var target = _a[_i];
                if (!validTargets.includes(target)) {
                    result.warnings.push("Invalid build target: ".concat(target));
                }
            }
        }
        if (config.build.minify && typeof config.build.minify !== 'boolean' &&
            !['terser', 'esbuild'].includes(config.build.minify)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('Invalid minify option', 'INVALID_MINIFY', { value: config.build.minify, expected: ['boolean', 'terser', 'esbuild'] }));
        }
    };
    ViteConfigAnalyzer.prototype.validateOptimizeDeps = function (config, result) {
        if (!config.optimizeDeps) {
            return;
        }
        if (config.optimizeDeps.include && !Array.isArray(config.optimizeDeps.include)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('optimizeDeps.include must be an array', 'INVALID_DEPS_INCLUDE', { value: typeof config.optimizeDeps.include, expected: 'array' }));
        }
        if (config.optimizeDeps.exclude && !Array.isArray(config.optimizeDeps.exclude)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('optimizeDeps.exclude must be an array', 'INVALID_DEPS_EXCLUDE', { value: typeof config.optimizeDeps.exclude, expected: 'array' }));
        }
    };
    ViteConfigAnalyzer.prototype.validateServer = function (config, result) {
        if (!config.server) {
            return;
        }
        if (config.server.port && !Number.isInteger(config.server.port)) {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('server.port must be an integer', 'INVALID_PORT', { value: config.server.port, expected: 'integer' }));
        }
        if (config.server.https && typeof config.server.https !== 'boolean') {
            result.errors.push(new ConfigValidationError_1.ConfigValidationError('server.https must be a boolean', 'INVALID_HTTPS', { value: typeof config.server.https, expected: 'boolean' }));
        }
    };
    ViteConfigAnalyzer.prototype.analyzePerformance = function (config, result) {
        var _a, _b, _c;
        var score = 100;
        // Check for source maps in production
        if (((_a = config.build) === null || _a === void 0 ? void 0 : _a.sourcemap) === true) {
            score -= 10;
            result.performance.issues.push('Source maps are enabled in production build, which increases bundle size');
            result.suggestions.push('Consider disabling source maps in production for better performance');
        }
        // Check for optimization settings
        if (!((_b = config.optimizeDeps) === null || _b === void 0 ? void 0 : _b.include) || config.optimizeDeps.include.length === 0) {
            score -= 5;
            result.performance.issues.push('No dependencies specified for pre-bundling optimization');
            result.suggestions.push('Consider specifying frequently used dependencies in optimizeDeps.include');
        }
        // Check minification settings
        if (((_c = config.build) === null || _c === void 0 ? void 0 : _c.minify) === false) {
            score -= 15;
            result.performance.issues.push('Minification is disabled');
            result.suggestions.push('Enable minification for better production performance');
        }
        result.performance.score = Math.max(0, score);
    };
    ViteConfigAnalyzer.prototype.extractBuildConfig = function (content) {
        var buildConfig = {};
        var buildMatch = content.match(/build\s*:?\s*({[^}]*})/s);
        if (buildMatch === null || buildMatch === void 0 ? void 0 : buildMatch[1]) {
            var buildContent = buildMatch[1];
            // Extract outDir
            var outDirMatch = buildContent.match(/outDir\s*:\s*['"]([^'"]+)['"]/);
            if (outDirMatch === null || outDirMatch === void 0 ? void 0 : outDirMatch[1]) {
                buildConfig.outDir = outDirMatch[1];
            }
            // Extract target
            var targetMatch = buildContent.match(/target\s*:\s*(?:['"]([^'"]+)['"]|\[([^\]]+)\])/);
            if (targetMatch) {
                buildConfig.target = targetMatch[2] ?
                    targetMatch[2].split(',').map(function (t) { return t.trim().replace(/['"]/g, ''); }) :
                    targetMatch[1];
            }
            // Extract minify
            var minifyMatch = buildContent.match(/minify\s*:\s*(true|false|['"]terser['"]|['"]esbuild['"])/);
            if (minifyMatch) {
                buildConfig.minify = minifyMatch[1] === 'true' ? true :
                    minifyMatch[1] === 'false' ? false :
                        minifyMatch[1].replace(/['"]/g, '');
            }
            // Extract sourcemap
            var sourcemapMatch = buildContent.match(/sourcemap\s*:\s*(true|false|['"]inline['"]|['"]hidden['"])/);
            if (sourcemapMatch) {
                buildConfig.sourcemap = sourcemapMatch[1] === 'true' ? true :
                    sourcemap[1] === 'false' ? false :
                        sourcemapMatch[1].replace(/['"]/g, '');
            }
            // Extract cssCodeSplit
            var cssCodeSplitMatch = buildContent.match(/cssCodeSplit\s*:\s*(true|false)/);
            if (cssCodeSplitMatch) {
                buildConfig.cssCodeSplit = cssCodeSplitMatch[1] === 'true';
            }
            // Extract cssModules
            var cssModulesMatch = buildContent.match(/cssModules\s*:\s*(true|false)/);
            if (cssModulesMatch) {
                buildConfig.cssModules = cssModulesMatch[1] === 'true';
            }
            // Extract assetsInlineLimit
            var assetsInlineLimitMatch = buildContent.match(/assetsInlineLimit\s*:\s*(\d+)/);
            if (assetsInlineLimitMatch) {
                buildConfig.assetsInlineLimit = parseInt(assetsInlineLimitMatch[1], 10);
            }
            // Extract rollupOptions if present
            var rollupOptionsMatch = buildContent.match(/rollupOptions\s*:\s*({[^}]*})/s);
            if (rollupOptionsMatch) {
                try {
                    buildConfig.rollupOptions = this.parseRollupOptions(rollupOptionsMatch[1]);
                }
                catch (error) {
                    this.logger.warn('Error parsing rollup options:', error);
                }
            }
        }
        return buildConfig;
    };
    ViteConfigAnalyzer.prototype.parseRollupOptions = function (optionsContent) {
        var options = {};
        // Extract external
        var externalMatch = optionsContent.match(/external\s*:\s*\[(.*?)\]/s);
        if (externalMatch) {
            options.external = externalMatch[1]
                .split(',')
                .map(function (item) { return item.trim().replace(/['"]/g, ''); })
                .filter(Boolean);
        }
        // Extract output options
        var outputMatch = optionsContent.match(/output\s*:\s*({[^}]*})/s);
        if (outputMatch) {
            var output = {};
            var outputContent = outputMatch[1];
            // Extract format
            var formatMatch = outputContent.match(/format\s*:\s*['"]([^'"]+)['"]/);
            if (formatMatch) {
                output.format = formatMatch[1];
            }
            // Extract entry names pattern
            var entryFileNamesMatch = outputContent.match(/entryFileNames\s*:\s*['"]([^'"]+)['"]/);
            if (entryFileNamesMatch) {
                output.entryFileNames = entryFileNamesMatch[1];
            }
            options.output = output;
        }
        return options;
    };
    ViteConfigAnalyzer.prototype.extractPlugins = function (content) {
        var _this = this;
        var plugins = [];
        var pluginsMatch = content.match(/plugins\s*:?\s*\[(.*?)\]/s);
        if (pluginsMatch === null || pluginsMatch === void 0 ? void 0 : pluginsMatch[1]) {
            var pluginsContent = pluginsMatch[1];
            var pluginMatches = Array.from(pluginsContent.matchAll(/(?:import|require)\(['"]([^'"]+)['"]\)/g));
            pluginMatches.forEach(function (match) {
                if (match[1]) {
                    var name_1 = _this.getPluginNameFromImport(match[1]);
                    plugins.push({
                        name: name_1,
                        description: _this.getPluginDescription(name_1)
                    });
                }
            });
        }
        return plugins;
    };
    ViteConfigAnalyzer.prototype.getPluginNameFromImport = function (importPath) {
        // Remove @vitejs/ prefix if present
        var name = importPath.replace(/^@vitejs\//, '');
        // Convert kebab-case to camelCase and add 'Plugin' suffix if not present
        return name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })
            .replace(/^[a-z]/, function (c) { return c.toUpperCase(); }) +
            (!name.toLowerCase().endsWith('plugin') ? 'Plugin' : '');
    };
    ViteConfigAnalyzer.prototype.getPluginDescription = function (pluginName) {
        var descriptions = {
            'ReactPlugin': 'Enable React support in Vite',
            'VuePlugin': 'Enable Vue support in Vite',
            'SveltePlugin': 'Enable Svelte support in Vite',
            'LegacyPlugin': 'Generate legacy bundles for older browsers',
            'TypescriptPlugin': 'Add TypeScript support',
            'WindiCSSPlugin': 'Enable WindiCSS support',
            'TailwindPlugin': 'Enable Tailwind CSS support',
            'ImagePlugin': 'Optimize and transform images',
            'CompressPlugin': 'Compress build output',
            'PwaPlugin': 'Add PWA support',
            'InspectPlugin': 'Inspect bundled modules',
            'MarkdownPlugin': 'Import and process Markdown files',
            'PreloadPlugin': 'Add preload directives to HTML',
            'VisualizerPlugin': 'Visualize bundle composition'
        };
        return descriptions[pluginName] || 'A Vite plugin';
    };
    ViteConfigAnalyzer.prototype.extractOptimizationOptions = function (content) {
        var options = {};
        var optimizeMatch = content.match(/optimizeDeps\s*:?\s*({[^}]*})/s);
        if (optimizeMatch === null || optimizeMatch === void 0 ? void 0 : optimizeMatch[1]) {
            var optimizeContent = optimizeMatch[1];
            options.deps = {
                entries: this.extractArrayOption(optimizeContent, 'entries'),
                exclude: this.extractArrayOption(optimizeContent, 'exclude'),
                include: this.extractArrayOption(optimizeContent, 'include')
            };
        }
        var buildMatch = content.match(/build\s*:?\s*({[^}]*})/s);
        if (buildMatch === null || buildMatch === void 0 ? void 0 : buildMatch[1]) {
            var buildContent = buildMatch[1];
            options.build = {
                target: this.extractStringOption(buildContent, 'target'),
                minify: this.extractBooleanOption(buildContent, 'minify'),
                cssCodeSplit: this.extractBooleanOption(buildContent, 'cssCodeSplit'),
                chunkSizeWarningLimit: this.extractNumberOption(buildContent, 'chunkSizeWarningLimit')
            };
        }
        return options;
    };
    ViteConfigAnalyzer.prototype.extractArrayOption = function (content, optionName) {
        var match = content.match(new RegExp("".concat(optionName, "\\s*:\\s*\\[([^\\]]*)\\]")));
        if (match === null || match === void 0 ? void 0 : match[1]) {
            return match[1]
                .split(',')
                .map(function (item) { return item.trim().replace(/['"]/g, ''); })
                .filter(Boolean);
        }
        return undefined;
    };
    ViteConfigAnalyzer.prototype.extractStringOption = function (content, optionName) {
        var match = content.match(new RegExp("".concat(optionName, "\\s*:\\s*['\"]([^'\"]+)['\"]")));
        return match === null || match === void 0 ? void 0 : match[1];
    };
    ViteConfigAnalyzer.prototype.extractBooleanOption = function (content, optionName) {
        var match = content.match(new RegExp("".concat(optionName, "\\s*:\\s*(true|false)")));
        if (match === null || match === void 0 ? void 0 : match[1]) {
            return match[1] === 'true';
        }
        return undefined;
    };
    ViteConfigAnalyzer.prototype.extractNumberOption = function (content, optionName) {
        var match = content.match(new RegExp("".concat(optionName, "\\s*:\\s*(\\d+)")));
        if (match === null || match === void 0 ? void 0 : match[1]) {
            return parseInt(match[1], 10);
        }
        return undefined;
    };
    return ViteConfigAnalyzer;
}());
exports.ViteConfigAnalyzer = ViteConfigAnalyzer;
