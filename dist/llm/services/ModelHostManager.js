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
exports.ModelHostManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const logging_1 = require("../../common/logging");
const ModelSystemManager_1 = require("./ModelSystemManager");
const ModelStateManager_1 = require("./ModelStateManager");
let ModelHostManager = class ModelHostManager extends events_1.EventEmitter {
    constructor(logger, systemManager, stateManager) {
        super();
        this.logger = logger;
        this.systemManager = systemManager;
        this.stateManager = stateManager;
        this.hostedProcesses = new Map();
        this.maxRestartAttempts = 3;
        this.restartDelayMs = 5000;
        this.outputChannel = vscode.window.createOutputChannel('Model Host');
        this.monitorInterval = setInterval(() => this.monitorProcesses(), 10000);
    }
    async startProcess(modelId, config) {
        try {
            // In a real implementation, this would start an actual process
            const pid = Math.floor(Math.random() * 10000) + 1000; // Simulated PID
            const process = {
                pid,
                modelId,
                startTime: new Date(),
                memoryUsage: 0,
                cpuUsage: 0,
                status: 'starting',
                lastHealthCheck: new Date(),
                restartCount: 0
            };
            this.hostedProcesses.set(modelId, process);
            await this.systemManager.registerProcess(pid);
            await this.stateManager.updateState(modelId, 'loading');
            // Simulate startup delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            process.status = 'running';
            await this.stateManager.updateState(modelId, 'ready');
            this.emit('processStarted', { modelId, pid });
            this.logProcessUpdate(modelId, 'Process started successfully');
            return pid;
        }
        catch (error) {
            this.handleError(`Failed to start process for model ${modelId}`, error);
            throw error;
        }
    }
    async stopProcess(modelId) {
        try {
            const process = this.hostedProcesses.get(modelId);
            if (!process) {
                throw new Error(`No process found for model ${modelId}`);
            }
            process.status = 'stopped';
            await this.systemManager.unregisterProcess(process.pid);
            await this.stateManager.updateState(modelId, 'unloading');
            this.hostedProcesses.delete(modelId);
            await this.stateManager.updateState(modelId, 'unloaded');
            this.emit('processStopped', { modelId });
            this.logProcessUpdate(modelId, 'Process stopped successfully');
        }
        catch (error) {
            this.handleError(`Failed to stop process for model ${modelId}`, error);
            throw error;
        }
    }
    async monitorProcesses() {
        for (const [modelId, process] of this.hostedProcesses.entries()) {
            try {
                if (process.status !== 'running')
                    continue;
                const metrics = await this.systemManager.getSystemMetrics();
                const processInfo = metrics.processes.get(process.pid);
                if (!processInfo) {
                    await this.handleCrashedProcess(modelId, process);
                    continue;
                }
                // Update process metrics
                process.memoryUsage = processInfo.memoryBytes;
                process.cpuUsage = processInfo.cpuUsagePercent;
                process.lastHealthCheck = new Date();
                this.emit('processMetrics', {
                    modelId,
                    pid: process.pid,
                    metrics: {
                        memoryUsage: process.memoryUsage,
                        cpuUsage: process.cpuUsage,
                        uptime: (Date.now() - process.startTime.getTime()) / 1000
                    }
                });
            }
            catch (error) {
                this.handleError(`Failed to monitor process for model ${modelId}`, error);
            }
        }
    }
    async handleCrashedProcess(modelId, process) {
        try {
            process.status = 'crashed';
            await this.stateManager.updateState(modelId, 'error');
            this.emit('processCrashed', { modelId, pid: process.pid });
            this.logProcessUpdate(modelId, 'Process crashed, attempting restart');
            if (process.restartCount < this.maxRestartAttempts) {
                process.restartCount++;
                await new Promise(resolve => setTimeout(resolve, this.restartDelayMs));
                await this.startProcess(modelId, {}); // Use stored config in real implementation
            }
            else {
                this.logProcessUpdate(modelId, `Process failed to restart after ${this.maxRestartAttempts} attempts`);
                this.hostedProcesses.delete(modelId);
            }
        }
        catch (error) {
            this.handleError(`Failed to handle crashed process for model ${modelId}`, error);
        }
    }
    logProcessUpdate(modelId, message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${modelId}: ${message}`);
    }
    handleError(message, error) {
        this.logger.error('[ModelHostManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        clearInterval(this.monitorInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        // Stop all running processes
        Promise.all(Array.from(this.hostedProcesses.keys())
            .map(modelId => this.stopProcess(modelId))).catch(err => {
            this.logger.error('Failed to stop all processes during disposal', err);
        });
        this.hostedProcesses.clear();
    }
};
exports.ModelHostManager = ModelHostManager;
exports.ModelHostManager = ModelHostManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelSystemManager_1.ModelSystemManager)),
    __param(2, (0, inversify_1.inject)(ModelStateManager_1.ModelStateManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelSystemManager_1.ModelSystemManager,
        ModelStateManager_1.ModelStateManager])
], ModelHostManager);
//# sourceMappingURL=ModelHostManager.js.map