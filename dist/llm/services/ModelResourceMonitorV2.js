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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelResourceMonitorV2 = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const logging_1 = require("../../common/logging");
const ModelHardwareManager_1 = require("./ModelHardwareManager");
const ModelSystemManager_1 = require("./ModelSystemManager");
let ModelResourceMonitorV2 = class ModelResourceMonitorV2 extends events_1.EventEmitter {
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
        this.metricsHistory = new Map();
        this.monitoringIntervals = new Map();
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
            timestamp: new Date(),
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
exports.ModelResourceMonitorV2 = ModelResourceMonitorV2;
exports.ModelResourceMonitorV2 = ModelResourceMonitorV2 = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelHardwareManager_1.ModelHardwareManager)),
    __param(2, (0, inversify_1.inject)(ModelSystemManager_1.ModelSystemManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelHardwareManager_1.ModelHardwareManager,
        ModelSystemManager_1.ModelSystemManager, Object])
], ModelResourceMonitorV2);
//# sourceMappingURL=ModelResourceMonitorV2.js.map