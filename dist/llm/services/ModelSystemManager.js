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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSystemManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const os_1 = require("os");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ModelSystemManager = class ModelSystemManager extends events_1.EventEmitter {
    logger;
    monitoringIntervalMs;
    outputChannel;
    monitoringInterval = null;
    metricsHistory = new Array();
    maxHistoryLength = 100;
    processMap = new Map();
    constructor(logger, monitoringIntervalMs = 5000) {
        super();
        this.logger = logger;
        this.monitoringIntervalMs = monitoringIntervalMs;
        this.outputChannel = vscode.window.createOutputChannel('System Monitor');
        this.startMonitoring();
    }
    async getSystemMetrics() {
        try {
            const [resourceUsage, processMetrics] = await Promise.all([
                this.getResourceUsage(),
                this.getProcessMetrics()
            ]);
            const metrics = {
                timestamp: new Date(),
                resources: resourceUsage,
                processes: processMetrics
            };
            this.updateMetricsHistory(metrics);
            this.emit('metricsUpdated', metrics);
            return metrics;
        }
        catch (error) {
            this.handleError('Failed to get system metrics', error);
            throw error;
        }
    }
    async registerProcess(pid, info = {}) {
        try {
            const processInfo = await this.getProcessInfo(pid);
            if (processInfo) {
                this.processMap.set(pid, {
                    ...processInfo,
                    ...info
                });
                this.emit('processRegistered', { pid, info: this.processMap.get(pid) });
            }
        }
        catch (error) {
            this.handleError(`Failed to register process ${pid}`, error);
            throw error;
        }
    }
    async unregisterProcess(pid) {
        if (this.processMap.has(pid)) {
            this.processMap.delete(pid);
            this.emit('processUnregistered', { pid });
        }
    }
    async getResourceUsage() {
        const totalMem = (0, os_1.totalmem)();
        const freeMem = (0, os_1.freemem)();
        const cpuInfo = (0, os_1.cpus)();
        const loads = (0, os_1.loadavg)();
        // Calculate CPU usage percentage
        const cpuUsage = cpuInfo.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total) * 100;
        }, 0) / cpuInfo.length;
        return {
            cpuUsagePercent: cpuUsage,
            memoryUsagePercent: ((totalMem - freeMem) / totalMem) * 100,
            totalMemoryBytes: totalMem,
            freeMemoryBytes: freeMem,
            loadAverages: loads
        };
    }
    async getProcessMetrics() {
        const metrics = new Map();
        for (const [pid] of this.processMap) {
            try {
                const info = await this.getProcessInfo(pid);
                if (info) {
                    metrics.set(pid, info);
                }
                else {
                    this.unregisterProcess(pid);
                }
            }
            catch (error) {
                this.logger.warn('[ModelSystemManager]', `Failed to get metrics for process ${pid}`, error);
                // Process might have terminated
                this.unregisterProcess(pid);
            }
        }
        return metrics;
    }
    async getProcessInfo(pid) {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync(`powershell "Get-Process -Id ${pid} | Select-Object CPU,WorkingSet,Path"`);
                const [_, cpu, memory] = stdout.trim().split(/\s+/);
                return {
                    pid,
                    cpuUsagePercent: parseFloat(cpu),
                    memoryBytes: parseInt(memory, 10),
                    timestamp: new Date()
                };
            }
            else {
                const { stdout } = await execAsync(`ps -p ${pid} -o %cpu,%mem,rss`);
                const [_, cpu, memPercent, rss] = stdout.trim().split(/\s+/);
                return {
                    pid,
                    cpuUsagePercent: parseFloat(cpu),
                    memoryBytes: parseInt(rss, 10) * 1024, // Convert KB to bytes
                    timestamp: new Date()
                };
            }
        }
        catch {
            return null; // Process not found or access denied
        }
    }
    startMonitoring() {
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.getSystemMetrics();
            }
            catch (error) {
                this.handleError('Error during system monitoring', error);
            }
        }, this.monitoringIntervalMs);
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    updateMetricsHistory(metrics) {
        this.metricsHistory.push(metrics);
        // Maintain fixed size history
        while (this.metricsHistory.length > this.maxHistoryLength) {
            this.metricsHistory.shift();
        }
    }
    getMetricsHistory() {
        return [...this.metricsHistory];
    }
    handleError(message, error) {
        this.logger.error('[ModelSystemManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.length = 0;
        this.processMap.clear();
    }
};
exports.ModelSystemManager = ModelSystemManager;
exports.ModelSystemManager = ModelSystemManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
    __metadata("design:paramtypes", [Object, Object])
], ModelSystemManager);
//# sourceMappingURL=ModelSystemManager.js.map