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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHardwareManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
const types_2 = require("../types");
const child_process_1 = require("child_process");
const util_1 = require("util");
const os_1 = __importDefault(require("os"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let ModelHardwareManager = class ModelHardwareManager extends events_1.EventEmitter {
    constructor(logger, monitoringIntervalMs = 5000) {
        super();
        this.logger = logger;
        this.monitoringIntervalMs = monitoringIntervalMs;
        this.monitoringInterval = null;
        this.metricsHistory = new Map();
        this.maxHistoryLength = 100;
        this.outputChannel = vscode.window.createOutputChannel('Hardware Monitor');
        this.startMonitoring();
    }
    async getHardwareSpecs() {
        try {
            const [gpuInfo, cudaInfo] = await Promise.all([
                this.detectGPU(),
                this.detectCUDA()
            ]);
            const specs = {
                gpu: {
                    available: gpuInfo.available,
                    name: gpuInfo.name,
                    vram: gpuInfo.vram,
                    cudaSupport: cudaInfo.available,
                    cudaVersion: cudaInfo.version
                },
                ram: {
                    total: os_1.default.totalmem() / (1024 * 1024),
                    free: os_1.default.freemem() / (1024 * 1024)
                },
                cpu: {
                    cores: os_1.default.cpus().length,
                    model: os_1.default.cpus()[0]?.model?.trim() || 'Unknown'
                }
            };
            this.emit(types_2.HardwareEvent.SpecsUpdated, specs);
            this.logHardwareSpecs(specs);
            return specs;
        }
        catch (error) {
            this.handleError('Failed to get hardware specifications', error);
            throw error;
        }
    }
    async getHardwareMetrics() {
        try {
            const [gpuMetrics, systemMetrics] = await Promise.all([
                this.getGPUMetrics(),
                this.getSystemMetrics()
            ]);
            const metrics = {
                timestamp: new Date(),
                gpu: gpuMetrics,
                system: systemMetrics
            };
            this.updateMetricsHistory('default', metrics);
            this.emit(types_2.HardwareEvent.MetricsUpdated, metrics);
            return metrics;
        }
        catch (error) {
            this.handleError('Failed to get hardware metrics', error);
            throw error;
        }
    }
    async detectGPU() {
        try {
            if (process.platform === 'win32') {
                const { stdout } = await execAsync('nvidia-smi --query-gpu=name,memory.total --format=csv,noheader');
                if (stdout) {
                    const [name, vramStr] = stdout.split(',').map(s => s.trim());
                    const vram = parseInt(vramStr) * 1024 * 1024; // Convert to bytes
                    return { available: true, name, vram };
                }
            }
            else if (process.platform === 'linux') {
                const { stdout } = await execAsync('lspci | grep -i nvidia');
                if (stdout) {
                    return { available: true, name: stdout.split(':')[2]?.trim() };
                }
            }
            return { available: false };
        }
        catch {
            return { available: false };
        }
    }
    async detectCUDA() {
        try {
            if (process.platform === 'win32' || process.platform === 'linux') {
                const { stdout } = await execAsync('nvcc --version');
                const match = stdout.match(/release (\d+\.\d+)/i);
                if (match) {
                    return { available: true, version: match[1] };
                }
            }
            return { available: false };
        }
        catch {
            return { available: false };
        }
    }
    async getGPUMetrics() {
        try {
            if (!process.platform.match(/^(win32|linux)$/)) {
                return {};
            }
            const { stdout } = await execAsync('nvidia-smi --query-gpu=utilization.gpu,memory.used,temperature.gpu,power.draw --format=csv,noheader');
            const [utilization, memory, temp, power] = stdout.split(',').map(s => parseFloat(s));
            return {
                utilizationPercent: utilization,
                memoryUsedBytes: memory * 1024 * 1024,
                temperature: temp,
                powerWatts: power
            };
        }
        catch {
            return {};
        }
    }
    async getSystemMetrics() {
        const cpus = os_1.default.cpus();
        const totalCpuTime = cpus.reduce((acc, cpu) => {
            Object.values(cpu.times).forEach(time => acc += time);
            return acc;
        }, 0);
        const cpuUsagePercent = 100 - (os_1.default.cpus()[0].times.idle / totalCpuTime * 100);
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
        const memoryUsedPercent = ((totalMem - freeMem) / totalMem) * 100;
        return {
            cpuUsagePercent,
            memoryUsedPercent,
            loadAverage: os_1.default.loadavg()
        };
    }
    startMonitoring() {
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.getHardwareMetrics();
            }
            catch (error) {
                this.handleError('Error during hardware monitoring', error);
            }
        }, this.monitoringIntervalMs);
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    getMetricsHistory(id = 'default') {
        return this.metricsHistory.get(id) || [];
    }
    updateMetricsHistory(id, metrics) {
        const history = this.metricsHistory.get(id) || [];
        history.push(metrics);
        // Maintain fixed size history
        if (history.length > this.maxHistoryLength) {
            history.shift();
        }
        this.metricsHistory.set(id, history);
    }
    logHardwareSpecs(specs) {
        this.outputChannel.appendLine('\nHardware Specifications:');
        this.outputChannel.appendLine('CPU:');
        this.outputChannel.appendLine(`  Model: ${specs.cpu.model}`);
        this.outputChannel.appendLine(`  Cores: ${specs.cpu.cores}`);
        this.outputChannel.appendLine('\nMemory:');
        this.outputChannel.appendLine(`  Total: ${Math.round(specs.ram.total / 1024)}GB`);
        this.outputChannel.appendLine(`  Free: ${Math.round(specs.ram.free / 1024)}GB`);
        this.outputChannel.appendLine('\nGPU:');
        if (specs.gpu.available) {
            this.outputChannel.appendLine(`  Name: ${specs.gpu.name}`);
            if (specs.gpu.vram) {
                this.outputChannel.appendLine(`  VRAM: ${Math.round(specs.gpu.vram / (1024 * 1024))}GB`);
            }
            this.outputChannel.appendLine(`  CUDA Support: ${specs.gpu.cudaSupport ? `Yes (${specs.gpu.cudaVersion})` : 'No'}`);
        }
        else {
            this.outputChannel.appendLine('  No GPU detected');
        }
    }
    handleError(message, error) {
        this.logger.error('[ModelHardwareManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        this.stopMonitoring();
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.metricsHistory.clear();
    }
};
ModelHardwareManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, Object])
], ModelHardwareManager);
exports.ModelHardwareManager = ModelHardwareManager;
//# sourceMappingURL=ModelHardwareManager.js.map