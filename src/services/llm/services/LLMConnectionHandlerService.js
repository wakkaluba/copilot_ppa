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
exports.LLMConnectionHandlerService = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var errors_1 = require("../errors");
var LLMConnectionHandlerService = /** @class */ (function (_super) {
    __extends(LLMConnectionHandlerService, _super);
    function LLMConnectionHandlerService(options) {
        if (options === void 0) { options = {}; }
        var _a;
        var _this = _super.call(this) || this;
        _this._currentState = types_1.ConnectionState.DISCONNECTED;
        _this._activeProvider = null;
        _this._activeConnection = null;
        _this.options = {
            maxRetries: options.maxRetries || 3,
            initialRetryDelay: options.initialRetryDelay || 1000,
            maxRetryDelay: options.maxRetryDelay || 30000,
            retryBackoffFactor: options.retryBackoffFactor || 2,
            connectionTimeout: options.connectionTimeout || 30000,
            reconnectOnError: (_a = options.reconnectOnError) !== null && _a !== void 0 ? _a : true,
            healthCheckInterval: options.healthCheckInterval || 30000
        };
        return _this;
    }
    Object.defineProperty(LLMConnectionHandlerService.prototype, "currentState", {
        get: function () {
            return this._currentState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LLMConnectionHandlerService.prototype, "activeProvider", {
        get: function () {
            return this._activeProvider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LLMConnectionHandlerService.prototype, "activeProviderName", {
        get: function () {
            var _a;
            return (_a = this._activeProvider) === null || _a === void 0 ? void 0 : _a.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(LLMConnectionHandlerService.prototype, "lastError", {
        get: function () {
            return this._lastError;
        },
        enumerable: false,
        configurable: true
    });
    LLMConnectionHandlerService.prototype.setActiveProvider = function (provider) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._activeConnection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.disconnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this._activeProvider = provider;
                        this._currentState = types_1.ConnectionState.DISCONNECTED;
                        this.emit('providerChanged', provider);
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMConnectionHandlerService.prototype.connect = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this._activeProvider) {
                            throw new errors_1.LLMConnectionError(errors_1.LLMConnectionErrorCode.ProviderNotFound, 'No active provider set');
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        this._currentState = types_1.ConnectionState.CONNECTING;
                        this.emit('stateChanged', this._currentState);
                        return [4 /*yield*/, connection.connect(__assign(__assign({}, this.options), { provider: this._activeProvider }))];
                    case 2:
                        _c.sent();
                        this._activeConnection = connection;
                        this._currentState = types_1.ConnectionState.CONNECTED;
                        this._lastError = undefined;
                        _a = this.emit;
                        _b = ['connected'];
                        return [4 /*yield*/, this.getConnectionStatus()];
                    case 3:
                        _a.apply(this, _b.concat([_c.sent()]));
                        this.emit('stateChanged', this._currentState);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        this._lastError = error_1 instanceof Error ? error_1 : new Error(String(error_1));
                        this._currentState = types_1.ConnectionState.ERROR;
                        this.emit('error', this._lastError);
                        this.emit('stateChanged', this._currentState);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    LLMConnectionHandlerService.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._activeConnection) return [3 /*break*/, 5];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this._activeConnection.disconnect()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Error disconnecting:', error_2);
                        return [3 /*break*/, 4];
                    case 4:
                        this._activeConnection = null;
                        _a.label = 5;
                    case 5:
                        this._currentState = types_1.ConnectionState.DISCONNECTED;
                        this.emit('disconnected');
                        this.emit('stateChanged', this._currentState);
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMConnectionHandlerService.prototype.getConnectionStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            var _b;
            var _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _b = {
                            state: this._currentState,
                            provider: ((_c = this._activeProvider) === null || _c === void 0 ? void 0 : _c.name) || 'unknown'
                        };
                        if (!this._activeConnection) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._activeConnection.getModelInfo()];
                    case 1:
                        _a = _e.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _a = undefined;
                        _e.label = 3;
                    case 3: return [2 /*return*/, (_b.modelInfo = _a,
                            _b.error = (_d = this._lastError) === null || _d === void 0 ? void 0 : _d.message,
                            _b)];
                }
            });
        });
    };
    LLMConnectionHandlerService.prototype.dispose = function () {
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    };
    return LLMConnectionHandlerService;
}(events_1.EventEmitter));
exports.LLMConnectionHandlerService = LLMConnectionHandlerService;
