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
exports.ModelHostManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelHostManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelHostManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelHostManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        systemManager;
        stateManager;
        hostedProcesses = new Map();
        outputChannel;
        monitorInterval;
        maxRestartAttempts = 3;
        restartDelayMs = 5000;
        constructor(logger, systemManager, stateManager) {
            super();
            this.logger = logger;
            this.systemManager = systemManager;
            this.stateManager = stateManager;
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
    return ModelHostManager = _classThis;
})();
exports.ModelHostManager = ModelHostManager;
//# sourceMappingURL=ModelHostManager.js.map