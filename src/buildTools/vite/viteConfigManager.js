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
exports.ViteConfigManager = void 0;
var fs = require("fs");
var services_1 = require("./services");
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
var ViteConfigManager = /** @class */ (function () {
    function ViteConfigManager(logger) {
        this.logger = logger || new NoOpLogger();
        this.configDetector = new services_1.ViteConfigDetector(this.logger);
        this.configAnalyzer = new services_1.ViteConfigAnalyzer(this.logger);
        this.optimizationService = new services_1.ViteOptimizationService(this.logger);
    }
    /**
     * Detects Vite configuration files in the given directory
     * @param workspacePath The root directory to search for Vite configs
     * @returns Array of absolute paths to Vite config files
     */
    ViteConfigManager.prototype.detectConfigs = function (workspacePath) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Detecting Vite configs in ".concat(workspacePath));
                        return [4 /*yield*/, this.configDetector.detect(workspacePath)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error detecting Vite configs:', error_1);
                        throw new Error("Failed to detect Vite configurations: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes a Vite configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    ViteConfigManager.prototype.analyzeConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, suggestions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.logger.debug("Analyzing Vite config at ".concat(configPath));
                        return [4 /*yield*/, this.configAnalyzer.analyze(configPath)];
                    case 1:
                        analysis = _a.sent();
                        return [4 /*yield*/, this.optimizationService.generateSuggestions(analysis.content, analysis.plugins, analysis.optimizationOptions)];
                    case 2:
                        suggestions = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, analysis), { optimizationSuggestions: suggestions })];
                    case 3:
                        error_2 = _a.sent();
                        this.logger.error('Error analyzing Vite config:', error_2);
                        throw new Error("Failed to analyze Vite configuration: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validates a Vite configuration file
     * @throws {ConfigValidationError} If validation fails
     */
    ViteConfigManager.prototype.validateConfig = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Validating Vite config at ".concat(configPath));
                        return [4 /*yield*/, this.analyzeConfig(configPath)];
                    case 1:
                        analysis = _a.sent();
                        return [2 /*return*/, analysis.isValid];
                    case 2:
                        error_3 = _a.sent();
                        this.logger.error('Error validating Vite config:', error_3);
                        throw new Error("Failed to validate Vite configuration: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates optimization suggestions for a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If generation fails
     */
    ViteConfigManager.prototype.generateOptimizations = function (configPath) {
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
    /**
     * Gets the detected framework from a Vite configuration
     * @throws {ConfigValidationError} If the config is invalid
     * @returns The detected framework or null if none detected
     */
    ViteConfigManager.prototype.detectFramework = function (configPath) {
        return __awaiter(this, void 0, void 0, function () {
            var content, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.logger.debug("Detecting framework in ".concat(configPath));
                        return [4 /*yield*/, fs.promises.readFile(configPath, 'utf-8')];
                    case 1:
                        content = _a.sent();
                        if (content.includes('@vitejs/plugin-vue')) {
                            return [2 /*return*/, 'vue'];
                        }
                        if (content.includes('@vitejs/plugin-react')) {
                            return [2 /*return*/, 'react'];
                        }
                        if (content.includes('@sveltejs/vite-plugin')) {
                            return [2 /*return*/, 'svelte'];
                        }
                        return [2 /*return*/, null];
                    case 2:
                        error_5 = _a.sent();
                        this.logger.error('Error detecting framework:', error_5);
                        throw new Error("Failed to detect framework: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ViteConfigManager;
}());
exports.ViteConfigManager = ViteConfigManager;
