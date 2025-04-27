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
exports.RollupConfigAnalyzer = void 0;
var fs = require("fs");
var ConfigValidationError_1 = require("../errors/ConfigValidationError");
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
var RollupConfigAnalyzer = /** @class */ (function () {
    function RollupConfigAnalyzer(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Analyzes a Rollup configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    RollupConfigAnalyzer.prototype.analyze = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, analysis, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs.promises.readFile(configPath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        analysis = {
                            input: this.extractInput(content),
                            output: this.extractOutput(content),
                            plugins: this.extractPlugins(content),
                            external: this.extractExternals(content),
                            content: content,
                            optimizationSuggestions: []
                        };
                        this.logger.debug("Analyzed Rollup config at ".concat(configPath, ":"), analysis);
                        return [2 /*return*/, analysis];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof ConfigValidationError_1.ConfigValidationError) {
                            throw error_1;
                        }
                        this.logger.error('Failed to analyze Rollup config:', error_1);
                        throw new Error("Failed to analyze Rollup config: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RollupConfigAnalyzer.prototype.extractInput = function (content) {
        var _this = this;
        var inputs = [];
        var inputMatch = content.match(/input\s*:?\s*({[^}]*}|\[[^\]]*\]|['"][^'"]*['"])/s);
        if (!(inputMatch === null || inputMatch === void 0 ? void 0 : inputMatch[1])) {
            return inputs;
        }
        var inputContent = inputMatch[1];
        // Handle object syntax: { main: 'src/index.js' }
        if (inputContent.startsWith('{')) {
            var entryMatches = Array.from(inputContent.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g));
            entryMatches.forEach(function (match) {
                if (match[1] && match[2]) {
                    inputs.push({
                        name: match[1],
                        path: match[2],
                        external: _this.extractExternals(content)
                    });
                }
            });
        }
        // Handle array syntax: ['src/index.js']
        else if (inputContent.startsWith('[')) {
            var entryPaths = Array.from(inputContent.matchAll(/['"]([^'"]+)['"]/g));
            entryPaths.forEach(function (match, index) {
                if (match[1]) {
                    inputs.push({
                        name: "entry".concat(index + 1),
                        path: match[1],
                        external: _this.extractExternals(content)
                    });
                }
            });
        }
        // Handle string syntax: 'src/index.js'
        else {
            var pathMatch = inputContent.match(/['"]([^'"]+)['"]/);
            if (pathMatch === null || pathMatch === void 0 ? void 0 : pathMatch[1]) {
                inputs.push({
                    name: 'main',
                    path: pathMatch[1],
                    external: this.extractExternals(content)
                });
            }
        }
        return inputs;
    };
    RollupConfigAnalyzer.prototype.extractExternals = function (content) {
        var externals = [];
        var externalsMatch = content.match(/external\s*:?\s*\[(.*?)\]/s);
        if (externalsMatch === null || externalsMatch === void 0 ? void 0 : externalsMatch[1]) {
            var externalContent = externalsMatch[1];
            var matches = Array.from(externalContent.matchAll(/['"]([^'"]+)['"]/g));
            matches.forEach(function (match) {
                if (match[1]) {
                    externals.push(match[1]);
                }
            });
        }
        return externals;
    };
    RollupConfigAnalyzer.prototype.extractOutput = function (content) {
        var _this = this;
        var outputs = [];
        var outputMatch = content.match(/output\s*:?\s*({[^}]*}|\[[^\]]*\])/s);
        if (!(outputMatch === null || outputMatch === void 0 ? void 0 : outputMatch[1])) {
            return outputs;
        }
        var outputContent = outputMatch[1];
        // Handle array of outputs: [{ file: 'bundle.js' }, { file: 'bundle.min.js' }]
        if (outputContent.startsWith('[')) {
            var outputBlocks = this.extractBlocks(outputContent);
            outputBlocks.forEach(function (block) {
                var output = _this.parseOutputBlock(block);
                if (output) {
                    outputs.push(output);
                }
            });
        }
        // Handle single output: { file: 'bundle.js' }
        else if (outputContent.startsWith('{')) {
            var output = this.parseOutputBlock(outputContent);
            if (output) {
                outputs.push(output);
            }
        }
        return outputs;
    };
    RollupConfigAnalyzer.prototype.parseOutputBlock = function (block) {
        var fileMatch = block.match(/file\s*:\s*['"]([^'"]+)['"]/);
        var dirMatch = block.match(/dir\s*:\s*['"]([^'"]+)['"]/);
        var formatMatch = block.match(/format\s*:\s*['"]([^'"]+)['"]/);
        var nameMatch = block.match(/name\s*:\s*['"]([^'"]+)['"]/);
        var sourcemapMatch = block.match(/sourcemap\s*:\s*(true|false|['"]inline['"]|['"]hidden['"]),?/);
        if (!formatMatch) {
            return null;
        }
        var output = {
            format: formatMatch[1]
        };
        if (fileMatch) {
            output.file = fileMatch[1];
        }
        if (dirMatch) {
            output.dir = dirMatch[1];
        }
        if (nameMatch) {
            output.name = nameMatch[1];
        }
        if (sourcemapMatch) {
            var value = sourcemapMatch[1];
            output.sourcemap = value === 'true' ? true :
                value === 'false' ? false :
                    value.replace(/['"]/g, '');
        }
        return output;
    };
    RollupConfigAnalyzer.prototype.extractPlugins = function (content) {
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
    RollupConfigAnalyzer.prototype.getPluginNameFromImport = function (importPath) {
        // Remove @rollup/ prefix if present
        var name = importPath.replace(/^@rollup\//, '');
        // Convert kebab-case to camelCase and add 'Plugin' suffix if not present
        return name.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })
            .replace(/^[a-z]/, function (c) { return c.toUpperCase(); }) +
            (!name.toLowerCase().endsWith('plugin') ? 'Plugin' : '');
    };
    RollupConfigAnalyzer.prototype.getPluginDescription = function (pluginName) {
        var descriptions = {
            'CommonjsPlugin': 'Convert CommonJS modules to ES6',
            'NodeResolvePlugin': 'Locate and bundle third-party dependencies in node_modules',
            'TypescriptPlugin': 'Integration with TypeScript compiler',
            'TerserPlugin': 'Minify generated bundle',
            'JsonPlugin': 'Convert .json files to ES6 modules',
            'ReplacePlugin': 'Replace strings in files while bundling',
            'BabelPlugin': 'Transform code with Babel',
            'PostcssPlugin': 'Process CSS with PostCSS',
            'VuePlugin': 'Bundle Vue components',
            'ImagePlugin': 'Import images as data-URIs or files',
            'UrlPlugin': 'Import files as data-URIs or esModule',
            'SveltePlugin': 'Bundle Svelte components',
            'Alias': 'Define aliases for import paths',
            'VisualizePlugin': 'Visualize the bundle composition',
            'LiveReloadPlugin': 'Reload the browser on change'
        };
        return descriptions[pluginName] || 'A rollup plugin';
    };
    RollupConfigAnalyzer.prototype.extractBlocks = function (content) {
        var blocks = [];
        var depth = 0;
        var currentBlock = '';
        for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
            var char = content_1[_i];
            if (char === '{') {
                depth++;
            }
            if (char === '}') {
                depth--;
            }
            currentBlock += char;
            if (depth === 0 && currentBlock.trim()) {
                blocks.push(currentBlock.trim());
                currentBlock = '';
            }
        }
        return blocks;
    };
    return RollupConfigAnalyzer;
}());
exports.RollupConfigAnalyzer = RollupConfigAnalyzer;
