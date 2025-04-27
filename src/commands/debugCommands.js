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
exports.registerDebugCommands = registerDebugCommands;
var vscode = require("vscode");
var copilotCommunicationAnalyzer_1 = require("../debug/copilotCommunicationAnalyzer");
var debugDashboard_1 = require("../debug/debugDashboard");
var debugConfigPanel_1 = require("../debug/debugConfigPanel");
var logViewer_1 = require("../debug/logViewer");
var cudaDetector_1 = require("../debug/cudaDetector");
var modelCompatibilityChecker_1 = require("../debug/modelCompatibilityChecker");
var advancedLogger_1 = require("../utils/advancedLogger");
/**
 * Register debug-related commands
 */
function registerDebugCommands(context) {
    var _this = this;
    var logger = advancedLogger_1.AdvancedLogger.getInstance();
    var analyzer = copilotCommunicationAnalyzer_1.CopilotCommunicationAnalyzer.getInstance();
    var dashboard = debugDashboard_1.DebugDashboard.getInstance();
    var cudaDetector = cudaDetector_1.CudaDetector.getInstance();
    var modelChecker = modelCompatibilityChecker_1.ModelCompatibilityChecker.getInstance();
    var configPanel = debugConfigPanel_1.DebugConfigPanel.getInstance();
    var logViewer = logViewer_1.LogViewer.getInstance();
    // Register command to show debug dashboard
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.showDebugDashboard', function () {
        logger.info('Opening debug dashboard', {}, 'DebugCommands');
        dashboard.show();
    }));
    // Register command to show debug configuration
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.showDebugConfig', function () {
        logger.info('Opening debug configuration', {}, 'DebugCommands');
        configPanel.show();
    }));
    // Register command to show log viewer
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.showLogViewer', function () {
        logger.info('Opening log viewer', {}, 'DebugCommands');
        logViewer.show();
    }));
    // Register command to toggle communication analyzer
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.toggleCommunicationAnalyzer', function () { return __awaiter(_this, void 0, void 0, function () {
        var currentState, newState;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    currentState = context.workspaceState.get('copilotAnalyzerEnabled', false);
                    newState = !currentState;
                    analyzer.setEnabled(newState);
                    return [4 /*yield*/, context.workspaceState.update('copilotAnalyzerEnabled', newState)];
                case 1:
                    _a.sent();
                    vscode.window.showInformationMessage("Copilot communication analyzer ".concat(newState ? 'enabled' : 'disabled'));
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to export communication data
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.exportCommunicationData', function () { return __awaiter(_this, void 0, void 0, function () {
        var filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, analyzer.exportCommunicationHistoryToFile()];
                case 1:
                    filePath = _a.sent();
                    if (filePath) {
                        vscode.window.showInformationMessage("Copilot communication data exported to ".concat(filePath));
                    }
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to clear communication history
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.clearCommunicationHistory', function () {
        analyzer.clearHistory();
        vscode.window.showInformationMessage('Copilot communication history cleared');
    }));
    // Register command to check CUDA support
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.checkCudaSupport', function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Checking CUDA Support',
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var info, statusMessage, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    progress.report({ message: 'Detecting GPU...' });
                                    return [4 /*yield*/, cudaDetector.detectCuda()];
                                case 1:
                                    info = _a.sent();
                                    statusMessage = info.isAvailable
                                        ? "CUDA support detected: ".concat(info.gpuName, " (").concat(info.totalMemoryMB, "MB)")
                                        : 'CUDA support not detected';
                                    vscode.window.showInformationMessage(statusMessage, 'Show Details').then(function (selection) {
                                        if (selection === 'Show Details') {
                                            // Show detailed information in a new dashboard
                                            dashboard.show();
                                        }
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    vscode.window.showErrorMessage("Failed to check CUDA support: ".concat(error_1));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to check model compatibility
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.checkModelCompatibility', function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            modelChecker.showModelCompatibilityReport();
            return [2 /*return*/];
        });
    }); }));
    // Register command to get model recommendations
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.getModelRecommendations', function () { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: 'Getting Model Recommendations',
                        cancellable: false
                    }, function (progress) { return __awaiter(_this, void 0, void 0, function () {
                        var recommendations, recommendedCount, messageText, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    progress.report({ message: 'Analyzing GPU capabilities...' });
                                    return [4 /*yield*/, cudaDetector.getRecommendedModels()];
                                case 1:
                                    recommendations = _a.sent();
                                    recommendedCount = recommendations.recommended.length;
                                    messageText = recommendedCount > 0
                                        ? "Found ".concat(recommendedCount, " recommended models for your system")
                                        : 'No recommended models found for your system';
                                    vscode.window.showInformationMessage(messageText, 'Show Recommendations').then(function (selection) {
                                        if (selection === 'Show Recommendations') {
                                            modelChecker.showModelCompatibilityReport();
                                        }
                                    });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_2 = _a.sent();
                                    vscode.window.showErrorMessage("Failed to get model recommendations: ".concat(error_2));
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    // Register command to clear logs
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.clearLogs', function () {
        logger.clearLogs();
        vscode.window.showInformationMessage('All logs cleared');
    }));
    // Register command to show output channel
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.showOutputChannel', function () {
        logger.showOutputChannel();
    }));
    // Register command to export logs
    context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.exportLogs', function () { return __awaiter(_this, void 0, void 0, function () {
        var format, formatType, viewer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, vscode.window.showQuickPick([
                        { label: 'JSON', description: 'Export logs as JSON format' },
                        { label: 'CSV', description: 'Export logs as CSV format' },
                        { label: 'Text', description: 'Export logs as plain text' }
                    ], { placeHolder: 'Select export format' })];
                case 1:
                    format = _a.sent();
                    if (!format) {
                        return [2 /*return*/];
                    }
                    formatType = format.label.toLowerCase();
                    viewer = logViewer_1.LogViewer.getInstance();
                    viewer.show();
                    // Let the log viewer handle the export
                    setTimeout(function () {
                        // Use VS Code messaging system to export logs
                        vscode.commands.executeCommand('workbench:action:webview.message', {
                            command: 'exportLogs',
                            format: formatType
                        });
                    }, 500);
                    return [2 /*return*/];
            }
        });
    }); }));
    // Initialize the analyzer state from workspace state
    var initialState = context.workspaceState.get('copilotAnalyzerEnabled', false);
    analyzer.setEnabled(initialState);
    logger.info("Copilot communication analyzer initialized (".concat(initialState ? 'enabled' : 'disabled', ")"), {}, 'DebugCommands');
    // Auto open dashboard if configured
    var config = vscode.workspace.getConfiguration('copilot-ppa.debug');
    var autoOpenDashboard = config.get('autoOpenDashboard', false);
    if (autoOpenDashboard) {
        // Delay opening to ensure extension is fully loaded
        setTimeout(function () {
            dashboard.show();
        }, 2000);
    }
}
