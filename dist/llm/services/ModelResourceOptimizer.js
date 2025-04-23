"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelResourceOptimizer = void 0;
const inversify_1 = require("inversify");
let ModelResourceOptimizer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ModelResourceOptimizer = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelResourceOptimizer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        systemManager;
        hardwareManager;
        optimizationIntervalMs;
        metricsHistory = new Array();
        maxHistoryLength = 100;
        currentOptimization;
        optimizationInterval = null;
        constructor(logger, systemManager, hardwareManager, optimizationIntervalMs = 10000) {
            this.logger = logger;
            this.systemManager = systemManager;
            this.hardwareManager = hardwareManager;
            this.optimizationIntervalMs = optimizationIntervalMs;
            this.currentOptimization = this.getDefaultOptimization();
            this.startOptimization();
        }
        getCurrentOptimization() {
            return { ...this.currentOptimization };
        }
        getOptimizationHistory() {
            return [...this.metricsHistory];
        }
        getDefaultOptimization() {
            return {
                memoryLimit: Math.floor(this.hardwareManager.getTotalMemory() * 0.7),
                maxCpuUsage: 80,
                swapUsageLimit: 1024 * 1024 * 1024, // 1GB
                loadBalancingEnabled: true,
                processPriority: 'normal',
                throttlingThreshold: 90
            };
        }
        async optimizeResources() {
            try {
                const systemMetrics = await this.systemManager.getSystemMetrics();
                const hardwareInfo = await this.hardwareManager.getHardwareInfo();
                // Memory optimization
                if (systemMetrics.resources.memoryUsagePercent > this.currentOptimization.throttlingThreshold) {
                    await this.optimizeMemory(systemMetrics.resources.memoryUsagePercent);
                }
                // CPU optimization
                if (systemMetrics.resources.cpuUsagePercent > this.currentOptimization.maxCpuUsage) {
                    await this.optimizeCPU(systemMetrics.resources.cpuUsagePercent);
                }
                // Process optimization
                await this.optimizeProcesses(systemMetrics.processes);
                // Record optimization metrics
                this.recordOptimizationMetrics(systemMetrics);
            }
            catch (error) {
                this.handleError('Failed to optimize resources', error);
            }
        }
        async optimizeMemory(currentUsage) {
            try {
                // Calculate target reduction
                const targetReduction = currentUsage - this.currentOptimization.throttlingThreshold;
                const processes = await this.systemManager.getSystemMetrics();
                // Sort processes by memory usage
                const sortedProcesses = Array.from(processes.processes.values())
                    .sort((a, b) => b.memoryBytes - a.memoryBytes);
                // Optimize high memory consumers
                for (const process of sortedProcesses) {
                    if (process.memoryBytes > this.currentOptimization.memoryLimit) {
                        await this.systemManager.unregisterProcess(process.pid);
                        this.logger.info('ModelResourceOptimizer', `Unregistered high memory process: ${process.pid}`);
                    }
                }
            }
            catch (error) {
                this.handleError('Failed to optimize memory', error);
            }
        }
        async optimizeCPU(currentUsage) {
            try {
                const processes = await this.systemManager.getSystemMetrics();
                const highCpuProcesses = Array.from(processes.processes.values())
                    .filter(p => p.cpuUsagePercent > this.currentOptimization.maxCpuUsage);
                for (const process of highCpuProcesses) {
                    if (this.currentOptimization.loadBalancingEnabled) {
                        // Implement load balancing logic
                        await this.balanceProcessLoad(process.pid);
                    }
                    else {
                        // Throttle the process
                        await this.throttleProcess(process.pid);
                    }
                }
            }
            catch (error) {
                this.handleError('Failed to optimize CPU', error);
            }
        }
        async optimizeProcesses(processes) {
            try {
                for (const [pid, process] of processes) {
                    if (process.memoryBytes > this.currentOptimization.memoryLimit ||
                        process.cpuUsagePercent > this.currentOptimization.maxCpuUsage) {
                        await this.adjustProcessPriority(pid, this.currentOptimization.processPriority);
                    }
                }
            }
            catch (error) {
                this.handleError('Failed to optimize processes', error);
            }
        }
        async balanceProcessLoad(pid) {
            // Implementation would depend on the specific load balancing strategy
            this.logger.info('ModelResourceOptimizer', `Balancing load for process: ${pid}`);
        }
        async throttleProcess(pid) {
            // Implementation would depend on the OS-specific process control mechanism
            this.logger.info('ModelResourceOptimizer', `Throttling process: ${pid}`);
        }
        async adjustProcessPriority(pid, priority) {
            // Implementation would depend on the OS-specific process priority control
            this.logger.info('ModelResourceOptimizer', `Adjusting priority for process ${pid} to ${priority}`);
        }
        recordOptimizationMetrics(systemMetrics) {
            const metrics = {
                memoryUsageReduction: this.calculateMemoryReduction(systemMetrics),
                cpuUsageReduction: this.calculateCpuReduction(systemMetrics),
                responseTimeImprovement: this.calculateResponseTimeImprovement(systemMetrics),
                resourceEfficiencyScore: this.calculateEfficiencyScore(systemMetrics),
                timestamp: Date.now()
            };
            this.metricsHistory.push(metrics);
            while (this.metricsHistory.length > this.maxHistoryLength) {
                this.metricsHistory.shift();
            }
        }
        calculateMemoryReduction(metrics) {
            // Implementation would calculate memory usage reduction
            return 0;
        }
        calculateCpuReduction(metrics) {
            // Implementation would calculate CPU usage reduction
            return 0;
        }
        calculateResponseTimeImprovement(metrics) {
            // Implementation would calculate response time improvement
            return 0;
        }
        calculateEfficiencyScore(metrics) {
            // Implementation would calculate overall resource efficiency score
            return 0;
        }
        startOptimization() {
            if (this.optimizationInterval) {
                return;
            }
            this.optimizationInterval = setInterval(() => this.optimizeResources(), this.optimizationIntervalMs);
        }
        stopOptimization() {
            if (this.optimizationInterval) {
                clearInterval(this.optimizationInterval);
                this.optimizationInterval = null;
            }
        }
        handleError(message, error) {
            this.logger.error('ModelResourceOptimizer', message, error);
        }
        dispose() {
            this.stopOptimization();
            this.metricsHistory.length = 0;
        }
    };
    return ModelResourceOptimizer = _classThis;
})();
exports.ModelResourceOptimizer = ModelResourceOptimizer;
//# sourceMappingURL=ModelResourceOptimizer.js.map