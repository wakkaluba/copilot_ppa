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
exports.LLMStatusReporter = void 0;
var vscode = require("vscode");
var llm_1 = require("../../types/llm");
/**
 * Reports LLM connection status to VS Code UI
 */
var LLMStatusReporter = /** @class */ (function () {
    function LLMStatusReporter() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.outputChannel = vscode.window.createOutputChannel('LLM Connection');
        this.setupStatusBarItem();
    }
    LLMStatusReporter.getInstance = function () {
        if (!this.instance) {
            this.instance = new LLMStatusReporter();
        }
        return this.instance;
    };
    /**
     * Update the displayed status
     */
    LLMStatusReporter.prototype.updateStatus = function (status, provider) {
        this.currentProvider = provider;
        this.currentModel = status.modelInfo;
        this.updateStatusBar(status.state);
        this.logStatus(status, provider);
    };
    /**
     * Report a connection state change
     */
    LLMStatusReporter.prototype.reportStateChange = function (event, provider) {
        this.updateStatusBar(event.newState);
        this.logStateChange(event, provider);
    };
    /**
     * Report an error
     */
    LLMStatusReporter.prototype.reportError = function (error, provider) {
        var prefix = provider ? "[".concat(provider, "] ") : '';
        var message = "".concat(prefix, "Error: ").concat(error.message);
        vscode.window.showErrorMessage(message);
        this.outputChannel.appendLine("".concat(new Date().toISOString(), " - ").concat(message));
        if (error.stack) {
            this.outputChannel.appendLine(error.stack);
        }
    };
    /**
     * Show connection details
     */
    LLMStatusReporter.prototype.showConnectionDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            var details, result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.currentProvider) {
                            vscode.window.showInformationMessage('No active LLM connection');
                            return [2 /*return*/];
                        }
                        details = [
                            "Provider: ".concat(this.currentProvider),
                            this.currentModel ? "Model: ".concat(this.currentModel.name) : 'No model loaded',
                            ((_b = (_a = this.currentModel) === null || _a === void 0 ? void 0 : _a.capabilities) === null || _b === void 0 ? void 0 : _b.length) ?
                                "Capabilities: ".concat(this.currentModel.capabilities.join(', ')) :
                                'No capabilities info'
                        ];
                        return [4 /*yield*/, vscode.window.showInformationMessage(details.join('\n'), 'Show Logs')];
                    case 1:
                        result = _c.sent();
                        if (result === 'Show Logs') {
                            this.outputChannel.show();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMStatusReporter.prototype.setupStatusBarItem = function () {
        this.statusBarItem.command = 'llm.showConnectionDetails';
        this.updateStatusBar(llm_1.ConnectionState.DISCONNECTED);
        this.statusBarItem.show();
    };
    LLMStatusReporter.prototype.updateStatusBar = function (state) {
        var _a;
        var icons = (_a = {},
            _a[llm_1.ConnectionState.CONNECTED] = '$(link)',
            _a[llm_1.ConnectionState.CONNECTING] = '$(sync~spin)',
            _a[llm_1.ConnectionState.DISCONNECTED] = '$(unlink)',
            _a[llm_1.ConnectionState.ERROR] = '$(warning)',
            _a);
        var provider = this.currentProvider ? " - ".concat(this.currentProvider) : '';
        var model = this.currentModel ? " (".concat(this.currentModel.name, ")") : '';
        this.statusBarItem.text = "".concat(icons[state], " LLM").concat(provider).concat(model);
        this.statusBarItem.tooltip = "LLM Connection Status: ".concat(state).concat(provider).concat(model);
    };
    LLMStatusReporter.prototype.logStatus = function (status, provider) {
        var timestamp = new Date().toISOString();
        var prefix = provider ? "[".concat(provider, "] ") : '';
        this.outputChannel.appendLine("".concat(timestamp, " - ").concat(prefix, "Status: ").concat(status.state) +
            (status.modelInfo ? " - Model: ".concat(status.modelInfo.name) : '') +
            (status.error ? "\nError: ".concat(status.error.message) : ''));
    };
    LLMStatusReporter.prototype.logStateChange = function (event, provider) {
        var timestamp = new Date().toISOString();
        var prefix = provider ? "[".concat(provider, "] ") : '';
        this.outputChannel.appendLine("".concat(timestamp, " - ").concat(prefix, "State changed: ").concat(event.previousState, " -> ").concat(event.newState));
    };
    LLMStatusReporter.prototype.dispose = function () {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    };
    return LLMStatusReporter;
}());
exports.LLMStatusReporter = LLMStatusReporter;
