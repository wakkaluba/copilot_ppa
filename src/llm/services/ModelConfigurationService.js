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
exports.ModelConfigurationService = void 0;
var events_1 = require("events");
var logger_1 = require("../../utils/logger");
var ModelConfigurationService = /** @class */ (function () {
    function ModelConfigurationService(persistenceIntervalMs) {
        if (persistenceIntervalMs === void 0) { persistenceIntervalMs = 5000; }
        this.persistenceIntervalMs = persistenceIntervalMs;
        this._configEmitter = new events_1.EventEmitter();
        this._configurations = new Map();
        this._persistenceInterval = null;
        this._logger = logger_1.Logger.for('ModelConfigurationService');
        this.startPersistence();
    }
    ModelConfigurationService.prototype.getConfiguration = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this._configurations.get(modelId)];
                }
                catch (error) {
                    this._logger.error('Failed to get configuration', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelConfigurationService.prototype.setConfiguration = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var currentConfig, validatedConfig, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        currentConfig = this._configurations.get(modelId) || {};
                        return [4 /*yield*/, this.validateConfiguration(__assign(__assign({}, currentConfig), config))];
                    case 1:
                        validatedConfig = _a.sent();
                        this._configurations.set(modelId, validatedConfig);
                        this._configEmitter.emit('configChanged', {
                            modelId: modelId,
                            oldConfig: currentConfig,
                            newConfig: validatedConfig
                        });
                        return [4 /*yield*/, this.persistConfiguration(modelId)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this._logger.error('Failed to set configuration', { modelId: modelId, error: error_1 });
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationService.prototype.validateConfiguration = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Add validation logic here
                    if (!config.modelType) {
                        throw new Error('Model type is required');
                    }
                    // Validate memory requirements
                    if (config.memoryRequirements) {
                        if (config.memoryRequirements < 0) {
                            throw new Error('Memory requirements must be positive');
                        }
                    }
                    // Validate thread count
                    if (config.threadCount) {
                        if (config.threadCount < 1) {
                            throw new Error('Thread count must be at least 1');
                        }
                    }
                    return [2 /*return*/, config];
                }
                catch (error) {
                    this._logger.error('Configuration validation failed', { config: config, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelConfigurationService.prototype.startPersistence = function () {
        var _this = this;
        if (this._persistenceInterval) {
            return;
        }
        this._persistenceInterval = setInterval(function () { return _this.persistAllConfigurations(); }, this.persistenceIntervalMs);
    };
    ModelConfigurationService.prototype.persistConfiguration = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                try {
                    config = this._configurations.get(modelId);
                    if (!config) {
                        return [2 /*return*/];
                    }
                    // Add persistence logic here
                    // This could write to disk, database, etc.
                }
                catch (error) {
                    this._logger.error('Failed to persist configuration', { modelId: modelId, error: error });
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelConfigurationService.prototype.persistAllConfigurations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var persistPromises, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        persistPromises = Array.from(this._configurations.entries())
                            .map(function (_a) {
                            var modelId = _a[0];
                            return _this.persistConfiguration(modelId);
                        });
                        return [4 /*yield*/, Promise.all(persistPromises)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        this._logger.error('Failed to persist configurations', { error: error_2 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ModelConfigurationService.prototype.onConfigurationChanged = function (listener) {
        var _this = this;
        this._configEmitter.on('configChanged', listener);
        return {
            dispose: function () { return _this._configEmitter.removeListener('configChanged', listener); }
        };
    };
    ModelConfigurationService.prototype.dispose = function () {
        if (this._persistenceInterval) {
            clearInterval(this._persistenceInterval);
            this._persistenceInterval = null;
        }
        this._configEmitter.removeAllListeners();
        this._configurations.clear();
    };
    return ModelConfigurationService;
}());
exports.ModelConfigurationService = ModelConfigurationService;
