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
exports.ModelSystemManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const os_1 = require("os");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ModelSystemManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelSystemManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelSystemManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                    timestamp: Date.now(),
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
                        timestamp: Date.now()
                    };
                }
                else {
                    const { stdout } = await execAsync(`ps -p ${pid} -o %cpu,%mem,rss`);
                    const [_, cpu, memPercent, rss] = stdout.trim().split(/\s+/);
                    return {
                        pid,
                        cpuUsagePercent: parseFloat(cpu),
                        memoryBytes: parseInt(rss, 10) * 1024, // Convert KB to bytes
                        timestamp: Date.now()
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
    return ModelSystemManager = _classThis;
})();
exports.ModelSystemManager = ModelSystemManager;
//# sourceMappingURL=ModelSystemManager.js.map