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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEventEmitter = void 0;
var events_1 = require("events");
var types_1 = require("../types");
var ProviderEventEmitter = /** @class */ (function (_super) {
    __extends(ProviderEventEmitter, _super);
    function ProviderEventEmitter() {
        var _this = _super.call(this) || this;
        _this.setMaxListeners(50); // Support many concurrent provider listeners
        return _this;
    }
    ProviderEventEmitter.getInstance = function () {
        if (!ProviderEventEmitter.instance) {
            ProviderEventEmitter.instance = new ProviderEventEmitter();
        }
        return ProviderEventEmitter.instance;
    };
    ProviderEventEmitter.prototype.emitProviderInit = function (providerId) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.Initialized
        };
        this.emit(types_1.ProviderEvent.Initialized, eventData);
    };
    ProviderEventEmitter.prototype.emitProviderConnect = function (providerId) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.Connected
        };
        this.emit(types_1.ProviderEvent.Connected, eventData);
    };
    ProviderEventEmitter.prototype.emitProviderDisconnect = function (providerId, reason) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.Disconnected,
            metadata: { reason: reason }
        };
        this.emit(types_1.ProviderEvent.Disconnected, eventData);
    };
    ProviderEventEmitter.prototype.emitProviderError = function (providerId, error) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.Error,
            error: error
        };
        this.emit(types_1.ProviderEvent.Error, eventData);
    };
    ProviderEventEmitter.prototype.emitHealthCheck = function (providerId, isHealthy, metrics) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.HealthCheck,
            metadata: { isHealthy: isHealthy, metrics: metrics }
        };
        this.emit(types_1.ProviderEvent.HealthCheck, eventData);
    };
    ProviderEventEmitter.prototype.emitRequestStart = function (providerId, requestId) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.RequestStart,
            metadata: { requestId: requestId }
        };
        this.emit(types_1.ProviderEvent.RequestStart, eventData);
    };
    ProviderEventEmitter.prototype.emitRequestComplete = function (providerId, requestId, duration, tokenUsage) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.RequestComplete,
            metadata: { requestId: requestId, duration: duration, tokenUsage: tokenUsage }
        };
        this.emit(types_1.ProviderEvent.RequestComplete, eventData);
    };
    ProviderEventEmitter.prototype.emitRequestError = function (providerId, requestId, error, duration) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.RequestError,
            error: error,
            metadata: { requestId: requestId, duration: duration }
        };
        this.emit(types_1.ProviderEvent.RequestError, eventData);
    };
    ProviderEventEmitter.prototype.emitProviderDestroy = function (providerId) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.Destroyed
        };
        this.emit(types_1.ProviderEvent.Destroyed, eventData);
    };
    ProviderEventEmitter.prototype.emitConfigChange = function (providerId, changes) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.ConfigChanged,
            metadata: { changes: changes }
        };
        this.emit(types_1.ProviderEvent.ConfigChanged, eventData);
    };
    ProviderEventEmitter.prototype.emitMetricsUpdate = function (providerId, metrics) {
        var eventData = {
            providerId: providerId,
            timestamp: new Date(),
            type: types_1.ProviderEvent.MetricsUpdate,
            metadata: { metrics: metrics }
        };
        this.emit(types_1.ProviderEvent.MetricsUpdate, eventData);
    };
    ProviderEventEmitter.prototype.onProviderEvent = function (event, listener) {
        this.on(event, listener);
    };
    ProviderEventEmitter.prototype.offProviderEvent = function (event, listener) {
        this.off(event, listener);
    };
    ProviderEventEmitter.prototype.clearAllListeners = function () {
        this.removeAllListeners();
    };
    return ProviderEventEmitter;
}(events_1.EventEmitter));
exports.ProviderEventEmitter = ProviderEventEmitter;
