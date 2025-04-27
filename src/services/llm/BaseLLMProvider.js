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
exports.BaseLLMProvider = void 0;
var events_1 = require("events");
var interfaces_1 = require("./interfaces");
var llm_1 = require("../../types/llm");
var ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
var errors_1 = require("./errors");
var connectionUtils_1 = require("./connectionUtils");
/**
 * Base class for LLM providers with common functionality
 */
var BaseLLMProvider = /** @class */ (function (_super) {
    __extends(BaseLLMProvider, _super);
    function BaseLLMProvider(name) {
        var _this = _super.call(this) || this;
        _this.name = name;
        _this.connectionState = llm_1.ConnectionState.DISCONNECTED;
        _this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
        return _this;
    }
    /**
     * Connect to the provider
     */
    BaseLLMProvider.prototype.connect = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, endTime, error_1, formattedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.connectionState = llm_1.ConnectionState.CONNECTING;
                        this.emit('stateChanged', this.connectionState);
                        startTime = Date.now();
                        return [4 /*yield*/, this.performConnect(options)];
                    case 1:
                        _a.sent();
                        endTime = Date.now();
                        this.metricsTracker.recordConnectionSuccess();
                        this.metricsTracker.recordRequest(endTime - startTime);
                        this.connectionState = llm_1.ConnectionState.CONNECTED;
                        this.emit('stateChanged', this.connectionState);
                        this.emit('connected');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        formattedError = (0, connectionUtils_1.formatProviderError)(error_1, this.name);
                        this.handleError(formattedError);
                        throw formattedError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnect from the provider
     */
    BaseLLMProvider.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, formattedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.performDisconnect()];
                    case 1:
                        _a.sent();
                        this.connectionState = llm_1.ConnectionState.DISCONNECTED;
                        this.emit('stateChanged', this.connectionState);
                        this.emit('disconnected');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        formattedError = (0, connectionUtils_1.formatProviderError)(error_2, this.name);
                        this.handleError(formattedError);
                        throw formattedError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current connection status
     */
    BaseLLMProvider.prototype.getStatus = function () {
        return {
            state: this.connectionState,
            error: this.lastError,
            modelInfo: this.currentModel,
            metadata: {
                metrics: this.metricsTracker.getMetrics()
            }
        };
    };
    /**
     * Check if provider is available
     */
    BaseLLMProvider.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var health, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.healthCheck()];
                    case 1:
                        health = _b.sent();
                        return [2 /*return*/, health.status === 'ok'];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current model info
     */
    BaseLLMProvider.prototype.getModelInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_3, formattedError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.currentModel) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, this.loadModelInfo()];
                    case 2:
                        _a.currentModel = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        formattedError = (0, connectionUtils_1.formatProviderError)(error_3, this.name);
                        this.handleError(formattedError);
                        throw formattedError;
                    case 4: return [2 /*return*/, this.currentModel];
                }
            });
        });
    };
    /**
     * Set active model
     */
    BaseLLMProvider.prototype.setModel = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var models, model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAvailableModels()];
                    case 1:
                        models = _a.sent();
                        model = models.find(function (m) { return m.id === modelId; });
                        if (!model) {
                            throw new errors_1.ModelNotFoundError(modelId);
                        }
                        return [4 /*yield*/, this.loadModel(model)];
                    case 2:
                        _a.sent();
                        this.currentModel = model;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle provider error
     */
    BaseLLMProvider.prototype.handleError = function (error) {
        this.lastError = error;
        this.emit('error', error);
        if (error instanceof errors_1.LLMConnectionError) {
            if (error.code === interfaces_1.ConnectionErrorCode.PROVIDER_UNAVAILABLE) {
                this.connectionState = llm_1.ConnectionState.DISCONNECTED;
            }
            else {
                this.connectionState = llm_1.ConnectionState.ERROR;
            }
        }
        else {
            this.connectionState = llm_1.ConnectionState.ERROR;
        }
        this.emit('stateChanged', this.connectionState);
        this.metricsTracker.recordRequestFailure(error);
    };
    /**
     * Dispose of provider resources
     */
    BaseLLMProvider.prototype.dispose = function () {
        if (this.connectionState === llm_1.ConnectionState.CONNECTED) {
            this.disconnect().catch(console.error);
        }
        this.removeAllListeners();
    };
    /**
     * Perform model load
     */
    BaseLLMProvider.prototype.performModelLoad = function (modelInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4, formattedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.loadModel(modelInfo)];
                    case 1:
                        _a.sent();
                        this.currentModel = modelInfo;
                        this.emit('modelLoaded', modelInfo);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        formattedError = (0, connectionUtils_1.formatProviderError)(error_4, this.name);
                        this.handleError(formattedError);
                        throw formattedError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Perform model unload
     */
    BaseLLMProvider.prototype.performModelUnload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var previousModel, error_5, formattedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.currentModel) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.performDisconnect()];
                    case 2:
                        _a.sent();
                        previousModel = this.currentModel;
                        this.currentModel = undefined;
                        this.emit('modelUnloaded', previousModel);
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        formattedError = (0, connectionUtils_1.formatProviderError)(error_5, this.name);
                        this.handleError(formattedError);
                        throw formattedError;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return BaseLLMProvider;
}(events_1.EventEmitter));
exports.BaseLLMProvider = BaseLLMProvider;
