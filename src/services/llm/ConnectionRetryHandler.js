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
exports.ConnectionRetryHandler = void 0;
var events_1 = require("events");
var types_1 = require("./types");
var ConnectionRetryHandler = /** @class */ (function (_super) {
    __extends(ConnectionRetryHandler, _super);
    function ConnectionRetryHandler() {
        var _this = _super.call(this) || this;
        _this.retryTimeouts = new Map();
        return _this;
    }
    ConnectionRetryHandler.getInstance = function () {
        if (!this.instance) {
            this.instance = new ConnectionRetryHandler();
        }
        return this.instance;
    };
    ConnectionRetryHandler.prototype.retry = function (providerId, operation, config) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1, delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, operation()];
                    case 1:
                        _a.sent();
                        this.resetRetry(providerId);
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        if (!this.isRetryableError(error_1) || config.currentAttempt >= config.maxAttempts) {
                            throw error_1;
                        }
                        delay = this.calculateBackoff(config);
                        config.currentAttempt++;
                        this.emit('retrying', {
                            providerId: providerId,
                            attempt: config.currentAttempt,
                            delay: delay,
                            error: error_1
                        });
                        return [4 /*yield*/, this.scheduleRetry(providerId, operation, config, delay)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionRetryHandler.prototype.isRetryableError = function (error) {
        if (error instanceof types_1.LLMConnectionError) {
            return [
                types_1.LLMConnectionErrorCode.ConnectionFailed,
                types_1.LLMConnectionErrorCode.NetworkError,
                types_1.LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }
        return true;
    };
    ConnectionRetryHandler.prototype.calculateBackoff = function (config) {
        var backoffDelay = config.baseDelay * Math.pow(config.backoffFactor, config.currentAttempt);
        return Math.min(backoffDelay, config.maxDelay);
    };
    ConnectionRetryHandler.prototype.scheduleRetry = function (providerId, operation, config, delay) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.clearExistingRetry(providerId);
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var timeout = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, this.retry(providerId, operation, config)];
                                    case 1:
                                        _a.sent();
                                        resolve();
                                        return [3 /*break*/, 4];
                                    case 2:
                                        error_2 = _a.sent();
                                        reject(error_2);
                                        return [3 /*break*/, 4];
                                    case 3:
                                        this.retryTimeouts.delete(providerId);
                                        return [7 /*endfinally*/];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }, delay);
                        _this.retryTimeouts.set(providerId, timeout);
                    })];
            });
        });
    };
    ConnectionRetryHandler.prototype.clearExistingRetry = function (providerId) {
        var existingTimeout = this.retryTimeouts.get(providerId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.retryTimeouts.delete(providerId);
        }
    };
    ConnectionRetryHandler.prototype.resetRetry = function (providerId) {
        this.clearExistingRetry(providerId);
    };
    ConnectionRetryHandler.prototype.dispose = function () {
        for (var _i = 0, _a = this.retryTimeouts.values(); _i < _a.length; _i++) {
            var timeout = _a[_i];
            clearTimeout(timeout);
        }
        this.retryTimeouts.clear();
        this.removeAllListeners();
    };
    return ConnectionRetryHandler;
}(events_1.EventEmitter));
exports.ConnectionRetryHandler = ConnectionRetryHandler;
