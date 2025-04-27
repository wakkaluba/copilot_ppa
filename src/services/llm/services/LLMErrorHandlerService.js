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
exports.LLMErrorHandlerService = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var LLMErrorHandlerService = /** @class */ (function (_super) {
    __extends(LLMErrorHandlerService, _super);
    function LLMErrorHandlerService() {
        var _this = _super.call(this) || this;
        _this.maxRetries = 3;
        _this.baseDelay = 1000; // 1 second
        _this.retryCount = new Map();
        return _this;
    }
    LLMErrorHandlerService.prototype.handleError = function (error, errorContext) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedError, errorId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formattedError = this.formatError(error);
                        errorId = this.generateErrorId(formattedError);
                        this.emit('error', { error: formattedError, errorId: errorId });
                        if (!this.shouldRetry(formattedError)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.handleRetry(errorId, formattedError)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        this.retryCount.delete(errorId);
                        throw formattedError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    LLMErrorHandlerService.prototype.formatError = function (error) {
        if (error instanceof types_1.LLMConnectionError) {
            return error;
        }
        var message = error instanceof Error ? error.message : String(error);
        return new types_1.LLMConnectionError(message, types_1.LLMConnectionErrorCode.Unknown);
    };
    LLMErrorHandlerService.prototype.generateErrorId = function (error) {
        return "".concat(error.code, "-").concat(Date.now());
    };
    LLMErrorHandlerService.prototype.shouldRetry = function (error) {
        var retryableErrors = [
            types_1.LLMConnectionErrorCode.NetworkError,
            types_1.LLMConnectionErrorCode.Timeout,
            types_1.LLMConnectionErrorCode.RateLimited,
            types_1.LLMConnectionErrorCode.ServiceUnavailable
        ];
        return retryableErrors.includes(error.code);
    };
    LLMErrorHandlerService.prototype.handleRetry = function (errorId, error) {
        return __awaiter(this, void 0, void 0, function () {
            var currentRetries, delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        currentRetries = this.retryCount.get(errorId) || 0;
                        if (currentRetries >= this.maxRetries) {
                            this.retryCount.delete(errorId);
                            throw error;
                        }
                        delay = this.calculateRetryDelay(currentRetries);
                        this.retryCount.set(errorId, currentRetries + 1);
                        this.emit('retrying', {
                            error: error,
                            retryCount: currentRetries + 1,
                            delay: delay
                        });
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LLMErrorHandlerService.prototype.calculateRetryDelay = function (retryCount) {
        // Exponential backoff with jitter
        var exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
        var jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    };
    LLMErrorHandlerService.prototype.setRetryStrategy = function (strategy) {
        var _a, _b;
        this.maxRetries = (_a = strategy.maxRetries) !== null && _a !== void 0 ? _a : this.maxRetries;
        this.baseDelay = (_b = strategy.baseDelay) !== null && _b !== void 0 ? _b : this.baseDelay;
    };
    LLMErrorHandlerService.prototype.dispose = function () {
        this.removeAllListeners();
        this.retryCount.clear();
    };
    return LLMErrorHandlerService;
}(events_1.EventEmitter));
exports.LLMErrorHandlerService = LLMErrorHandlerService;
