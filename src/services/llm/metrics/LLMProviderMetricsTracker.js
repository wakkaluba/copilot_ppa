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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderMetricsTracker = void 0;
var events_1 = require("events");
var LLMProviderMetricsTracker = /** @class */ (function (_super) {
    __extends(LLMProviderMetricsTracker, _super);
    function LLMProviderMetricsTracker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.metrics = new Map();
        _this.metricsWindow = 1000 * 60 * 60; // 1 hour window
        return _this;
    }
    LLMProviderMetricsTracker.prototype.initializeProvider = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.metrics.set(providerId, {
                    requestCount: 0,
                    successCount: 0,
                    errorCount: 0,
                    tokenUsage: 0,
                    averageResponseTime: 0,
                    requestTimes: [],
                    lastUpdated: Date.now()
                });
                return [2 /*return*/];
            });
        });
    };
    LLMProviderMetricsTracker.prototype.recordSuccess = function (providerId, responseTime, tokens) {
        var _this = this;
        var metrics = this.metrics.get(providerId);
        if (!metrics) {
            return;
        }
        var now = Date.now();
        // Update request times, keeping only those within the window
        metrics.requestTimes = __spreadArray(__spreadArray([], metrics.requestTimes.filter(function (t) { return now - t.timestamp <= _this.metricsWindow; }), true), [
            { timestamp: now, duration: responseTime }
        ], false);
        // Calculate new average response time
        metrics.averageResponseTime = metrics.requestTimes.reduce(function (sum, time) { return sum + time.duration; }, 0) / metrics.requestTimes.length;
        metrics.requestCount++;
        metrics.successCount++;
        metrics.tokenUsage += tokens;
        metrics.lastUpdated = now;
        this.emit('metricsUpdated', {
            providerId: providerId,
            metrics: __assign({}, metrics)
        });
    };
    LLMProviderMetricsTracker.prototype.recordError = function (providerId, error) {
        var metrics = this.metrics.get(providerId);
        if (!metrics) {
            return;
        }
        metrics.requestCount++;
        metrics.errorCount++;
        metrics.lastUpdated = Date.now();
        metrics.lastError = error;
        this.emit('metricsUpdated', {
            providerId: providerId,
            metrics: __assign({}, metrics)
        });
    };
    LLMProviderMetricsTracker.prototype.getMetrics = function (providerId) {
        var metrics = this.metrics.get(providerId);
        return metrics ? __assign({}, metrics) : undefined;
    };
    LLMProviderMetricsTracker.prototype.resetMetrics = function (providerId) {
        this.metrics.delete(providerId);
    };
    LLMProviderMetricsTracker.prototype.dispose = function () {
        this.metrics.clear();
        this.removeAllListeners();
    };
    return LLMProviderMetricsTracker;
}(events_1.EventEmitter));
exports.LLMProviderMetricsTracker = LLMProviderMetricsTracker;
