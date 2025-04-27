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
exports.WebpackConfigAnalyzer = void 0;
var fs = require("fs");
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
var WebpackConfigAnalyzer = /** @class */ (function () {
    function WebpackConfigAnalyzer(logger) {
        this.logger = logger || new NoOpLogger();
    }
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     */
    WebpackConfigAnalyzer.prototype.analyze = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, entryPoints, output, loaders, plugins, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.logger.debug("Analyzing webpack config at ".concat(configPath));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs.promises.readFile(configPath, 'utf-8')];
                    case 2:
                        content = _a.sent();
                        entryPoints = this.extractEntryPoints(content);
                        output = this.extractOutput(content);
                        loaders = this.extractLoaders(content);
                        plugins = this.extractPlugins(content);
                        return [2 /*return*/, {
                                entryPoints: entryPoints,
                                output: output,
                                loaders: loaders,
                                plugins: plugins,
                                content: content,
                                optimizationSuggestions: [], // Will be filled by OptimizationService
                                errors: [],
                                warnings: []
                            }];
                    case 3:
                        error_1 = _a.sent();
                        this.logger.error('Error analyzing webpack config:', error_1);
                        throw new Error("Failed to analyze webpack configuration: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WebpackConfigAnalyzer.prototype.extractEntryPoints = function (content) {
        var entries = [];
        var entryMatch = content.match(/entry\s*:\s*({[^}]*}|\[[^\]]*\]|['"][^'"]*['"])/s);
        if (!(entryMatch === null || entryMatch === void 0 ? void 0 : entryMatch[1])) {
            return entries;
        }
        var entryContent = entryMatch[1];
        // Handle object syntax: { main: './src/index.js' }
        if (entryContent.startsWith('{')) {
            var entryMatches = Array.from(entryContent.matchAll(/['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g));
            entryMatches.forEach(function (match) {
                if (match[1] && match[2]) {
                    entries.push({ name: match[1], path: match[2] });
                }
            });
        }
        // Handle array syntax: ['./src/index.js']
        else if (entryContent.startsWith('[')) {
            var entryPaths = Array.from(entryContent.matchAll(/['"]([^'"]+)['"]/g));
            entryPaths.forEach(function (match, index) {
                if (match[1]) {
                    entries.push({ name: "entry".concat(index + 1), path: match[1] });
                }
            });
        }
        // Handle string syntax: './src/index.js'
        else {
            var pathMatch = entryContent.match(/['"]([^'"]+)['"]/);
            if (pathMatch === null || pathMatch === void 0 ? void 0 : pathMatch[1]) {
                entries.push({ name: 'main', path: pathMatch[1] });
            }
        }
        return entries;
    };
    WebpackConfigAnalyzer.prototype.extractOutput = function (content) {
        var outputMatch = content.match(/output\s*:\s*{([^}]*)}/s);
        if (!(outputMatch === null || outputMatch === void 0 ? void 0 : outputMatch[1])) {
            return { path: '', filename: '' };
        }
        var outputContent = outputMatch[1];
        var pathMatch = outputContent.match(/path\s*:\s*[^,}]+/);
        var filenameMatch = outputContent.match(/filename\s*:\s*['"]([^'"]+)['"]/);
        var publicPathMatch = outputContent.match(/publicPath\s*:\s*['"]([^'"]+)['"]/);
        return {
            path: pathMatch ? this.extractPathValue(pathMatch[0]) : '',
            filename: (filenameMatch === null || filenameMatch === void 0 ? void 0 : filenameMatch[1]) || '',
            publicPath: publicPathMatch === null || publicPathMatch === void 0 ? void 0 : publicPathMatch[1]
        };
    };
    WebpackConfigAnalyzer.prototype.extractPathValue = function (pathString) {
        // Handle path.resolve/join syntax
        var resolveMatch = pathString.match(/path\.(?:resolve|join)\s*\((.*)\)/);
        if (resolveMatch === null || resolveMatch === void 0 ? void 0 : resolveMatch[1]) {
            var parts = Array.from(resolveMatch[1].matchAll(/['"]([^'"]+)['"]/g));
            return parts.map(function (match) { return match[1]; }).join('/');
        }
        // Handle direct string
        var directMatch = pathString.match(/['"]([^'"]+)['"]/);
        return (directMatch === null || directMatch === void 0 ? void 0 : directMatch[1]) || '';
    };
    WebpackConfigAnalyzer.prototype.extractLoaders = function (content) {
        var _this = this;
        var loaders = [];
        var rulesMatch = content.match(/rules\s*:\s*\[(.*?)\]/s);
        if (rulesMatch === null || rulesMatch === void 0 ? void 0 : rulesMatch[1]) {
            var rulesContent = rulesMatch[1];
            var ruleBlocks = this.extractRuleBlocks(rulesContent);
            ruleBlocks.forEach(function (block) {
                var test = _this.extractTest(block);
                var loaderNames = _this.extractLoaderNames(block);
                loaderNames.forEach(function (name) {
                    loaders.push({
                        name: name,
                        test: test,
                        options: _this.extractLoaderOptions(block, name)
                    });
                });
            });
        }
        return loaders;
    };
    WebpackConfigAnalyzer.prototype.extractRuleBlocks = function (rulesContent) {
        var blocks = [];
        var depth = 0;
        var currentBlock = '';
        for (var _i = 0, rulesContent_1 = rulesContent; _i < rulesContent_1.length; _i++) {
            var char = rulesContent_1[_i];
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
    WebpackConfigAnalyzer.prototype.extractTest = function (ruleBlock) {
        var testMatch = ruleBlock.match(/test\s*:\s*\/([^/]+)\//);
        return (testMatch === null || testMatch === void 0 ? void 0 : testMatch[1]) || '';
    };
    WebpackConfigAnalyzer.prototype.extractLoaderNames = function (ruleBlock) {
        var names = [];
        // Check for use array
        var useMatch = ruleBlock.match(/use\s*:\s*\[(.*?)\]/s);
        if (useMatch === null || useMatch === void 0 ? void 0 : useMatch[1]) {
            var loaderMatches = Array.from(useMatch[1].matchAll(/['"]([^'"]*-loader)['"]/g));
            loaderMatches.forEach(function (match) {
                if (match[1]) {
                    names.push(match[1]);
                }
            });
        }
        // Check for single loader
        var loaderMatch = ruleBlock.match(/loader\s*:\s*['"]([^'"]*-loader)['"]/);
        if (loaderMatch === null || loaderMatch === void 0 ? void 0 : loaderMatch[1]) {
            names.push(loaderMatch[1]);
        }
        return names;
    };
    WebpackConfigAnalyzer.prototype.extractLoaderOptions = function (ruleBlock, loaderName) {
        var options = {};
        var optionsMatch = ruleBlock.match(new RegExp("".concat(loaderName, ".*?options\\s*:\\s*{([^}]*)}"), 's'));
        if (optionsMatch === null || optionsMatch === void 0 ? void 0 : optionsMatch[1]) {
            var optionsContent = optionsMatch[1];
            var optionPairs = Array.from(optionsContent.matchAll(/(['"])?([^'":\s]+)\1\s*:\s*([^,}]+)/g));
            optionPairs.forEach(function (match) {
                if (match[2] && match[3]) {
                    var key = match[2];
                    var value = match[3].trim();
                    // Try to parse as JSON if possible
                    try {
                        value = JSON.parse(value);
                    }
                    catch (_a) {
                        // Keep as string if parsing fails
                    }
                    options[key] = value;
                }
            });
        }
        return options;
    };
    WebpackConfigAnalyzer.prototype.extractPlugins = function (content) {
        var _this = this;
        var plugins = [];
        var pluginsMatch = content.match(/plugins\s*:\s*\[(.*?)\]/s);
        if (pluginsMatch === null || pluginsMatch === void 0 ? void 0 : pluginsMatch[1]) {
            var pluginsContent = pluginsMatch[1];
            var pluginMatches = Array.from(pluginsContent.matchAll(/new\s+([A-Za-z]+Plugin)/g));
            pluginMatches.forEach(function (match) {
                if (match[1]) {
                    plugins.push({
                        name: match[1],
                        description: _this.getPluginDescription(match[1])
                    });
                }
            });
        }
        return plugins;
    };
    WebpackConfigAnalyzer.prototype.getPluginDescription = function (pluginName) {
        var descriptions = {
            'HtmlWebpackPlugin': 'Generates HTML files to serve your webpack bundles',
            'MiniCssExtractPlugin': 'Extracts CSS into separate files',
            'CleanWebpackPlugin': 'Cleans the build folder before each build',
            'CopyWebpackPlugin': 'Copies individual files or directories to the build directory',
            'DefinePlugin': 'Allows configuring global constants at compile time',
            'TerserPlugin': 'Minifies JavaScript',
            'OptimizeCSSAssetsPlugin': 'Optimizes and minimizes CSS assets',
            'BundleAnalyzerPlugin': 'Visualizes the size of webpack output files',
            'CompressionPlugin': 'Prepares compressed versions of assets to serve them with Content-Encoding'
        };
        return descriptions[pluginName] || 'A webpack plugin';
    };
    return WebpackConfigAnalyzer;
}());
exports.WebpackConfigAnalyzer = WebpackConfigAnalyzer;
