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
exports.VisualizationCommandService = void 0;
var vscode = require("vscode");
var path = require("path");
var VisualizationCommandService = /** @class */ (function () {
    function VisualizationCommandService(context, errorHandler) {
        this.context = context;
        this.errorHandler = errorHandler;
    }
    VisualizationCommandService.prototype.showMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var panel, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.createWebviewPanel('metrics', 'PPA Metrics Dashboard')];
                    case 1:
                        panel = _b.sent();
                        _a = panel.webview;
                        return [4 /*yield*/, this.getMetricsDashboardHtml()];
                    case 2:
                        _a.html = _b.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage('Metrics dashboard opened')];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        this.errorHandler.handle('Failed to show metrics', error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VisualizationCommandService.prototype.showMemoryVisualization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var panel, templatePath, template, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createWebviewPanel('memoryVisualization', 'Memory Usage Visualization')];
                    case 1:
                        panel = _a.sent();
                        templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'memoryVisualization.html');
                        return [4 /*yield*/, vscode.workspace.fs.readFile(vscode.Uri.file(templatePath))];
                    case 2:
                        template = _a.sent();
                        panel.webview.html = template.toString();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.errorHandler.handle('Failed to show memory visualization', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    VisualizationCommandService.prototype.showPerformanceMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var panel, _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.createWebviewPanel('performanceMetrics', 'Performance Metrics')];
                    case 1:
                        panel = _b.sent();
                        _a = panel.webview;
                        return [4 /*yield*/, this.getPerformanceMetricsHtml()];
                    case 2:
                        _a.html = _b.sent();
                        return [4 /*yield*/, vscode.window.showInformationMessage('Performance metrics opened')];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        this.errorHandler.handle('Failed to show performance metrics', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VisualizationCommandService.prototype.exportMetrics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var exportPath, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, vscode.window.showSaveDialog({
                                defaultUri: vscode.Uri.file('metrics_export.json'),
                                filters: {
                                    'JSON files': ['json'],
                                    'All files': ['*']
                                }
                            })];
                    case 1:
                        exportPath = _a.sent();
                        if (!exportPath) return [3 /*break*/, 3];
                        // TODO: Collect and export metrics
                        return [4 /*yield*/, vscode.window.showInformationMessage('Metrics exported successfully')];
                    case 2:
                        // TODO: Collect and export metrics
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        this.errorHandler.handle('Failed to export metrics', error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VisualizationCommandService.prototype.createWebviewPanel = function (viewType, title) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, vscode.window.createWebviewPanel(viewType, title, vscode.ViewColumn.One, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                        localResourceRoots: [
                            vscode.Uri.file(path.join(this.context.extensionPath, 'media')),
                            vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'webview', 'templates'))
                        ]
                    })];
            });
        });
    };
    VisualizationCommandService.prototype.getMetricsDashboardHtml = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templatePath, template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'metricsDashboard.html');
                        return [4 /*yield*/, vscode.workspace.fs.readFile(vscode.Uri.file(templatePath))];
                    case 1:
                        template = _a.sent();
                        return [2 /*return*/, template.toString()];
                }
            });
        });
    };
    VisualizationCommandService.prototype.getPerformanceMetricsHtml = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templatePath, template;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        templatePath = path.join(this.context.extensionPath, 'src', 'webview', 'templates', 'performanceMetrics.html');
                        return [4 /*yield*/, vscode.workspace.fs.readFile(vscode.Uri.file(templatePath))];
                    case 1:
                        template = _a.sent();
                        return [2 /*return*/, template.toString()];
                }
            });
        });
    };
    return VisualizationCommandService;
}());
exports.VisualizationCommandService = VisualizationCommandService;
