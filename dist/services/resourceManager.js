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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManager = void 0;
const os = __importStar(require("os"));
/**
 * Manages system resource usage and provides methods to optimize resource utilization
 * for LLM operations.
 */
class ResourceManager {
    constructor(context, conversationHistory) {
        this.context = context;
        this.conversationHistory = conversationHistory;
        this.monitoringInterval = null;
        this.memoryWarningThreshold = 80; // 80% memory usage warning threshold
        this.memoryCriticalThreshold = 90; // 90% memory usage critical threshold
        this.cpuWarningThreshold = 70; // 70% CPU usage warning threshold
        this.cpuCriticalThreshold = 85; // 85% CPU usage critical threshold
    }
    /**
     * Gets the current memory usage of the system
     */
    getCurrentMemoryUsage() {
        const totalMemory = os.totalmem() / (1024 * 1024); // Convert to MB
        const freeMemory = os.freemem() / (1024 * 1024); // Convert to MB
        const usedMemory = totalMemory - freeMemory;
        const percentUsed = (usedMemory / totalMemory) * 100;
        return {
            total: Math.round(totalMemory),
            used: Math.round(usedMemory),
            free: Math.round(freeMemory),
            percentUsed: Math.round(percentUsed)
        };
    }
    /**
     * Gets the current CPU usage of the system and process
     */
    async getCurrentCpuUsage() {
        // This is a simple approximation - in a real implementation,
        // we would measure CPU usage more accurately over time
        const cpus = os.cpus();
        const totalCpuTime = cpus.reduce((acc, cpu) => {
            return acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0);
        }, 0);
        const totalIdleTime = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
        const systemPercent = 100 - (totalIdleTime / totalCpuTime * 100);
        // Estimate process CPU usage - in a real implementation this would be more accurate
        const processPercent = systemPercent * 0.6; // Simple approximation
        return {
            systemPercent: Math.round(systemPercent),
            processPercent: Math.round(processPercent)
        };
    }
    /**
     * Checks if the system is under memory pressure
     */
    isUnderMemoryPressure() {
        const memoryUsage = this.getCurrentMemoryUsage();
        return memoryUsage.percentUsed > this.memoryCriticalThreshold;
    }
    /**
     * Checks if the system is under CPU pressure
     */
    async isUnderCpuPressure() {
        const cpuUsage = await this.getCurrentCpuUsage();
        return cpuUsage.systemPercent > this.cpuCriticalThreshold;
    }
    /**
     * Checks the status of memory resources
     */
    checkMemoryStatus() {
        const memoryUsage = this.getCurrentMemoryUsage();
        if (memoryUsage.percentUsed > this.memoryCriticalThreshold) {
            return {
                status: 'critical',
                message: `Critical memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
            };
        }
        else if (memoryUsage.percentUsed > this.memoryWarningThreshold) {
            return {
                status: 'warning',
                message: `High memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
            };
        }
        return {
            status: 'normal',
            message: `Normal memory usage: ${memoryUsage.percentUsed.toFixed(1)}% used, ${memoryUsage.free.toFixed(0)} MB free`
        };
    }
    /**
     * Checks the status of CPU resources
     */
    async checkCpuStatus() {
        const cpuUsage = await this.getCurrentCpuUsage();
        if (cpuUsage.systemPercent > this.cpuCriticalThreshold) {
            return {
                status: 'critical',
                message: `Critical CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
            };
        }
        else if (cpuUsage.systemPercent > this.cpuWarningThreshold) {
            return {
                status: 'warning',
                message: `High CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
            };
        }
        return {
            status: 'normal',
            message: `Normal CPU usage: ${cpuUsage.systemPercent.toFixed(1)}% system, ${cpuUsage.processPercent.toFixed(1)}% process`
        };
    }
    /**
     * Checks overall resource status
     */
    async checkResourceStatus() {
        const memoryStatus = this.checkMemoryStatus();
        const cpuStatus = await this.checkCpuStatus();
        // Return the most severe status
        if (memoryStatus.status === 'critical' || cpuStatus.status === 'critical') {
            return {
                status: 'critical',
                message: `Critical resource usage - ${memoryStatus.message}; ${cpuStatus.message}`
            };
        }
        else if (memoryStatus.status === 'warning' || cpuStatus.status === 'warning') {
            return {
                status: 'warning',
                message: `Warning: resource pressure detected - ${memoryStatus.message}; ${cpuStatus.message}`
            };
        }
        return {
            status: 'normal',
            message: 'Normal resource usage'
        };
    }
    /**
     * Starts periodic monitoring of system resources
     */
    startMonitoring(intervalMs = 5000) {
        // Clear any existing interval
        this.stopMonitoring();
        this.monitoringInterval = setInterval(async () => {
            await this.checkResourceStatus();
        }, intervalMs);
    }
    /**
     * Stops the resource monitoring
     */
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    /**
     * Optimizes memory usage by cleaning up resources
     */
    async optimizeMemoryUsage() {
        const beforeMemory = this.getCurrentMemoryUsage();
        // Perform optimization actions
        await this.cleanupConversationCache();
        global.gc?.(); // Request garbage collection if available
        const afterMemory = this.getCurrentMemoryUsage();
        const freedMemory = beforeMemory.used - afterMemory.used;
        return {
            optimized: freedMemory > 0,
            freedMemory: Math.max(0, freedMemory)
        };
    }
    /**
     * Cleans up conversation cache to free memory
     */
    async cleanupConversationCache() {
        // Get all conversations
        const conversations = this.conversationHistory.getAllConversations();
        if (conversations.length > 10) {
            // Keep the 10 most recent conversations and clean up the rest
            const sortedConversations = conversations.sort((a, b) => {
                const aLastUpdated = a.messages.length ?
                    a.messages[a.messages.length - 1].timestamp : 0;
                const bLastUpdated = b.messages.length ?
                    b.messages[b.messages.length - 1].timestamp : 0;
                return bLastUpdated - aLastUpdated;
            });
            // Delete older conversations
            for (let i = 10; i < sortedConversations.length; i++) {
                await this.conversationHistory.deleteConversation(sortedConversations[i].id);
            }
        }
    }
    /**
     * Allocates resources for an operation
     */
    async allocateResourcesForOperation(request) {
        // Check current resource status
        const memoryUnderPressure = this.isUnderMemoryPressure();
        const cpuUnderPressure = await this.isUnderCpuPressure();
        const memoryUsage = this.getCurrentMemoryUsage();
        const cpuUsage = await this.getCurrentCpuUsage();
        // If system is under pressure and request is not high priority, deny it
        if ((memoryUnderPressure || cpuUnderPressure) && request.priority !== 'high') {
            return {
                allocated: false,
                reason: `System under resource pressure: memory=${memoryUsage.percentUsed.toFixed(1)}%, CPU=${cpuUsage.systemPercent.toFixed(1)}%`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        // If estimated resource needs exceed available resources, deny
        if (request.estimatedMemory > memoryUsage.free) {
            return {
                allocated: false,
                reason: `Insufficient memory: requested ${request.estimatedMemory}MB but only ${memoryUsage.free.toFixed(0)}MB available`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        if (request.estimatedCpuLoad + cpuUsage.systemPercent > 100) {
            return {
                allocated: false,
                reason: `Insufficient CPU: requested ${request.estimatedCpuLoad}% but only ${(100 - cpuUsage.systemPercent).toFixed(0)}% available`,
                availableMemory: memoryUsage.free,
                availableCpu: 100 - cpuUsage.systemPercent
            };
        }
        // Resources are available, approve allocation
        return {
            allocated: true,
            availableMemory: memoryUsage.free,
            availableCpu: 100 - cpuUsage.systemPercent
        };
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resourceManager.js.map