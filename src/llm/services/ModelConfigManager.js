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
exports.ModelConfigManager = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var types_1 = require("../types");
var ModelConfigManager = /** @class */ (function (_super) {
    __extends(ModelConfigManager, _super);
    function ModelConfigManager(logger, storage) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.configStore = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Configuration');
        _this.storage = storage;
        _this.loadPersistedConfigs();
        return _this;
    }
    ModelConfigManager.prototype.getConfig = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.configStore.get(modelId)];
                }
                catch (error) {
                    this.handleError('Failed to get model config', error);
                    return [2 /*return*/, undefined];
                }
                return [2 /*return*/];
            });
        });
    };
    ModelConfigManager.prototype.updateConfig = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var currentConfig, newConfig, validation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        currentConfig = this.configStore.get(modelId) || this.createDefaultConfig();
                        newConfig = __assign(__assign({}, currentConfig), config);
                        return [4 /*yield*/, this.validateConfig(newConfig)];
                    case 1:
                        validation = _a.sent();
                        if (!validation.isValid) {
                            throw new Error("Invalid configuration: ".concat(validation.errors.join(', ')));
                        }
                        this.configStore.set(modelId, newConfig);
                        return [4 /*yield*/, this.persistConfig(modelId, newConfig)];
                    case 2:
                        _a.sent();
                        this.emit('configUpdated', modelId, newConfig);
                        this.logConfigUpdate(modelId, newConfig);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.handleError('Failed to update model config', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigManager.prototype.validateConfig = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var errors, warnings;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errors = [];
                        warnings = [];
                        // Validate required fields
                        if (!this.validateRequiredFields(config, errors)) {
                            return [2 /*return*/, { isValid: false, errors: errors, warnings: warnings }];
                        }
                        // Validate numerical ranges
                        this.validateNumericalRanges(config, errors, warnings);
                        // Validate compatibility
                        return [4 /*yield*/, this.validateCompatibility(config, errors, warnings)];
                    case 1:
                        // Validate compatibility
                        _a.sent();
                        return [2 /*return*/, {
                                isValid: errors.length === 0,
                                errors: errors,
                                warnings: warnings
                            }];
                }
            });
        });
    };
    ModelConfigManager.prototype.validateRequiredFields = function (config, errors) {
        var requiredFields = ['contextLength', 'temperature', 'topP'];
        var missingFields = requiredFields.filter(function (field) { return config[field] === undefined; });
        if (missingFields.length > 0) {
            errors.push("Missing required fields: ".concat(missingFields.join(', ')));
            return false;
        }
        return true;
    };
    ModelConfigManager.prototype.validateNumericalRanges = function (config, errors, warnings) {
        // Temperature validation
        if (config.temperature !== undefined) {
            if (config.temperature < 0 || config.temperature > 2) {
                errors.push('Temperature must be between 0 and 2');
            }
            else if (config.temperature > 1.5) {
                warnings.push('High temperature values may lead to less focused outputs');
            }
        }
        // Top-p validation
        if (config.topP !== undefined) {
            if (config.topP < 0 || config.topP > 1) {
                errors.push('Top-p must be between 0 and 1');
            }
        }
        // Context length validation
        if (config.contextLength !== undefined) {
            if (config.contextLength < 0) {
                errors.push('Context length must be positive');
            }
            else if (config.contextLength > 32768) {
                warnings.push('Very large context lengths may impact performance');
            }
        }
    };
    ModelConfigManager.prototype.validateCompatibility = function (config, errors, warnings) {
        return __awaiter(this, void 0, void 0, function () {
            var estimatedMemory, availableMemory;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        estimatedMemory = this.estimateMemoryRequirement(config);
                        return [4 /*yield*/, this.getAvailableMemory()];
                    case 1:
                        availableMemory = _a.sent();
                        if (estimatedMemory > availableMemory) {
                            errors.push('Configuration exceeds available system memory');
                        }
                        else if (estimatedMemory > availableMemory * 0.8) {
                            warnings.push('Configuration may use most available memory');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigManager.prototype.estimateMemoryRequirement = function (config) {
        // Basic memory estimation based on context length and model size
        var bytesPerToken = 4; // Approximate bytes per token
        var baseMemory = 512 * 1024 * 1024; // 512MB base memory
        return baseMemory + (config.contextLength || 2048) * bytesPerToken;
    };
    ModelConfigManager.prototype.getAvailableMemory = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In a real implementation, this would check system memory
                return [2 /*return*/, 16 * 1024 * 1024 * 1024]; // Example: 16GB
            });
        });
    };
    ModelConfigManager.prototype.createDefaultConfig = function () {
        return {
            contextLength: 2048,
            temperature: 0.7,
            topP: 0.95,
            frequencyPenalty: 0,
            presencePenalty: 0,
            stopSequences: [],
            maxTokens: undefined
        };
    };
    ModelConfigManager.prototype.persistConfig = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var key, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        key = "model-config-".concat(modelId);
                        return [4 /*yield*/, this.storage.update(key, config)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this.handleError('Failed to persist config', error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigManager.prototype.loadPersistedConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, configKeys, _i, configKeys_1, key, modelId, config, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.storage.keys()];
                    case 1:
                        keys = _a.sent();
                        configKeys = keys.filter(function (key) { return key.startsWith('model-config-'); });
                        _i = 0, configKeys_1 = configKeys;
                        _a.label = 2;
                    case 2:
                        if (!(_i < configKeys_1.length)) return [3 /*break*/, 5];
                        key = configKeys_1[_i];
                        modelId = key.replace('model-config-', '');
                        return [4 /*yield*/, this.storage.get(key)];
                    case 3:
                        config = _a.sent();
                        if (config) {
                            this.configStore.set(modelId, config);
                        }
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        this.logConfigLoad(configKeys.length);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        this.handleError('Failed to load persisted configs', error_3);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigManager.prototype.logConfigUpdate = function (modelId, config) {
        this.outputChannel.appendLine('\nConfiguration Updated:');
        this.outputChannel.appendLine("Model: ".concat(modelId));
        this.outputChannel.appendLine(JSON.stringify(config, null, 2));
    };
    ModelConfigManager.prototype.logConfigLoad = function (count) {
        this.outputChannel.appendLine("\nLoaded ".concat(count, " model configurations"));
    };
    ModelConfigManager.prototype.handleError = function (message, error) {
        this.logger.error('[ModelConfigManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelConfigManager.prototype.dispose = function () {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.configStore.clear();
    };
    var _a;
    ModelConfigManager = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(types_1.ILogger)),
        __param(1, (0, inversify_1.inject)('GlobalState')),
        __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, Object])
    ], ModelConfigManager);
    return ModelConfigManager;
}(events_1.EventEmitter));
exports.ModelConfigManager = ModelConfigManager;
