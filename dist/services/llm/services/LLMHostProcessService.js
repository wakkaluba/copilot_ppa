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
exports.LLMHostProcessService = void 0;
const events_1 = require("events");
const child_process = __importStar(require("child_process"));
class LLMHostProcessService extends events_1.EventEmitter {
    outputChannel;
    process = null;
    processInfo = null;
    metricsInterval = null;
    constructor(outputChannel) {
        super();
        this.outputChannel = outputChannel;
    }
    async startProcess(config) {
        if (this.process) {
            throw new Error('Process already running');
        }
        this.process = child_process.spawn(config.hostPath, ['--model', config.modelPath]);
        this.processInfo = {
            pid: this.process.pid,
            startTime: Date.now(),
            status: 'starting',
            errorCount: 0
        };
        this.setupProcessHandlers();
        this.startMetricsTracking();
        await this.waitForStartup();
        return this.processInfo;
    }
    setupProcessHandlers() {
        if (!this.process)
            return;
        this.process.stdout?.on('data', this.handleOutput.bind(this));
        this.process.stderr?.on('data', this.handleError.bind(this));
        this.process.on('error', this.handleProcessError.bind(this));
        this.process.on('exit', this.handleProcessExit.bind(this));
    }
    startMetricsTracking() {
        this.metricsInterval = setInterval(() => {
            this.updateProcessMetrics();
        }, 5000);
    }
    async waitForStartup() {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Process startup timeout'));
            }, 30000);
            this.once('process:running', () => {
                clearTimeout(timeout);
                resolve();
            });
        });
    }
    async stopProcess() {
        if (!this.process)
            return;
        this.process.kill();
        this.process = null;
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
            this.metricsInterval = null;
        }
        if (this.processInfo) {
            this.processInfo.status = 'stopped';
            this.emit('process:stopped', { ...this.processInfo });
        }
    }
    getProcessInfo() {
        return this.processInfo ? { ...this.processInfo } : null;
    }
    hasProcess() {
        return this.process !== null && this.processInfo?.status === 'running';
    }
    dispose() {
        this.stopProcess();
        this.removeAllListeners();
    }
    handleOutput(data) {
        const output = data.toString();
        this.outputChannel.appendLine(output);
        if (this.processInfo?.status === 'starting' && output.includes('Model loaded')) {
            this.processInfo.status = 'running';
            this.emit('process:running', { ...this.processInfo });
        }
    }
    handleError(data) {
        const error = data.toString();
        this.outputChannel.appendLine(`[ERROR] ${error}`);
        if (this.processInfo) {
            this.processInfo.errorCount++;
            this.processInfo.lastError = new Error(error);
        }
    }
    handleProcessError(error) {
        if (this.processInfo) {
            this.processInfo.status = 'error';
            this.processInfo.errorCount++;
            this.processInfo.lastError = error;
            this.emit('process:error', error, { ...this.processInfo });
        }
    }
    handleProcessExit(code) {
        if (code !== 0 && this.processInfo) {
            this.processInfo.status = 'error';
            this.emit('process:crash', new Error(`Process exited with code ${code}`), { ...this.processInfo });
        }
        this.process = null;
    }
    updateProcessMetrics() {
        if (!this.process || !this.processInfo)
            return;
        try {
            const usage = process.cpuUsage();
            const memory = process.memoryUsage();
            this.processInfo.cpuUsage = (usage.user + usage.system) / 1000000;
            this.processInfo.memoryUsage = memory.heapUsed / 1024 / 1024;
            this.emit('metrics:updated', {
                cpu: this.processInfo.cpuUsage,
                memory: this.processInfo.memoryUsage
            });
        }
        catch (error) {
            this.outputChannel.appendLine(`[ERROR] Failed to update metrics: ${error}`);
        }
    }
}
exports.LLMHostProcessService = LLMHostProcessService;
//# sourceMappingURL=LLMHostProcessService.js.map