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
exports.ConnectionUIManager = void 0;
var vscode = require("vscode");
var ConnectionStatusService_1 = require("../ui/ConnectionStatusService");
var ModelInfoService_1 = require("../ui/ModelInfoService");
var ConnectionDetailsService_1 = require("../ui/ConnectionDetailsService");
var ConnectionUIManager = /** @class */ (function () {
    function ConnectionUIManager() {
        this.disposables = [];
        this.statusService = new ConnectionStatusService_1.ConnectionStatusService();
        this.modelInfoService = new ModelInfoService_1.ModelInfoService();
        this.detailsService = new ConnectionDetailsService_1.ConnectionDetailsService();
        this.disposables.push(this.statusService, this.modelInfoService, this.detailsService);
        this.registerCommands();
    }
    ConnectionUIManager.prototype.setConnectionManager = function (manager) {
        this.connectionManager = manager;
        this.subscribeToEvents();
        this.updateUI(this.connectionManager.getStatus());
    };
    ConnectionUIManager.prototype.subscribeToEvents = function () {
        var _this = this;
        if (!this.connectionManager) {
            return;
        }
        this.connectionManager.on('stateChanged', function (status) {
            _this.updateUI(status);
        });
        this.connectionManager.on('modelChanged', function (status) {
            _this.modelInfoService.updateModelInfo(status.modelInfo);
        });
        this.connectionManager.on('error', function (status) {
            _this.statusService.showError(status.error);
        });
    };
    ConnectionUIManager.prototype.updateUI = function (status) {
        this.statusService.updateStatus(status);
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isConnected', status.isConnected);
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isAvailable', status.isAvailable);
    };
    ConnectionUIManager.prototype.registerCommands = function () {
        var _this = this;
        this.disposables.push(vscode.commands.registerCommand('copilot-ppa.toggleConnection', function () {
            _this.handleToggleConnection();
        }), vscode.commands.registerCommand('copilot-ppa.showConnectionDetails', function () {
            _this.showConnectionDetails();
        }), vscode.commands.registerCommand('copilot-ppa.configureModel', function () {
            _this.handleConfigure();
        }));
    };
    ConnectionUIManager.prototype.handleToggleConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectionManager) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        status_1 = this.connectionManager.getStatus();
                        if (!status_1.isConnected) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.connectionManager.disconnect()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.connectionManager.connect()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        this.statusService.showError(error_1 instanceof Error ? error_1 : new Error(String(error_1)));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionUIManager.prototype.handleConfigure = function () {
        return __awaiter(this, void 0, void 0, function () {
            var providers, selected, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.connectionManager) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, this.connectionManager.getAvailableProviders()];
                    case 2:
                        providers = _a.sent();
                        return [4 /*yield*/, this.modelInfoService.selectProvider(providers)];
                    case 3:
                        selected = _a.sent();
                        if (!selected) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.connectionManager.configureProvider(selected)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        this.statusService.showError(error_2 instanceof Error ? error_2 : new Error(String(error_2)));
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionUIManager.prototype.showConnectionDetails = function () {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                if (!this.connectionManager) {
                    return [2 /*return*/];
                }
                status = this.connectionManager.getStatus();
                this.detailsService.showConnectionDetails(status);
                return [2 /*return*/];
            });
        });
    };
    ConnectionUIManager.prototype.dispose = function () {
        this.disposables.forEach(function (d) { return d.dispose(); });
    };
    return ConnectionUIManager;
}());
exports.ConnectionUIManager = ConnectionUIManager;
