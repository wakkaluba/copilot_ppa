"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderEventEmitter = void 0;
const events_1 = require("events");
const types_1 = require("../types");
class ProviderEventEmitter extends events_1.EventEmitter {
    static instance;
    constructor() {
        super();
        this.setMaxListeners(50); // Support many concurrent provider listeners
    }
    static getInstance() {
        if (!ProviderEventEmitter.instance) {
            ProviderEventEmitter.instance = new ProviderEventEmitter();
        }
        return ProviderEventEmitter.instance;
    }
    emitProviderInit(providerId) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.Initialized
        };
        this.emit(types_1.ProviderEvent.Initialized, eventData);
    }
    emitProviderConnect(providerId) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.Connected
        };
        this.emit(types_1.ProviderEvent.Connected, eventData);
    }
    emitProviderDisconnect(providerId, reason) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.Disconnected,
            metadata: { reason }
        };
        this.emit(types_1.ProviderEvent.Disconnected, eventData);
    }
    emitProviderError(providerId, error) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.Error,
            error
        };
        this.emit(types_1.ProviderEvent.Error, eventData);
    }
    emitHealthCheck(providerId, isHealthy, metrics) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.HealthCheck,
            metadata: { isHealthy, metrics }
        };
        this.emit(types_1.ProviderEvent.HealthCheck, eventData);
    }
    emitRequestStart(providerId, requestId) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.RequestStart,
            metadata: { requestId }
        };
        this.emit(types_1.ProviderEvent.RequestStart, eventData);
    }
    emitRequestComplete(providerId, requestId, duration, tokenUsage) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.RequestComplete,
            metadata: { requestId, duration, tokenUsage }
        };
        this.emit(types_1.ProviderEvent.RequestComplete, eventData);
    }
    emitRequestError(providerId, requestId, error, duration) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.RequestError,
            error,
            metadata: { requestId, duration }
        };
        this.emit(types_1.ProviderEvent.RequestError, eventData);
    }
    emitProviderDestroy(providerId) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.Destroyed
        };
        this.emit(types_1.ProviderEvent.Destroyed, eventData);
    }
    emitConfigChange(providerId, changes) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.ConfigChanged,
            metadata: { changes }
        };
        this.emit(types_1.ProviderEvent.ConfigChanged, eventData);
    }
    emitMetricsUpdate(providerId, metrics) {
        const eventData = {
            providerId,
            timestamp: Date.now(),
            type: types_1.ProviderEvent.MetricsUpdate,
            metadata: { metrics }
        };
        this.emit(types_1.ProviderEvent.MetricsUpdate, eventData);
    }
    onProviderEvent(event, listener) {
        this.on(event, listener);
    }
    offProviderEvent(event, listener) {
        this.off(event, listener);
    }
    clearAllListeners() {
        this.removeAllListeners();
    }
}
exports.ProviderEventEmitter = ProviderEventEmitter;
//# sourceMappingURL=ProviderEventEmitter.js.map