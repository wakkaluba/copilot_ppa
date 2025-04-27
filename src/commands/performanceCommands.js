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
exports.registerPerformanceCommands = registerPerformanceCommands;
var vscode = require("vscode");
var performanceManager_1 = require("../performance/performanceManager");
var logger_1 = require("../utils/logger");
/**
 * Register all performance-related commands
 */
function registerPerformanceCommands(context) {
    var _this = this;
    var perfManager = performanceManager_1.PerformanceManager.getInstance();
    var logger = logger_1.Logger.getInstance();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('localLLMAgent.performance.toggleProfiling', function () { return __awaiter(_this, void 0, void 0, function () {
        var config, currentValue;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    config = vscode.workspace.getConfiguration('localLLMAgent.performance');
                    currentValue = config.get('profilingEnabled', false);
                    // Toggle the value
                    return [4 /*yield*/, config.update('profilingEnabled', !currentValue, vscode.ConfigurationTarget.Global)];
                case 1:
                    // Toggle the value
                    _a.sent();
                    // Reinitialize the performance manager to apply changes
                    perfManager.initialize();
                    vscode.window.showInformationMessage("Performance profiling ".concat(!currentValue ? 'enabled' : 'disabled'));
                    return [2 /*return*/];
            }
        });
    }); }), vscode.commands.registerCommand('localLLMAgent.performance.generateReport', function () {
        perfManager.generatePerformanceReport();
        vscode.window.showInformationMessage('Performance report generated. Check the output log.');
    }), vscode.commands.registerCommand('localLLMAgent.performance.clearCache', function () {
        perfManager.getCachingService().clearAll();
        vscode.window.showInformationMessage('Cache cleared successfully.');
    }), vscode.commands.registerCommand('localLLMAgent.performance.analyzeBottlenecks', function () {
        var bottleneckDetector = perfManager.getBottleneckDetector();
        var bottlenecks = bottleneckDetector.analyzeAll();
        if (bottlenecks.critical.length === 0 && bottlenecks.warnings.length === 0) {
            vscode.window.showInformationMessage('No performance bottlenecks detected.');
            return;
        }
        logger.log('=== BOTTLENECK ANALYSIS ===');
        if (bottlenecks.critical.length > 0) {
            logger.log("Critical bottlenecks (".concat(bottlenecks.critical.length, "):"));
            bottlenecks.critical.forEach(function (opId) {
                logger.log("- ".concat(opId));
            });
        }
        if (bottlenecks.warnings.length > 0) {
            logger.log("Performance warnings (".concat(bottlenecks.warnings.length, "):"));
            bottlenecks.warnings.forEach(function (opId) {
                logger.log("- ".concat(opId));
            });
        }
        logger.log('==========================');
        vscode.window.showWarningMessage("Found ".concat(bottlenecks.critical.length, " critical and ").concat(bottlenecks.warnings.length, " warning bottlenecks. See output log for details."));
    }), vscode.commands.registerCommand('localLLMAgent.performance.optimizationSuggestions', function () { return __awaiter(_this, void 0, void 0, function () {
        var operations, selected, suggestions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    operations = Array.from(perfManager.getProfiler().getAllStats().keys());
                    if (operations.length === 0) {
                        vscode.window.showInformationMessage('No operations data available for optimization suggestions.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, vscode.window.showQuickPick(operations, {
                            placeHolder: 'Select an operation to get optimization suggestions'
                        })];
                case 1:
                    selected = _a.sent();
                    if (!selected) {
                        return [2 /*return*/];
                    }
                    suggestions = perfManager.getBottleneckDetector().getOptimizationSuggestions(selected);
                    logger.log("=== OPTIMIZATION SUGGESTIONS FOR ".concat(selected, " ==="));
                    suggestions.forEach(function (suggestion, index) {
                        logger.log("".concat(index + 1, ". ").concat(suggestion));
                    });
                    logger.log('==========================================');
                    vscode.window.showInformationMessage('Optimization suggestions available in output log.');
                    return [2 /*return*/];
            }
        });
    }); }));
    logger.log('Performance commands registered');
}
