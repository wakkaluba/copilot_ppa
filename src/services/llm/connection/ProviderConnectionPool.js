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
exports.ProviderConnectionPool = void 0;
var ProviderConnectionPool = /** @class */ (function () {
    function ProviderConnectionPool(maxSize) {
        this.connections = [];
        this.maxSize = maxSize;
    }
    ProviderConnectionPool.prototype.acquire = function () {
        return __awaiter(this, void 0, void 0, function () {
            var available, provider;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        available = this.connections.find(function (c) { return !c.isActive; });
                        if (available) {
                            available.isActive = true;
                            available.lastUsed = Date.now();
                            return [2 /*return*/, available.provider];
                        }
                        if (!(this.connections.length < this.maxSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createConnection()];
                    case 1:
                        provider = _a.sent();
                        this.connections.push({
                            provider: provider,
                            lastUsed: Date.now(),
                            isActive: true
                        });
                        return [2 /*return*/, provider];
                    case 2: 
                    // Wait for a connection to become available
                    return [2 /*return*/, new Promise(function (resolve) {
                            var checkInterval = setInterval(function () {
                                var conn = _this.connections.find(function (c) { return !c.isActive; });
                                if (conn) {
                                    clearInterval(checkInterval);
                                    conn.isActive = true;
                                    conn.lastUsed = Date.now();
                                    resolve(conn.provider);
                                }
                            }, 100);
                        })];
                }
            });
        });
    };
    ProviderConnectionPool.prototype.release = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                connection = this.connections.find(function (c) { return c.provider === provider; });
                if (connection) {
                    connection.isActive = false;
                    connection.lastUsed = Date.now();
                }
                return [2 /*return*/];
            });
        });
    };
    ProviderConnectionPool.prototype.checkHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, healthy;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.connections.map(function (conn) { return __awaiter(_this, void 0, void 0, function () {
                            var start, error_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        start = Date.now();
                                        return [4 /*yield*/, conn.provider.healthCheck()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, {
                                                isHealthy: true,
                                                latency: Date.now() - start,
                                                timestamp: new Date()
                                            }];
                                    case 2:
                                        error_1 = _a.sent();
                                        return [2 /*return*/, {
                                                isHealthy: false,
                                                latency: -1,
                                                timestamp: new Date(),
                                                error: error_1 instanceof Error ? error_1 : new Error(String(error_1))
                                            }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 1:
                        results = _a.sent();
                        healthy = results.filter(function (r) { return r.isHealthy; });
                        return [2 /*return*/, {
                                isHealthy: healthy.length > 0,
                                latency: healthy.reduce(function (sum, r) { return sum + r.latency; }, 0) / healthy.length,
                                timestamp: new Date(),
                                details: {
                                    totalConnections: this.connections.length,
                                    healthyConnections: healthy.length,
                                    results: results
                                }
                            }];
                }
            });
        });
    };
    ProviderConnectionPool.prototype.createConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // This should be implemented by the specific provider implementation
                throw new Error('createConnection must be implemented by provider');
            });
        });
    };
    ProviderConnectionPool.prototype.dispose = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(this.connections.map(function (conn) { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, conn.provider.disconnect()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_2 = _a.sent();
                                        console.error('Error disconnecting provider:', error_2);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                    case 1:
                        _a.sent();
                        this.connections = [];
                        return [2 /*return*/];
                }
            });
        });
    };
    return ProviderConnectionPool;
}());
exports.ProviderConnectionPool = ProviderConnectionPool;
