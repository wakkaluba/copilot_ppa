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
exports.ConnectionPoolManager = exports.ProviderEvent = exports.ProviderConnectionState = void 0;
var events_1 = require("events");
var errors_1 = require("../errors");
var ProviderFactory_1 = require("../providers/ProviderFactory");
// Define missing types that were previously imported
var ProviderConnectionState;
(function (ProviderConnectionState) {
    ProviderConnectionState["Disconnected"] = "disconnected";
    ProviderConnectionState["Connecting"] = "connecting";
    ProviderConnectionState["Connected"] = "connected";
    ProviderConnectionState["Error"] = "error";
})(ProviderConnectionState || (exports.ProviderConnectionState = ProviderConnectionState = {}));
var ProviderEvent;
(function (ProviderEvent) {
    ProviderEvent["Connected"] = "provider:connected";
    ProviderEvent["Disconnected"] = "provider:disconnected";
    ProviderEvent["Error"] = "provider:error";
    ProviderEvent["HealthCheckComplete"] = "provider:healthcheck";
})(ProviderEvent || (exports.ProviderEvent = ProviderEvent = {}));
var ConnectionPoolManager = /** @class */ (function (_super) {
    __extends(ConnectionPoolManager, _super);
    function ConnectionPoolManager() {
        var _this = _super.call(this) || this;
        _this.pools = new Map();
        _this.poolConfigs = new Map();
        _this.startMaintenanceTimer();
        return _this;
    }
    ConnectionPoolManager.prototype.startMaintenanceTimer = function () {
        var _this = this;
        this.maintenanceTimer = setInterval(function () {
            _this.performPoolMaintenance();
        }, 60000); // Run maintenance every minute
    };
    ConnectionPoolManager.prototype.performPoolMaintenance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, _i, _a, _b, providerId, pool, config, _c, pool_1, _d, connectionId, connection, activeConnections, error_1;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        now = Date.now();
                        _i = 0, _a = this.pools;
                        _e.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        _b = _a[_i], providerId = _b[0], pool = _b[1];
                        config = this.poolConfigs.get(providerId);
                        if (!config) {
                            return [3 /*break*/, 9];
                        }
                        _c = 0, pool_1 = pool;
                        _e.label = 2;
                    case 2:
                        if (!(_c < pool_1.length)) return [3 /*break*/, 5];
                        _d = pool_1[_c], connectionId = _d[0], connection = _d[1];
                        if (!(!connection.isInUse &&
                            now - connection.lastUsed > config.idleTimeoutMs)) return [3 /*break*/, 4];
                        // Remove idle connection
                        return [4 /*yield*/, this.removeConnection(providerId, connectionId)];
                    case 3:
                        // Remove idle connection
                        _e.sent();
                        _e.label = 4;
                    case 4:
                        _c++;
                        return [3 /*break*/, 2];
                    case 5:
                        activeConnections = Array.from(pool.values())
                            .filter(function (conn) { return !conn.isInUse; }).length;
                        if (!(activeConnections < config.minSize)) return [3 /*break*/, 9];
                        _e.label = 6;
                    case 6:
                        _e.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this.addConnection(providerId)];
                    case 7:
                        _e.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _e.sent();
                        console.error("Failed to maintain minimum pool size for provider ".concat(providerId, ":"), error_1);
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.initializeProvider = function (providerId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var poolConfig, i;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.pools.has(providerId)) {
                            this.pools.set(providerId, new Map());
                        }
                        this.poolConfigs.set(providerId, {
                            minSize: ((_a = config.connection) === null || _a === void 0 ? void 0 : _a.poolSize) || 1,
                            maxSize: ((_b = config.connection) === null || _b === void 0 ? void 0 : _b.poolSize) || 5,
                            idleTimeoutMs: 300000, // 5 minutes
                            acquireTimeoutMs: ((_c = config.connection) === null || _c === void 0 ? void 0 : _c.timeout) || 30000
                        });
                        poolConfig = this.poolConfigs.get(providerId);
                        i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(i < poolConfig.minSize)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.addConnection(providerId)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.addConnection = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, config, connectionId, provider, _a, _b, _c, error_2;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        config = this.poolConfigs.get(providerId);
                        if (!pool || !config) {
                            throw new errors_1.ConnectionError('Provider not initialized', providerId, 'NOT_INITIALIZED');
                        }
                        if (pool.size >= config.maxSize) {
                            throw new errors_1.ConnectionError('Connection pool is full', providerId, 'POOL_FULL');
                        }
                        connectionId = "".concat(providerId, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, this.createProviderInstance(providerId)];
                    case 2:
                        provider = _e.sent();
                        // Initialize connection
                        return [4 /*yield*/, provider.connect()];
                    case 3:
                        // Initialize connection
                        _e.sent();
                        // Add to pool
                        _b = (_a = pool).set;
                        _c = [connectionId];
                        _d = {
                            provider: provider,
                            lastUsed: Date.now(),
                            isInUse: false
                        };
                        return [4 /*yield*/, provider.healthCheck()];
                    case 4:
                        // Add to pool
                        _b.apply(_a, _c.concat([(_d.healthStatus = _e.sent(),
                                _d)]));
                        return [2 /*return*/, connectionId];
                    case 5:
                        error_2 = _e.sent();
                        throw new errors_1.ConnectionError('Failed to create connection', providerId, 'CONNECTION_FAILED', error_2 instanceof Error ? error_2 : undefined);
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.removeConnection = function (providerId, connectionId) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            return [2 /*return*/];
                        }
                        connection = pool.get(connectionId);
                        if (!connection) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, connection.provider.dispose()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        pool.delete(connectionId);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.acquireConnection = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, config, _i, pool_2, _a, connectionId, connection, connectionId, connection;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        config = this.poolConfigs.get(providerId);
                        if (!pool || !config) {
                            throw new errors_1.ConnectionError('Provider not initialized', providerId, 'NOT_INITIALIZED');
                        }
                        // First, try to find an available healthy connection
                        for (_i = 0, pool_2 = pool; _i < pool_2.length; _i++) {
                            _a = pool_2[_i], connectionId = _a[0], connection = _a[1];
                            if (!connection.isInUse && connection.healthStatus.isHealthy) {
                                connection.isInUse = true;
                                connection.lastUsed = Date.now();
                                return [2 /*return*/, connection.provider];
                            }
                        }
                        if (!(pool.size < config.maxSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.addConnection(providerId)];
                    case 1:
                        connectionId = _b.sent();
                        connection = pool.get(connectionId);
                        connection.isInUse = true;
                        return [2 /*return*/, connection.provider];
                    case 2: 
                    // Wait for a connection to become available
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var timeout = setTimeout(function () {
                                reject(new errors_1.ConnectionError('Timeout waiting for available connection', providerId, 'ACQUIRE_TIMEOUT'));
                            }, config.acquireTimeoutMs);
                            var checkForConnection = function () {
                                for (var _i = 0, pool_3 = pool; _i < pool_3.length; _i++) {
                                    var _a = pool_3[_i], connectionId = _a[0], connection = _a[1];
                                    if (!connection.isInUse && connection.healthStatus.isHealthy) {
                                        clearTimeout(timeout);
                                        connection.isInUse = true;
                                        connection.lastUsed = Date.now();
                                        resolve(connection.provider);
                                        return;
                                    }
                                }
                                setTimeout(checkForConnection, 100);
                            };
                            checkForConnection();
                        })];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.releaseConnection = function (providerId, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, _i, pool_4, _a, connectionId, connection, _b, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            return [2 /*return*/];
                        }
                        _i = 0, pool_4 = pool;
                        _c.label = 1;
                    case 1:
                        if (!(_i < pool_4.length)) return [3 /*break*/, 10];
                        _a = pool_4[_i], connectionId = _a[0], connection = _a[1];
                        if (!(connection.provider === provider)) return [3 /*break*/, 9];
                        connection.isInUse = false;
                        connection.lastUsed = Date.now();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 8]);
                        _b = connection;
                        return [4 /*yield*/, provider.healthCheck()];
                    case 3:
                        _b.healthStatus = _c.sent();
                        if (!!connection.healthStatus.isHealthy) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.removeConnection(providerId, connectionId)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        error_3 = _c.sent();
                        return [4 /*yield*/, this.removeConnection(providerId, connectionId)];
                    case 7:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.createProviderInstance = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var factory, defaultConfig, providerType;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        factory = ProviderFactory_1.ProviderFactory.getInstance();
                        defaultConfig = {
                            apiEndpoint: 'http://localhost:11434', // Default for Ollama
                            id: providerId,
                            name: providerId,
                            defaultModel: 'llama2'
                        };
                        providerType = 'ollama';
                        if (providerId.includes('llamaapi')) {
                            providerType = 'llamaapi';
                        }
                        else if (providerId.includes('lmstudio')) {
                            providerType = 'lmstudio';
                        }
                        return [4 /*yield*/, factory.createProvider(providerType, defaultConfig)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.dispose = function () {
        if (this.maintenanceTimer) {
            clearInterval(this.maintenanceTimer);
        }
        // Clean up all connections
        for (var _i = 0, _a = this.pools; _i < _a.length; _i++) {
            var _b = _a[_i], providerId = _b[0], pool = _b[1];
            for (var _c = 0, pool_5 = pool; _c < pool_5.length; _c++) {
                var connectionId = pool_5[_c][0];
                this.removeConnection(providerId, connectionId).catch(console.error);
            }
        }
        this.pools.clear();
        this.poolConfigs.clear();
        this.removeAllListeners();
    };
    return ConnectionPoolManager;
}(events_1.EventEmitter));
exports.ConnectionPoolManager = ConnectionPoolManager;
