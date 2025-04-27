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
exports.ConnectionPoolManager = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var ConnectionPoolManager = /** @class */ (function (_super) {
    __extends(ConnectionPoolManager, _super);
    function ConnectionPoolManager() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.pools = new Map();
        _this.healthChecks = new Map();
        return _this;
    }
    ConnectionPoolManager.prototype.initializeProvider = function (providerId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var pool;
            return __generator(this, function (_a) {
                pool = new ProviderConnectionPool(config.poolSize || 1);
                this.pools.set(providerId, pool);
                // Start health monitoring
                this.startHealthCheck(providerId);
                return [2 /*return*/];
            });
        });
    };
    ConnectionPoolManager.prototype.startHealthCheck = function (providerId) {
        var _this = this;
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var pool, health;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.checkHealth()];
                    case 1:
                        health = _a.sent();
                        this.emit('healthCheck', {
                            providerId: providerId,
                            health: health,
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        }); }, 30000); // Check every 30 seconds
        this.healthChecks.set(providerId, interval);
    };
    ConnectionPoolManager.prototype.acquireConnection = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            throw new Error("No connection pool for provider ".concat(providerId));
                        }
                        return [4 /*yield*/, pool.acquire()];
                    case 1:
                        connection = _a.sent();
                        this.emit('connectionStateChanged', {
                            providerId: providerId,
                            state: types_1.ProviderConnectionState.Active,
                            timestamp: new Date()
                        });
                        return [2 /*return*/, connection];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.releaseConnection = function (providerId, connection) {
        return __awaiter(this, void 0, void 0, function () {
            var pool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, pool.release(connection)];
                    case 1:
                        _a.sent();
                        this.emit('connectionStateChanged', {
                            providerId: providerId,
                            state: types_1.ProviderConnectionState.Available,
                            timestamp: new Date()
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.disposeProvider = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var pool, healthCheck;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pool = this.pools.get(providerId);
                        if (!pool) {
                            return [2 /*return*/];
                        }
                        healthCheck = this.healthChecks.get(providerId);
                        if (healthCheck) {
                            clearInterval(healthCheck);
                            this.healthChecks.delete(providerId);
                        }
                        // Dispose pool
                        return [4 /*yield*/, pool.dispose()];
                    case 1:
                        // Dispose pool
                        _a.sent();
                        this.pools.delete(providerId);
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.dispose = function () {
        // Clean up all providers
        for (var _i = 0, _a = this.pools; _i < _a.length; _i++) {
            var providerId = _a[_i][0];
            this.disposeProvider(providerId).catch(console.error);
        }
        this.removeAllListeners();
    };
    return ConnectionPoolManager;
}(events_1.EventEmitter));
exports.ConnectionPoolManager = ConnectionPoolManager;
