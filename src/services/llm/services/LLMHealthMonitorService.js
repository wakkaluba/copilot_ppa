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
exports.LLMHealthMonitorService = void 0;
var events_1 = require("events");
var LLMHealthMonitorService = /** @class */ (function (_super) {
    __extends(LLMHealthMonitorService, _super);
    function LLMHealthMonitorService(eventManager, healthCheckCallback) {
        var _this = _super.call(this) || this;
        _this.eventManager = eventManager;
        _this.healthCheckCallback = healthCheckCallback;
        _this.healthStatus = new Map();
        _this.checkIntervals = new Map();
        _this.DEFAULT_CHECK_INTERVAL = 60000; // 1 minute
        _this.setupEventListeners();
        return _this;
    }
    LLMHealthMonitorService.prototype.setupEventListeners = function () {
        var _this = this;
        this.eventManager.on('stateChange', function (_a) {
            var providerId = _a.providerId, newState = _a.newState;
            _this.handleStateChange(providerId, newState);
        });
    };
    LLMHealthMonitorService.prototype.handleStateChange = function (providerId, state) {
        if (state === 'connected') {
            this.startHealthChecks(providerId);
        }
        else if (state === 'disconnected') {
            this.stopHealthChecks(providerId);
        }
    };
    LLMHealthMonitorService.prototype.performHealthCheck = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, status_1, error_1, status_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!this.healthCheckCallback) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.healthCheckCallback(providerId)];
                    case 1:
                        result = _b.sent();
                        this.updateHealthStatus(providerId, result);
                        return [2 /*return*/, result];
                    case 2:
                        status_1 = {
                            isHealthy: true,
                            latency: 0,
                            lastCheck: Date.now(),
                            errorCount: 0
                        };
                        this.updateHealthStatus(providerId, { status: status_1 });
                        return [2 /*return*/, { status: status_1 }];
                    case 3:
                        error_1 = _b.sent();
                        status_2 = {
                            isHealthy: false,
                            latency: -1,
                            lastCheck: Date.now(),
                            errorCount: (((_a = this.healthStatus.get(providerId)) === null || _a === void 0 ? void 0 : _a.errorCount) || 0) + 1,
                            lastError: error_1 instanceof Error ? error_1.message : String(error_1)
                        };
                        this.updateHealthStatus(providerId, { status: status_2 });
                        return [2 /*return*/, { status: status_2, error: error_1 }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    LLMHealthMonitorService.prototype.updateHealthStatus = function (providerId, result) {
        this.healthStatus.set(providerId, result.status);
        this.emit('healthUpdate', __assign({ providerId: providerId }, result));
    };
    LLMHealthMonitorService.prototype.startHealthChecks = function (providerId, interval) {
        var _this = this;
        if (interval === void 0) { interval = this.DEFAULT_CHECK_INTERVAL; }
        if (this.checkIntervals.has(providerId)) {
            return;
        }
        var timer = setInterval(function () {
            _this.performHealthCheck(providerId);
        }, interval);
        this.checkIntervals.set(providerId, timer);
    };
    LLMHealthMonitorService.prototype.stopHealthChecks = function (providerId) {
        var timer = this.checkIntervals.get(providerId);
        if (timer) {
            clearInterval(timer);
            this.checkIntervals.delete(providerId);
        }
    };
    LLMHealthMonitorService.prototype.getHealthStatus = function (providerId) {
        return this.healthStatus.get(providerId);
    };
    LLMHealthMonitorService.prototype.dispose = function () {
        this.removeAllListeners();
        for (var _i = 0, _a = this.checkIntervals.values(); _i < _a.length; _i++) {
            var timer = _a[_i];
            clearInterval(timer);
        }
        this.checkIntervals.clear();
        this.healthStatus.clear();
    };
    return LLMHealthMonitorService;
}(events_1.EventEmitter));
exports.LLMHealthMonitorService = LLMHealthMonitorService;
