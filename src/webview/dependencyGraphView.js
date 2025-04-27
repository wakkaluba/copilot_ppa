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
exports.DependencyGraphViewProvider = void 0;
var vscode = require("vscode");
var DependencyGraphService_1 = require("../services/dependencyGraph/DependencyGraphService");
var DependencyGraphRenderer_1 = require("./renderers/DependencyGraphRenderer");
var LoggerService_1 = require("../services/LoggerService");
/**
 * Provides interactive dependency graph visualization
 */
var DependencyGraphViewProvider = /** @class */ (function () {
    function DependencyGraphViewProvider(context) {
        this.disposables = [];
        this.graphService = new DependencyGraphService_1.DependencyGraphService();
        this.renderer = new DependencyGraphRenderer_1.DependencyGraphRenderer();
        this.logger = LoggerService_1.LoggerService.getInstance();
        this.registerEventHandlers(context);
    }
    /**
     * Creates and shows the dependency graph panel
     */
    DependencyGraphViewProvider.prototype.show = function (workspaceRoot) {
        return __awaiter(this, void 0, void 0, function () {
            var panel, dependencies, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        panel = this.createWebviewPanel();
                        return [4 /*yield*/, this.graphService.analyzeDependencies(workspaceRoot)];
                    case 1:
                        dependencies = _a.sent();
                        panel.webview.html = this.renderer.render(dependencies);
                        this.setupMessageHandling(panel);
                        this.disposables.push(panel);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to show dependency graph', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates the graph when dependencies change
     */
    DependencyGraphViewProvider.prototype.update = function (panel, workspaceRoot) {
        return __awaiter(this, void 0, void 0, function () {
            var dependencies, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.graphService.analyzeDependencies(workspaceRoot)];
                    case 1:
                        dependencies = _a.sent();
                        panel.webview.html = this.renderer.render(dependencies);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to update dependency graph', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cleans up resources
     */
    DependencyGraphViewProvider.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables.length = 0;
        this.graphService.dispose();
    };
    DependencyGraphViewProvider.prototype.createWebviewPanel = function () {
        return vscode.window.createWebviewPanel(DependencyGraphViewProvider.viewType, 'Dependency Graph', vscode.ViewColumn.Two, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [this.getLocalResourceRoot()]
        });
    };
    DependencyGraphViewProvider.prototype.setupMessageHandling = function (panel) {
        var _this = this;
        panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = message.command;
                        switch (_a) {
                            case 'refresh': return [3 /*break*/, 1];
                            case 'exportSvg': return [3 /*break*/, 3];
                        }
                        return [3 /*break*/, 5];
                    case 1: return [4 /*yield*/, this.update(panel, message.workspaceRoot)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 3: return [4 /*yield*/, this.exportGraph(message.data)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        this.logger.warn("Unknown command: ".concat(message.command));
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_3 = _b.sent();
                        this.handleError("Failed to handle message: ".concat(message.command), error_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); }, null, this.disposables);
    };
    DependencyGraphViewProvider.prototype.registerEventHandlers = function (context) {
        var _this = this;
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(function (e) { return _this.handleDocumentChange(e); }), vscode.workspace.onDidChangeWorkspaceFolders(function () { return _this.handleWorkspaceChange(); }));
    };
    DependencyGraphViewProvider.prototype.handleDocumentChange = function (e) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.shouldUpdateOnChange(e.document)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.notifyDependencyChange()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    DependencyGraphViewProvider.prototype.handleWorkspaceChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.notifyDependencyChange()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DependencyGraphViewProvider.prototype.shouldUpdateOnChange = function (document) {
        var relevantFiles = ['.ts', '.js', '.json', '.yaml', '.yml'];
        return relevantFiles.some(function (ext) { return document.fileName.endsWith(ext); });
    };
    DependencyGraphViewProvider.prototype.notifyDependencyChange = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, vscode.commands.executeCommand('dependencyGraph.refresh')];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.handleError('Failed to notify dependency change', error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DependencyGraphViewProvider.prototype.exportGraph = function (svgData) {
        return __awaiter(this, void 0, void 0, function () {
            var uri, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, vscode.window.showSaveDialog({
                                filters: { 'SVG files': ['svg'] }
                            })];
                    case 1:
                        uri = _a.sent();
                        if (!uri) return [3 /*break*/, 3];
                        return [4 /*yield*/, vscode.workspace.fs.writeFile(uri, Buffer.from(svgData))];
                    case 2:
                        _a.sent();
                        vscode.window.showInformationMessage('Dependency graph exported successfully');
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        this.handleError('Failed to export graph', error_5);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DependencyGraphViewProvider.prototype.getLocalResourceRoot = function () {
        return vscode.Uri.joinPath(vscode.Uri.file(__dirname), 'media');
    };
    DependencyGraphViewProvider.prototype.handleError = function (message, error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.error("DependencyGraphView: ".concat(message), errorMessage);
        vscode.window.showErrorMessage("".concat(message, ": ").concat(errorMessage));
    };
    DependencyGraphViewProvider.viewType = 'dependencyGraph.view';
    return DependencyGraphViewProvider;
}());
exports.DependencyGraphViewProvider = DependencyGraphViewProvider;
