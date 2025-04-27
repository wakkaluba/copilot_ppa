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
exports.LLMProviderManager = exports.ProviderEvent = void 0;
var events_1 = require("events");
var ConnectionPoolManager_1 = require("./ConnectionPoolManager");
var ProviderFactory_1 = require("../providers/ProviderFactory");
var errors_1 = require("../errors");
// Define missing types locally until we resolve the type conflicts
var ProviderEvent;
(function (ProviderEvent) {
    ProviderEvent["Initialized"] = "provider:initialized";
    ProviderEvent["Removed"] = "provider:removed";
    ProviderEvent["StatusChanged"] = "provider:statusChanged";
    ProviderEvent["MetricsUpdated"] = "provider:metricsUpdated";
})(ProviderEvent || (exports.ProviderEvent = ProviderEvent = {}));
var LLMProviderManager = /** @class */ (function (_super) {
    __extends(LLMProviderManager, _super);
    function LLMProviderManager(connectionManager, hostManager, connectionStatus) {
        var _this = _super.call(this) || this;
        _this.metrics = new Map();
        _this.activeProviders = new Set();
        _this.connectionManager = connectionManager;
        _this.hostManager = hostManager;
        _this.connectionStatus = connectionStatus;
        _this.connectionPool = new ConnectionPoolManager_1.ConnectionPoolManager();
        return _this;
    }
    // Remove the static getInstance method that conflicts with the new constructor
    // The ServiceRegistry will manage the instance lifecycle
    LLMProviderManager.prototype.initializeProvider = function (type, config) {
        return __awaiter(this, void 0, void 0, function () {
            var factory, provider, providerId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factory = ProviderFactory_1.ProviderFactory.getInstance();
                        return [4 /*yield*/, factory.createProvider(type, config)];
                    case 1:
                        provider = _a.sent();
                        providerId = provider.id;
                        // Initialize connection pool for this provider
                        return [4 /*yield*/, this.connectionPool.initializeProvider(providerId, config)];
                    case 2:
                        // Initialize connection pool for this provider
                        _a.sent();
                        // Initialize metrics
                        this.metrics.set(providerId, {
                            requestCount: 0,
                            errorCount: 0,
                            totalLatency: 0,
                            lastUsed: Date.now()
                        });
                        this.activeProviders.add(providerId);
                        // Set as default if none set
                        if (!this.defaultProviderId) {
                            this.defaultProviderId = providerId;
                        }
                        this.emit(ProviderEvent.Initialized, {
                            providerId: providerId,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, providerId];
                }
            });
        });
    };
    LLMProviderManager.prototype.getProvider = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var targetId;
            return __generator(this, function (_a) {
                targetId = providerId || this.defaultProviderId;
                if (!targetId) {
                    throw new errors_1.ProviderError('No provider available', 'unknown');
                }
                if (!this.activeProviders.has(targetId)) {
                    throw new errors_1.ProviderError('Provider not active', targetId);
                }
                return [2 /*return*/, this.connectionPool.acquireConnection(targetId)];
            });
        });
    };
    LLMProviderManager.prototype.releaseProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connectionPool.releaseConnection(provider.id, provider)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.setDefaultProvider = function (providerId) {
        if (!this.activeProviders.has(providerId)) {
            throw new errors_1.ConfigurationError('Provider not active', providerId, 'defaultProvider');
        }
        this.defaultProviderId = providerId;
    };
    LLMProviderManager.prototype.getDefaultProviderId = function () {
        return this.defaultProviderId;
    };
    LLMProviderManager.prototype.generateCompletion = function (prompt, systemPrompt, options) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, start, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider(options === null || options === void 0 ? void 0 : options.providerId)];
                    case 1:
                        provider = _a.sent();
                        start = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, provider.generateCompletion((options === null || options === void 0 ? void 0 : options.model) || 'default', prompt, systemPrompt, options)];
                    case 3:
                        response = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start);
                        return [2 /*return*/, response];
                    case 4:
                        error_1 = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start, true);
                        throw error_1;
                    case 5: return [4 /*yield*/, this.releaseProvider(provider)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.generateChatCompletion = function (messages, options) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, start, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider(options === null || options === void 0 ? void 0 : options.providerId)];
                    case 1:
                        provider = _a.sent();
                        start = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, provider.generateChatCompletion((options === null || options === void 0 ? void 0 : options.model) || 'default', messages, options)];
                    case 3:
                        response = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start);
                        return [2 /*return*/, response];
                    case 4:
                        error_2 = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start, true);
                        throw error_2;
                    case 5: return [4 /*yield*/, this.releaseProvider(provider)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.streamCompletion = function (prompt, systemPrompt, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, start, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider(options === null || options === void 0 ? void 0 : options.providerId)];
                    case 1:
                        provider = _a.sent();
                        start = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, provider.streamCompletion((options === null || options === void 0 ? void 0 : options.model) || 'default', prompt, systemPrompt, options, callback)];
                    case 3:
                        _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start);
                        return [3 /*break*/, 7];
                    case 4:
                        error_3 = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start, true);
                        throw error_3;
                    case 5: return [4 /*yield*/, this.releaseProvider(provider)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.streamChatCompletion = function (messages, options, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, start, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getProvider(options === null || options === void 0 ? void 0 : options.providerId)];
                    case 1:
                        provider = _a.sent();
                        start = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 7]);
                        return [4 /*yield*/, provider.streamChatCompletion((options === null || options === void 0 ? void 0 : options.model) || 'default', messages, options, callback)];
                    case 3:
                        _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start);
                        return [3 /*break*/, 7];
                    case 4:
                        error_4 = _a.sent();
                        this.updateMetrics(provider.id, Date.now() - start, true);
                        throw error_4;
                    case 5: return [4 /*yield*/, this.releaseProvider(provider)];
                    case 6:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    LLMProviderManager.prototype.updateMetrics = function (providerId, latency, isError) {
        if (isError === void 0) { isError = false; }
        var metrics = this.metrics.get(providerId);
        if (!metrics) {
            return;
        }
        metrics.requestCount++;
        metrics.totalLatency += latency;
        if (isError) {
            metrics.errorCount++;
        }
        metrics.lastUsed = Date.now();
    };
    LLMProviderManager.prototype.getMetrics = function (providerId) {
        var metrics = this.metrics.get(providerId);
        if (!metrics) {
            throw new errors_1.ProviderError('Provider not found', providerId);
        }
        return {
            requestCount: metrics.requestCount,
            errorCount: metrics.errorCount,
            averageLatency: metrics.requestCount > 0
                ? metrics.totalLatency / metrics.requestCount
                : 0,
            successRate: metrics.requestCount > 0
                ? (metrics.requestCount - metrics.errorCount) / metrics.requestCount
                : 1,
            lastUsed: metrics.lastUsed
        };
    };
    LLMProviderManager.prototype.getActiveProviders = function () {
        return Array.from(this.activeProviders);
    };
    LLMProviderManager.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connectionPool.dispose()];
                    case 1:
                        _a.sent();
                        this.activeProviders.clear();
                        this.metrics.clear();
                        this.defaultProviderId = undefined;
                        this.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    };
    return LLMProviderManager;
}(events_1.EventEmitter));
exports.LLMProviderManager = LLMProviderManager;
