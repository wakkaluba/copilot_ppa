"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.WebpackConfigManager = void 0;
var services_1 = require("./services");
var WebpackConfigManager = /** @class */ (function () {
    function WebpackConfigManager(configDetectorOrLogger, configAnalyzer, optimizationService, loggerParam) {
        // Handle single logger constructor case
        if (arguments.length === 1 && 'debug' in configDetectorOrLogger) {
            this.logger = configDetectorOrLogger;
            this.configDetector = new services_1.WebpackConfigDetector();
            this.configAnalyzer = new services_1.WebpackConfigAnalyzer();
            this.optimizationService = new services_1.WebpackOptimizationService();
        }
        else {
            // Handle full constructor case
            this.configDetector = configDetectorOrLogger;
            this.configAnalyzer = configAnalyzer;
            this.optimizationService = optimizationService;
            this.logger = loggerParam;
        }
    }
    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath The root directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    WebpackConfigManager.prototype.detectConfigs = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Searching for webpack configs in ".concat(workspacePath));
                        return [4 /*yield*/, this.configDetector.detectConfigs(workspacePath)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error detecting webpack configs:', error_1);
                        throw new Error("Failed to detect webpack configurations: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Analysis results including entry points, output config, loaders, plugins, and optimization suggestions
     */
    WebpackConfigManager.prototype.analyzeConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, suggestions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.logger.debug("Analyzing webpack config at ".concat(configPath));
                        return [4 /*yield*/, this.configAnalyzer.analyze(configPath)];
                    case 1:
                        analysis = _a.sent();
                        return [4 /*yield*/, this.optimizationService.generateSuggestions(analysis.content, analysis.entryPoints, analysis.loaders, analysis.plugins)];
                    case 2:
                        suggestions = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, analysis), { optimizationSuggestions: suggestions })];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Error analyzing webpack config:', error_2);
                        throw new Error("Failed to analyze webpack configuration: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates a webpack configuration file
     * @param configPath Path to the webpack config file
     * @returns Validation results containing any errors or warnings
     */
    WebpackConfigManager.prototype.validateConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Validating webpack config at ".concat(configPath));
                        return [4 /*yield*/, this.analyzeConfig(configPath)];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, {
                                isValid: analysis.errors.length === 0,
                                errors: analysis.errors.map(function (error) { return ({
                                    message: error.message,
                                    line: error.line,
                                    column: error.column,
                                    severity: 'error'
                                }); }),
                                warnings: analysis.warnings.map(function (warning) { return ({
                                    message: warning.message,
                                    line: warning.line,
                                    column: warning.column,
                                    severity: 'warning'
                                }); })
                            }];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Error validating webpack config:', error_3);
                        throw new Error("Failed to validate webpack configuration: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates optimization suggestions for a webpack configuration
     * @param configPath Path to the webpack config file
     * @returns Array of optimization suggestions
     */
    WebpackConfigManager.prototype.generateOptimizations = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Generating optimization suggestions for ".concat(configPath));
                        return [4 /*yield*/, this.analyzeConfig(configPath)];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, analysis.optimizationSuggestions];
                    case 2:
                        error_4 = _a.sent();
                        this.logger.error('Error generating optimizations:', error_4);
                        throw new Error("Failed to generate optimization suggestions: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return WebpackConfigManager;
}());
exports.WebpackConfigManager = WebpackConfigManager;
