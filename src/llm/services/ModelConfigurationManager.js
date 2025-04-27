"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
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
exports.ModelConfigurationManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelConfigurationManager = /** @class */ (function (_super) {
    __extends(ModelConfigurationManager, _super);
    function ModelConfigurationManager(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.configMap = new Map();
        _this.defaultConfigs = new Map();
        _this.storageKey = 'model-configurations';
        _this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
        _this.loadPersistedConfigs();
        return _this;
    }
    ModelConfigurationManager.prototype.updateConfig = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var currentConfig, newConfig, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        currentConfig = this.configMap.get(modelId) || this.getDefaultConfig(modelId);
                        newConfig = __assign(__assign({}, currentConfig), config);
                        return [4 /*yield*/, this.validateConfig(newConfig)];
                    case 1:
                        _a.sent();
                        this.configMap.set(modelId, newConfig);
                        this.emit('configUpdated', { modelId: modelId, config: newConfig });
                        this.logConfigChange(modelId, currentConfig, newConfig);
                        return [4 /*yield*/, this.persistConfigs()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError('Failed to update configuration', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationManager.prototype.getConfig = function (modelId) {
        return this.configMap.get(modelId) || this.getDefaultConfig(modelId);
    };
    ModelConfigurationManager.prototype.setDefaultConfig = function (modelId, config) {
        this.defaultConfigs.set(modelId, config);
        this.emit('defaultConfigSet', { modelId: modelId, config: config });
    };
    ModelConfigurationManager.prototype.resetConfig = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultConfig, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        defaultConfig = this.getDefaultConfig(modelId);
                        this.configMap.delete(modelId);
                        this.emit('configReset', { modelId: modelId, config: defaultConfig });
                        return [4 /*yield*/, this.persistConfigs()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to reset configuration', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationManager.prototype.getDefaultConfig = function (modelId) {
        return this.defaultConfigs.get(modelId) || {
            maxTokens: 2048,
            temperature: 0.7,
            topP: 0.9,
            presencePenalty: 0,
            frequencyPenalty: 0,
            stopSequences: []
        };
    };
    ModelConfigurationManager.prototype.validateConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var errors;
            return __generator(this, function (_a) {
                errors = [];
                // Validate maxTokens
                if (config.maxTokens < 1) {
                    errors.push('maxTokens must be greater than 0');
                }
                // Validate temperature
                if (config.temperature < 0 || config.temperature > 2) {
                    errors.push('temperature must be between 0 and 2');
                }
                // Validate topP
                if (config.topP < 0 || config.topP > 1) {
                    errors.push('topP must be between 0 and 1');
                }
                // Validate penalties
                if (config.presencePenalty < -2 || config.presencePenalty > 2) {
                    errors.push('presencePenalty must be between -2 and 2');
                }
                if (config.frequencyPenalty < -2 || config.frequencyPenalty > 2) {
                    errors.push('frequencyPenalty must be between -2 and 2');
                }
                // Validate stop sequences
                if (!Array.isArray(config.stopSequences)) {
                    errors.push('stopSequences must be an array');
                }
                if (errors.length > 0) {
                    throw new Error("Configuration validation failed:\n".concat(errors.join('\n')));
                }
                return [2 /*return*/];
            });
        });
    };
    ModelConfigurationManager.prototype.persistConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        configData = Array.from(this.configMap.entries()).map(function (_a) {
                            var id = _a[0], config = _a[1];
                            return ({
                                modelId: id,
                                config: config
                            });
                        });
                        return [4 /*yield*/, vscode.workspace.getConfiguration().update(this.storageKey, configData, vscode.ConfigurationTarget.Global)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        this.handleError('Failed to persist configurations', error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationManager.prototype.loadPersistedConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var configData, _i, configData_1, data, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        configData = vscode.workspace.getConfiguration().get(this.storageKey) || [];
                        _i = 0, configData_1 = configData;
                        _a.label = 1;
                    case 1:
                        if (!(_i < configData_1.length)) return [3 /*break*/, 4];
                        data = configData_1[_i];
                        if (!(data.modelId && data.config)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.validateConfig(data.config)];
                    case 2:
                        _a.sent();
                        this.configMap.set(data.modelId, data.config);
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        this.handleError('Failed to load persisted configurations', error_4);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationManager.prototype.logConfigChange = function (modelId, oldConfig, newConfig) {
        this.outputChannel.appendLine('\nModel Configuration Change:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine('Changes:');
        for (var _i = 0, _a = Object.keys(newConfig); _i < _a.length; _i++) {
            var key = _a[_i];
            if (oldConfig[key] !== newConfig[key]) {
                this.outputChannel.appendLine("  ".concat(key, ": ").concat(oldConfig[key], " -> ").concat(newConfig[key]));
            }
        }
        this.outputChannel.appendLine("Timestamp: ".concat(new Date().toISOString()));
    };
    ModelConfigurationManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelConfigurationManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelConfigurationManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.configMap.clear();
        this.defaultConfigs.clear();
    };
    var _a;
    ModelConfigurationManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object])
    ], ModelConfigurationManager);
    return ModelConfigurationManager;
}(events_1.EventEmitter));
exports.ModelConfigurationManager = ModelConfigurationManager;
