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
exports.ConfigManager = void 0;
var vscode = require("vscode");
var DEFAULT_CONFIG = {
    enableTelemetry: true,
    debugLogging: false,
    showStatusBar: true,
    analysisThreshold: 500,
    integrationFeatures: {
        copilotEnabled: true,
        vscodeProfileEnabled: false,
        perfDataCollection: true,
    },
    llm: {
        provider: 'ollama',
        modelId: 'llama2',
        endpoint: 'http://localhost:11434',
        maxTokens: 2048,
        temperature: 0.7,
    },
    defaultProvider: 'ollama',
};
var ConfigManager = /** @class */ (function () {
    function ConfigManager(context) {
        this._configChangeEmitter = new vscode.EventEmitter();
        this.onConfigChanged = this._configChangeEmitter.event;
        this._context = context;
        this._currentConfig = this.loadConfig();
        this.setupConfigChangeListener();
    }
    ConfigManager.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validateAndUpdateConfig()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.registerConfigurationDefaults()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.loadConfig = function () {
        var config = vscode.workspace.getConfiguration('copilot-ppa');
        return this.mergeWithDefaults(config);
    };
    ConfigManager.prototype.mergeWithDefaults = function (config) {
        return {
            enableTelemetry: config.get('enableTelemetry', DEFAULT_CONFIG.enableTelemetry),
            debugLogging: config.get('debugLogging', DEFAULT_CONFIG.debugLogging),
            showStatusBar: config.get('showStatusBar', DEFAULT_CONFIG.showStatusBar),
            analysisThreshold: this.validateAnalysisThreshold(config.get('analysisThreshold', DEFAULT_CONFIG.analysisThreshold)),
            integrationFeatures: {
                copilotEnabled: config.get('integrationFeatures.copilotEnabled', DEFAULT_CONFIG.integrationFeatures.copilotEnabled),
                vscodeProfileEnabled: config.get('integrationFeatures.vscodeProfileEnabled', DEFAULT_CONFIG.integrationFeatures.vscodeProfileEnabled),
                perfDataCollection: config.get('integrationFeatures.perfDataCollection', DEFAULT_CONFIG.integrationFeatures.perfDataCollection),
            },
            llm: this.validateLLMConfig({
                provider: config.get('llm.provider', DEFAULT_CONFIG.llm.provider),
                modelId: config.get('llm.modelId', DEFAULT_CONFIG.llm.modelId),
                endpoint: config.get('llm.endpoint', DEFAULT_CONFIG.llm.endpoint),
                maxTokens: config.get('llm.maxTokens', DEFAULT_CONFIG.llm.maxTokens),
                temperature: config.get('llm.temperature', DEFAULT_CONFIG.llm.temperature),
            }),
            defaultProvider: config.get('defaultProvider', DEFAULT_CONFIG.defaultProvider),
        };
    };
    ConfigManager.prototype.validateAnalysisThreshold = function (threshold) {
        return Math.max(100, Math.min(threshold, 10000));
    };
    ConfigManager.prototype.validateLLMConfig = function (config) {
        return __assign(__assign({}, config), { maxTokens: Math.max(1, Math.min(config.maxTokens, 8192)), temperature: Math.max(0, Math.min(config.temperature, 2)), endpoint: this.validateEndpoint(config.endpoint) });
    };
    ConfigManager.prototype.validateEndpoint = function (endpoint) {
        try {
            new URL(endpoint);
            return endpoint;
        }
        catch (_a) {
            return DEFAULT_CONFIG.llm.endpoint;
        }
    };
    ConfigManager.prototype.validateAndUpdateConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = this.getConfig();
                        if (!(config.analysisThreshold !== this._currentConfig.analysisThreshold)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.updateConfig('analysisThreshold', this._currentConfig.analysisThreshold)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(config.llm.maxTokens !== this._currentConfig.llm.maxTokens)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.updateConfig('llm.maxTokens', this._currentConfig.llm.maxTokens)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!(config.llm.temperature !== this._currentConfig.llm.temperature)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.updateConfig('llm.temperature', this._currentConfig.llm.temperature)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(config.llm.endpoint !== this._currentConfig.llm.endpoint)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.updateConfig('llm.endpoint', this._currentConfig.llm.endpoint)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.setupConfigChangeListener = function () {
        var _this = this;
        this._configChangeHandler = vscode.workspace.onDidChangeConfiguration(function (event) {
            if (event.affectsConfiguration('copilot-ppa')) {
                var oldConfig = _this._currentConfig;
                _this._currentConfig = _this.loadConfig();
                // Emit specific changes
                _this.emitConfigChanges(oldConfig, _this._currentConfig);
            }
        });
        this._context.subscriptions.push(this._configChangeHandler);
    };
    ConfigManager.prototype.emitConfigChanges = function (oldConfig, newConfig) {
        // Compare and emit changes for each top-level property
        for (var key in newConfig) {
            var typedKey = key;
            if (JSON.stringify(oldConfig[typedKey]) !== JSON.stringify(newConfig[typedKey])) {
                this._configChangeEmitter.fire({
                    key: typedKey,
                    value: newConfig[typedKey],
                    source: vscode.ConfigurationTarget.Global
                });
            }
        }
    };
    ConfigManager.prototype.getConfig = function () {
        return __assign({}, this._currentConfig);
    };
    ConfigManager.prototype.updateConfig = function (section_1, value_1) {
        return __awaiter(this, arguments, void 0, function (section, value, configTarget) {
            if (configTarget === void 0) { configTarget = vscode.ConfigurationTarget.Global; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, vscode.workspace.getConfiguration('copilot-ppa').update(section, value, configTarget)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.registerConfigurationDefaults = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = vscode.workspace.getConfiguration('copilot-ppa');
                        if (!!config.has('defaultProvider')) return [3 /*break*/, 2];
                        return [4 /*yield*/, config.update('defaultProvider', DEFAULT_CONFIG.llm.provider, vscode.ConfigurationTarget.Global)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ConfigManager.prototype.dispose = function () {
        var _a;
        (_a = this._configChangeHandler) === null || _a === void 0 ? void 0 : _a.dispose();
        this._configChangeEmitter.dispose();
    };
    return ConfigManager;
}());
exports.ConfigManager = ConfigManager;
