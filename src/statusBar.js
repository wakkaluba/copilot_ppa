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
exports.StatusBarManager = void 0;
var vscode = require("vscode");
var StatusBarManager = /** @class */ (function () {
    function StatusBarManager(context) {
        this._state = {
            mainText: '$(copilot) PPA',
            isWorking: false,
            isVisible: true,
            isError: false
        };
        this._mainStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._mainStatusBarItem.command = 'copilot-ppa.openMenu';
        this._mainStatusBarItem.tooltip = 'Copilot PPA';
        this._metricsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this._metricsStatusBarItem.command = 'copilot-ppa.showMetrics';
        this._metricsStatusBarItem.tooltip = 'PPA Metrics';
        // Setup configuration change listener
        this._configListener = vscode.workspace.onDidChangeConfiguration(this.handleConfigChange.bind(this));
        context.subscriptions.push(this._mainStatusBarItem, this._metricsStatusBarItem, this._configListener);
    }
    StatusBarManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.loadInitialState()];
                    case 1:
                        _a.sent();
                        this.updateUI();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        message = error_1 instanceof Error ? error_1.message : 'Unknown error';
                        vscode.window.showErrorMessage("Failed to initialize status bar: ".concat(message));
                        this.setErrorState();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StatusBarManager.prototype.loadInitialState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('copilot-ppa');
                        this._state.isVisible = config.get('showStatusBar', true);
                        return [4 /*yield*/, this.updateUI()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StatusBarManager.prototype.handleConfigChange = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!event.affectsConfiguration('copilot-ppa.showStatusBar')) return [3 /*break*/, 2];
                        config = vscode.workspace.getConfiguration('copilot-ppa');
                        this._state.isVisible = config.get('showStatusBar', true);
                        return [4 /*yield*/, this.updateUI()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    StatusBarManager.prototype.updateMainStatusBar = function (text) {
        if (text) {
            this._state.mainText = text;
        }
        this.updateUI();
    };
    StatusBarManager.prototype.updateMetricsStatusBar = function (perfScore) {
        this._state.metricsScore = perfScore;
        this.updateUI();
    };
    StatusBarManager.prototype.showWorkingAnimation = function (message) {
        var _this = this;
        // Clear any existing animation
        this.clearWorkingAnimation();
        this._state.isWorking = true;
        this._state.workingMessage = message || 'Analyzing...';
        var dots = '.';
        var count = 0;
        this._workingAnimation = setInterval(function () {
            var text = "$(sync~spin) ".concat(_this._state.workingMessage).concat(dots);
            _this._mainStatusBarItem.text = text;
            count = (count + 1) % 3;
            dots = '.'.repeat(count + 1);
        }, 500);
        var animation = {
            message: this._state.workingMessage,
            updateMessage: function (newMessage) {
                _this._state.workingMessage = newMessage;
            },
            dispose: function () {
                _this.clearWorkingAnimation();
                _this._state.isWorking = false;
                _this._state.workingMessage = undefined;
                _this.updateUI();
            }
        };
        return animation;
    };
    StatusBarManager.prototype.clearWorkingAnimation = function () {
        if (this._workingAnimation) {
            clearInterval(this._workingAnimation);
            this._workingAnimation = undefined;
        }
    };
    StatusBarManager.prototype.setErrorState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._state.isError = true;
                this._state.mainText = '$(error) PPA Error';
                this._mainStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
                this.updateUI();
                return [2 /*return*/];
            });
        });
    };
    StatusBarManager.prototype.clearErrorState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._state.isError = false;
                this._state.mainText = '$(copilot) PPA';
                this._mainStatusBarItem.backgroundColor = undefined;
                this.updateUI();
                return [2 /*return*/];
            });
        });
    };
    StatusBarManager.prototype.show = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._state.isVisible = true;
                this.updateUI();
                return [2 /*return*/];
            });
        });
    };
    StatusBarManager.prototype.hide = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._state.isVisible = false;
                this.updateUI();
                return [2 /*return*/];
            });
        });
    };
    StatusBarManager.prototype.update = function (message) {
        this.updateMainStatusBar(message);
    };
    StatusBarManager.prototype.updateUI = function () {
        try {
            // Update main status bar
            this._mainStatusBarItem.text = this._state.mainText;
            // Update metrics status bar if score is available
            if (this._state.metricsScore !== undefined) {
                var icon = this.getMetricsIcon(this._state.metricsScore);
                this._metricsStatusBarItem.text = "".concat(icon, " ").concat(this._state.metricsScore);
                this._metricsStatusBarItem.show();
            }
            else {
                this._metricsStatusBarItem.hide();
            }
            // Update visibility
            if (this._state.isVisible) {
                this._mainStatusBarItem.show();
            }
            else {
                this._mainStatusBarItem.hide();
                this._metricsStatusBarItem.hide();
            }
        }
        catch (error) {
            console.error('Error updating status bar UI:', error);
        }
    };
    StatusBarManager.prototype.getMetricsIcon = function (score) {
        if (score < 50) {
            return '$(warning)';
        }
        if (score < 80) {
            return '$(info)';
        }
        return '$(check)';
    };
    StatusBarManager.prototype.dispose = function () {
        this.clearWorkingAnimation();
        this._mainStatusBarItem.dispose();
        this._metricsStatusBarItem.dispose();
        this._configListener.dispose();
    };
    return StatusBarManager;
}());
exports.StatusBarManager = StatusBarManager;
