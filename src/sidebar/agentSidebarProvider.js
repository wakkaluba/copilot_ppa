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
exports.AgentSidebarProvider = void 0;
var vscode = require("vscode");
var fs = require("fs");
/**
 * Provides the agent sidebar webview implementation
 */
var AgentSidebarProvider = /** @class */ (function () {
    function AgentSidebarProvider(_extensionUri, _connectionManager) {
        this._extensionUri = _extensionUri;
        this._connectionManager = _connectionManager;
        this._disposables = [];
        this._messageHandlers = new Map();
        this.registerMessageHandlers();
        this.listenToConnectionChanges();
    }
    /**
     * Resolves the webview view
     */
    AgentSidebarProvider.prototype.resolveWebviewView = function (webviewView, _context, _token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        webviewView.webview.html = this._getHtmlContent(webviewView.webview);
        this.setupMessageListener(webviewView.webview);
        this.updateConnectionState();
    };
    /**
     * Sets up the message listener for webview communication
     */
    AgentSidebarProvider.prototype.setupMessageListener = function (webview) {
        var _this = this;
        this._disposables.push(webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var handler, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        handler = this._messageHandlers.get(message.type);
                        if (!handler) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, handler(message.data)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error handling message ".concat(message.type, ":"), error_1);
                        this.showError("Failed to handle ".concat(message.type, ": ").concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        console.warn("No handler registered for message type: ".concat(message.type));
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        }); }));
    };
    /**
     * Registers all message handlers for webview communication
     */
    AgentSidebarProvider.prototype.registerMessageHandlers = function () {
        var _this = this;
        this._messageHandlers.set('connect', function () { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._connectionManager.connect()];
                    case 1:
                        _a.sent();
                        this.updateConnectionState();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.showError("Failed to connect: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this._messageHandlers.set('disconnect', function () { return __awaiter(_this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._connectionManager.disconnect()];
                    case 1:
                        _a.sent();
                        this.updateConnectionState();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.showError("Failed to disconnect: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        this._messageHandlers.set('refreshModels', function () { return __awaiter(_this, void 0, void 0, function () {
            var models, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this._connectionManager.getAvailableModels()];
                    case 1:
                        models = _b.sent();
                        return [4 /*yield*/, ((_a = this._view) === null || _a === void 0 ? void 0 : _a.webview.postMessage({
                                type: 'updateModels',
                                data: models
                            }))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        this.showError("Failed to refresh models: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        this._messageHandlers.set('setModel', function (modelId) { return __awaiter(_this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this._connectionManager.setModel(modelId)];
                    case 1:
                        _a.sent();
                        this.updateConnectionState();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        this.showError("Failed to set model: ".concat(error_5 instanceof Error ? error_5.message : String(error_5)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Listens to connection state changes
     */
    AgentSidebarProvider.prototype.listenToConnectionChanges = function () {
        var _this = this;
        this._disposables.push(this._connectionManager.onConnectionStateChanged(function () {
            _this.updateConnectionState();
        }));
    };
    /**
     * Updates the connection state in the webview
     */
    AgentSidebarProvider.prototype.updateConnectionState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var state, currentModel, _a, _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        if (!this._view) {
                            return [2 /*return*/];
                        }
                        state = this._connectionManager.getConnectionState();
                        currentModel = this._connectionManager.getCurrentModel();
                        _b = (_a = this._view.webview).postMessage;
                        _c = {
                            type: 'updateState'
                        };
                        _d = {
                            connected: state.isConnected,
                            model: currentModel
                        };
                        return [4 /*yield*/, this._connectionManager.getAvailableModels()];
                    case 1: return [4 /*yield*/, _b.apply(_a, [(_c.data = (_d.models = _e.sent(),
                                _d),
                                _c)])];
                    case 2:
                        _e.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Shows an error message in the webview
     */
    AgentSidebarProvider.prototype.showError = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._view) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this._view.webview.postMessage({
                                type: 'showError',
                                data: message
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets the HTML content for the webview
     */
    AgentSidebarProvider.prototype._getHtmlContent = function (webview) {
        var htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.html');
        var styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'agent-sidebar.css'));
        var scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sidebar.js'));
        var nonce = this.generateNonce();
        var htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
        return htmlContent
            .replace('${webview.cspSource}', webview.cspSource)
            .replace('${styleUri}', styleUri.toString())
            .replace('${scriptUri}', scriptUri.toString())
            .replace('${nonce}', nonce);
    };
    /**
     * Generates a nonce for Content Security Policy
     */
    AgentSidebarProvider.prototype.generateNonce = function () {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
    };
    /**
     * Cleans up resources
     */
    AgentSidebarProvider.prototype.dispose = function () {
        this._disposables.forEach(function (d) { return d.dispose(); });
        this._messageHandlers.clear();
        this._view = undefined;
    };
    AgentSidebarProvider.viewType = 'copilot-ppa.agentSidebar';
    return AgentSidebarProvider;
}());
exports.AgentSidebarProvider = AgentSidebarProvider;
