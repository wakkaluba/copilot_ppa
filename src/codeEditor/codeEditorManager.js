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
exports.CodeEditorManager = void 0;
var vscode = require("vscode");
var codeExecutor_1 = require("./services/codeExecutor");
var codeNavigator_1 = require("./services/codeNavigator");
var codeLinker_1 = require("./services/codeLinker");
/**
 * Manages code editing functionality through specialized services
 */
var CodeEditorManager = /** @class */ (function () {
    function CodeEditorManager(context) {
        this.disposables = [];
        this._onEditorStateChange = new vscode.EventEmitter();
        this.metrics = new Map();
        this.executor = new codeExecutor_1.CodeExecutorService();
        this.navigator = new codeNavigator_1.CodeNavigatorService();
        this.linker = new codeLinker_1.CodeLinkerService();
        this.registerCommands(context);
        this.initializeMetrics();
    }
    CodeEditorManager.getInstance = function (context) {
        if (!CodeEditorManager.instance) {
            CodeEditorManager.instance = new CodeEditorManager(context);
        }
        return CodeEditorManager.instance;
    };
    CodeEditorManager.prototype.initializeMetrics = function () {
        this.metrics.set('executions', 0);
        this.metrics.set('navigations', 0);
        this.metrics.set('links', 0);
        this.metrics.set('errors', 0);
    };
    CodeEditorManager.prototype.registerCommands = function (context) {
        var _a;
        var _this = this;
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.executeCode', function () { return _this.executeSelectedCode(); }), vscode.commands.registerCommand('copilot-ppa.showOverview', function () { return _this.showCodeOverview(); }), vscode.commands.registerCommand('copilot-ppa.findReferences', function () { return _this.findReferences(); }), vscode.commands.registerCommand('copilot-ppa.createLink', function () { return _this.createCodeLink(); }), vscode.commands.registerCommand('copilot-ppa.navigateLink', function () { return _this.navigateCodeLink(); }));
        (_a = context.subscriptions).push.apply(_a, this.disposables);
    };
    // ICodeExecutor implementation
    CodeEditorManager.prototype.executeSelectedCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._onEditorStateChange.fire();
                        this.metrics.set('executions', (this.metrics.get('executions') || 0) + 1);
                        return [4 /*yield*/, this.executor.executeSelectedCode()];
                    case 1:
                        _a.sent();
                        vscode.commands.executeCommand('setContext', 'copilot-ppa:hasActiveExecution', true);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
                        vscode.window.showErrorMessage("Failed to execute code: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        throw new Error("Execution failed: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ICodeNavigator implementation
    CodeEditorManager.prototype.showCodeOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._onEditorStateChange.fire();
                        this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
                        return [4 /*yield*/, this.navigator.showCodeOverview()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
                        vscode.window.showErrorMessage("Failed to show code overview: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                        throw new Error("Navigation failed: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeEditorManager.prototype.findReferences = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._onEditorStateChange.fire();
                        this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
                        return [4 /*yield*/, this.navigator.findReferences()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
                        vscode.window.showErrorMessage("Failed to find references: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        throw new Error("Reference search failed: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ICodeLinker implementation
    CodeEditorManager.prototype.createCodeLink = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._onEditorStateChange.fire();
                        this.metrics.set('links', (this.metrics.get('links') || 0) + 1);
                        return [4 /*yield*/, this.linker.createCodeLink()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
                        vscode.window.showErrorMessage("Failed to create code link: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                        throw new Error("Link creation failed: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeEditorManager.prototype.navigateCodeLink = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this._onEditorStateChange.fire();
                        this.metrics.set('navigations', (this.metrics.get('navigations') || 0) + 1);
                        return [4 /*yield*/, this.linker.navigateCodeLink()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        this.metrics.set('errors', (this.metrics.get('errors') || 0) + 1);
                        vscode.window.showErrorMessage("Failed to navigate code link: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                        throw new Error("Link navigation failed: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CodeEditorManager.prototype.getMetrics = function () {
        return new Map(this.metrics);
    };
    CodeEditorManager.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables = [];
        this._onEditorStateChange.dispose();
        // Dispose services
        if (this.executor instanceof vscode.Disposable) {
            this.executor.dispose();
        }
        if (this.navigator instanceof vscode.Disposable) {
            this.navigator.dispose();
        }
        if (this.linker instanceof vscode.Disposable) {
            this.linker.dispose();
        }
    };
    return CodeEditorManager;
}());
exports.CodeEditorManager = CodeEditorManager;
