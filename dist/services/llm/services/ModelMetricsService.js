"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelMetricsService = void 0;
const events_1 = require("events");
const inversify_1 = require("inversify");
const logger_1 = require("../../../utils/logger");
const types_1 = require("../types");
const IStorageService_1 = require("../../storage/IStorageService");
let ModelMetricsService = class ModelMetricsService extends events_1.EventEmitter {
    constructor(logger, storage) {
        super();
        this.logger = logger;
        this.storage = storage;
        this.metrics = new Map();
        this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        this.aggregationInterval = 5 * 60 * 1000; // 5 minutes
        this.aggregationTimer = null;
        this.startAggregation();
    }
    /**
     * Record metrics for a model
     */
    async recordMetrics(modelId, metrics) {
        try {
            const current = this.metrics.get(modelId) || this.createDefaultMetrics();
            const updated = {
                ...current,
                ...metrics,
                lastUpdated: Date.now()
            };
            this.metrics.set(modelId, updated);
            await this.persistMetrics(modelId);
            this.emit(types_1.ModelEvents.MetricsUpdated, {
                modelId,
                metrics: updated
            });
        }
        catch (error) {
            this.handleError('Failed to record metrics', error);
            throw error;
        }
    }
    /**
     * Get current metrics for a model
     */
    getMetrics(modelId) {
        return this.metrics.get(modelId);
    }
    /**
     * Get aggregated metrics for all models
     */
    getAggregatedMetrics() {
        return new Map(this.metrics);
    }
    createDefaultMetrics() {
        return {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            tokenUsage: 0,
            memoryUsage: 0,
            lastUpdated: Date.now()
        };
    }
    async persistMetrics(modelId) {
        try {
            const metrics = this.metrics.get(modelId);
            if (metrics) {
                await this.storage.set(`metrics:${modelId}`, metrics);
            }
        }
        catch (error) {
            this.handleError('Failed to persist metrics', error);
        }
    }
    startAggregation() {
        this.aggregationTimer = setInterval(() => {
            this.aggregateMetrics();
        }, this.aggregationInterval);
    }
    aggregateMetrics() {
        try {
            const now = Date.now();
            const cutoff = now - this.retentionPeriod;
            // Clean up old metrics
            for (const [modelId, metrics] of this.metrics.entries()) {
                if (metrics.lastUpdated < cutoff) {
                    this.metrics.delete(modelId);
                    this.emit(types_1.ModelEvents.MetricsExpired, { modelId });
                }
            }
            this.emit(types_1.ModelEvents.MetricsAggregated, {
                timestamp: now,
                metrics: this.getAggregatedMetrics()
            });
        }
        catch (error) {
            this.handleError('Failed to aggregate metrics', error);
        }
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
            this.aggregationTimer = null;
        }
        this.removeAllListeners();
        this.metrics.clear();
    }
};
exports.ModelMetricsService = ModelMetricsService;
exports.ModelMetricsService = ModelMetricsService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(IStorageService_1.IStorageService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof IStorageService_1.IStorageService !== "undefined" && IStorageService_1.IStorageService) === "function" ? _b : Object])
], ModelMetricsService);
//# sourceMappingURL=ModelMetricsService.js.map