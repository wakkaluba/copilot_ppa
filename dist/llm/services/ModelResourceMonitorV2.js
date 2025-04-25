"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelResourceMonitorV2 = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelResourceMonitorV2 = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelResourceMonitorV2 = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelResourceMonitorV2 = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        hardwareManager;
        systemManager;
        config;
        metricsHistory = new Map();
        monitoringIntervals = new Map();
        outputChannel;
        constructor(logger, hardwareManager, systemManager, config = {
            checkInterval: 5000,
            warningThresholds: {
                cpuPercent: 80,
                memoryPercent: 80,
                gpuPercent: 80
            },
            criticalThresholds: {
                cpuPercent: 90,
                memoryPercent: 90,
                gpuPercent: 90
            }
        }) {
            super();
            this.logger = logger;
            this.hardwareManager = hardwareManager;
            this.systemManager = systemManager;
            this.config = config;
            this.outputChannel = vscode.window.createOutputChannel('Model Resource Monitor');
        }
        async startMonitoring(modelId) {
            try {
                if (this.monitoringIntervals.has(modelId)) {
                    return;
                }
                await this.initializeMetrics(modelId);
                const interval = setInterval(() => this.collectMetrics(modelId), this.config.checkInterval);
                this.monitoringIntervals.set(modelId, interval);
                this.emit('monitoringStarted', { modelId });
                this.logger.info(`Started resource monitoring for model ${modelId}`);
            }
            catch (error) {
                this.handleError(`Failed to start monitoring for model ${modelId}`, error);
                throw error;
            }
        }
        stopMonitoring(modelId) {
            try {
                const interval = this.monitoringIntervals.get(modelId);
                if (interval) {
                    clearInterval(interval);
                    this.monitoringIntervals.delete(modelId);
                    this.emit('monitoringStopped', { modelId });
                    this.logger.info(`Stopped resource monitoring for model ${modelId}`);
                }
            }
            catch (error) {
                this.handleError(`Failed to stop monitoring for model ${modelId}`, error);
            }
        }
        async initializeMetrics(modelId) {
            const initialMetrics = await this.gatherResourceMetrics();
            this.metricsHistory.set(modelId, [initialMetrics]);
        }
        async collectMetrics(modelId) {
            try {
                const metrics = await this.gatherResourceMetrics();
                const history = this.metricsHistory.get(modelId) || [];
                history.push(metrics);
                // Keep last hour of metrics (720 samples at 5s interval)
                while (history.length > 720) {
                    history.shift();
                }
                this.metricsHistory.set(modelId, history);
                this.checkThresholds(modelId, metrics);
                this.emit('metricsUpdated', { modelId, metrics });
                this.logMetrics(modelId, metrics);
            }
            catch (error) {
                this.handleError(`Failed to collect metrics for model ${modelId}`, error);
            }
        }
        async gatherResourceMetrics() {
            const [systemMetrics, hardwareInfo] = await Promise.all([
                this.systemManager.getSystemMetrics(),
                this.hardwareManager.getHardwareInfo()
            ]);
            return {
                timestamp: Date.now(),
                cpu: {
                    usage: systemMetrics.resources.cpuUsagePercent,
                    temperature: hardwareInfo.cpu?.temperature
                },
                memory: {
                    used: systemMetrics.resources.totalMemoryBytes - systemMetrics.resources.freeMemoryBytes,
                    total: systemMetrics.resources.totalMemoryBytes,
                    percent: ((systemMetrics.resources.totalMemoryBytes - systemMetrics.resources.freeMemoryBytes) /
                        systemMetrics.resources.totalMemoryBytes) * 100
                },
                ...(hardwareInfo.gpu ? {
                    gpu: {
                        usage: hardwareInfo.gpu.utilizationPercent,
                        memory: {
                            used: hardwareInfo.gpu.memoryUsed,
                            total: hardwareInfo.gpu.memoryTotal
                        },
                        temperature: hardwareInfo.gpu.temperature
                    }
                } : {})
            };
        }
        checkThresholds(modelId, metrics) {
            // Check CPU usage
            if (metrics.cpu.usage >= this.config.criticalThresholds.cpuPercent) {
                this.emit('resourceCritical', {
                    modelId,
                    resource: 'cpu',
                    value: metrics.cpu.usage
                });
            }
            else if (metrics.cpu.usage >= this.config.warningThresholds.cpuPercent) {
                this.emit('resourceWarning', {
                    modelId,
                    resource: 'cpu',
                    value: metrics.cpu.usage
                });
            }
            // Check memory usage
            if (metrics.memory.percent >= this.config.criticalThresholds.memoryPercent) {
                this.emit('resourceCritical', {
                    modelId,
                    resource: 'memory',
                    value: metrics.memory.percent
                });
            }
            else if (metrics.memory.percent >= this.config.warningThresholds.memoryPercent) {
                this.emit('resourceWarning', {
                    modelId,
                    resource: 'memory',
                    value: metrics.memory.percent
                });
            }
            // Check GPU if available
            if (metrics.gpu) {
                if (metrics.gpu.usage >= this.config.criticalThresholds.gpuPercent) {
                    this.emit('resourceCritical', {
                        modelId,
                        resource: 'gpu',
                        value: metrics.gpu.usage
                    });
                }
                else if (metrics.gpu.usage >= this.config.warningThresholds.gpuPercent) {
                    this.emit('resourceWarning', {
                        modelId,
                        resource: 'gpu',
                        value: metrics.gpu.usage
                    });
                }
            }
        }
        getMetricsHistory(modelId) {
            return [...(this.metricsHistory.get(modelId) || [])];
        }
        getLatestMetrics(modelId) {
            const history = this.metricsHistory.get(modelId);
            return history?.[history.length - 1];
        }
        logMetrics(modelId, metrics) {
            this.outputChannel.appendLine('\nResource Metrics:');
            this.outputChannel.appendLine(`Model: ${modelId}`);
            this.outputChannel.appendLine(`Timestamp: ${new Date(metrics.timestamp).toISOString()}`);
            this.outputChannel.appendLine(`CPU Usage: ${metrics.cpu.usage.toFixed(1)}%`);
            this.outputChannel.appendLine(`Memory Usage: ${metrics.memory.percent.toFixed(1)}%`);
            if (metrics.gpu) {
                this.outputChannel.appendLine(`GPU Usage: ${metrics.gpu.usage.toFixed(1)}%`);
                this.outputChannel.appendLine(`GPU Memory: ${metrics.gpu.memory.used}MB/${metrics.gpu.memory.total}MB`);
            }
        }
        handleError(message, error) {
            this.logger.error('[ModelResourceMonitor]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            for (const timer of this.monitoringIntervals.values()) {
                clearInterval(timer);
            }
            this.monitoringIntervals.clear();
            this.metricsHistory.clear();
            this.outputChannel.dispose();
            this.removeAllListeners();
        }
    };
    return ModelResourceMonitorV2 = _classThis;
})();
exports.ModelResourceMonitorV2 = ModelResourceMonitorV2;
//# sourceMappingURL=ModelResourceMonitorV2.js.map